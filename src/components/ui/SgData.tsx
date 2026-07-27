import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { sg } from '../../tokens/sg';

interface Props {
  /** The numeral string, e.g. "2,500" / "214 / 500" / "80.0%" / a cert hash. */
  value: string;
  /** Unit label — REQUIRED by design rule for money-like numbers ("Coins", "listed value"). */
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  /**
   * gold    — value semantics: prices, balances (§4).
   * chase   — §6 top rarity rank: neon, always with glow.
   * hit     — §6 second rank: gold, quiet value.
   * base    — §6 remaining ranks: muted @50%, no statement.
   * success — verification / stock / success only. Never decoration.
   */
  tone?: 'default' | 'gold' | 'chase' | 'hit' | 'base' | 'success';
  style?: TextStyle;
}

const SIZES = { sm: 12, md: 15, lg: 20 } as const;

/**
 * The only entry point for numerals: Spline Sans Mono + tabular-nums (§4).
 * Mono is restricted to prices, odds, stock, cert numbers, countdowns and
 * balances — product names and dates use the body face.
 */
export function SgData({ value, unit, size = 'md', tone = 'default', style }: Props) {
  const valueColor =
    tone === 'gold' || tone === 'hit'
      ? sg.gold
      : tone === 'chase'
        ? sg.neon
        : tone === 'base'
          ? sg.muted
          : tone === 'success'
            ? sg.success
            : sg.text;

  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.value,
          { fontSize: SIZES[size], color: valueColor },
          tone === 'chase' && styles.chaseGlow,
          tone === 'base' && styles.baseDim,
          style,
        ]}
      >
        {value}
      </Text>
      {unit ? <Text style={styles.unit}>{unit}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  value: {
    fontFamily: sg.font.dataBold,
    letterSpacing: 0.2,
    fontVariant: [...sg.numeric],
  },
  // §6 CHASE — neon must glow (text shadow is the RN translation of --ph-glow-neon)
  chaseGlow: {
    textShadowColor: sg.neonGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  // §6 BASE — muted @50%
  baseDim: { opacity: 0.5 },
  unit: {
    fontFamily: sg.font.data,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: sg.muted,
  },
});
