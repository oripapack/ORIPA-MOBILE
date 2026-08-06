import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { sg } from '../../tokens/sg';
import type { PublicVaultListing } from '../../lib/friendVaultShop';
import { showUserMessage } from '../../utils/showUserMessage';
import { navigationRef } from '../../navigation/navigationRef';

interface Props {
  listing: PublicVaultListing;
  isOwnListing?: boolean;
}

export function CardMarketListingRow({ listing, isOwnListing }: Props) {
  const onBuyNow = () => {
    if (isOwnListing) {
      showUserMessage('Your Listing', 'This is your own listing. Visit your Vault to manage it.');
      return;
    }
    navigationRef.navigate('PaymentPortal', {
      initialTab: 'marketplace',
      listingTitle: listing.result,
      listingPrice: `$${listing.listPriceUsd}`,
    });
  };

  return (
    <View style={styles.row}>
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
          <Text style={styles.sellerText}>@{listing.sellerUsername}</Text>
        </View>
      </View>

      {/* Price + CTA */}
      <View style={styles.rightWrap}>
        <Text style={styles.price}>${listing.listPriceUsd}</Text>
        <Text style={styles.priceBasis}>Listed price</Text>
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
    backgroundColor: sg.surface,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    marginBottom: sg.space.sm,
    overflow: 'hidden',
  },
  infoWrap: {
    flex: 1,
    padding: sg.space.md,
    paddingRight: sg.space.sm,
    gap: 4,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.xs,
  },
  cardName: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    flex: 1,
  },
  ownBadge: {
    backgroundColor: sg.accentSoft,
    borderRadius: sg.radius.tag,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: sg.accentLine,
  },
  ownBadgeText: {
    fontSize: 9,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    letterSpacing: 0.5,
  },
  packName: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.xs,
    marginTop: 2,
  },
  sellerText: {
    fontSize: 10,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
  rightWrap: {
    alignItems: 'flex-end',
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.md,
    gap: sg.space.xs,
  },
  price: {
    fontSize: sg.type.md,
    fontFamily: sg.font.dataBold,
    fontVariant: [...sg.numeric],
    color: sg.text,
  },
  priceBasis: {
    marginTop: -2,
    fontSize: 8,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  buyBtn: {
    backgroundColor: sg.gold,
    borderRadius: sg.radius.btn,
    paddingVertical: 6,
    paddingHorizontal: sg.space.md,
  },
  buyBtnOwn: {
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.accentLine,
  },
  buyBtnText: {
    fontSize: 11,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
    letterSpacing: 0.3,
  },
  buyBtnTextOwn: {
    color: sg.gold,
  },
});
