import React from 'react';
import { sg } from '../../tokens/sg';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import type { MembershipPlan } from '../../data/membershipPlans';

export interface MembershipTierCardProps {
  plan: MembershipPlan;
  selected: boolean;
  onSelect: () => void;
}

/** Membership names stay legible without creating a second decorative color system. */
const TIER_STYLES: Record<
  MembershipPlan['id'],
  { accent: string }
> = {
  silver: { accent: sg.text },
  gold: { accent: sg.gold },
  black: { accent: sg.text },
};

export function MembershipTierCard({ plan, selected, onSelect }: MembershipTierCardProps) {
  const { t } = useTranslation();
  const metal = TIER_STYLES[plan.id];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderColor: sg.line, backgroundColor: sg.surface },
        plan.isPopular && styles.cardPopular,
        selected && styles.cardSelected,
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
          <Text style={[styles.tierName, plan.id === 'gold' && { color: sg.gold }]}>
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
      <Text style={styles.pointsLine}>
        {t('membership.coinsMonthly', { count: plan.monthlyPoints.toLocaleString() })}
      </Text>

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
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    padding: sg.space.md,
    marginHorizontal: sg.space.md,
    marginBottom: sg.space.md,
    overflow: 'hidden',
  },
  cardPopular: {
    borderTopColor: sg.gold,
  },
  cardSelected: { borderColor: sg.gold, borderWidth: 2, backgroundColor: sg.surface2 },
  popularRibbon: {
    alignSelf: 'center',
    backgroundColor: sg.accentSoft,
    borderWidth: 1,
    borderColor: sg.line,
    paddingHorizontal: sg.space.md,
    paddingVertical: 5,
    borderRadius: sg.radius.tag,
    marginBottom: sg.space.sm,
  },
  popularRibbonText: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sg.space.xs,
  },
  tierName: {
    fontSize: sg.type.xl,
    fontFamily: sg.font.display,
    color: sg.text,
    letterSpacing: -0.3,
  },
  badgeMicro: {
    fontSize: 10,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    marginTop: 4,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: sg.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priceLine: {
    fontSize: sg.type.md,
    fontFamily: sg.font.data,
    color: sg.text,
    marginTop: sg.space.sm,
  },
  pointsLine: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.data,
    fontVariant: ['tabular-nums'],
    color: sg.muted,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: sg.line,
    marginVertical: sg.space.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sg.space.sm,
    marginBottom: sg.space.sm,
  },
  bulletIcon: {
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 20,
  },
});
