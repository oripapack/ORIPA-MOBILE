import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { PublicVaultListing } from '../../lib/friendVaultShop';
import type { PullRarityTier } from '../../data/mockUser';
import { confirmUserAction, showUserMessage } from '../../utils/showUserMessage';

const TIER_COLOR: Record<PullRarityTier, string> = {
  common: colors.textMuted,
  rare: colors.accentSapphire,
  epic: colors.accent,
  legendary: colors.gold,
  mythic: colors.magenta,
};

const TIER_LABEL: Record<PullRarityTier, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
};

const TIER_BG: Record<PullRarityTier, string> = {
  common: 'rgba(139, 130, 168, 0.12)',
  rare: 'rgba(56, 189, 248, 0.12)',
  epic: 'rgba(192, 132, 252, 0.12)',
  legendary: 'rgba(232, 197, 71, 0.12)',
  mythic: 'rgba(244, 114, 182, 0.12)',
};

interface Props {
  listing: PublicVaultListing;
  isOwnListing?: boolean;
}

export function CardMarketListingRow({ listing, isOwnListing }: Props) {
  const tier = listing.tier ?? 'common';
  const tierColor = TIER_COLOR[tier];
  const tierBg = TIER_BG[tier];
  const tierLabel = TIER_LABEL[tier];

  const onBuyNow = () => {
    if (isOwnListing) {
      showUserMessage('Your Listing', 'This is your own listing. Visit your Vault to manage it.');
      return;
    }
    confirmUserAction({
      title: 'Buy Now',
      message: `Purchase "${listing.result}" for $${listing.listPriceUsd}?\n\nStripe checkout coming soon.`,
      cancelLabel: 'Cancel',
      confirmLabel: `Buy for $${listing.listPriceUsd}`,
      onConfirm: () =>
        showUserMessage(
          'Order Placed!',
          'Your purchase will be processed via Stripe. The seller will be notified.',
        ),
    });
  };

  return (
    <View style={styles.row}>
      {/* Rarity left bar */}
      <View style={[styles.rarityBar, { backgroundColor: tierColor }]} />

      {/* Card info */}
      <View style={styles.infoWrap}>
        <View style={styles.topLine}>
          <Text style={styles.cardName} numberOfLines={1}>
            {listing.result}
          </Text>
          {isOwnListing ? <View style={styles.ownBadge}><Text style={styles.ownBadgeText}>YOURS</Text></View> : null}
        </View>
        <Text style={styles.packName} numberOfLines={1}>
          {listing.packTitle}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.rarityPill, { backgroundColor: tierBg, borderColor: tierColor + '55' }]}>
            <Text style={[styles.rarityPillText, { color: tierColor }]}>{tierLabel}</Text>
          </View>
          <Text style={styles.sellerText}>@{listing.sellerUsername}</Text>
        </View>
      </View>

      {/* Price + CTA */}
      <View style={styles.rightWrap}>
        <Text style={styles.price}>${listing.listPriceUsd}</Text>
        <TouchableOpacity
          style={[styles.buyBtn, isOwnListing && styles.buyBtnOwn]}
          onPress={onBuyNow}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Buy ${listing.result} for $${listing.listPriceUsd}`}
        >
          <Text style={[styles.buyBtnText, isOwnListing && styles.buyBtnTextOwn]}>
            {isOwnListing ? 'Listed' : 'Buy Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  rarityBar: {
    width: 3,
    alignSelf: 'stretch',
    opacity: 0.7,
  },
  infoWrap: {
    flex: 1,
    padding: spacing.md,
    paddingRight: spacing.sm,
    gap: 4,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardName: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  ownBadge: {
    backgroundColor: colors.goldPillBg,
    borderRadius: radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.goldPillBorder,
  },
  ownBadgeText: {
    fontSize: 9,
    fontFamily: brandFont.black,
    color: colors.gold,
    letterSpacing: 0.5,
  },
  packName: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.medium,
    color: colors.textMuted,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  rarityPill: {
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  rarityPillText: {
    fontSize: 9,
    fontFamily: brandFont.bold,
    letterSpacing: 0.3,
  },
  sellerText: {
    fontSize: 10,
    fontFamily: brandFont.medium,
    color: colors.textMuted,
  },
  rightWrap: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  price: {
    fontSize: fontSize.md,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
  },
  buyBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  buyBtnOwn: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  buyBtnText: {
    fontSize: 11,
    fontFamily: brandFont.black,
    color: colors.ink,
    letterSpacing: 0.3,
  },
  buyBtnTextOwn: {
    color: colors.gold,
  },
});
