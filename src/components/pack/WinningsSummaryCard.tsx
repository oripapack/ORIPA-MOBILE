import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

type Props = {
  label?: string;
  amount: number;
  currencyLabel?: string; // "Coins" / "Points"
  helperText?: string;
  style?: ViewStyle;
};

export function WinningsSummaryCard({
  label = 'Total Convert Value',
  amount,
  currencyLabel = 'Coins',
  helperText,
  style,
}: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>🪙 {currencyLabel}</Text>
        </View>
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.amount}>{amount.toLocaleString()}</Text>
        <Text style={styles.amountUnit}>{currencyLabel}</Text>
      </View>

      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.casinoFelt,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.casinoFeltBorder,
    shadowColor: colors.shadowStrong,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  label: {
    color: colors.casinoGold,
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    flex: 1,
  },
  pill: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.accentBorder,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  pillText: {
    color: colors.casinoGold,
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    letterSpacing: 0.2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
    rowGap: spacing.xs,
    marginBottom: spacing.sm,
  },
  amount: {
    color: colors.textPrimary,
    fontSize: 44,
    fontFamily: brandFont.black,
    letterSpacing: -0.8,
    lineHeight: 48,
  },
  amountUnit: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
    fontFamily: brandFont.bold,
    paddingBottom: 6,
  },
  helper: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});

