import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Pack } from '../../data/mockPacks';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { ChipTag } from '../shared/ChipTag';
import { useAppStore } from '../../store/useAppStore';
import { getLocalizedPackFields } from '../../i18n/packCopy';

interface Props {
  pack: Pack;
  onPress?: () => void;
}

export function PackCard({ pack, onPress }: Props) {
  const { t } = useTranslation();
  const openPack = useAppStore((s) => s.openPack);
  const isPackOpening = useAppStore((s) => s.modals.packOpening);
  const awaitingFulfillment = useAppStore((s) => !!s.pendingFulfillmentPullId);
  const pct = Math.round((pack.remainingInventory / pack.totalInventory) * 100);
  const loc = getLocalizedPackFields(pack, t);

  return (
    <View style={styles.card}>
      {/* Chips */}
      <View style={styles.chips}>
        {pack.tags.slice(0, 3).map((tag) => (
          <ChipTag key={tag} type={tag} />
        ))}
      </View>

      {/* Image area */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.92} style={[styles.imageArea, { backgroundColor: pack.imageColor }]}>
        <View style={styles.imageOverlay}>
          <Text style={styles.imageTitle}>{loc.title}</Text>
          <View style={styles.valueBadge}>
            <Text style={styles.valueBadgeText}>{loc.valueDescription}</Text>
          </View>
          <Text style={styles.guaranteeText}>{loc.guaranteeText}</Text>
          {pack.maxPerUser && (
            <Text style={styles.limitText}>{t('packCard.maxPerUser', { count: pack.maxPerUser })}</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Price + inventory */}
      <View style={styles.priceRow}>
        <View style={styles.priceLeft}>
          <Text style={styles.coin}>🪙</Text>
          <Text style={styles.price}>{pack.creditPrice.toLocaleString()}</Text>
          <Text style={styles.credits}>{t('packCard.credits')}</Text>
        </View>
        <Text style={styles.remaining}>
          {t('packCard.remaining', {
            left: pack.remainingInventory.toLocaleString(),
            total: pack.totalInventory.toLocaleString(),
          })}
        </Text>
      </View>

      {/* Inventory bar */}
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` as any }]} />
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.cta, (isPackOpening || awaitingFulfillment) && styles.ctaDisabled]}
        onPress={() => openPack(pack)}
        activeOpacity={0.85}
        disabled={isPackOpening || awaitingFulfillment}
      >
        <Text style={styles.ctaText}>{t('packCard.openPack')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  chips: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  imageArea: {
    height: 200,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  imageOverlay: {
    padding: spacing.base,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  imageTitle: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.heavy,
    marginBottom: spacing.sm,
  },
  valueBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.xs,
  },
  valueBadgeText: {
    color: colors.nearBlack,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  guaranteeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  limitText: {
    color: colors.gold,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  coin: {
    fontSize: 16,
  },
  price: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  credits: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  remaining: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  barTrack: {
    height: 4,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.base,
    borderRadius: radius.full,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.red,
    borderRadius: radius.full,
  },
  cta: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    height: 52,
    backgroundColor: colors.nearBlack,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },
});
