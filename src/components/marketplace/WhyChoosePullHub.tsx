import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { VaultFramedCard } from '../shared/VaultFramedCard';
import Ionicons from '@expo/vector-icons/Ionicons';

const POINTS: { pointKey: '1' | '2' | '3'; icon: keyof typeof Ionicons.glyphMap }[] = [
  { pointKey: '1', icon: 'cube-outline' },
  { pointKey: '2', icon: 'pricetag-outline' },
  { pointKey: '3', icon: 'albums-outline' },
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
            <Ionicons name={icon} size={18} color={sg.goldHi} />
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
    fontFamily: brandFont.bold,
    color: sg.muted,
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
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
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
    backgroundColor: sg.cobaltWash,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: sg.goldHi,
    marginBottom: 4,
  },
  pointPillText: {
    fontSize: 8,
    fontFamily: brandFont.bold,
    color: sg.gold,
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: sg.text,
    marginBottom: 2,
  },
  body: {
    fontSize: 11,
    color: sg.muted,
    lineHeight: 17,
  },
});
