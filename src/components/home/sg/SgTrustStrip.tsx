import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { sg } from '../../../tokens/sg';

const ITEMS = [
  { code: '01', title: 'Odds', sub: 'live data required to open' },
  { code: '02', title: 'Trade in', sub: 'uses listed value' },
  { code: '03', title: 'Fulfillment', sub: 'recorded in your Vault' },
] as const;

/** Trust strip — dividers are 1px `line` borders (N2 §3). */
export function SgTrustStrip() {
  return (
    <View style={styles.row}>
      {ITEMS.map((item, i) => (
        <View key={item.title} style={[styles.cell, i > 0 && styles.cellDivider]}>
          <Text style={styles.code}>{item.code}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.sub}>{item.sub}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: sg.space.md,
    marginTop: sg.space.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: sg.line,
  },
  cell: { flex: 1, paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center' },
  cellDivider: { borderLeftWidth: 1, borderLeftColor: sg.line },
  code: { fontFamily: sg.font.dataBold, fontSize: 8, color: sg.goldHi, letterSpacing: 0.8 },
  title: { fontFamily: sg.font.bodyBold, fontSize: 12, color: sg.text, marginTop: 3 },
  sub: {
    fontFamily: sg.font.body,
    fontSize: 10,
    color: sg.muted,
    marginTop: 3,
    textAlign: 'center',
  },
});
