import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { RECENT_PULLS } from '../../../../shared/mock/recentPulls';
import { SgSectionHeader, SgData } from '../../ui';
import { sg } from '../../../tokens/sg';

/**
 * "Just Pulled" social-proof strip (Urushi). Same data source as PhRecentPulls
 * (shared/mock/recentPulls). Rarity reads as a brass data line; values are
 * jade (financial confirmation text). Card names use the body face — Fraunces
 * is reserved for revealed card names on the RESULT screen, not feed items.
 */
export function SgRecentPulls() {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <SgSectionHeader title="Just Pulled" actionLabel="LIVE" live />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {RECENT_PULLS.map((pull) => (
          <View key={pull.id} style={styles.card}>
            <View style={styles.satinTop} pointerEvents="none" />
            <SgData value={pull.rarity.toUpperCase()} size="sm" tone="brass" />
            <Text style={styles.cardName} numberOfLines={2}>{pull.card}</Text>
            <Text style={styles.user}>@{pull.username}</Text>
            <View style={styles.meta}>
              <SgData value={pull.value} unit="listed" size="sm" tone="jade" />
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
    backgroundColor: sg.showroom.surface,
    borderRadius: sg.radius.card,
    padding: 14,
    gap: 6,
    overflow: 'hidden',
  },
  satinTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: sg.satinTopHighlight,
  },
  cardName: {
    fontFamily: sg.font.bodyBold,
    fontSize: 13,
    color: sg.showroom.text,
    lineHeight: 17,
    marginTop: 2,
  },
  user: { fontFamily: sg.font.body, fontSize: 11, color: sg.showroom.textMuted },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 4,
  },
  time: { fontFamily: sg.font.body, fontSize: 10, color: sg.showroom.textMuted },
});
