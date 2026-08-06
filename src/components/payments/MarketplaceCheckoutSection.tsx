import React from 'react';
import { sg } from '../../tokens/sg';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PAYMENT_ROUTING } from '../../payments/physicalGoodsPolicy';
import { showUserMessage } from '../../utils/showUserMessage';

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
    showUserMessage(
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
    fontSize: sg.type.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: sg.space.xs,
  },
  lead: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    marginBottom: sg.space.lg,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: sg.radius.panel,
    padding: sg.space.md,
    marginBottom: sg.space.lg,
    backgroundColor: sg.surface2,
  },
  label: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    marginBottom: sg.space.sm,
  },
  policy: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: sg.space.lg,
  },
  cta: {
    backgroundColor: sg.surface2,
    paddingVertical: sg.space.sm + 4,
    borderRadius: sg.radius.btn,
    alignItems: 'center',
  },
  ctaText: {
    color: sg.text,
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyBold,
  },
});
