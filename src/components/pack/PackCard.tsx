import React, { useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { ChipTagType, Pack } from '../../data/mockPacks';
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

/** One “hero” tag for accent rail + badge; rest summarized as +N */
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

function railColor(tag: ChipTagType | undefined): string {
  if (!tag) return colors.textMuted;
  switch (tag) {
    case 'hot_drop':
    case 'new_user':
      return colors.red;
    case 'chase_boost':
      return '#EA580C';
    case 'best_value':
      return colors.casinoGoldDark;
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

  const primary = useMemo(() => primaryTag(pack.tags), [pack.tags]);
  const extraCount = pack.tags.length > 1 ? pack.tags.length - 1 : 0;
  const rail = useMemo(() => railColor(primary), [primary]);

  const cardScale = useRef(new Animated.Value(1)).current;
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
          shadowColor: colors.shadowStrong,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        disabled={!onPress}
        style={[styles.hero, { backgroundColor: pack.imageColor }]}
      >
        <View style={styles.imageGradient} pointerEvents="none">
          <Svg width={CARD_W} height={PACK_IMG_H}>
            <Defs>
              <LinearGradient id={`packImgGrad-${pack.id}`} x1="0.5" y1="0" x2="0.5" y2="1">
                <Stop offset="0" stopColor="rgba(0,0,0,0.12)" />
                <Stop offset="0.5" stopColor="rgba(0,0,0,0.2)" />
                <Stop offset="1" stopColor="rgba(0,0,0,0.75)" />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width={CARD_W} height={PACK_IMG_H} fill={`url(#packImgGrad-${pack.id})`} />
          </Svg>
        </View>

        {primary ? (
          <View style={styles.badgeCluster} pointerEvents="none">
            <View style={styles.badgeMain}>
              <Text style={styles.badgeMainText}>{t(`packCard.shortBadge.${primary}`)}</Text>
            </View>
            {extraCount > 0 ? (
              <View style={styles.badgeMore}>
                <Text style={styles.badgeMoreText}>+{extraCount}</Text>
              </View>
            ) : null}
          </View>
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

      <TouchableOpacity
        style={[styles.cta, (isPackOpening || awaitingFulfillment) && styles.ctaDisabled]}
        onPress={() => requireAuth(() => openPack(pack))}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        disabled={isPackOpening || awaitingFulfillment}
      >
        <View style={styles.ctaInner}>
          <Text style={styles.ctaText}>{t('packCard.openPack')}</Text>
        </View>
      </TouchableOpacity>
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
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  badgeCluster: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
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
  badgeMore: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeMoreText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.95)',
  },
  heroCopy: {
    padding: spacing.base,
    paddingBottom: spacing.md,
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
  cta: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.nearBlack,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
