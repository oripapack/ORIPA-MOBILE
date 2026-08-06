import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { sg } from '../../../tokens/sg';

const ITEMS = [
  { title: 'Zero-fee', sub: 'Trade in, always' },
  { title: '100% listed value', sub: 'in Points' },
  { title: 'Shipping choices', sub: 'shown before confirmation' },
] as const;

/** Trust strip — dividers are 1px `line` borders (N2 §3). */
export function SgTrustStrip() {
  return (
    <View style={styles.row}>
      {ITEMS.map((item, i) => (
        <View key={item.title} style={[styles.cell, i > 0 && styles.cellDivider]}>
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
  title: { fontFamily: sg.font.bodyBold, fontSize: 12, color: sg.text },
  sub: {
    fontFamily: sg.font.body,
    fontSize: 10,
    color: sg.muted,
    marginTop: 3,
    textAlign: 'center',
  },
});
