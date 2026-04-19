import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  cancelAnimation,
  Easing as REasing,
  runOnJS,
  runOnUI,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { hapticPackEnter } from '../../../audio/packOpeningFeedback';
import { buildReelShells } from './reelStrip';

const WIN_W = Dimensions.get('window').width;

export type PackReelUiPhase = 'fast' | 'slow' | 'landed';

function runHaptic(fn: () => Promise<void>) {
  if (Platform.OS === 'web') return;
  void fn().catch(() => {});
}

export function usePackReel({
  sessionSalt,
  winTint,
  skipNonce,
  onLanded,
  reelMotionDelayMs = 0,
}: {
  sessionSalt: number;
  winTint: string;
  skipNonce: number;
  onLanded: (fromSkip: boolean) => void;
  reelMotionDelayMs?: number;
}) {
  const onLandedRef = useRef(onLanded);
  onLandedRef.current = onLanded;

  const { shells, winIndex, slotW, packW } = useMemo(
    () => buildReelShells(sessionSalt, winTint),
    [sessionSalt, winTint],
  );

  const len = shells.length;
  const targetX = WIN_W / 2 - packW / 2 - winIndex * slotW;
  /**
   * At start, pack (winIndex − K) is nearest center — must stay in-strip or the viewport is empty.
   * Old fixed K often made winIndex − K negative.
   */
  const kDesired = 12 + (sessionSalt % 10);
  const kMax = Math.max(2, winIndex - 1);
  const kMin = Math.max(2, winIndex - (len - 2));
  const K = Math.min(kMax, Math.max(kMin, kDesired));
  const startX = targetX + slotW * K;

  const reelX = useSharedValue(0);
  const slowdownActive = useSharedValue(0);

  const [motionStarted, setMotionStarted] = useState(() => reelMotionDelayMs <= 0);
  const [uiPhase, setUiPhase] = useState<PackReelUiPhase>('fast');
  const landedNotifiedRef = useRef(false);
  const prevSkipRef = useRef(0);
  const tickTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const motionStartedAtRef = useRef(0);

  const clearTicks = useCallback(() => {
    tickTimersRef.current.forEach(clearTimeout);
    tickTimersRef.current = [];
  }, []);

  const notifyLanded = useCallback(
    (fromSkip: boolean) => {
      if (landedNotifiedRef.current) return;
      landedNotifiedRef.current = true;
      clearTicks();
      setUiPhase('landed');
      runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
      onLandedRef.current(fromSkip);
    },
    [clearTicks],
  );

  const beginSlowdown = useCallback(
    (fromSkip: boolean) => {
      if (slowdownActive.value === 1) return;
      slowdownActive.value = 1;
      cancelAnimation(reelX);

      if (fromSkip) {
        reelX.value = targetX;
        notifyLanded(true);
        return;
      }

      setUiPhase('slow');
      runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));

      const current = reelX.value;
      const totalTravel = current - targetX;

      if (totalTravel <= slotW * 0.35) {
        reelX.value = withTiming(
          targetX,
          { duration: 420, easing: REasing.out(REasing.cubic) },
          (finished) => {
            'worklet';
            if (finished) runOnJS(notifyLanded)(false);
          },
        );
        return;
      }

      const slotsLeft = totalTravel / slotW;
      const decelMs = Math.round(
        Math.min(4800, Math.max(3100, 1750 + slotsLeft * 360 + (sessionSalt % 4) * 80)),
      );

      reelX.value = withTiming(
        targetX,
        { duration: decelMs, easing: REasing.out(REasing.cubic) },
        (finished) => {
          'worklet';
          if (finished) runOnJS(notifyLanded)(false);
        },
      );
    },
    [notifyLanded, reelX, sessionSalt, slotW, targetX],
  );

  useEffect(() => {
    let motionDelayTimer: ReturnType<typeof setTimeout> | null = null;

    if (reelMotionDelayMs > 0) {
      setMotionStarted(false);
    } else {
      setMotionStarted(true);
    }

    landedNotifiedRef.current = false;
    slowdownActive.value = 0;
    setUiPhase('fast');
    clearTicks();
    cancelAnimation(reelX);
    reelX.value = startX;

    const startMotion = () => {
      motionStartedAtRef.current = Date.now();
      setMotionStarted(true);
      hapticPackEnter();

      const scrollDist = slotW * 82;
      const scrollMs = 14800 + (sessionSalt % 4) * 350;
      const pxPerMs = scrollDist / scrollMs;
      /** ~12s chunks: long single withTiming durations have snapped/jumped on some devices. */
      const chunkMs = 12000;
      const chunkShift = pxPerMs * chunkMs;

      runOnUI((from: number, cShift: number, cMs: number) => {
        'worklet';
        const spin = (origin: number) => {
          if (slowdownActive.value === 1) return;
          reelX.value = withTiming(origin - cShift, { duration: cMs, easing: REasing.linear }, (finished) => {
            'worklet';
            if (finished && slowdownActive.value === 0) {
              spin(reelX.value);
            }
          });
        };
        spin(from);
      })(startX, chunkShift, chunkMs);
    };

    if (reelMotionDelayMs > 0) {
      motionDelayTimer = setTimeout(startMotion, reelMotionDelayMs);
    } else {
      startMotion();
    }

    return () => {
      if (motionDelayTimer) clearTimeout(motionDelayTimer);
      slowdownActive.value = 1;
      cancelAnimation(reelX);
      clearTicks();
    };
  }, [clearTicks, reelMotionDelayMs, sessionSalt, slotW, startX]);

  useEffect(() => {
    if (skipNonce === 0) {
      prevSkipRef.current = 0;
      return;
    }
    if (prevSkipRef.current === skipNonce) return;
    prevSkipRef.current = skipNonce;
    beginSlowdown(true);
  }, [beginSlowdown, skipNonce]);

  const onUserSlowTap = useCallback(() => {
    if (slowdownActive.value === 1) return;
    if (Date.now() - motionStartedAtRef.current < 480) return;
    beginSlowdown(false);
  }, [beginSlowdown, slowdownActive]);

  return {
    reelX,
    shells,
    winIndex,
    slotW,
    packW,
    screenCx: WIN_W / 2,
    uiPhase,
    motionStarted,
    onUserSlowTap,
  };
}
