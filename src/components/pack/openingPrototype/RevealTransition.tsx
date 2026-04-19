import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { brandFont } from '../../../tokens/typography';
import { spacing } from '../../../tokens/spacing';
import type { PackRollResult, RevealCard, RevealRarity } from '../opening/types';
import { tierCelebrationFor } from '../opening/tierCelebration';

const easeOut = Easing.bezier(0.33, 0.86, 0.2, 1);
const easeDrift = Easing.bezier(0.22, 1, 0.36, 1);
/** Longer, calmer beats so tier → hero → payout → stats read as separate moments */
const T = {
  rootInMs: 780,
  rootLiftPx: 18,
  badgeDelayMs: 140,
  badgeOpacityMs: 540,
  heroDelayMs: 320,
  heroOpacityMs: 720,
  heroStartScale: 0.74,
  heroLiftPx: 36,
  glowDelayMs: 380,
  glowRampMs: 560,
  glowSettleMs: 720,
  winDelayMs: 860,
  winInMs: 620,
  tertiaryDelayMs: 1180,
  tertiaryInMs: 520,
  statsDelayMs: 980,
  statsInMs: 560,
  breathLoopStartMs: 900,
} as const;
const { width: WIN_W } = Dimensions.get('window');

type Props = {
  roll: PackRollResult;
  revealCard: RevealCard;
  revealRarity: RevealRarity;
  skipped: boolean;
  onStoreInVault?: () => void;
  onSharePull?: () => void;
};

function CompactCelebrationStats({
  credits,
  vaultValue,
  tierLabel,
  tierColor,
  delayMs,
}: {
  credits: string;
  vaultValue: string;
  tierLabel: string;
  tierColor: string;
  delayMs: number;
}) {
  const { t } = useTranslation();
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(22)).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delayMs),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: T.statsInMs,
          easing: easeOut,
          useNativeDriver: true,
        }),
        Animated.spring(y, {
          toValue: 0,
          friction: 14,
          tension: 56,
          useNativeDriver: true,
        }),
      ]),
    ]);
    anim.start();
    return () => anim.stop();
  }, [delayMs, opacity, y]);

  const cell = (label: string, value: string, valueColor?: string) => (
    <View style={styles.statPill}>
      <Text style={styles.statPillLabel}>{label}</Text>
      <Text
        style={[styles.statPillValue, valueColor ? { color: valueColor } : undefined]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <Animated.View style={[styles.statsRow, { opacity, transform: [{ translateY: y }] }]}>
      {cell(t('packOpening.resultStatCoins'), credits)}
      {cell(t('packOpening.resultStatVaultValue'), vaultValue)}
      {cell(t('packOpening.resultStatTier'), tierLabel, tierColor)}
    </Animated.View>
  );
}

/**
 * Post-rip reveal: hero-first celebration, compact stats, optional vault / share.
 */
export function RevealTransition({
  roll,
  revealCard,
  revealRarity: _revealRarity,
  skipped,
  onStoreInVault,
  onSharePull,
}: Props) {
  void _revealRarity;
  const { t } = useTranslation();
  const tv = tierCelebrationFor(roll.tier);
  const tierLabel = t(`packOpening.tier_${roll.tier}`);

  const heroSize = Math.min(280, WIN_W * 0.58);
  const artSize = Math.round(heroSize * 0.4);

  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(T.rootLiftPx)).current;

  const badgeOp = useRef(new Animated.Value(0)).current;
  const badgeY = useRef(new Animated.Value(14)).current;

  const heroOp = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(T.heroStartScale)).current;
  const heroY = useRef(new Animated.Value(T.heroLiftPx)).current;

  const glowIntro = useRef(new Animated.Value(0)).current;
  const breath = useRef(new Animated.Value(0)).current;

  const winOp = useRef(new Animated.Value(0)).current;
  const winY = useRef(new Animated.Value(22)).current;

  const tertiaryOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: T.rootInMs,
        easing: easeDrift,
        useNativeDriver: true,
      }),
      Animated.timing(lift, {
        toValue: 0,
        duration: T.rootInMs,
        easing: easeDrift,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, lift]);

  useEffect(() => {
    const badgeIn = Animated.parallel([
      Animated.timing(badgeOp, {
        toValue: 1,
        duration: T.badgeOpacityMs,
        delay: T.badgeDelayMs,
        easing: easeOut,
        useNativeDriver: true,
      }),
      Animated.spring(badgeY, {
        toValue: 0,
        delay: T.badgeDelayMs,
        friction: 13,
        tension: 58,
        useNativeDriver: true,
      }),
    ]);

    const heroIn = Animated.parallel([
      Animated.timing(heroOp, {
        toValue: 1,
        duration: T.heroOpacityMs,
        delay: T.heroDelayMs,
        easing: easeDrift,
        useNativeDriver: true,
      }),
      Animated.spring(heroScale, {
        toValue: 1,
        delay: T.heroDelayMs,
        friction: 11,
        tension: 52,
        useNativeDriver: true,
      }),
      Animated.spring(heroY, {
        toValue: 0,
        delay: T.heroDelayMs,
        friction: 12,
        tension: 54,
        useNativeDriver: true,
      }),
    ]);

    const glow = Animated.sequence([
      Animated.delay(T.glowDelayMs),
      Animated.timing(glowIntro, {
        toValue: 1,
        duration: T.glowRampMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(glowIntro, {
        toValue: 0.55,
        duration: T.glowSettleMs,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    const winIn = Animated.sequence([
      Animated.delay(T.winDelayMs),
      Animated.parallel([
        Animated.timing(winOp, {
          toValue: 1,
          duration: T.winInMs,
          easing: easeDrift,
          useNativeDriver: true,
        }),
        Animated.spring(winY, {
          toValue: 0,
          friction: 13,
          tension: 58,
          useNativeDriver: true,
        }),
      ]),
    ]);

    const tertiaryIn = Animated.sequence([
      Animated.delay(T.tertiaryDelayMs),
      Animated.timing(tertiaryOp, {
        toValue: 1,
        duration: T.tertiaryInMs,
        easing: easeDrift,
        useNativeDriver: true,
      }),
    ]);

    Animated.parallel([badgeIn, heroIn, glow, winIn, tertiaryIn]).start();
  }, [badgeOp, badgeY, glowIntro, heroOp, heroScale, heroY, tertiaryOp, winOp, winY]);

  useEffect(() => {
    if (tv.pulseStrength < 0.18) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: Math.round(1900 + (1 - tv.pulseStrength) * 700),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: Math.round(1900 + (1 - tv.pulseStrength) * 700),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const tId = setTimeout(() => loop.start(), T.breathLoopStartMs);
    return () => {
      clearTimeout(tId);
      loop.stop();
    };
  }, [breath, tv.pulseStrength]);

  const haloScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08 + tv.pulseStrength * 0.08],
  });

  const haloOpacity = glowIntro.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.42 + tv.pulseStrength * 0.28],
  });

  const onShare = () => {
    if (onSharePull) {
      onSharePull();
      return;
    }
    const msg = t('packOpening.shareMessage', {
      name: revealCard.name,
      tier: tierLabel,
      credits: roll.creditsWon.toLocaleString(),
    });
    void Share.share({ message: msg });
  };

  return (
    <View style={styles.outer}>
      <LinearGradient
        colors={['rgba(2,6,23,0.2)', 'rgba(15,23,42,0.35)', 'rgba(2,6,23,0.25)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View style={[styles.column, { opacity: fade, transform: [{ translateY: lift }] }]}>
          {skipped ? (
            <Text style={styles.skipped}>{t('packOpening.skippedToResult')}</Text>
          ) : null}

          <Text style={styles.eyebrow}>{t('packOpening.title')}</Text>

          <Animated.View
            style={[
              styles.tierBadgeWrap,
              { opacity: badgeOp, transform: [{ translateY: badgeY }] },
            ]}
          >
            <View style={[styles.tierBadge, { borderColor: tv.border }]}>
              <Text style={[styles.tierBadgeEmoji, { color: tv.accent }]}>{tv.emoji}</Text>
              <Text style={[styles.tierBadgeText, { color: tv.accent }]}>{tierLabel}</Text>
            </View>
          </Animated.View>

          <View style={styles.heroBlock}>
            <View
              style={[
                styles.heroPlateWrap,
                { width: heroSize + 48, height: heroSize + 48 },
              ]}
            >
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.heroHalo,
                  {
                    width: heroSize + 40,
                    height: heroSize + 40,
                    borderRadius: (heroSize + 40) / 2,
                    backgroundColor: tv.halo,
                    opacity: haloOpacity,
                    transform: [{ scale: haloScale }],
                    top: 4,
                    left: 4,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.heroPlate,
                  {
                    width: heroSize,
                    height: heroSize,
                    borderRadius: heroSize / 2,
                    borderColor: tv.border,
                    opacity: heroOp,
                    transform: [{ translateY: heroY }, { scale: heroScale }],
                  },
                ]}
              >
              <LinearGradient
                colors={[
                  `${revealCard.color}44`,
                  'rgba(15,23,42,0.92)',
                  'rgba(2,6,23,0.95)',
                ]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={[tv.glow, 'transparent']}
                style={styles.heroInnerGlow}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
              <Text style={[styles.heroArt, { fontSize: artSize }]}>{revealCard.image}</Text>
              </Animated.View>
            </View>
            <Animated.Text
              style={[
                styles.heroName,
                { opacity: heroOp, transform: [{ translateY: heroY }, { scale: heroScale }] },
              ]}
              numberOfLines={2}
            >
              {revealCard.name}
            </Animated.Text>
          </View>

          <Animated.View style={{ opacity: winOp, transform: [{ translateY: winY }] }}>
            <Text style={styles.winCredits}>
              {t('packOpening.resultWinCredits', {
                amount: roll.creditsWon.toLocaleString(),
              })}
            </Text>
            <Text style={styles.winVault}>
              {t('packOpening.resultWinVaultLine', {
                value: revealCard.value.toLocaleString(),
              })}
            </Text>
          </Animated.View>

          <CompactCelebrationStats
            credits={roll.creditsWon.toLocaleString()}
            vaultValue={revealCard.value.toLocaleString()}
            tierLabel={tierLabel}
            tierColor={tv.accent}
            delayMs={T.statsDelayMs}
          />

          <Animated.View style={[styles.tertiaryRow, { opacity: tertiaryOp }]}>
            {onStoreInVault ? (
              <Pressable
                onPress={onStoreInVault}
                style={({ pressed }) => [styles.tertiaryBtn, pressed && styles.tertiaryPressed]}
                hitSlop={10}
              >
                <Text style={styles.tertiaryText}>{t('packOpening.storeInVault')}</Text>
              </Pressable>
            ) : null}
            {onStoreInVault ? <View style={styles.tertiaryDot} /> : null}
            <Pressable
              onPress={onShare}
              style={({ pressed }) => [styles.tertiaryBtn, pressed && styles.tertiaryPressed]}
              hitSlop={10}
            >
              <Text style={styles.tertiaryText}>{t('packOpening.sharePull')}</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  column: {
    width: '100%',
    maxWidth: '100%',
    alignItems: 'center',
  },
  skipped: {
    color: 'rgba(248,250,252,0.55)',
    fontSize: 12,
    fontFamily: brandFont.medium,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: brandFont.extraBold,
    color: 'rgba(248,250,252,0.45)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  tierBadgeWrap: {
    marginBottom: spacing.md,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(2,6,23,0.55)',
  },
  tierBadgeEmoji: {
    fontSize: 14,
  },
  tierBadgeText: {
    fontSize: 12,
    fontFamily: brandFont.extraBold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroBlock: {
    alignItems: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  heroPlateWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroHalo: {
    position: 'absolute',
  },
  heroPlate: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroInnerGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  heroArt: {
    textAlign: 'center',
  },
  heroName: {
    marginTop: spacing.md,
    color: 'rgba(248,250,252,0.96)',
    fontSize: 20,
    fontFamily: brandFont.bold,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
    lineHeight: 26,
  },
  winCredits: {
    fontSize: 28,
    fontFamily: brandFont.black,
    color: '#FEF3C7',
    textAlign: 'center',
    letterSpacing: 0.3,
    fontVariant: ['tabular-nums'],
  },
  winVault: {
    marginTop: 6,
    fontSize: 15,
    fontFamily: brandFont.semibold,
    color: 'rgba(226,232,240,0.72)',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: spacing.lg,
    width: '100%',
  },
  statPill: {
    minWidth: 100,
    flexGrow: 1,
    maxWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statPillLabel: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: 'rgba(148,163,184,0.88)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    textAlign: 'center',
  },
  statPillValue: {
    fontSize: 15,
    fontFamily: brandFont.bold,
    color: 'rgba(248,250,252,0.95)',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  tertiaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: 4,
  },
  tertiaryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tertiaryPressed: {
    opacity: 0.72,
  },
  tertiaryText: {
    fontSize: 13,
    fontFamily: brandFont.semibold,
    color: 'rgba(125,211,252,0.88)',
  },
  tertiaryDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(148,163,184,0.45)',
  },
});
