import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { RECENT_PULLS } from '../../../shared/mock/recentPulls';
import { RarityBadge } from './PhBadge';
import { ph } from '../../tokens/phTheme';
import { brandFont, fontSize } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';

export function PhRecentPulls() {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Live from the vault</Text>
        <View style={styles.liveDot} />
        <Text style={styles.live}>LIVE</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {RECENT_PULLS.map((pull) => (
          <View key={pull.id} style={styles.card}>
            <RarityBadge rarity={pull.rarity} small />
            <Text style={styles.cardName} numberOfLines={2}>{pull.card}</Text>
            <Text style={styles.user}>@{pull.username}</Text>
            <View style={styles.meta}>
              <Text style={styles.value}>{pull.value}</Text>
              <Text style={styles.time}>{pull.timeAgo}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.xl, marginBottom: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, marginBottom: spacing.md, gap: 8 },
  title: { fontSize: fontSize.lg, fontFamily: brandFont.black, color: ph.text },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ph.green },
  live: { fontSize: 10, fontFamily: brandFont.bold, color: ph.green, letterSpacing: 1 },
  scroll: { paddingHorizontal: spacing.base, gap: 12 },
  card: {
    width: 160,
    backgroundColor: ph.surface,
    borderRadius: ph.radius.lg,
    borderWidth: 1,
    borderColor: ph.border,
    padding: 14,
    gap: 6,
  },
  cardName: { fontSize: fontSize.sm, fontFamily: brandFont.bold, color: ph.text, marginTop: 4 },
  user: { fontSize: 11, color: ph.textMuted },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  value: { fontSize: 12, fontFamily: brandFont.bold, color: ph.green },
  time: { fontSize: 10, color: ph.textMuted },
});
