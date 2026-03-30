import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import type { MembershipPlan } from '../../data/membershipPlans';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

export interface MembershipTierCardProps {
  plan: MembershipPlan;
  selected: boolean;
  onSelect: () => void;
}

/** Visual tokens per metal tier — premium TCG, not casino. */
const TIER_STYLES: Record<
  MembershipPlan['id'],
  { border: string; accent: string; glow?: string; surface: string }
> = {
  silver: {
    border: 'rgba(180, 190, 200, 0.45)',
    accent: '#C8D0D8',
    surface: 'rgba(120, 130, 145, 0.08)',
  },
  gold: {
    border: 'rgba(255, 203, 5, 0.55)',
    accent: colors.gold,
    glow: 'rgba(255, 203, 5, 0.12)',
    surface: 'rgba(255, 203, 5, 0.06)',
  },
  black: {
    border: 'rgba(90, 90, 100, 0.55)',
    accent: '#E8E8EC',
    surface: 'rgba(8, 10, 14, 0.92)',
  },
};

export function MembershipTierCard({ plan, selected, onSelect }: MembershipTierCardProps) {
  const { t } = useTranslation();
  const metal = TIER_STYLES[plan.id];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderColor: metal.border, backgroundColor: metal.surface },
        plan.isPopular && styles.cardPopular,
        selected && { borderColor: metal.accent, borderWidth: 2 },
      ]}
      onPress={onSelect}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={t(`membership.tierName_${plan.id}`)}
    >
      {plan.isPopular ? (
        <View style={styles.popularRibbon} accessibilityRole="text">
          <Text style={styles.popularRibbonText}>{t('membership.mostPopular')}</Text>
        </View>
      ) : null}

      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.tierName, plan.id === 'gold' && { color: colors.gold }]}>
            {t(`membership.tierName_${plan.id}`)}
          </Text>
          <Text style={styles.badgeMicro}>{t(`membership.badge_${plan.id}`)}</Text>
        </View>
        <View style={[styles.radioOuter, selected && { borderColor: metal.accent }]}>
          {selected ? <View style={[styles.radioInner, { backgroundColor: metal.accent }]} /> : null}
        </View>
      </View>

      <Text style={styles.priceLine}>
        {t('membership.pricePerMonth', { price: `$${plan.priceUsd.toFixed(2)}` })}
      </Text>
      <Text style={styles.coinsLine}>{t('membership.coinsMonthly', { count: plan.monthlyCoins })}</Text>

      <View style={styles.divider} />

      {plan.benefitIds.map((bid) => (
        <View key={bid} style={styles.bulletRow}>
          <Ionicons name="checkmark-circle" size={16} color={metal.accent} style={styles.bulletIcon} />
          <Text style={styles.bulletText}>{t(`membership.benefits.${bid}`)}</Text>
        </View>
      ))}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardPopular: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  popularRibbon: {
    alignSelf: 'center',
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  popularRibbonText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  tierName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  badgeMicro: {
    fontSize: 10,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priceLine: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  coinsLine: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bulletIcon: {
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
