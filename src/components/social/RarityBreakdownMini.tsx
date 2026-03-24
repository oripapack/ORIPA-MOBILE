import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RarityBreakdown } from '../../data/socialMock';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { rarityColor } from './rarityStyles';
import type { SocialRarity } from '../../data/socialMock';

const ORDER: SocialRarity[] = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

export function RarityBreakdownMini({ breakdown }: { breakdown: RarityBreakdown }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {ORDER.map((k) => {
          const n = breakdown[k];
          if (n <= 0) return null;
          return (
            <View key={k} style={[styles.seg, { flex: n, backgroundColor: rarityColor(k) }]} />
          );
        })}
      </View>
      <View style={styles.legend}>
        {ORDER.map((k) => {
          const n = breakdown[k];
          if (n <= 0) return null;
          return (
            <View key={k} style={styles.legRow}>
              <View style={[styles.dot, { backgroundColor: rarityColor(k) }]} />
              <Text style={styles.legText}>
                {k.charAt(0).toUpperCase() + k.slice(1)} · {n}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  bar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: colors.borderLight,
  },
  seg: { height: '100%' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  legRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legText: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
});
