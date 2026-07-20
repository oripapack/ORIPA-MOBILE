import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { sg } from '../../../tokens/sg';

const ITEMS = [
  { title: 'Zero-fee', sub: 'trade-in, always' },
  { title: '100% listed value', sub: 'back in Coins' },
  { title: 'Free shipping', sub: 'on orders $100+' },
] as const;

/** Trust strip — neutral hairline separators (allowed as decorative rules). */
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
    borderColor: 'rgba(232,229,222,0.08)',
  },
  cell: { flex: 1, paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center' },
  cellDivider: { borderLeftWidth: 1, borderLeftColor: 'rgba(232,229,222,0.08)' },
  title: { fontFamily: sg.font.bodyBold, fontSize: 12, color: sg.showroom.text },
  sub: {
    fontFamily: sg.font.body,
    fontSize: 10,
    color: sg.showroom.textMuted,
    marginTop: 3,
    textAlign: 'center',
  },
});
