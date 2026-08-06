import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { sg } from '../../tokens/sg';

interface Props {
  /** The numeral string, e.g. "2,500" / "214 / 500" / "80.0%" / a cert hash. */
  value: string;
  /** Unit label — REQUIRED by design rule for money-like numbers ("Points", "listed value"). */
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  /**
   * gold    — value semantics: prices, balances (§4).
   * success — verification / stock / success only. Never decoration.
   * Tier coloring is NOT a tone: tiers render through SgTierTag (§6),
   * the single path for tier chrome.
   */
  tone?: 'default' | 'gold' | 'success';
  style?: TextStyle;
}

const SIZES = { sm: 12, md: 15, lg: 20 } as const;

/**
 * The only entry point for numerals: Spline Sans Mono + tabular-nums (§4).
 * Mono is restricted to prices, odds, stock, cert numbers, countdowns and
 * balances — product names and dates use the body face.
 */
export function SgData({ value, unit, size = 'md', tone = 'default', style }: Props) {
  const valueColor = tone === 'gold' ? sg.gold : tone === 'success' ? sg.success : sg.text;

  return (
    <View style={styles.row}>
      <Text style={[styles.value, { fontSize: SIZES[size], color: valueColor }, style]}>
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
  unit: {
    fontFamily: sg.font.data,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: sg.muted,
  },
});
