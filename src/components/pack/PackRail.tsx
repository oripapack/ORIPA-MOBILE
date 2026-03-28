import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import type { Pack } from '../../data/mockPacks';
import { PackCardMini } from './PackCardMini';

export function PackRail({ title, subtitle, packs }: { title: string; subtitle?: string; packs: Pack[] }) {
  if (packs.length === 0) return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {packs.map((p) => (
          <PackCardMini key={String(p.id)} pack={p} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.base,
  },
  head: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  sub: {
    marginTop: 2,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  scroll: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
});

