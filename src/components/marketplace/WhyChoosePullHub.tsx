import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

const POINTS: { pointKey: '1' | '2' | '3'; icon: string }[] = [
  { pointKey: '1', icon: '🚚' },
  { pointKey: '2', icon: '💴' },
  { pointKey: '3', icon: '🃏' },
];

export function WhyChoosePullHub() {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.base,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.surfaceElevated,
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
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  pointPillText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  body: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
