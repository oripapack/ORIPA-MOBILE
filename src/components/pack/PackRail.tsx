import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
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
    paddingTop: sg.space.md,
  },
  head: {
    paddingHorizontal: sg.space.md,
    marginBottom: sg.space.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    letterSpacing: -0.2,
  },
  sub: {
    marginTop: 2,
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 18,
  },
  scroll: {
    paddingHorizontal: sg.space.md,
    gap: sg.space.sm,
    paddingBottom: sg.space.xs,
  },
});
