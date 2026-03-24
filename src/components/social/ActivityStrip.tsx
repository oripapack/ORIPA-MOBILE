import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { ActivityHighlight } from '../../data/socialMock';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

export function ActivityStrip({ items }: { items: ActivityHighlight[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={styles.text} numberOfLines={2}>
            {item.text}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.sm, paddingVertical: 2 },
  card: {
    width: 220,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  emoji: { fontSize: 20 },
  text: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
