import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { hapticPackEnter, hapticPackReveal, hapticPackResult } from '../../../audio/packOpeningFeedback';
import type { PackOpeningPhase, PackRollResult, RevealRarity } from './types';

/** Rarity-tuned pauses and flash weight (AAA: common snappy → chase heavy). */
function getRevealPacing(rarity: RevealRarity) {
  switch (rarity) {
    case 'common':
      return { freezeMs: 160, foilDelayMs: 320, flashIn: 66, flashOut: 102, afterglowPeak: 0.82 };
    case 'rare':
      return { freezeMs: 170, foilDelayMs: 350, flashIn: 72, flashOut: 112, afterglowPeak: 0.86 };
    case 'ultra_rare':
      return { freezeMs: 180, foilDelayMs: 385, flashIn: 78, flashOut: 120, afterglowPeak: 0.9 };
    case 'chase':
      return { freezeMs: 200, foilDelayMs: 430, flashIn: 96, flashOut: 148, afterglowPeak: 1 };
    default:
      return { freezeMs: 170, foilDelayMs: 350, flashIn: 70, flashOut: 110, afterglowPeak: 0.88 };
  }
}

/** Escalating shake: 3 → 6 → 10 → 16px, then settle (organic build). */
function buildEscalatingShake(packShakeX: Animated.Value): Animated.CompositeAnimation {
  const targets = [
    3, -3, 3, -3, 6, -6, 6, -6, 10, -10, 10, -10, 16, -16, 16, -16, 16, -16, 16, -16,
  ];
  const steps = targets.map((t) =>
    Animated.timing(packShakeX, {
      toValue: t,
      duration: 42,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  );
  return Animated.sequence([
    ...steps,
    Animated.timing(packShakeX, { toValue: 0, duration: 68, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
  ]);
}

const TIMING = {
  focus: 320,
  anticipation: 900,
  flash: 220,
  reveal: 650,
  value: 380,
};

const BADGE_DELAY_MS = 120;
const VALUE_DELAY_MS = 120;

/** Rails / sparks ramp before taps count (shorter = less passive “waiting room”) */
const ARMING_MS = 400;

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
  const packShakeX = useRef(new Animated.Value(0)).current;
  const railShimmer = useRef(new Animated.Value(0)).current;

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
  /** Full-frame “camera” punch during rupture (1 → 1.03 → 0.98 → 1). */
  const cameraPunch = useRef(new Animated.Value(1)).current;
  /** Slow bob on the pack during arming + spinning so the stage feels alive, not slide-like. */
  const packBobY = useRef(new Animated.Value(0)).current;
  /** Quick tilt nudge per tap while charging. */
  const packTiltDeg = useRef(new Animated.Value(0)).current;

  const stopFloatRef = useRef<Animated.CompositeAnimation | null>(null);
  const bobLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  /** Prevents double-firing `runPrimedBurst` from rapid taps on the commit beat. */
  const burstLockRef = useRef(false);

  const reset = useCallback(() => {
    setPhase('intro');
    bgDim.setValue(0);
    glowPulse.setValue(0);
    packScale.setValue(0.9);
    packOpacity.setValue(1);
    leakOpacity.setValue(0);
    packSplit.setValue(0);
    tapCharge.setValue(0);
    packShakeX.setValue(0);
    railShimmer.setValue(0);
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
    cameraPunch.setValue(1);
    packBobY.setValue(0);
    packTiltDeg.setValue(0);
    didFinishRef.current = false;
    stopFloatRef.current?.stop();
    stopFloatRef.current = null;
    bobLoopRef.current?.stop();
    bobLoopRef.current = null;
    burstLockRef.current = false;
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
    packShakeX,
    railShimmer,
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
    cameraPunch,
    packBobY,
    packTiltDeg,
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
    packShakeX.setValue(0);
    railShimmer.setValue(1);
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
    cameraPunch.setValue(1);
    packBobY.setValue(0);
    packTiltDeg.setValue(0);
    bobLoopRef.current?.stop();
    bobLoopRef.current = null;
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
    const pacing = getRevealPacing(revealRarity);
    const intensity =
      revealRarity === 'chase'
        ? 1
        : revealRarity === 'ultra_rare'
          ? 0.8
          : revealRarity === 'rare'
            ? 0.6
            : 0.35;
    const revealDim = 0.42 + intensity * 0.14;
    const flipMs =
      revealRarity === 'common'
        ? Math.round(TIMING.reveal * 0.88)
        : revealRarity === 'rare'
          ? Math.round(TIMING.reveal * 0.94)
          : revealRarity === 'ultra_rare'
            ? Math.round(TIMING.reveal * 1.02)
            : Math.round(TIMING.reveal * 1.08);

    packShakeX.setValue(0);
    Animated.timing(railShimmer, {
      toValue: 0.1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    setPhase('landing');
    hapticPackReveal();

    /** One restrained impact pop — avoids the cheap zoom-in/zoom-out “wobble”. */
    const cameraImpact = Animated.sequence([
      Animated.timing(cameraPunch, { toValue: 1.014, duration: 70, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(cameraPunch, { toValue: 1, friction: 11, tension: 180, useNativeDriver: true }),
    ]);

    const cardInDelayMs = 68;

    // Pre-reveal freeze: hold the frame, slightly deepen focus, then one overlapping “rupture” beat
    // (pack tear + card emergence share time — reads as motion, not successive slides).
    Animated.timing(bgDim, {
      toValue: revealDim + 0.06,
      duration: 68,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        setTimeout(() => setPhase('reveal'), 88);

        cardY.setValue(-34);

        const ruptureParallel = Animated.parallel([
          Animated.timing(packOpacity, { toValue: 0, duration: 118, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(packSplit, {
            toValue: 1,
            duration: 210,
            easing: Easing.bezier(0.33, 0, 0.14, 1),
            useNativeDriver: true,
          }),
          cameraImpact,
          Animated.sequence([
            Animated.timing(flashOpacity, { toValue: 1, duration: pacing.flashIn, easing: Easing.linear, useNativeDriver: true }),
            Animated.timing(flashOpacity, { toValue: 0, duration: pacing.flashOut, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(afterglowOpacity, {
              toValue: pacing.afterglowPeak,
              duration: 78,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(afterglowOpacity, { toValue: 0, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(silhouetteOpacity, { toValue: 0.72, duration: 44, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(silhouetteOpacity, { toValue: 0, duration: 95, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          ]),
          Animated.timing(bgDim, { toValue: revealDim, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(vignetteOpacity, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(cardInDelayMs),
            Animated.parallel([
              Animated.timing(cardOpacity, { toValue: 1, duration: 175, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
              Animated.sequence([
                Animated.timing(cardY, { toValue: 11, duration: 252, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
                Animated.spring(cardY, { toValue: 0, friction: 8, tension: 118, useNativeDriver: true }),
              ]),
              Animated.sequence([
                Animated.timing(cardScale, { toValue: 1.05, duration: Math.round(TIMING.reveal * 0.5), easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                Animated.timing(cardScale, { toValue: 1, duration: Math.round(TIMING.reveal * 0.42), easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
              ]),
              Animated.timing(cardShadow, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
              Animated.timing(flip, { toValue: 1, duration: flipMs, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true }),
              Animated.sequence([
                Animated.timing(auraOpacity, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                Animated.timing(auraOpacity, { toValue: 0.78, duration: 240, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(auraOpacity, { toValue: 1, duration: 240, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              ]),
            ]),
          ]),
        ]);

        ruptureParallel.start(({ finished }) => {
          if (!finished) return;

          setTimeout(() => {
            foilX.setValue(-140);
            foilOpacity.setValue(0);
            Animated.parallel([
              Animated.timing(foilOpacity, { toValue: 1, duration: 130, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
              Animated.timing(foilX, { toValue: 140, duration: 380, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
            ]).start(() => {
              Animated.timing(foilOpacity, { toValue: 0, duration: 165, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
            });
          }, pacing.foilDelayMs);

          Animated.sequence([
            Animated.delay(BADGE_DELAY_MS),
            Animated.parallel([
              Animated.timing(badgeOpacity, { toValue: 1, duration: 165, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
              Animated.spring(badgeScale, { toValue: 1, friction: 7, tension: 140, useNativeDriver: true }),
            ]),
            Animated.delay(VALUE_DELAY_MS),
            Animated.parallel([
              Animated.timing(valueOpacity, { toValue: 1, duration: TIMING.value, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
              Animated.spring(valueY, { toValue: 0, friction: 9, tension: 130, useNativeDriver: true }),
            ]),
          ]).start(() => finish());
        });
      }, pacing.freezeMs);
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
    packShakeX,
    railShimmer,
    cameraPunch,
  ]);

  const runPrimedBurst = useCallback(() => {
    setPhase('primed');
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setTimeout(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 380);
    }

    const shake = buildEscalatingShake(packShakeX);

    const strobe = Animated.loop(
      Animated.sequence([
        Animated.timing(railShimmer, { toValue: 1, duration: 72, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(railShimmer, { toValue: 0.3, duration: 78, easing: Easing.linear, useNativeDriver: true }),
      ]),
      { iterations: 9 },
    );

    const energyRamp = Animated.parallel([
      Animated.timing(leakOpacity, {
        toValue: 0.98,
        duration: 185,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(glowPulse, {
        toValue: 1,
        duration: 165,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    Animated.sequence([
      Animated.parallel([shake, strobe]),
      energyRamp,
    ]).start(({ finished }) => {
      if (!finished) return;
      packShakeX.setValue(0);
      railShimmer.setValue(0.72);
      runOpenAndReveal();
    });
  }, [glowPulse, leakOpacity, packShakeX, railShimmer, runOpenAndReveal]);

  const onTapCharge = useCallback(() => {
    if (phase === 'commit') {
      if (burstLockRef.current) return;
      burstLockRef.current = true;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      runPrimedBurst();
      return;
    }
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

    const tiltDir = next % 2 === 0 ? 1 : -1;
    packTiltDeg.stopAnimation();
    packTiltDeg.setValue(0);
    Animated.sequence([
      Animated.timing(packTiltDeg, {
        toValue: tiltDir * 2.4,
        duration: 38,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(packTiltDeg, { toValue: 0, friction: 6, tension: 132, useNativeDriver: true }),
    ]).start();

    if (next >= required) {
      tapCharge.setValue(1);
      Animated.parallel([
        Animated.timing(leakOpacity, {
          toValue: 0.94,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(packScale, { toValue: 1.06, friction: 5, tension: 118, useNativeDriver: true }),
      ]).start();
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      // Wait for explicit commit tap — perceived agency only; pull was already rolled in `PackOpeningModal`.
      setPhase('commit');
      burstLockRef.current = false;
    }
  }, [glowPulse, leakOpacity, packScale, packTiltDeg, phase, runPrimedBurst, tapCharge]);

  useEffect(() => {
    reset();
    hapticPackEnter();

    const intensity = revealRarity === 'chase' ? 1 : revealRarity === 'ultra_rare' ? 0.8 : revealRarity === 'rare' ? 0.6 : 0.35;
    const focusDim = 0.22 + intensity * 0.18;

    // Focus: background dim + pack enters + glow pulse begins
    Animated.parallel([
      Animated.timing(bgDim, { toValue: focusDim, duration: TIMING.focus, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(packScale, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
      Animated.timing(glowPulse, { toValue: 1, duration: TIMING.focus, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => {
      // Rails / sparks ramp — then taps register (interactive friction)
      setPhase('arming');
      Animated.parallel([
        Animated.timing(leakOpacity, {
          toValue: 0.34,
          duration: Math.round(ARMING_MS * 0.75),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(railShimmer, {
          toValue: 0.52,
          duration: ARMING_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(packScale, { toValue: 1.02, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.spring(packScale, { toValue: 1, friction: 7, tension: 120, useNativeDriver: true }),
        ]),
      ]).start(() => {
        setPhase('spinning');
        tapsRef.current = 0;
        setTapCount(0);
        tapCharge.setValue(0);
        Animated.timing(leakOpacity, {
          toValue: 0.35,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
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
    railShimmer,
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

  useEffect(() => {
    const live =
      phase === 'arming' || phase === 'spinning' || phase === 'commit';
    if (!live) {
      bobLoopRef.current?.stop();
      bobLoopRef.current = null;
      Animated.timing(packBobY, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    bobLoopRef.current?.stop();
    packBobY.setValue(0);
    const amp = phase === 'commit' ? 4.4 : 2.8;
    const halfMs = phase === 'commit' ? 520 : 760;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(packBobY, {
          toValue: -amp,
          duration: halfMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(packBobY, {
          toValue: amp,
          duration: halfMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    bobLoopRef.current = loop;
    loop.start();
    return () => {
      bobLoopRef.current?.stop();
      bobLoopRef.current = null;
    };
  }, [phase, packBobY]);

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
    packShakeX,
    railShimmer,
    cameraPunch,
    packBobY,
    packTiltDeg,
    skipToEnd,
  };
}

