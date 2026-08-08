import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RECENT_PULLS } from '../../../../shared/mock/recentPulls';
import { SgSectionHeader, SgData } from '../../ui';
import { sg } from '../../../tokens/sg';

/**
 * Illustrative "Just Pulled" strip (N2). Uses `shared/mock/recentPulls` —
 * not a live platform feed. Labeled SAMPLE so users do not confuse it with
 * real activity.
 */
export function SgRecentPulls() {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <SgSectionHeader
          title={t('home.recentPulls.title')}
          actionLabel={t('home.recentPulls.sampleBadge')}
        />
        <Text style={styles.caption}>{t('home.recentPulls.caption')}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {RECENT_PULLS.map((pull) => (
          <View key={pull.id} style={styles.card}>
            <Text style={styles.cardName} numberOfLines={2}>{pull.card}</Text>
            <Text style={styles.user}>@{pull.username}</Text>
            <View style={styles.meta}>
              <SgData value={pull.value} unit={t('home.recentPulls.listedUnit')} size="sm" tone="gold" />
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
  header: { paddingHorizontal: sg.space.md, marginBottom: sg.space.md, gap: 6 },
  caption: {
    fontFamily: sg.font.body,
    fontSize: 11,
    lineHeight: 15,
    color: sg.muted,
  },
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
