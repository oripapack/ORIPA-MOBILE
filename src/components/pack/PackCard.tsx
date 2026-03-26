import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { ChipTagType, Pack } from '../../data/mockPacks';
import { mockPackTopHits } from '../../data/mockTopHits';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { useAppStore } from '../../store/useAppStore';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { getLocalizedPackFields } from '../../i18n/packCopy';

const WIN_W = Dimensions.get('window').width;
const CARD_GUTTER = spacing.base * 2;
const CARD_W = WIN_W - CARD_GUTTER;
const PACK_IMG_H = 192;

/** Show up to two tags as readable badges (avoid confusing +N). */
const TAG_PRIORITY: ChipTagType[] = [
  'hot_drop',
  'new_user',
  'chase_boost',
  'best_value',
  'graded',
  'new',
  'bonus_pack',
];

function primaryTag(tags: ChipTagType[]): ChipTagType | undefined {
  const hit = TAG_PRIORITY.find((t) => tags.includes(t));
  return hit ?? tags[0];
}

function secondaryTag(tags: ChipTagType[], primary: ChipTagType | undefined): ChipTagType | undefined {
  if (!primary) return undefined;
  const rest = tags.filter((t) => t !== primary);
  const hit = TAG_PRIORITY.find((t) => rest.includes(t));
  return hit ?? rest[0];
}

function railColor(tag: ChipTagType | undefined): string {
  if (!tag) return colors.textMuted;
  switch (tag) {
    case 'hot_drop':
    case 'new_user':
      return colors.red;
    case 'chase_boost':
      return '#EA580C';
    case 'best_value':
      return '#22C55E';
    case 'graded':
      return '#7C3AED';
    case 'new':
      return '#2563EB';
    case 'bonus_pack':
      return '#059669';
    default:
      return colors.textMuted;
  }
}

const CTA_GLOW = {
  border: 'rgba(251, 191, 36, 0.45)',
  glow: 'rgba(251, 191, 36, 0.85)',
} as const;

interface Props {
  pack: Pack;
  onPress?: () => void;
}

export function PackCard({ pack, onPress }: Props) {
  const { t } = useTranslation();
  const { requireAuth } = useRequireAuth();
  const openPack = useAppStore((s) => s.openPack);
  const isPackOpening = useAppStore((s) => s.modals.packOpening);
  const awaitingFulfillment = useAppStore((s) => !!s.pendingFulfillmentPullId);
  const pct = Math.round((pack.remainingInventory / pack.totalInventory) * 100);
  const loc = getLocalizedPackFields(pack, t);
  const topHit = mockPackTopHits[String(pack.id)];

  const primary = useMemo(() => primaryTag(pack.tags), [pack.tags]);
  const secondary = useMemo(() => secondaryTag(pack.tags, primary), [pack.tags, primary]);
  const rail = useMemo(() => railColor(primary), [primary]);

  const cardScale = useRef(new Animated.Value(1)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;
  const ctaGlow = useRef(new Animated.Value(0)).current;
  const tierPulse = useRef(new Animated.Value(0)).current;
  const shimmerX = useRef(new Animated.Value(-90)).current;
  const shimmerOpacity = useRef(new Animated.Value(0)).current;
  const [ctaW, setCtaW] = useState(320);

  useEffect(() => {
    // Flashier pulse so movement is clearly visible.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(tierPulse, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(tierPulse, { toValue: 0, duration: 700, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [tierPulse]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(550),
        Animated.parallel([
          Animated.timing(shimmerOpacity, { toValue: 1, duration: 130, useNativeDriver: true }),
          Animated.timing(shimmerX, {
            toValue: ctaW + 90,
            duration: 650,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(shimmerOpacity, { toValue: 0, duration: 90, useNativeDriver: true }),
        Animated.timing(shimmerX, { toValue: -90, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [ctaW, shimmerOpacity, shimmerX]);

  const ctaPressIn = () => {
    Animated.parallel([
      Animated.spring(ctaScale, { toValue: 0.975, friction: 6, tension: 320, useNativeDriver: true }),
      Animated.timing(ctaGlow, { toValue: 1, duration: 140, useNativeDriver: false }),
    ]).start();
  };
  const ctaPressOut = () => {
    Animated.parallel([
      Animated.spring(ctaScale, { toValue: 1, friction: 7, tension: 260, useNativeDriver: true }),
      Animated.timing(ctaGlow, { toValue: 0, duration: 180, useNativeDriver: false }),
    ]).start();
  };
  const ctaHoverIn = () => {
    Animated.parallel([
      Animated.spring(ctaScale, { toValue: 1.028, friction: 7, tension: 180, useNativeDriver: true }),
      Animated.timing(ctaGlow, { toValue: 1, duration: 180, useNativeDriver: false }),
    ]).start();
  };
  const ctaHoverOut = () => {
    Animated.parallel([
      Animated.spring(ctaScale, { toValue: 1, friction: 8, tension: 200, useNativeDriver: true }),
      Animated.timing(ctaGlow, { toValue: 0, duration: 220, useNativeDriver: false }),
    ]).start();
  };
  const pressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.988,
      friction: 5,
      tension: 320,
      useNativeDriver: true,
    }).start();
  };
  const pressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 6,
      tension: 280,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: cardScale }],
          borderLeftColor: rail,
          borderTopColor: 'rgba(15,23,42,0.08)',
          borderRightColor: 'rgba(15,23,42,0.08)',
          borderBottomColor: 'rgba(15,23,42,0.08)',
          shadowColor: colors.shadowStrong,
          shadowOpacity: 0.18,
          shadowRadius: 22,
        },
      ]}
      className="bg-slate-950/40"
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        disabled={!onPress}
        style={[styles.hero, { backgroundColor: pack.imageColor }]}
      >
        {pack.imageUrl ? (
          <>
            <Image
              source={{ uri: pack.imageUrl }}
              style={styles.heroImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
            {/* RN-SVG gradients over full-bleed images often render solid black on iOS — use native gradient */}
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.42)']}
              locations={[0.25, 1]}
              style={styles.heroPhotoGradient}
            />
          </>
        ) : (
          <View style={styles.imageGradient} pointerEvents="none">
            <Svg width={CARD_W} height={PACK_IMG_H}>
              <Defs>
                <SvgLinearGradient id={`packImgGradSolid-${pack.id}`} x1="0.5" y1="0" x2="0.5" y2="1">
                  <Stop offset="0" stopColor="#000000" stopOpacity={0.12} />
                  <Stop offset="0.5" stopColor="#000000" stopOpacity={0.22} />
                  <Stop offset="1" stopColor="#000000" stopOpacity={0.62} />
                </SvgLinearGradient>
              </Defs>
              <Rect
                x={0}
                y={0}
                width={CARD_W}
                height={PACK_IMG_H}
                fill={`url(#packImgGradSolid-${pack.id})`}
              />
            </Svg>
          </View>
        )}

        {primary ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.badgeCluster,
              {
                transform: [{ scale: tierPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
              },
            ]}
          >
            <View
              style={styles.badgeMain}
              className="bg-slate-950/70"
            >
              <Text style={styles.badgeMainText}>
                {t(`packCard.shortBadge.${primary}`)}
              </Text>
            </View>
            {secondary ? (
              <View
                style={styles.badgeSecondary}
                className="bg-slate-950/60"
              >
                <Text
                  style={styles.badgeSecondaryText}
                >
                  {t(`packCard.shortBadge.${secondary}`)}
                </Text>
              </View>
            ) : null}
          </Animated.View>
        ) : null}

        <View style={styles.heroCopy}>
          <Text style={styles.imageTitle} numberOfLines={2}>
            {loc.title}
          </Text>
          <Text style={styles.valueLine} numberOfLines={1}>
            {loc.valueDescription}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.meta}>
        {topHit ? (
          <View style={[styles.topHitWrap, topHit.isChase && styles.topHitWrapChase]}>
            <View style={styles.topHitHeader}>
              <Text style={styles.topHitLabel}>{t('packCard.topHit')}</Text>
              {topHit.isChase ? (
                <View style={styles.chasePill}>
                  <Text style={styles.chaseText}>{t('packCard.chase')}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.topHitRow}>
              <Image source={{ uri: topHit.imageUrl }} style={styles.topHitThumb} contentFit="cover" />
              <View style={styles.topHitCopy}>
                <Text style={styles.topHitName} numberOfLines={1}>
                  {topHit.name}
                </Text>
                <View style={styles.topHitMetaRow}>
                  <View style={[styles.rarityPill, topHit.isChase && styles.rarityPillChase]}>
                    <Text style={[styles.rarityText, topHit.isChase && styles.rarityTextChase]}>
                      {topHit.rarity}
                    </Text>
                  </View>
                  <Text style={styles.topHitValue} numberOfLines={1}>
                    {topHit.estValue}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.priceRow}>
          <View style={styles.priceLeft}>
            <Text style={styles.coin}>🪙</Text>
            <Text style={styles.price}>{pack.creditPrice.toLocaleString()}</Text>
            <Text style={styles.credits}>{t('packCard.credits')}</Text>
          </View>
          <Text style={styles.remaining} numberOfLines={1}>
            {t('packCard.remaining', {
              left: pack.remainingInventory.toLocaleString(),
              total: pack.totalInventory.toLocaleString(),
            })}
          </Text>
        </View>

        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%` as `${number}%`, backgroundColor: rail }]} />
        </View>

        {pack.maxPerUser ? (
          <Text style={styles.limitText}>{t('packCard.maxPerUser', { count: pack.maxPerUser })}</Text>
        ) : null}
        <Text style={styles.guaranteeText} numberOfLines={2}>
          {loc.guaranteeText}
        </Text>
      </View>

      <Animated.View
        style={[
          styles.ctaOuter,
          {
            transform: [{ scale: tierPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }],
            shadowColor: CTA_GLOW.glow,
            shadowOpacity: tierPulse.interpolate({ inputRange: [0, 1], outputRange: [0.32, 0.62] }),
            shadowRadius: tierPulse.interpolate({ inputRange: [0, 1], outputRange: [24, 42] }),
          },
          (isPackOpening || awaitingFulfillment) && styles.ctaDisabled,
        ]}
        onLayout={(e) => setCtaW(e.nativeEvent.layout.width)}
      >
        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <Pressable
            style={styles.cta}
            className={[
              'border',
              'rounded-xl',
              'overflow-hidden',
              'bg-slate-900/75 border-amber-300/40',
            ].join(' ')}
            onPress={() => requireAuth(() => openPack(pack))}
            onPressIn={ctaPressIn}
            onPressOut={ctaPressOut}
            onHoverIn={ctaHoverIn}
            onHoverOut={ctaHoverOut}
            disabled={isPackOpening || awaitingFulfillment}
          >
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(251,191,36,0.90)', 'rgba(253,230,138,0.92)', 'rgba(217,119,6,0.92)']}
              locations={[0, 0.55, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            />
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.02)', 'rgba(0,0,0,0.10)']}
              locations={[0, 0.55, 1]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.ctaSheen}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shimmerWrap,
                {
                  opacity: shimmerOpacity,
                  transform: [{ translateX: shimmerX }, { rotate: '12deg' }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.75)', 'rgba(255,255,255,0)']}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmer}
              />
            </Animated.View>

            <View style={styles.ctaInner}>
              <Text
                style={styles.ctaText}
              >
                {t('packCard.openPack')}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderLeftWidth: 5,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15,23,42,0.08)',
    borderRightColor: 'rgba(15,23,42,0.08)',
    borderBottomColor: 'rgba(15,23,42,0.08)',
    elevation: 8,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
  },
  hero: {
    height: PACK_IMG_H,
    width: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    width: '100%',
    height: PACK_IMG_H,
    zIndex: 0,
    backgroundColor: 'transparent',
  },
  heroPhotoGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  badgeCluster: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeMain: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(240,193,76,0.55)',
  },
  badgeMainText: {
    fontSize: 11,
    fontWeight: fontWeight.black,
    color: colors.casinoGold,
    letterSpacing: 1.2,
  },
  badgeSecondary: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  badgeSecondaryText: {
    fontSize: 11,
    fontWeight: fontWeight.black,
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 1.1,
  },
  heroCopy: {
    padding: spacing.base,
    paddingBottom: spacing.md,
    zIndex: 2,
  },
  imageTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    marginBottom: 6,
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  valueLine: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
  meta: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  topHitWrap: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  topHitWrapChase: {
    borderColor: 'rgba(240,193,76,0.40)',
    shadowColor: colors.casinoGold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 6,
  },
  topHitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  topHitLabel: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  chasePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(240,193,76,0.45)',
  },
  chaseText: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.casinoGold,
    letterSpacing: 1.1,
  },
  topHitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topHitThumb: {
    width: 44,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  topHitCopy: {
    flex: 1,
    minWidth: 0,
  },
  topHitName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  topHitMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rarityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.nearBlack,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  rarityPillChase: {
    borderColor: 'rgba(240,193,76,0.35)',
  },
  rarityText: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  rarityTextChase: {
    color: colors.casinoGold,
  },
  topHitValue: {
    fontSize: 11,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  coin: {
    fontSize: 16,
  },
  price: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  credits: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  remaining: {
    flex: 1,
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: fontWeight.semibold,
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  barTrack: {
    height: 4,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  limitText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.red,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  guaranteeText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  ctaOuter: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  cta: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.nearBlack,
    borderWidth: 1,
    borderColor: CTA_GLOW.border,
  },
  ctaGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.92,
  },
  ctaSheen: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.65,
  },
  shimmerWrap: {
    position: 'absolute',
    left: 0,
    top: -34,
    bottom: -34,
    width: 140,
  },
  shimmer: {
    flex: 1,
  },
  ctaInner: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaText: {
    color: colors.nearBlack,
    fontSize: fontSize.base,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
