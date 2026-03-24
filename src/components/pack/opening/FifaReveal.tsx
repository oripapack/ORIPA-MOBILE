import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import {
  hapticPackEnter,
  hapticPackReveal,
  hapticPackResult,
  type RarityTier,
} from '../../../audio/packOpeningFeedback';
import { colors } from '../../../tokens/colors';
import { fontSize, fontWeight } from '../../../tokens/typography';
import { spacing } from '../../../tokens/spacing';
import { getAppLogoParts } from '../../../config/app';
import { useTranslation } from 'react-i18next';
import { PackEnergyRings, RaritySweepBeams, RareConfetti } from './RarityEffects';
import { RevealResultCard } from './RevealResultCard';
import { REVEAL_RARITY_VISUAL } from './rarityTokens';
import { packArtBase } from './sharedStage';
import type { PackRollResult, RevealRarity } from './types';

const STADIUM_MS = 3200;
const BURST_MS = 420;
const WALKOUT_MS = 1100;

type FlowPhase = 'stadium' | 'burst' | 'walkout' | 'done';

const PACK_OPENING_BRAND = getAppLogoParts();

type Props = {
  roll: PackRollResult;
  revealRarity: RevealRarity;
  packTint: string;
  replayKey: number;
  skipNonce: number;
  onComplete: () => void;
};

export function FifaReveal({ roll, revealRarity, packTint, replayKey, skipNonce, onComplete }: Props) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<FlowPhase>('stadium');
  const [skippedToEnd, setSkippedToEnd] = useState(false);
  const didCompleteRef = useRef(false);

  const tierVisual = REVEAL_RARITY_VISUAL[revealRarity];
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const spotlightPulse = useRef(new Animated.Value(0)).current;
  const packScale = useRef(new Animated.Value(0.45)).current;
  const packY = useRef(new Animated.Value(120)).current;
  const packShake = useRef(new Animated.Value(0)).current;
  const packOpacity = useRef(new Animated.Value(1)).current;
  const burstFlash = useRef(new Animated.Value(0)).current;
  const burstTint = useRef(new Animated.Value(0)).current;
  const walkoutY = useRef(new Animated.Value(520)).current;
  const walkoutScale = useRef(new Animated.Value(0.5)).current;
  const walkoutRotate = useRef(new Animated.Value(0)).current;
  const cardShine = useRef(new Animated.Value(0)).current;

  const glowLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const shakeLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timersRef = useRef<{
    burst?: ReturnType<typeof setTimeout>;
    walkout?: ReturnType<typeof setTimeout>;
    done?: ReturnType<typeof setTimeout>;
    hint?: ReturnType<typeof setTimeout>;
  }>({});

  const packShakeDeg = useMemo(
    () =>
      packShake.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: ['-4deg', '5deg', '-6deg', '4deg', '-4deg'],
      }),
    [packShake],
  );

  const walkoutRotStr = walkoutRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['8deg', '0deg'],
  });

  const runWalkoutAnimation = (tier: RarityTier) => {
    walkoutY.setValue(520);
    const startScale =
      tier === 'mythic'
        ? 0.36
        : tier === 'legendary'
          ? 0.4
          : tier === 'epic'
            ? 0.43
            : tier === 'rare'
              ? 0.47
              : 0.52;
    walkoutScale.setValue(startScale);
    walkoutRotate.setValue(0);
    cardShine.setValue(0);

    const ySpring =
      tier === 'mythic'
        ? { friction: 4, tension: 64 }
        : tier === 'legendary'
          ? { friction: 5, tension: 68 }
          : tier === 'epic'
            ? { friction: 5, tension: 72 }
            : tier === 'rare'
              ? { friction: 6, tension: 74 }
              : { friction: 7, tension: 80 };

    const scaleSpring =
      tier === 'mythic' || tier === 'legendary'
        ? { friction: 4, tension: 74 }
        : { friction: 6, tension: 78 };

    Animated.parallel([
      Animated.spring(walkoutY, {
        toValue: 0,
        ...ySpring,
        useNativeDriver: true,
      }),
      Animated.spring(walkoutScale, {
        toValue: 1,
        ...scaleSpring,
        useNativeDriver: true,
      }),
      Animated.timing(walkoutRotate, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardShine, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const skipToEnd = useCallback(() => {
    glowLoopRef.current?.stop();
    shakeLoopRef.current?.stop();
    Object.values(timersRef.current).forEach((id) => id && clearTimeout(id));
    timersRef.current = {};

    setSkippedToEnd(true);
    setPhase('done');
    packOpacity.setValue(0);
    burstFlash.setValue(0);
    burstTint.setValue(0);
    walkoutY.setValue(0);
    walkoutScale.setValue(1);
    walkoutRotate.setValue(1);
    cardShine.setValue(1);
    hapticPackResult(roll.tier);
    if (!didCompleteRef.current) {
      didCompleteRef.current = true;
      onComplete();
    }
  }, [onComplete, roll.tier]);

  const prevSkipRef = useRef(0);
  useEffect(() => {
    if (skipNonce === 0) {
      prevSkipRef.current = 0;
      return;
    }
    if (skipNonce === prevSkipRef.current) return;
    prevSkipRef.current = skipNonce;
    skipToEnd();
  }, [skipNonce, skipToEnd]);

  useEffect(() => {
    didCompleteRef.current = false;
    setSkippedToEnd(false);
    setPhase('stadium');

    modalOpacity.setValue(0);
    spotlightPulse.setValue(0);
    packScale.setValue(0.45);
    packY.setValue(120);
    packShake.setValue(0);
    packOpacity.setValue(1);
    burstFlash.setValue(0);
    burstTint.setValue(0);
    walkoutY.setValue(520);
    walkoutScale.setValue(0.5);
    walkoutRotate.setValue(0);
    cardShine.setValue(0);

    const spotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(spotlightPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(spotlightPulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    glowLoopRef.current = spotLoop;
    spotLoop.start();

    const shakeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(packShake, {
          toValue: 1,
          duration: 180,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(packShake, {
          toValue: 0,
          duration: 180,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    shakeLoopRef.current = shakeLoop;
    shakeLoop.start();

    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(packScale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.spring(packY, {
        toValue: 0,
        friction: 6,
        tension: 68,
        useNativeDriver: true,
      }),
    ]).start((ev) => {
      if (ev?.finished) {
        hapticPackEnter();
      }
    });

    timersRef.current.burst = setTimeout(() => {
      setPhase('burst');
      glowLoopRef.current?.stop();
      shakeLoopRef.current?.stop();
      hapticPackReveal();

      const chroma = roll.tier === 'mythic' || roll.tier === 'legendary' || roll.tier === 'epic';
      if (chroma) {
        burstTint.setValue(0);
        Animated.sequence([
          Animated.timing(burstTint, {
            toValue: 0.92,
            duration: 52,
            useNativeDriver: true,
          }),
          Animated.timing(burstTint, {
            toValue: 0,
            duration: 360,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }

      Animated.timing(packOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();

      Animated.sequence([
        Animated.timing(burstFlash, {
          toValue: 1,
          duration: chroma ? 55 : 70,
          useNativeDriver: true,
        }),
        Animated.timing(burstFlash, {
          toValue: 0,
          duration: chroma ? 300 : 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, STADIUM_MS);

    timersRef.current.walkout = setTimeout(() => {
      setPhase('walkout');
      runWalkoutAnimation(roll.tier);
      hapticPackResult(roll.tier);
    }, STADIUM_MS + BURST_MS);

    timersRef.current.done = setTimeout(() => {
      setPhase('done');
      if (!didCompleteRef.current) {
        didCompleteRef.current = true;
        onComplete();
      }
    }, STADIUM_MS + BURST_MS + WALKOUT_MS);

    return () => {
      glowLoopRef.current?.stop();
      shakeLoopRef.current?.stop();
      Object.values(timersRef.current).forEach((id) => id && clearTimeout(id));
      timersRef.current = {};
    };
  }, [
    replayKey,
    roll.tier,
    onComplete,
    modalOpacity,
    spotlightPulse,
    packScale,
    packY,
    packShake,
    packOpacity,
    burstFlash,
    burstTint,
    walkoutY,
    walkoutScale,
    walkoutRotate,
    cardShine,
  ]);

  const showConfetti =
    roll.tier !== 'common' && (phase === 'walkout' || phase === 'done') && !skippedToEnd;

  return (
    <View style={styles.stage}>
      {phase === 'stadium' && <RaritySweepBeams revealRarity={revealRarity} active />}

      {(phase === 'stadium' || phase === 'burst') && (
        <View style={styles.packStage}>
          {phase === 'stadium' && <PackEnergyRings color={tierVisual.border} active />}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.packHalo,
              {
                borderColor: tierVisual.border,
                shadowColor: tierVisual.glow,
                opacity: packOpacity,
              },
            ]}
          />
          <Animated.View
            style={{
              opacity: packOpacity,
              transform: [{ translateY: packY }, { rotate: packShakeDeg }, { scale: packScale }],
            }}
          >
            <View style={[packArtBase, { backgroundColor: packTint }]}>
              <Text style={styles.packEmoji}>🎴</Text>
              <Text style={styles.packArtTitle}>{PACK_OPENING_BRAND.primary.toUpperCase()}</Text>
              {PACK_OPENING_BRAND.secondary ? (
                <Text style={styles.packArtSub}>{PACK_OPENING_BRAND.secondary.toUpperCase()}</Text>
              ) : null}
              <Text style={styles.packHint}>{t('packOpening.opening')}</Text>
            </View>
          </Animated.View>
        </View>
      )}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.burstTintLayer,
          {
            opacity: burstTint,
            backgroundColor: tierVisual.beam,
          },
        ]}
      />

      <Animated.View pointerEvents="none" style={[styles.burstLayer, { opacity: burstFlash }]} />

      {(phase === 'walkout' || phase === 'done') && (
        <View style={styles.walkoutArea}>
          <RareConfetti active={!!showConfetti} tier={roll.tier} revealRarity={revealRarity} />
          <RevealResultCard
            creditsWon={roll.creditsWon}
            resultText={roll.result}
            revealRarity={revealRarity}
            walkoutY={walkoutY}
            walkoutScale={walkoutScale}
            walkoutRotate={walkoutRotStr}
            cardShine={cardShine}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    minHeight: 380,
    justifyContent: 'center',
  },
  packStage: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 260,
  },
  packHalo: {
    position: 'absolute',
    width: 240,
    height: 300,
    borderRadius: 18,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 12,
  },
  packEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  packArtTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    letterSpacing: 4,
  },
  packArtSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 4,
    marginTop: 6,
  },
  packHint: {
    marginTop: spacing.lg,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  burstTintLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 18,
  },
  burstLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 20,
  },
  walkoutArea: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    zIndex: 15,
  },
});
