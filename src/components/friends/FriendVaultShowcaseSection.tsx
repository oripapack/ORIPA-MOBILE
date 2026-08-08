import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { VaultFramedCard } from '../shared/VaultFramedCard';
import { useAppStore } from '../../store/useAppStore';
import { normalizeFriendUsername } from '../../data/friends';
import { getLocalizedPackTitle } from '../../i18n/packCopy';
import type { Pull, PullRarityTier } from '../../data/mockUser';
import type { PublicVaultListing } from '../../lib/friendVaultShop';
import { getFriendVaultShowcasePulls } from '../../lib/friendVaultShowcase';
import { vaultExchangeBuyerRules, formatVaultExchangeUsd } from '../../lib/vaultExchange';
import { FriendVaultItemSheet } from './FriendVaultItemSheet';
import { VaultExchangeCheckoutStubModal } from '../vault/VaultExchangeCheckoutStubModal';
import type { FriendEntry } from '../../data/friends';
import { showUserMessage } from '../../utils/showUserMessage';

type Props = {
  sellerUsername: string;
  isSelf: boolean;
  friendEntry?: FriendEntry | null;
};

const TIER_DOT: Record<PullRarityTier, string> = {
  base: sg.chrome,
  epic: sg.goldHi,
  legendary: sg.warning,
  mythic: sg.neon,
};

export function FriendVaultShowcaseSection({ sellerUsername, isSelf, friendEntry }: Props) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const user = useAppStore((s) => s.user);
  const key = useMemo(() => normalizeFriendUsername(sellerUsername), [sellerUsername]);
  const listings = useAppStore((s) => s.friendVaultShopByUser[key] ?? []);
  const purchase = useAppStore((s) => s.purchaseFriendVaultListing);

  const pulls = useMemo(
    () => getFriendVaultShowcasePulls({ username: key, isSelf, user, friendEntry: friendEntry ?? null }),
    [key, isSelf, user, friendEntry],
  );

  const [sheetPull, setSheetPull] = useState<Pull | null>(null);
  const [checkout, setCheckout] = useState<{
    listingId: string;
    priceUsd: number;
    title: string;
  } | null>(null);

  const horizontalPad = spacing.base;
  const gap = spacing.sm;
  const tileW = Math.max(148, (width - horizontalPad * 2 - gap) / 2);

  const openCheckout = useCallback((listingId: string, priceUsd: number, title: string) => {
    setCheckout({ listingId, priceUsd, title });
  }, []);

  const onSimulatePaid = useCallback(() => {
    if (!checkout) return;
    const res = purchase(key, checkout.listingId);
    setCheckout(null);
    if (res === 'ok') {
      showUserMessage(t('vaultExchange.purchaseOkTitle'), t('vaultExchange.purchaseOkBody'));
    } else if (res === 'own_listing') {
      showUserMessage(t('friendVaultShop.ownTitle'), t('friendVaultShop.ownBody'));
    } else {
      showUserMessage(t('vaultExchange.purchaseFailTitle'), t('vaultExchange.purchaseFailBody'));
    }
  }, [checkout, purchase, key, t]);

  if (pulls.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.section}>{t('vaultExchange.friendSectionTitle')}</Text>
        <Text style={styles.hint}>{t('vaultExchange.friendSectionHint')}</Text>
        <VaultFramedCard contentStyle={styles.emptyInner}>
          <Text style={styles.empty}>{t('vaultExchange.emptyVault')}</Text>
        </VaultFramedCard>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>{t('vaultExchange.friendSectionTitle')}</Text>
      <Text style={styles.hint}>{t('vaultExchange.friendSectionHint')}</Text>
      <View style={[styles.grid, { gap }]}>
        {pulls.map((pull) => (
          <VaultTile
            key={pull.id}
            pull={pull}
            width={tileW}
            listings={listings}
            isSelf={isSelf}
            onPress={() => setSheetPull(pull)}
          />
        ))}
      </View>

      <FriendVaultItemSheet
        visible={sheetPull != null}
        pull={sheetPull}
        rules={sheetPull ? vaultExchangeBuyerRules(sheetPull, listings) : null}
        sellerDisplayHandle={`@${key}`}
        isSelf={isSelf}
        onClose={() => setSheetPull(null)}
        onBuyNow={(listingId, priceUsd) => openCheckout(listingId, priceUsd, sheetPull?.result ?? '')}
      />

      <VaultExchangeCheckoutStubModal
        visible={checkout != null}
        itemTitle={checkout?.title ?? ''}
        listPriceUsd={checkout?.priceUsd ?? 0}
        onClose={() => setCheckout(null)}
        onSimulatePaid={onSimulatePaid}
      />
    </View>
  );
}

function VaultTile({
  pull,
  width,
  listings,
  isSelf,
  onPress,
}: {
  pull: Pull;
  width: number;
  listings: PublicVaultListing[];
  isSelf: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const rules = vaultExchangeBuyerRules(pull, listings);
  const listed = rules.surface === 'listed_buy_now';
  const dot = TIER_DOT[pull.tier ?? 'base'];

  return (
    <TouchableOpacity
      style={[styles.tileOuter, { width }]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${pull.result}. ${listed ? t('vaultExchange.badgeBuyNow') : t('vaultExchange.badgeRequestable')}`}
    >
      <VaultFramedCard
        style={[styles.tileCard, listed && styles.tileCardListed]}
        contentStyle={styles.tileInner}
      >
        <View style={[styles.dot, { backgroundColor: dot }]} />
        <Text style={styles.tileResult} numberOfLines={3}>
          {pull.result}
        </Text>
        <Text style={styles.tilePack} numberOfLines={2}>
          {getLocalizedPackTitle(pull.packId, pull.packTitle, t)}
        </Text>
        {listed && rules.listPriceUsd != null ? (
          <>
            <View style={styles.buyBadge}>
              <Text style={styles.buyBadgeText}>{t('vaultExchange.badgeBuyNow')}</Text>
            </View>
            <Text style={styles.tilePrice}>{formatVaultExchangeUsd(rules.listPriceUsd)}</Text>
          </>
        ) : (
          <View style={styles.reqBadge}>
            <Text style={styles.reqBadgeText}>{t('vaultExchange.tileRequestable')}</Text>
          </View>
        )}
        {isSelf && listed ? (
          <Text style={styles.manage}>{t('vaultExchange.tileYourListing')}</Text>
        ) : null}
      </VaultFramedCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  section: {
    fontSize: 10,
    fontFamily: brandFont.black,
    color: sg.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  hint: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tileOuter: { marginBottom: spacing.sm },
  tileCard: { minHeight: 168 },
  tileCardListed: {
    borderColor: sg.cobaltBorder,
    borderWidth: 1.5,
  },
  tileInner: { padding: spacing.md, minHeight: 168 },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: spacing.sm },
  tileResult: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: sg.text,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  tilePack: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
    flex: 1,
  },
  buyBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: sg.cobaltWashSoft,
    borderWidth: 1,
    borderColor: sg.cobaltBorderStrong,
  },
  buyBadgeText: {
    fontSize: 9,
    fontFamily: brandFont.black,
    color: sg.accentText,
    letterSpacing: 0.5,
  },
  tilePrice: {
    marginTop: 4,
    fontSize: fontSize.md,
    fontFamily: brandFont.black,
    color: sg.text,
  },
  reqBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
  },
  reqBadgeText: {
    fontSize: 9,
    fontFamily: brandFont.bold,
    color: sg.muted,
    letterSpacing: 0.4,
  },
  manage: {
    marginTop: 6,
    fontSize: 9,
    fontFamily: brandFont.semibold,
    color: sg.muted,
  },
  emptyInner: { padding: spacing.lg },
  empty: {
    fontSize: fontSize.sm,
    color: sg.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
