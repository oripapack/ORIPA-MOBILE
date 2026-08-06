import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
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
  currencyLabel = 'Points',
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
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.panel,
    padding: sg.space.xl,
    borderWidth: 1,
    borderColor: sg.line,
    ...sg.shadowHero,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sg.space.md,
    gap: sg.space.md,
  },
  label: {
    color: sg.muted,
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyBold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    flex: 1,
  },
  pill: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderColor: sg.gold,
    borderWidth: 1,
    paddingHorizontal: sg.space.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  pillText: {
    color: sg.gold,
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyBold,
    letterSpacing: 0.2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    columnGap: sg.space.sm,
    rowGap: sg.space.xs,
    marginBottom: sg.space.sm,
  },
  amount: {
    color: sg.text,
    fontSize: 44,
    fontFamily: sg.font.dataBold,
    letterSpacing: -0.8,
    lineHeight: 48,
    fontVariant: [...sg.numeric],
  },
  amountUnit: {
    color: sg.muted,
    fontSize: fontSize.lg,
    fontFamily: sg.font.bodyBold,
    paddingBottom: 6,
  },
  helper: {
    color: sg.muted,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});
