import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PackOpenQuantity } from '../../store/useAppStore';
import { packOpenTotalCredits } from '../../lib/packMultiOpen';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('packDetails.multiOpen.fastTitle')}</Text>
      <Text style={styles.lead}>{t('packDetails.multiOpen.fastLead')}</Text>
      <Text style={styles.support}>{t('packDetails.multiOpen.fastTotal', { total: totalStr })}</Text>
      <Text style={styles.supportMuted}>{t('packDetails.multiOpen.perPack', { each })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
    padding: spacing.md,
    gap: 6,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    letterSpacing: 0.2,
  },
  lead: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    lineHeight: 20,
  },
  support: {
    marginTop: 2,
    fontSize: fontSize.sm,
    fontFamily: sg.font.dataBold,
    color: sg.valueHi,
  },
  supportMuted: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
  },
});
