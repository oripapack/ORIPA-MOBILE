import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { VaultFramedCard } from '../shared/VaultFramedCard';

const POINTS: { pointKey: '1' | '2' | '3'; icon: string }[] = [
  { pointKey: '1', icon: '🚚' },
  { pointKey: '2', icon: '💴' },
  { pointKey: '3', icon: '🃏' },
];

export function WhyChoosePullHub() {
  const { t } = useTranslation();

  return (
    <VaultFramedCard style={styles.outer} contentStyle={styles.inner}>
      <Text style={styles.sectionTitle}>{t('marketplace.whyTitle')}</Text>

      {POINTS.map(({ pointKey, icon }) => (
        <View key={pointKey} style={styles.row}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>{icon}</Text>
          </View>
          <View style={styles.textCol}>
            <View style={styles.pointPill}>
              <Text style={styles.pointPillText}>{t(`marketplace.whyPointLabel${pointKey}`)}</Text>
            </View>
            <Text style={styles.heading}>{t(`marketplace.whyPoint${pointKey}Title`)}</Text>
            <Text style={styles.body}>{t(`marketplace.whyPoint${pointKey}Body`)}</Text>
          </View>
        </View>
      ))}
    </VaultFramedCard>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  inner: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    paddingRight: spacing.lg,
    paddingLeft: spacing.lg + 6,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(5,8,6,0.6)',
    borderWidth: 2,
    borderColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },
  textCol: {
    flex: 1,
  },
  pointPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.red,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  pointPillText: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.white,
    letterSpacing: 0.8,
  },
  heading: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
