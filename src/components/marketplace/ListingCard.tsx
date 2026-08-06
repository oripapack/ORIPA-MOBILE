import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { radius, spacing } from '../../tokens/spacing';
import type { MarketplaceListing } from '../../data/marketplace';
import { AssetBlockedCard } from '../shared/AssetBlockedCard';

const CARD_W = 158;

interface Props {
  listing: MarketplaceListing;
  /** Short origin label (e.g. “Japan”) — optional marketplace context */
  shipsFromShort?: string;
  onPress?: () => void;
}

export function ListingCard({ listing, shipsFromShort, onPress }: Props) {
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

  const footerLine = shipLine;

  const a11yLabel = [listing.title, listing.price, listing.subtitle].filter(Boolean).join('. ');

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
    >
      <View style={[styles.thumb, { backgroundColor: listing.imageColor }]}>
        <AssetBlockedCard label="LISTING MEDIA PENDING" />
        <View style={styles.thumbScrim} pointerEvents="none" />
        {shipsFromShort ? (
          <View style={styles.regionPill} pointerEvents="none">
            <Text style={styles.regionPillText} numberOfLines={1}>
              {shipsFromShort}
            </Text>
          </View>
        ) : null}
        {badgeLabel ? (
          <View style={[styles.badgePill, shipsFromShort && styles.badgePillWithRegion]}>
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
      <Text style={styles.price}>{listing.price}</Text>
      {footerLine ? (
        <Text style={styles.footerHint} numberOfLines={1}>
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
  thumbScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  regionPill: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 2,
    maxWidth: '72%',
    backgroundColor: 'rgba(10, 16, 12, 0.88)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.38)',
  },
  regionPillText: {
    fontSize: 8,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    letterSpacing: 0.3,
  },
  badgePill: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    zIndex: 1,
    backgroundColor: sg.error,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radius.sm,
    maxWidth: '88%',
  },
  badgePillWithRegion: {
    left: 'auto',
    right: 6,
    bottom: 6,
    maxWidth: '42%',
  },
  badgeText: {
    fontSize: 8,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 11,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    lineHeight: 15,
    minHeight: 30,
  },
  subtitle: {
    fontSize: 10,
    color: sg.muted,
    marginTop: 2,
  },
  price: {
    fontSize: 13,
    fontFamily: sg.font.dataBold,
    color: sg.text,
    marginTop: 4,
    fontVariant: [...sg.numeric],
  },
  footerHint: {
    fontSize: 9,
    color: sg.muted,
    marginTop: 3,
    fontFamily: sg.font.bodyMedium,
  },
});
