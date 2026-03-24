import React, { useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import {
  buildLeaderboard,
  deriveSocialProfileFromUser,
  type LeaderboardMetric,
} from '../data/socialMock';
import { formatUsd as fmt } from '../lib/socialFormat';

type Nav = StackNavigationProp<RootStackParamList, 'FriendsLeaderboard'>;

const METRICS: LeaderboardMetric[] = [
  'totalValue',
  'biggestPull',
  'packsOpened',
  'chaseHits',
  'luckScore',
];

function formatMetricValue(metric: LeaderboardMetric, v: number): string {
  if (metric === 'luckScore') return `${Math.round(v)}`;
  if (metric === 'packsOpened' || metric === 'chaseHits') return `${Math.round(v)}`;
  return fmt(v);
}

export function FriendsLeaderboardScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const user = useAppStore((s) => s.user);
  const friends = useAppStore((s) => s.friends);

  const [metric, setMetric] = useState<LeaderboardMetric>('totalValue');

  const meProfile = useMemo(() => deriveSocialProfileFromUser(user), [user]);

  const entries = useMemo(
    () => buildLeaderboard(metric, user.username, meProfile, friends),
    [metric, user.username, meProfile, friends],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('social.leaderboardNavTitle'),
      headerShown: true,
      headerTintColor: colors.textPrimary,
      headerTitleStyle: { fontWeight: fontWeight.bold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: colors.surfaceElevated },
    });
  }, [navigation, t]);

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        style={styles.tabBar}
      >
        {METRICS.map((m) => {
          const active = metric === m;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.tab, active && styles.tabOn]}
              onPress={() => setMetric(m)}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabText, active && styles.tabTextOn]} numberOfLines={1}>
                {t(`social.metric.${m}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.lead}>{t('social.leaderboardLead')}</Text>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {entries.map((e) => (
          <View
            key={e.username}
            style={[styles.row, e.isCurrentUser && styles.rowMe]}
          >
            <Text style={styles.rank}>{e.rank}</Text>
            <Text style={styles.emoji}>{e.avatarEmoji}</Text>
            <View style={styles.rowMeta}>
              <Text style={styles.rowName} numberOfLines={1}>
                {e.displayName}
                {e.isCurrentUser ? ` (${t('social.you')})` : ''}
              </Text>
              <Text style={styles.rowUn} numberOfLines={1}>
                @{e.username}
              </Text>
            </View>
            <Text style={styles.rowVal}>{formatMetricValue(metric, e.value)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  tabBar: { maxHeight: 52, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  tabs: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm, gap: spacing.sm, alignItems: 'center' },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabOn: { backgroundColor: colors.nearBlack, borderColor: colors.nearBlack },
  tabText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textSecondary },
  tabTextOn: { color: colors.white },
  lead: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    lineHeight: 20,
  },
  list: { paddingHorizontal: spacing.base, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
  },
  rowMe: { borderColor: 'rgba(225,29,46,0.35)', backgroundColor: 'rgba(225,29,46,0.04)' },
  rank: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    width: 28,
  },
  emoji: { fontSize: 22 },
  rowMeta: { flex: 1, minWidth: 0 },
  rowName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  rowUn: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  rowVal: { fontSize: fontSize.md, fontWeight: fontWeight.black, color: colors.red },
});
