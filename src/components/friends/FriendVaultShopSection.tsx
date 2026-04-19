import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { VaultFramedCard } from '../shared/VaultFramedCard';
import { useAppStore } from '../../store/useAppStore';
import { normalizeFriendUsername } from '../../data/friends';
import { getLocalizedPackTitle } from '../../i18n/packCopy';
import type { PublicVaultListing } from '../../lib/friendVaultShop';

type Props = {
  /** Profile being viewed (lowercase handle). */
  sellerUsername: string;
  /** True when viewing your own profile in this screen. */
  isSelf: boolean;
};

export function FriendVaultShopSection({ sellerUsername, isSelf }: Props) {
  const { t } = useTranslation();
  const key = useMemo(() => normalizeFriendUsername(sellerUsername), [sellerUsername]);
  const me = useAppStore((s) => normalizeFriendUsername(s.user.username));
  const listings = useAppStore((s) => s.friendVaultShopByUser[key] ?? []);
  const credits = useAppStore((s) => s.user.credits);
  const purchase = useAppStore((s) => s.purchaseFriendVaultListing);
  const openInsufficient = useAppStore((s) => s.openModal);

  if (listings.length === 0) return null;

  const onBuy = (row: PublicVaultListing) => {
    if (isSelf) return;
    if (row.sellerUsername === me) return;
    Alert.alert(
      t('friendVaultShop.buyTitle'),
      t('friendVaultShop.buyBody', { coins: row.priceCredits.toLocaleString(), card: row.result }),
      [
        { text: t('vaultAsset.cancel'), style: 'cancel' },
        {
          text: t('friendVaultShop.buyConfirm'),
          onPress: () => {
            if (credits < row.priceCredits) {
              openInsufficient('insufficientCredits');
              return;
            }
            const res = purchase(row.sellerUsername, row.id);
            if (res === 'ok') {
              Alert.alert(t('friendVaultShop.boughtTitle'), t('friendVaultShop.boughtBody'));
            } else if (res === 'insufficient') {
              openInsufficient('insufficientCredits');
            } else if (res === 'own_listing') {
              Alert.alert(t('friendVaultShop.ownTitle'), t('friendVaultShop.ownBody'));
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>{t('friendVaultShop.sectionTitle')}</Text>
      <Text style={styles.hint}>{t('friendVaultShop.sectionHint')}</Text>
      <VaultFramedCard contentStyle={styles.cardInner}>
        {listings.map((row) => {
          const isOwnListing = normalizeFriendUsername(row.sellerUsername) === me;
          return (
            <View key={row.id} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.cardName} numberOfLines={2}>
                  {row.result}
                </Text>
                <Text style={styles.pack} numberOfLines={1}>
                  {getLocalizedPackTitle(row.packId, row.packTitle, t)}
                </Text>
                <Text style={styles.price}>🪙 {row.priceCredits.toLocaleString()}</Text>
              </View>
              {!isSelf && !isOwnListing ? (
                <TouchableOpacity style={styles.buyBtn} onPress={() => onBuy(row)} accessibilityRole="button">
                  <Text style={styles.buyBtnText}>{t('friendVaultShop.buy')}</Text>
                </TouchableOpacity>
              ) : isSelf && isOwnListing ? (
                <Text style={styles.manageHint}>{t('friendVaultShop.manageHint')}</Text>
              ) : null}
            </View>
          );
        })}
      </VaultFramedCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  section: {
    fontSize: 10,
    fontFamily: brandFont.black,
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  cardInner: { padding: spacing.md, gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  rowText: { flex: 1, minWidth: 0 },
  cardName: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
  },
  pack: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  price: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    fontFamily: brandFont.black,
    color: colors.accentDark,
  },
  buyBtn: {
    backgroundColor: colors.accentDark,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.md,
  },
  buyBtnText: {
    color: colors.white,
    fontFamily: brandFont.bold,
    fontSize: fontSize.xs,
  },
  manageHint: {
    fontSize: 10,
    fontFamily: brandFont.semibold,
    color: colors.textMuted,
    maxWidth: 100,
    textAlign: 'right',
  },
});
