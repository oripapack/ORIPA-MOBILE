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

/**
 * Post-browse trust reinforcement — vault-framed but visually secondary to inventory.
 */
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
    marginBottom: spacing.md,
  },
  inner: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'left',
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  textCol: {
    flex: 1,
  },
  pointPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    marginBottom: 4,
  },
  pointPillText: {
    fontSize: 8,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  body: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
