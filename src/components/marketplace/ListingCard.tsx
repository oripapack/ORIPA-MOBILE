import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { MarketplaceListing } from '../../data/marketplace';

const CARD_W = 152;

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

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={listing.title}
    >
      <View style={[styles.thumb, { backgroundColor: listing.imageColor }]}>
        {badgeLabel ? (
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        ) : null}
        <Text style={styles.thumbPlaceholder}>🃏</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {listing.title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={1}>
        {listing.subtitle}
      </Text>
      <Text style={styles.price}>{listing.price}</Text>
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
    borderRadius: radius.lg,
    marginBottom: spacing.xs,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbPlaceholder: {
    fontSize: 36,
    opacity: 0.35,
  },
  badgePill: {
    position: 'absolute',
    left: spacing.xs,
    bottom: spacing.xs,
    backgroundColor: colors.red,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
    maxWidth: '90%',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    lineHeight: 16,
    minHeight: 32,
  },
  subtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  price: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.nearBlack,
    marginTop: 4,
  },
});
