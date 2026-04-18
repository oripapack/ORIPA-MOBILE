import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PackOpenQuantity } from '../../store/useAppStore';
import { packOpenTotalCredits } from '../../lib/packMultiOpen';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

type Props = {
  quantity: PackOpenQuantity;
  creditPrice: number;
};

export function PackMultiOpenSummary({ quantity, creditPrice }: Props) {
  const { t } = useTranslation();
  const total = packOpenTotalCredits(creditPrice, quantity);
  const each = creditPrice.toLocaleString();
  const totalStr = total.toLocaleString();

  if (quantity === 1) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{t('packDetails.multiOpen.standardTitle')}</Text>
        <Text style={styles.lead}>{t('packDetails.multiOpen.standardLead')}</Text>
        <Text style={styles.support}>{t('packDetails.multiOpen.standardCredits', { credits: totalStr })}</Text>
      </View>
    );
  }

  if (quantity === 10) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{t('packDetails.multiOpen.fastTitle')}</Text>
        <Text style={styles.lead}>{t('packDetails.multiOpen.fastLead')}</Text>
        <Text style={styles.support}>{t('packDetails.multiOpen.fastTotal', { total: totalStr })}</Text>
        <Text style={styles.supportMuted}>{t('packDetails.multiOpen.perPack', { each })}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.cardRush]}>
      <Text style={styles.title}>{t('packDetails.multiOpen.rushTitle')}</Text>
      <Text style={styles.lead}>{t('packDetails.multiOpen.rushLead1')}</Text>
      <Text style={styles.lead}>{t('packDetails.multiOpen.rushLead2')}</Text>
      <View style={styles.divider} />
      <Text style={styles.support}>{t('packDetails.multiOpen.rushTotal', { total: totalStr })}</Text>
      <Text style={styles.supportMuted}>{t('packDetails.multiOpen.perPack', { each })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(2,6,23,0.35)',
    padding: spacing.md,
    gap: 6,
  },
  cardRush: {
    borderColor: colors.magentaBorder,
    backgroundColor: colors.magentaSoft,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  lead: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  support: {
    marginTop: 2,
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    letterSpacing: 0.15,
  },
  supportMuted: {
    fontSize: 12,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    opacity: 0.92,
  },
  divider: {
    marginTop: spacing.xs,
    marginBottom: 2,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
