import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { PublicVaultListing } from '../../lib/friendVaultShop';
import type { PullRarityTier } from '../../data/mockUser';
import { showUserMessage } from '../../utils/showUserMessage';

const TIER_COLOR: Record<PullRarityTier, string> = {
  base: sg.muted,
  epic: sg.goldHi,
  legendary: sg.warning,
  mythic: sg.neon,
};

const TIER_LABEL: Record<PullRarityTier, string> = {
  base: 'Base',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
};

const TIER_BG: Record<PullRarityTier, string> = {
  base: sg.surface2,
  epic: sg.cobaltWash,
  legendary: sg.warningWash,
  mythic: sg.vermilionWash,
};

interface Props {
  listing: PublicVaultListing;
  isOwnListing?: boolean;
}

export function CardMarketListingRow({ listing, isOwnListing }: Props) {
  const { t } = useTranslation();
  const tier = listing.tier ?? 'base';
  const tierColor = TIER_COLOR[tier];
  const tierBg = TIER_BG[tier];
  const tierLabel = TIER_LABEL[tier];

  const onBuyNow = () => {
    if (isOwnListing) {
      showUserMessage(
        t('cardMarket.ownListingTitle'),
        t('cardMarket.ownListingBody'),
      );
      return;
    }
    showUserMessage(
      t('cardMarket.previewTitle'),
      t('cardMarket.previewBody', {
        title: listing.result,
        price: listing.listPriceUsd,
      }),
    );
  };

  return (
    <View style={styles.row}>
      <View style={[styles.rarityBar, { backgroundColor: tierColor }]} />

      <View style={styles.infoWrap}>
        <View style={styles.topLine}>
          <Text style={styles.cardName} numberOfLines={1}>
            {listing.result}
          </Text>
          {isOwnListing ? (
            <View style={styles.ownBadge}>
              <Text style={styles.ownBadgeText}>{t('cardMarket.yours')}</Text>
            </View>
          ) : null}
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

      <View style={styles.rightWrap}>
        <Text style={styles.price}>${listing.listPriceUsd}</Text>
        <TouchableOpacity
          style={[styles.buyBtn, !isOwnListing && styles.buyBtnPreview, isOwnListing && styles.buyBtnOwn]}
          onPress={onBuyNow}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={
            isOwnListing
              ? t('cardMarket.listed')
              : t('cardMarket.previewCta')
          }
        >
          <Text style={styles.buyBtnText}>
            {isOwnListing ? t('cardMarket.listed') : t('cardMarket.previewCta')}
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
    backgroundColor: sg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: sg.line,
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
    color: sg.text,
    flex: 1,
  },
  ownBadge: {
    backgroundColor: sg.cobaltWash,
    borderRadius: radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: sg.cobaltBorder,
  },
  ownBadgeText: {
    fontSize: 9,
    fontFamily: brandFont.black,
    color: sg.gold,
    letterSpacing: 0.5,
  },
  packName: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.medium,
    color: sg.muted,
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
    color: sg.muted,
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
    color: sg.text,
  },
  buyBtn: {
    backgroundColor: sg.gold,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  buyBtnPreview: {
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
  },
  buyBtnOwn: {
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.cobaltBorder,
  },
  buyBtnText: {
    fontSize: 11,
    fontFamily: brandFont.black,
    color: sg.muted,
    letterSpacing: 0.3,
  },
});
