import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { hapticPackEnter, hapticPackReveal } from '../../../audio/packOpeningFeedback';
import { colors } from '../../../tokens/colors';
import { fontSize, fontWeight } from '../../../tokens/typography';
import { spacing } from '../../../tokens/spacing';
import { getAppLogoParts } from '../../../config/app';
import { useTranslation } from 'react-i18next';
import { CsgoReveal } from './CsgoReveal';
import { PackEnergyRings, RaritySweepBeams, RareConfetti } from './RarityEffects';
import { RevealResultCard } from './RevealResultCard';
import { REVEAL_RARITY_VISUAL } from './rarityTokens';
import { packArtBase } from './sharedStage';
import type { PackRollResult, RevealCard, RevealRarity } from './types';

const INTRO_STADIUM_MS = 1500;
const INTRO_BURST_MS = 380;
const FINALE_MS = 900;

const PACK_OPENING_BRAND = getAppLogoParts();

type Phase = 'intro' | 'csgo' | 'finale' | 'done';

type Props = {
  roll: PackRollResult;
  revealCard: RevealCard;
  revealRarity: RevealRarity;
  packTint: string;
  sessionSalt: number;
  replayKey: number;
  skipNonce: number;
  onComplete: () => void;
};

export function HybridReveal({
  roll,
  revealCard,
  revealRarity,
  packTint,
  sessionSalt,
  replayKey,
  skipNonce,
  onComplete,
}: Props) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('intro');
  const didCompleteRef = useRef(false);

  const tierVisual = REVEAL_RARITY_VISUAL[revealRarity];

  const spotlightPulse = useRef(new Animated.Value(0)).current;
  const packScale = useRef(new Animated.Value(0.5)).current;
  const packY = useRef(new Animated.Value(100)).current;
  const packOpacity = useRef(new Animated.Value(1)).current;
  const burstFlash = useRef(new Animated.Value(0)).current;
  const burstTint = useRef(new Animated.Value(0)).current;

  const finaleY = useRef(new Animated.Value(120)).current;
  const finaleScale = useRef(new Animated.Value(0.82)).current;
  const finaleOpacity = useRef(new Animated.Value(0)).current;

  const glowLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const resetIntro = useCallback(() => {
    spotlightPulse.setValue(0);
    packScale.setValue(0.5);
    packY.setValue(100);
    packOpacity.setValue(1);
    burstFlash.setValue(0);
    burstTint.setValue(0);
    finaleY.setValue(120);
    finaleScale.setValue(0.82);
    finaleOpacity.setValue(0);
    didCompleteRef.current = false;
    setPhase('intro');
  }, [burstFlash, burstTint, finaleOpacity, finaleScale, finaleY, packOpacity, packScale, packY, spotlightPulse]);

  useEffect(() => {
    resetIntro();
  }, [replayKey, resetIntro]);

  const runIntro = useCallback(() => {
    const spotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(spotlightPulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(spotlightPulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    glowLoopRef.current = spotLoop;
    spotLoop.start();

    Animated.parallel([
      Animated.spring(packScale, {
        toValue: 1,
        friction: 5,
        tension: 72,
        useNativeDriver: true,
      }),
      Animated.spring(packY, {
        toValue: 0,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start((ev) => {
      if (ev?.finished) {
        hapticPackEnter();
      }
    });

    const t1 = setTimeout(() => {
      glowLoopRef.current?.stop();
      hapticPackReveal();

      const chroma = roll.tier === 'mythic' || roll.tier === 'legendary' || roll.tier === 'epic';
      if (chroma) {
        burstTint.setValue(0);
        Animated.sequence([
          Animated.timing(burstTint, {
            toValue: 0.88,
            duration: 48,
            useNativeDriver: true,
          }),
          Animated.timing(burstTint, {
            toValue: 0,
            duration: 320,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }

      Animated.timing(packOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      Animated.sequence([
        Animated.timing(burstFlash, {
          toValue: 1,
          duration: chroma ? 50 : 65,
          useNativeDriver: true,
        }),
        Animated.timing(burstFlash, {
          toValue: 0,
          duration: chroma ? 280 : 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, INTRO_STADIUM_MS);

    const t2 = setTimeout(() => {
      setPhase('csgo');
    }, INTRO_STADIUM_MS + INTRO_BURST_MS);

    timersRef.current = [t1, t2];
  }, [
    burstFlash,
    burstTint,
    packOpacity,
    packScale,
    packY,
    roll.tier,
    spotlightPulse,
  ]);

  useEffect(() => {
    if (phase !== 'intro') return;
    runIntro();
    return () => {
      glowLoopRef.current?.stop();
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [phase, replayKey, runIntro]);

  const onCsgoDone = useCallback(() => {
    setPhase('finale');
    finaleOpacity.setValue(0);
    finaleY.setValue(90);
    finaleScale.setValue(0.88);

    const sp =
      roll.tier === 'mythic' || roll.tier === 'legendary'
        ? { friction: 5, tension: 68 }
        : roll.tier === 'epic'
          ? { friction: 6, tension: 72 }
          : { friction: 7, tension: 78 };

    Animated.parallel([
      Animated.timing(finaleOpacity, {
        toValue: 1,
        duration: FINALE_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(finaleY, {
        toValue: 0,
        ...sp,
        useNativeDriver: true,
      }),
      Animated.spring(finaleScale, {
        toValue: 1,
        ...sp,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPhase('done');
      if (!didCompleteRef.current) {
        didCompleteRef.current = true;
        onComplete();
      }
    });
  }, [finaleOpacity, finaleScale, finaleY, onComplete, roll.tier]);

  const skipAll = useCallback(() => {
    glowLoopRef.current?.stop();
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('finale');
    packOpacity.setValue(0);
    burstFlash.setValue(0);
    burstTint.setValue(0);
    finaleOpacity.setValue(1);
    finaleY.setValue(0);
    finaleScale.setValue(1);
    if (!didCompleteRef.current) {
      didCompleteRef.current = true;
      onComplete();
    }
  }, [burstFlash, burstTint, finaleOpacity, finaleScale, finaleY, onComplete, packOpacity]);

  const prevSkipRef = useRef(0);
  useEffect(() => {
    if (skipNonce === 0) {
      prevSkipRef.current = 0;
      return;
    }
    if (skipNonce === prevSkipRef.current) return;
    prevSkipRef.current = skipNonce;
    if (phase === 'intro') skipAll();
  }, [phase, skipAll, skipNonce]);

  const showConfetti = useMemo(
    () => roll.tier !== 'common' && (phase === 'finale' || phase === 'done'),
    [phase, roll.tier],
  );

  return (
    <View style={styles.stage}>
      {phase === 'intro' && <RaritySweepBeams revealRarity={revealRarity} active />}

      {phase === 'intro' && (
        <View style={styles.packStage}>
          <PackEnergyRings color={tierVisual.border} active />
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
              transform: [{ translateY: packY }, { scale: packScale }],
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

      {phase === 'csgo' && (
        <View style={styles.csgoWrap}>
          <CsgoReveal
            winningCard={revealCard}
            sessionSalt={sessionSalt}
            replayKey={replayKey}
            skipNonce={skipNonce}
            audioTier={roll.tier}
            onComplete={onCsgoDone}
          />
        </View>
      )}

      {(phase === 'finale' || phase === 'done') && (
        <View style={styles.finaleArea} pointerEvents="box-none">
          <RareConfetti active={showConfetti} tier={roll.tier} revealRarity={revealRarity} />
          <Animated.View
            style={{
              opacity: finaleOpacity,
              transform: [{ translateY: finaleY }, { scale: finaleScale }],
              width: '100%',
              alignItems: 'center',
            }}
          >
            <RevealResultCard
              creditsWon={roll.creditsWon}
              resultText={roll.result}
              revealRarity={revealRarity}
            />
          </Animated.View>
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
    minHeight: 220,
  },
  packHalo: {
    position: 'absolute',
    width: 220,
    height: 280,
    borderRadius: 18,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 24,
    elevation: 12,
  },
  packEmoji: {
    fontSize: 44,
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
    marginTop: spacing.md,
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
  csgoWrap: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 12,
  },
  finaleArea: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    zIndex: 25,
  },
});
