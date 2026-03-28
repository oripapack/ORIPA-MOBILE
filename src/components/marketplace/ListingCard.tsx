import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { MarketplaceListing } from '../../data/marketplace';

const CARD_W = 158;

interface Props {
  listing: MarketplaceListing;
  onPress?: () => void;
}

export function ListingCard({ listing, onPress }: Props) {
  const { t } = useTranslation();

  const badgeLabel =
    listing.badge === 'sale'
      ? t('marketplace.badgeSale')
      : listing.badge === 'tournament'
        ? t('marketplace.badgeTournament')
        : listing.badge === 'new'
          ? t('marketplace.badgeNew')
          : null;

  const shipLine =
    listing.listingShipKey != null ? t(`marketplace.listingShip.${listing.listingShipKey}`) : null;

  const deltaLine =
    listing.marketDeltaPct != null
      ? t('marketplace.vsMarket', { pct: Math.abs(listing.marketDeltaPct) })
      : null;

  const footerLine = deltaLine ?? shipLine;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={listing.title}
    >
      <View style={[styles.thumb, { backgroundColor: listing.imageColor }]}>
        {listing.imageUrl ? (
          <Image
            source={{ uri: listing.imageUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Text style={styles.thumbPlaceholder}>🃏</Text>
        )}
        <View style={styles.thumbScrim} pointerEvents="none" />
        {badgeLabel ? (
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {listing.title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={1}>
        {listing.subtitle}
      </Text>
      {listing.conditionGrade ? (
        <Text style={styles.condition} numberOfLines={1}>
          {t('marketplace.conditionLabel', { grade: listing.conditionGrade })}
        </Text>
      ) : null}
      <Text style={styles.price}>{listing.price}</Text>
      {footerLine ? (
        <Text style={[styles.footerHint, listing.marketDeltaPct != null && styles.footerDelta]} numberOfLines={1}>
          {footerLine}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export const LISTING_CARD_WIDTH = CARD_W;

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    marginRight: spacing.sm,
  },
  thumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    marginBottom: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  thumbPlaceholder: {
    fontSize: 36,
    opacity: 0.35,
  },
  thumbScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  badgePill: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    zIndex: 1,
    backgroundColor: colors.red,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radius.sm,
    maxWidth: '88%',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: 15,
    minHeight: 30,
  },
  subtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  condition: {
    fontSize: 9,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: 3,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginTop: 4,
  },
  footerHint: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 3,
    fontWeight: fontWeight.medium,
  },
  footerDelta: {
    color: colors.chipBestValueText,
  },
});
