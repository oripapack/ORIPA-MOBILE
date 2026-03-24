import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PAYMENT_ROUTING } from '../../payments/physicalGoodsPolicy';

interface Props {
  listingTitle: string;
  listingPrice: string;
}

/**
 * Physical goods checkout — Stripe / Apple Pay only after a **server** creates a PaymentIntent.
 * Not the same pipeline as digital credits (IAP). See `PAYMENT_ROUTING`.
 */
export function MarketplaceCheckoutSection({ listingTitle, listingPrice }: Props) {
  const { t } = useTranslation();

  const onContinue = () => {
    Alert.alert(
      t('paymentPortal.physicalStubTitle'),
      t('paymentPortal.physicalStubBody'),
    );
  };

  return (
    <View>
      <Text style={styles.title}>{t('paymentPortal.marketplaceTitle')}</Text>
      <Text style={styles.lead}>{t('paymentPortal.marketplaceLead')}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t('paymentPortal.item')}</Text>
        <Text style={styles.value} numberOfLines={3}>
          {listingTitle}
        </Text>
        <Text style={styles.label}>{t('paymentPortal.price')}</Text>
        <Text style={styles.value}>{listingPrice}</Text>
      </View>

      <Text style={styles.policy}>{t('paymentPortal.physicalPolicy', { mode: PAYMENT_ROUTING.physicalMarketplace })}</Text>

      <TouchableOpacity style={styles.cta} onPress={onContinue} activeOpacity={0.88}>
        <Text style={styles.ctaText}>{t('paymentPortal.continueCheckout')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  lead: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceElevated,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  policy: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  cta: {
    backgroundColor: colors.nearBlack,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
