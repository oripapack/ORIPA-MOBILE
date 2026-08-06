import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { RECENT_PULLS } from '../../../../shared/mock/recentPulls';
import { SgSectionHeader, SgData } from '../../ui';
import { sg } from '../../../tokens/sg';

/**
 * "Just Pulled" social-proof strip (N2). Same data source as PhRecentPulls
 * (shared/mock/recentPulls). Feed pulls carry no card→tier link, so their
 * tier state is UNKNOWN — no tier chrome renders at all (§6 v2.2; the
 * legacy card-rarity text that sat here was removed with the old enum).
 * Pulled values are gold (value semantics). Card names use the body face —
 * Fraunces is heading-tier only.
 */
export function SgRecentPulls() {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <SgSectionHeader title="Just Pulled" actionLabel="PREVIEW" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {RECENT_PULLS.map((pull) => (
          <View key={pull.id} style={styles.card}>
            <Text style={styles.cardName} numberOfLines={2}>{pull.card}</Text>
            <Text style={styles.user}>@{pull.username}</Text>
            <View style={styles.meta}>
              <SgData value={pull.value} unit="listed" size="sm" tone="gold" />
              <Text style={styles.time}>{pull.timeAgo}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: sg.space.xl, marginBottom: sg.space.lg },
  header: { paddingHorizontal: sg.space.md, marginBottom: sg.space.md },
  scroll: { paddingHorizontal: sg.space.md, gap: 12 },
  card: {
    width: 160,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: sg.radius.panel,
    padding: 14,
    gap: 6,
    overflow: 'hidden',
  },
  cardName: {
    fontFamily: sg.font.bodyBold,
    fontSize: 13,
    color: sg.text,
    lineHeight: 17,
    marginTop: 2,
  },
  user: { fontFamily: sg.font.body, fontSize: 11, color: sg.muted },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 4,
  },
  time: { fontFamily: sg.font.body, fontSize: 10, color: sg.muted },
});
