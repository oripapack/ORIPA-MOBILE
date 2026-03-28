import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { hapticPackEnter, hapticPackReveal, hapticPackResult } from '../../../audio/packOpeningFeedback';
import type { PackOpeningPhase, PackRollResult, RevealRarity } from './types';

const TIMING = {
  focus: 400,
  anticipation: 900,
  flash: 220,
  reveal: 650,
  value: 420,
};

const FREEZE_MS = 100;
const BADGE_DELAY_MS = 150;
const VALUE_DELAY_MS = 150;
const FOIL_DELAY_MS = 200;

function randInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function useHeroReveal({
  roll,
  revealRarity,
  replayKey,
  skipNonce,
  onRevealDone,
}: {
  roll: PackRollResult;
  revealRarity: RevealRarity;
  replayKey: number;
  skipNonce: number;
  onRevealDone: () => void;
}) {
  // Stable identity for effect deps when the same pack is opened again with a new roll (parent also remounts via key).
  const rollId = `${roll.tier}-${roll.creditsWon}-${roll.result}`;
  const [phase, setPhase] = useState<PackOpeningPhase>('idle');
  const didFinishRef = useRef(false);
  const prevSkipRef = useRef(0);
  const [tapCount, setTapCount] = useState(0);
  const tapsRef = useRef(0);
  const tapsRequiredRef = useRef(6);

  const bgDim = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const packScale = useRef(new Animated.Value(0.9)).current;
  const packOpacity = useRef(new Animated.Value(1)).current;
  const leakOpacity = useRef(new Animated.Value(0)).current;
  const packSplit = useRef(new Animated.Value(0)).current; // 0..1
  const tapCharge = useRef(new Animated.Value(0)).current; // 0..1

  const flashOpacity = useRef(new Animated.Value(0)).current;
  const afterglowOpacity = useRef(new Animated.Value(0)).current;
  const silhouetteOpacity = useRef(new Animated.Value(0)).current;

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const cardY = useRef(new Animated.Value(22)).current;
  const flip = useRef(new Animated.Value(0)).current; // 0..1

  const auraOpacity = useRef(new Animated.Value(0)).current;
  const vignetteOpacity = useRef(new Animated.Value(0)).current;
  const foilX = useRef(new Animated.Value(-140)).current;
  const foilOpacity = useRef(new Animated.Value(0)).current;
  const cardShadow = useRef(new Animated.Value(0)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0.86)).current;
  const valueOpacity = useRef(new Animated.Value(0)).current;
  const valueY = useRef(new Animated.Value(10)).current;
  const floatY = useRef(new Animated.Value(0)).current;

  const stopFloatRef = useRef<Animated.CompositeAnimation | null>(null);

  const reset = useCallback(() => {
    setPhase('intro');
    bgDim.setValue(0);
    glowPulse.setValue(0);
    packScale.setValue(0.9);
    packOpacity.setValue(1);
    leakOpacity.setValue(0);
    packSplit.setValue(0);
    tapCharge.setValue(0);
    tapsRef.current = 0;
    setTapCount(0);
    tapsRequiredRef.current = randInt(5, 8);
    flashOpacity.setValue(0);
    afterglowOpacity.setValue(0);
    silhouetteOpacity.setValue(0);
    cardOpacity.setValue(0);
    cardScale.setValue(0.96);
    cardY.setValue(22);
    flip.setValue(0);
    auraOpacity.setValue(0);
    vignetteOpacity.setValue(0);
    foilX.setValue(-140);
    foilOpacity.setValue(0);
    cardShadow.setValue(0);
    badgeOpacity.setValue(0);
    badgeScale.setValue(0.86);
    valueOpacity.setValue(0);
    valueY.setValue(10);
    floatY.setValue(0);
    didFinishRef.current = false;
    stopFloatRef.current?.stop();
    stopFloatRef.current = null;
  }, [
    auraOpacity,
    badgeOpacity,
    bgDim,
    cardOpacity,
    cardScale,
    cardY,
    flashOpacity,
    afterglowOpacity,
    floatY,
    flip,
    glowPulse,
    leakOpacity,
    tapCharge,
    packSplit,
    packOpacity,
    packScale,
    silhouetteOpacity,
    valueOpacity,
    valueY,
    badgeScale,
    vignetteOpacity,
    foilX,
    foilOpacity,
    cardShadow,
  ]);

  const finish = useCallback(() => {
    if (didFinishRef.current) return;
    didFinishRef.current = true;
    hapticPackResult(roll.tier);
    onRevealDone();
    setPhase('result');

    // Subtle float after reveal (single element; native driver).
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -4, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    stopFloatRef.current = loop;
    loop.start();

    // Ease focus layers out after settle (keeps hero moment, then relaxes).
    Animated.timing(vignetteOpacity, {
      toValue: 0,
      duration: 650,
      delay: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.timing(afterglowOpacity, {
      toValue: 0,
      duration: 520,
      delay: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [floatY, onRevealDone, roll.tier]);

  const skipToEnd = useCallback(() => {
    bgDim.setValue(0.55);
    glowPulse.setValue(1);
    packOpacity.setValue(0);
    leakOpacity.setValue(1);
    packSplit.setValue(1);
    tapCharge.setValue(1);
    flashOpacity.setValue(0);
    afterglowOpacity.setValue(0);
    silhouetteOpacity.setValue(0);
    cardOpacity.setValue(1);
    cardScale.setValue(1);
    cardY.setValue(0);
    flip.setValue(1);
    auraOpacity.setValue(1);
    vignetteOpacity.setValue(0);
    foilX.setValue(140);
    foilOpacity.setValue(0);
    cardShadow.setValue(1);
    badgeOpacity.setValue(1);
    badgeScale.setValue(1);
    valueOpacity.setValue(1);
    valueY.setValue(0);
    finish();
  }, [
    auraOpacity,
    badgeOpacity,
    bgDim,
    cardOpacity,
    cardScale,
    cardY,
    finish,
    flashOpacity,
    afterglowOpacity,
    flip,
    glowPulse,
    leakOpacity,
    tapCharge,
    packSplit,
    packOpacity,
    silhouetteOpacity,
    valueOpacity,
    valueY,
    badgeScale,
    vignetteOpacity,
    foilX,
    foilOpacity,
    cardShadow,
  ]);

  const runOpenAndReveal = useCallback(() => {
    const intensity =
      revealRarity === 'chase'
        ? 1
        : revealRarity === 'ultra_rare'
          ? 0.8
          : revealRarity === 'rare'
            ? 0.6
            : 0.35;
    const revealDim = 0.42 + intensity * 0.14;

    setPhase('landing');
    hapticPackReveal();

    // Pre-reveal freeze: hold the frame, slightly deepen focus, then flash.
    Animated.timing(bgDim, {
      toValue: revealDim + 0.06,
      duration: 80,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(packOpacity, { toValue: 0, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(packSplit, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(flashOpacity, { toValue: 1, duration: 70, easing: Easing.linear, useNativeDriver: true }),
            Animated.timing(flashOpacity, { toValue: 0, duration: 110, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(afterglowOpacity, { toValue: 0.9, duration: 90, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(afterglowOpacity, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(silhouetteOpacity, { toValue: 1, duration: 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(silhouetteOpacity, { toValue: 0, duration: 130, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          ]),
          Animated.timing(bgDim, { toValue: revealDim, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(vignetteOpacity, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start(() => {
      setPhase('reveal');

      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        // Parallax lift: slight up + scale + shadow ramp.
        Animated.sequence([
          Animated.timing(cardY, { toValue: -8, duration: Math.round(TIMING.reveal * 0.62), easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.spring(cardY, { toValue: 0, friction: 9, tension: 120, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(cardScale, { toValue: 1.05, duration: Math.round(TIMING.reveal * 0.55), easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(cardScale, { toValue: 1, duration: Math.round(TIMING.reveal * 0.45), easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        ]),
        Animated.timing(cardShadow, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(flip, { toValue: 1, duration: TIMING.reveal, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(auraOpacity, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(auraOpacity, { toValue: 0.78, duration: 260, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(auraOpacity, { toValue: 1, duration: 260, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ]).start(() => {
        // Single foil sweep (one pass), starts shortly after reveal begins.
        setTimeout(() => {
          foilX.setValue(-140);
          foilOpacity.setValue(0);
          Animated.parallel([
            Animated.timing(foilOpacity, { toValue: 1, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(foilX, { toValue: 140, duration: 400, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
          ]).start(() => {
            Animated.timing(foilOpacity, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
          });
        }, FOIL_DELAY_MS);

        Animated.sequence([
          Animated.delay(BADGE_DELAY_MS),
          Animated.parallel([
            Animated.timing(badgeOpacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.spring(badgeScale, { toValue: 1, friction: 7, tension: 140, useNativeDriver: true }),
          ]),
          Animated.delay(VALUE_DELAY_MS),
          Animated.parallel([
            Animated.timing(valueOpacity, { toValue: 1, duration: TIMING.value, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.spring(valueY, { toValue: 0, friction: 9, tension: 130, useNativeDriver: true }),
          ]),
        ]).start(() => finish());
      });
        });
      }, FREEZE_MS);
    });
  }, [
    auraOpacity,
    afterglowOpacity,
    badgeOpacity,
    badgeScale,
    bgDim,
    cardOpacity,
    cardScale,
    cardY,
    cardShadow,
    finish,
    flashOpacity,
    flip,
    packOpacity,
    packSplit,
    revealRarity,
    silhouetteOpacity,
    valueOpacity,
    valueY,
    vignetteOpacity,
    foilX,
    foilOpacity,
  ]);

  const onTapCharge = useCallback(() => {
    if (phase !== 'spinning') return;
    const required = tapsRequiredRef.current;
    const next = Math.min(required, tapsRef.current + 1);
    tapsRef.current = next;
    setTapCount(next);
    const p = next / required;

    // Charge feedback: leak + scale creep + halo pulse. All native-driver friendly.
    Animated.parallel([
      Animated.timing(tapCharge, { toValue: p, duration: 90, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(leakOpacity, { toValue: 0.55 + 0.45 * p, duration: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(packScale, { toValue: 1.02 + 0.07 * p, duration: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 70, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.72 + 0.28 * p, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    if (next >= required) {
      runOpenAndReveal();
    }
  }, [glowPulse, leakOpacity, packScale, phase, runOpenAndReveal, tapCharge]);

  useEffect(() => {
    reset();
    hapticPackEnter();

    const intensity = revealRarity === 'chase' ? 1 : revealRarity === 'ultra_rare' ? 0.8 : revealRarity === 'rare' ? 0.6 : 0.35;
    const focusDim = 0.22 + intensity * 0.18;
    const revealDim = 0.42 + intensity * 0.14;

    // Focus: background dim + pack enters + glow pulse begins
    Animated.parallel([
      Animated.timing(bgDim, { toValue: focusDim, duration: TIMING.focus, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(packScale, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
      Animated.timing(glowPulse, { toValue: 1, duration: TIMING.focus, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => {
      // Enter tap-to-build anticipation state
      setPhase('spinning');
      tapsRef.current = 0;
      setTapCount(0);
      tapCharge.setValue(0);
      // Gentle baseline leak so it doesn't feel dead before the first tap
      Animated.timing(leakOpacity, {
        toValue: 0.35,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    return () => {
      stopFloatRef.current?.stop();
    };
  }, [
    rollId,
    replayKey,
    auraOpacity,
    badgeOpacity,
    badgeScale,
    bgDim,
    cardOpacity,
    cardScale,
    cardY,
    finish,
    flip,
    glowPulse,
    leakOpacity,
    packOpacity,
    packScale,
    packSplit,
    tapCharge,
    reset,
    revealRarity,
    silhouetteOpacity,
    valueOpacity,
    valueY,
  ]);

  useEffect(() => {
    if (skipNonce === 0) {
      prevSkipRef.current = 0;
      return;
    }
    if (prevSkipRef.current === skipNonce) return;
    prevSkipRef.current = skipNonce;
    skipToEnd();
  }, [skipNonce, skipToEnd]);

  return {
    phase,
    tapCount,
    tapsRequired: tapsRequiredRef.current,
    onTapCharge,
    bgDim,
    glowPulse,
    packScale,
    packOpacity,
    leakOpacity,
    packSplit,
    tapCharge,
    flashOpacity,
    afterglowOpacity,
    silhouetteOpacity,
    cardOpacity,
    cardScale,
    cardY,
    flip,
    auraOpacity,
    vignetteOpacity,
    foilX,
    foilOpacity,
    cardShadow,
    badgeOpacity,
    badgeScale,
    valueOpacity,
    valueY,
    floatY,
    skipToEnd,
  };
}

