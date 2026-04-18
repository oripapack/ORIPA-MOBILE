import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
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
  /** Wait before the reel begins scrolling (gallery entrance / transition). */
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

  const targetX = WIN_W / 2 - packW / 2 - winIndex * slotW;
  const startX = targetX + slotW * (18 + (sessionSalt % 6));

  const reelX = useRef(new Animated.Value(startX)).current;
  const [motionStarted, setMotionStarted] = useState(() => reelMotionDelayMs <= 0);
  const [uiPhase, setUiPhase] = useState<PackReelUiPhase>('fast');
  const slowdownDoneRef = useRef(false);
  const landedNotifiedRef = useRef(false);
  const fastAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const slowAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const tickTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevSkipRef = useRef(0);

  const clearTicks = useCallback(() => {
    tickTimersRef.current.forEach(clearTimeout);
    tickTimersRef.current = [];
  }, []);

  const notifyLanded = useCallback((fromSkip: boolean) => {
    if (landedNotifiedRef.current) return;
    landedNotifiedRef.current = true;
    clearTicks();
    setUiPhase('landed');
    runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
    onLandedRef.current(fromSkip);
  }, [clearTicks]);

  const beginSlowdown = useCallback(
    (fromSkip: boolean) => {
      if (slowdownDoneRef.current) return;
      slowdownDoneRef.current = true;
      fastAnimRef.current?.stop();
      fastAnimRef.current = null;

      if (fromSkip) {
        reelX.stopAnimation();
        reelX.setValue(targetX);
        notifyLanded(true);
        return;
      }

      setUiPhase('slow');
      runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));

      reelX.stopAnimation((current) => {
        reelX.setValue(current);
        /** Positive = still need to scroll “forward” (decrease translateX) to reach target. */
        const totalTravel = current - targetX;

        if (totalTravel <= slotW * 0.35) {
          slowAnimRef.current = Animated.timing(reelX, {
            toValue: targetX,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          });
          slowAnimRef.current.start(({ finished }) => {
            slowAnimRef.current = null;
            if (finished) notifyLanded(false);
          });
          return;
        }

        const slotsLeft = totalTravel / slotW;
        const decelMs = Math.round(
          Math.min(4800, Math.max(3100, 1750 + slotsLeft * 360 + (sessionSalt % 4) * 80)),
        );

        slowAnimRef.current = Animated.timing(reelX, {
          toValue: targetX,
          duration: decelMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        });

        slowAnimRef.current.start(({ finished }) => {
          slowAnimRef.current = null;
          if (finished) notifyLanded(false);
        });
      });
    },
    [notifyLanded, reelX, sessionSalt, slotW, targetX],
  );

  const beginSlowdownRef = useRef(beginSlowdown);
  beginSlowdownRef.current = beginSlowdown;

  useEffect(() => {
    let motionDelayTimer: ReturnType<typeof setTimeout> | null = null;

    if (reelMotionDelayMs > 0) {
      setMotionStarted(false);
    } else {
      setMotionStarted(true);
    }

    reelX.setValue(startX);
    landedNotifiedRef.current = false;
    slowdownDoneRef.current = false;
    setUiPhase('fast');
    clearTicks();

    const startMotion = () => {
      setMotionStarted(true);
      hapticPackEnter();

      /** Steady scroll forever until the user taps — no auto slow-down. */
      const scrollDist = slotW * 82;
      const scrollMs = 14800 + (sessionSalt % 4) * 350;

      const runFastSegment = () => {
        if (slowdownDoneRef.current) return;
        reelX.stopAnimation((current) => {
          if (slowdownDoneRef.current) return;
          const nextTo = current - scrollDist;
          fastAnimRef.current = Animated.timing(reelX, {
            toValue: nextTo,
            duration: scrollMs,
            easing: Easing.linear,
            useNativeDriver: false,
          });
          fastAnimRef.current.start(({ finished }) => {
            fastAnimRef.current = null;
            if (finished && !slowdownDoneRef.current) runFastSegment();
          });
        });
      };

      reelX.setValue(startX);
      runFastSegment();
    };

    if (reelMotionDelayMs > 0) {
      motionDelayTimer = setTimeout(startMotion, reelMotionDelayMs);
    } else {
      startMotion();
    }

    return () => {
      if (motionDelayTimer) clearTimeout(motionDelayTimer);
      fastAnimRef.current?.stop();
      fastAnimRef.current = null;
      slowAnimRef.current?.stop();
      slowAnimRef.current = null;
      clearTicks();
    };
  }, [clearTicks, reelMotionDelayMs, reelX, sessionSalt, slotW, startX, winTint]);

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
    if (slowdownDoneRef.current) return;
    beginSlowdown(false);
  }, [beginSlowdown]);

  return {
    reelX,
    shells,
    winIndex,
    slotW,
    packW,
    uiPhase,
    motionStarted,
    onUserSlowTap,
  };
}
