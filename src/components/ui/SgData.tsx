import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { sg, SgLayer } from '../../tokens/sg';

interface Props {
  /** The numeral string, e.g. "2,500" / "214 / 500" / "80.0%" / a seed hash. */
  value: string;
  /** Unit label — REQUIRED by design rule for money-like numbers ("Coins", "listed value"). */
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  /**
   * brass — rarity / decorative data accents (never buttons).
   * jade  — financial confirmation status only (trade-in complete, value confirmed).
   */
  tone?: 'default' | 'brass' | 'jade';
  layer?: SgLayer;
  style?: TextStyle;
}

const SIZES = { sm: 12, md: 15, lg: 20 } as const;

/**
 * The only entry point for numerals. Mono is restricted to prices, odds,
 * stock, coins and hashes — product names and dates use the body face.
 */
export function SgData({ value, unit, size = 'md', tone = 'default', layer = 'showroom', style }: Props) {
  const base = layer === 'showroom' ? sg.showroom.text : sg.gallery.ink;
  const muted = layer === 'showroom' ? sg.showroom.textMuted : sg.gallery.inkMuted;
  const valueColor =
    tone === 'brass' ? sg.brass : tone === 'jade' ? (layer === 'showroom' ? sg.jadeOnDark : sg.jade) : base;

  return (
    <View style={styles.row}>
      <Text style={[styles.value, { fontSize: SIZES[size], color: valueColor }, style]}>{value}</Text>
      {unit ? <Text style={[styles.unit, { color: muted }]}>{unit}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  value: { fontFamily: sg.font.dataBold, letterSpacing: 0.2 },
  unit: { fontFamily: sg.font.data, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' },
});
