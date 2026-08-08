import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { MarketplaceListing } from '../../data/marketplace';
import Ionicons from '@expo/vector-icons/Ionicons';

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

  const deltaLine =
    listing.marketDeltaPct != null
      ? t('marketplace.vsMarket', { pct: Math.abs(listing.marketDeltaPct) })
      : null;

  const footerLine = deltaLine ?? shipLine;

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
        {listing.imageUrl ? (
          <Image
            source={{ uri: listing.imageUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Ionicons name="albums-outline" size={34} color={sg.muted} />
        )}
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
    borderColor: sg.cobaltBorder,
  },
  regionPillText: {
    fontSize: 8,
    fontFamily: brandFont.bold,
    color: sg.accentText,
    letterSpacing: 0.3,
  },
  badgePill: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    zIndex: 1,
    backgroundColor: sg.warning,
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
    fontFamily: brandFont.bold,
    color: sg.ticketInk,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: sg.text,
    lineHeight: 15,
    minHeight: 30,
  },
  subtitle: {
    fontSize: 10,
    color: sg.muted,
    marginTop: 2,
  },
  condition: {
    fontSize: 9,
    fontFamily: brandFont.semibold,
    color: sg.muted,
    marginTop: 3,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.black,
    color: sg.text,
    marginTop: 4,
  },
  footerHint: {
    fontSize: 9,
    color: sg.muted,
    marginTop: 3,
    fontFamily: brandFont.medium,
  },
  footerDelta: {
    color: sg.success,
  },
});
