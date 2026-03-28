import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { hapticPackEnter, hapticPackReveal, hapticPackResult } from '../../../audio/packOpeningFeedback';
import { buildCsgoStrip } from './stripGenerator';
import { STAGE } from './sharedStage';
import type { PackOpeningPhase, PackOpeningStyle, PackRollResult, RevealCard, RevealRarity } from './types';

const CARD_W = 86;
const CARD_GAP = 10;
const SLOT_W = CARD_W + CARD_GAP;

const RARITY_MULT: Record<RevealRarity, number> = {
  common: 0.92,
  rare: 1,
  ultra_rare: 1.08,
  chase: 1.16,
};

export function usePackOpening({
  style,
  roll,
  revealCard,
  revealRarity,
  sessionSalt,
  replayKey,
  skipNonce,
  onRevealDone,
}: {
  style: PackOpeningStyle;
  roll: PackRollResult;
  revealCard: RevealCard;
  revealRarity: RevealRarity;
  sessionSalt: number;
  replayKey: number;
  skipNonce: number;
  onRevealDone: () => void;
}) {
  const [phase, setPhase] = useState<PackOpeningPhase>('idle');
  const didFinishRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevSkipRef = useRef(0);

  const { strip, winIndex } = useMemo(() => buildCsgoStrip(revealCard, sessionSalt), [revealCard, sessionSalt]);
  const targetX = STAGE.WIN_W / 2 - (winIndex * SLOT_W + CARD_W / 2);
  const startX = targetX + STAGE.WIN_W * 0.92;
  const slowX = targetX + 16;

  const introOpacity = useRef(new Animated.Value(1)).current;
  const introScale = useRef(new Animated.Value(0.78)).current;
  const introGlow = useRef(new Animated.Value(0)).current;
  const reelOpacity = useRef(new Animated.Value(0)).current;
  const reelX = useRef(new Animated.Value(startX)).current;
  const stopGlow = useRef(new Animated.Value(0)).current;
  const dimOpacity = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const revealRotate = useRef(new Animated.Value(80)).current;
  const revealFloat = useRef(new Animated.Value(18)).current;
  const valueOpacity = useRef(new Animated.Value(0)).current;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const finish = useCallback(() => {
    if (didFinishRef.current) return;
    didFinishRef.current = true;
    hapticPackResult(roll.tier);
    onRevealDone();
  }, [onRevealDone, roll.tier]);

  const skipToResult = useCallback(() => {
    clearTimers();
    setPhase('result');
    introOpacity.setValue(0);
    introScale.setValue(1);
    introGlow.setValue(1);
    reelOpacity.setValue(1);
    reelX.setValue(targetX);
    stopGlow.setValue(1);
    dimOpacity.setValue(0.42);
    flashOpacity.setValue(0.15);
    revealRotate.setValue(0);
    revealFloat.setValue(0);
    valueOpacity.setValue(1);
    finish();
  }, [
    clearTimers,
    dimOpacity,
    finish,
    flashOpacity,
    introGlow,
    introOpacity,
    introScale,
    reelOpacity,
    reelX,
    revealFloat,
    revealRotate,
    stopGlow,
    targetX,
    valueOpacity,
  ]);

  useEffect(() => {
    didFinishRef.current = false;
    clearTimers();
    setPhase('intro');

    const m = RARITY_MULT[revealRarity];
    const introMs = Math.round((style === 'fifa' ? 960 : 760) * m);
    const spinMs = Math.round(1280 * m);
    const slowMs = Math.round(640 * m);
    const suspenseMs = Math.round(
      (revealRarity === 'chase' ? 540 : revealRarity === 'ultra_rare' ? 360 : 200) * m,
    );
    const flipMs = Math.round(520 * m);

    introOpacity.setValue(1);
    introScale.setValue(0.78);
    introGlow.setValue(0);
    reelOpacity.setValue(0);
    reelX.setValue(startX);
    stopGlow.setValue(0);
    dimOpacity.setValue(0);
    flashOpacity.setValue(0);
    revealRotate.setValue(80);
    revealFloat.setValue(18);
    valueOpacity.setValue(0);

    hapticPackEnter();

    Animated.parallel([
      Animated.timing(introGlow, {
        toValue: 1,
        duration: introMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(introScale, {
        toValue: 1,
        friction: 6,
        tension: 72,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const proceedToReveal = () => {
        const suspense = setTimeout(() => {
          setPhase('reveal');
          Animated.parallel([
            Animated.timing(dimOpacity, { toValue: 0.46, duration: 220, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(flashOpacity, { toValue: 0.9, duration: 90, useNativeDriver: true }),
              Animated.timing(flashOpacity, { toValue: 0, duration: 260, useNativeDriver: true }),
            ]),
            Animated.timing(revealRotate, {
              toValue: 0,
              duration: flipMs,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(revealFloat, { toValue: 0, duration: 260, useNativeDriver: true }),
              Animated.timing(revealFloat, { toValue: -4, duration: 120, useNativeDriver: true }),
              Animated.timing(revealFloat, { toValue: 0, duration: 120, useNativeDriver: true }),
            ]),
          ]).start(() => {
            Animated.timing(valueOpacity, { toValue: 1, duration: 350, useNativeDriver: true }).start(() => {
              setPhase('result');
              finish();
            });
          });
        }, suspenseMs);
        timersRef.current.push(suspense);
      };

      if (style === 'fifa') {
        setPhase('landing');
        hapticPackReveal();
        Animated.sequence([
          Animated.timing(introScale, {
            toValue: 1.08,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(introScale, {
            toValue: 1,
            duration: 140,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(introOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start(proceedToReveal);
        return;
      }

      Animated.parallel([
        Animated.timing(introOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(reelOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        setPhase('spinning');
        Animated.timing(reelX, {
          toValue: targetX + 440,
          duration: spinMs,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => {
          setPhase('slowing');
          Animated.timing(reelX, {
            toValue: slowX,
            duration: slowMs,
            easing: Easing.bezier(0.22, 1, 0.36, 1),
            useNativeDriver: true,
          }).start(() => {
            setPhase('landing');
            hapticPackReveal();
            Animated.sequence([
              Animated.spring(reelX, { toValue: targetX + 10, friction: 6, tension: 130, useNativeDriver: true }),
              Animated.spring(reelX, { toValue: targetX, friction: 7, tension: 145, useNativeDriver: true }),
            ]).start(() => {
              Animated.timing(stopGlow, { toValue: 1, duration: 200, useNativeDriver: true }).start();
              proceedToReveal();
            });
          });
        });
      });
    });

    return clearTimers;
  }, [
    clearTimers,
    dimOpacity,
    finish,
    flashOpacity,
    introGlow,
    introOpacity,
    introScale,
    reelOpacity,
    reelX,
    replayKey,
    revealFloat,
    revealRarity,
    revealRotate,
    style,
    slowX,
    startX,
    stopGlow,
    targetX,
    valueOpacity,
  ]);

  useEffect(() => {
    if (skipNonce === 0) {
      prevSkipRef.current = 0;
      return;
    }
    if (prevSkipRef.current === skipNonce) return;
    prevSkipRef.current = skipNonce;
    skipToResult();
  }, [skipNonce, skipToResult]);

  return {
    phase,
    strip,
    winIndex,
    reelX,
    introOpacity,
    introScale,
    introGlow,
    reelOpacity,
    stopGlow,
    dimOpacity,
    flashOpacity,
    revealRotate,
    revealFloat,
    valueOpacity,
    skipToResult,
  };
}
