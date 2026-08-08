import React from 'react';
import { sg } from '../../tokens/sg';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PAYMENT_ROUTING } from '../../payments/physicalGoodsPolicy';
import { FutureUpdateBadge } from '../shared/FutureUpdateBadge';

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

  return (
    <View>
      <FutureUpdateBadge />
      <Text style={styles.title}>{t('paymentPortal.marketplaceTitle')}</Text>
      <Text style={styles.lead}>{t('paymentPortal.marketplaceLead')}</Text>
      <Text style={styles.previewNote}>{t('paymentPortal.marketplacePreviewNote')}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t('paymentPortal.item')}</Text>
        <Text style={styles.value} numberOfLines={3}>
          {listingTitle}
        </Text>
        <Text style={styles.label}>{t('paymentPortal.price')}</Text>
        <Text style={styles.value}>{listingPrice}</Text>
      </View>

      <Text style={styles.policy}>
        {t('paymentPortal.physicalPolicy', { mode: PAYMENT_ROUTING.physicalMarketplace })}
      </Text>

      <View style={styles.ctaDisabled} accessibilityState={{ disabled: true }}>
        <Text style={styles.ctaText}>{t('paymentPortal.checkoutDisabledCta')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: spacing.xs,
  },
  lead: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  previewNote: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.gold,
    backgroundColor: 'rgba(232,197,71,0.12)',
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  card: {
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
    backgroundColor: sg.surface2,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    marginBottom: spacing.sm,
  },
  policy: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  ctaDisabled: {
    backgroundColor: sg.surface2,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: sg.line,
    opacity: 0.85,
  },
  ctaText: {
    color: sg.muted,
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyBold,
  },
});
