import React, { useLayoutEffect, useMemo, useState } from 'react';
import { sg } from '../tokens/sg';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fontSize } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import {
  buildLeaderboard,
  deriveSocialProfileFromUser,
  type LeaderboardMetric,
} from '../data/socialMock';
import { formatUsd as fmt } from '../lib/socialFormat';
import { SgScreen } from '../components/ui/SgScreen';
import { SgUnavailableService } from '../components/ui';
import { SOCIAL_IS_LIVE } from '../config/app';

type Nav = StackNavigationProp<RootStackParamList, 'FriendsLeaderboard'>;

const METRICS: LeaderboardMetric[] = [
  'totalValue',
  'biggestPull',
  'packsOpened',
];

function formatMetricValue(metric: LeaderboardMetric, v: number): string {
  if (metric === 'packsOpened') return `${Math.round(v)}`;
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
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  if (!__DEV__ && !SOCIAL_IS_LIVE) {
    return (
      <SgUnavailableService
        code="SOCIAL / LEADERBOARD"
        eyebrow={t('friends.releaseEyebrow')}
        title={t('friends.releaseTitle')}
        body={t('friends.releaseBody')}
      />
    );
  }

  return (
    <SgScreen constrainContent>
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
            <Text style={styles.emoji}>{e.displayName.trim().slice(0, 2).toUpperCase()}</Text>
            <View style={styles.rowMeta}>
              <Text style={styles.rowName} numberOfLines={1}>
                {e.displayName}
                {e.isCurrentUser ? ` (${t('social.you')})` : ''}
              </Text>
              <Text style={styles.rowUn} numberOfLines={1}>
                @{e.username}
              </Text>
            </View>
            <Text
              style={[styles.rowVal, metric !== 'packsOpened' && styles.rowValFinancial]}
            >
              {formatMetricValue(metric, e.value)}
            </Text>
          </View>
        ))}
      </ScrollView>
      </View>
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  tabBar: { maxHeight: 52, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: sg.line },
  tabs: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm, gap: spacing.sm, alignItems: 'center' },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  tabOn: { backgroundColor: sg.surface2, borderColor: sg.surface2 },
  tabText: { fontSize: fontSize.xs, fontFamily: sg.font.bodyBold, color: sg.muted },
  tabTextOn: { color: sg.text },
  lead: {
    fontSize: fontSize.sm,
    color: sg.muted,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    lineHeight: 20,
  },
  list: { paddingHorizontal: spacing.base, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: sg.surface2,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: sg.line,
  },
  rowMe: { borderColor: sg.cobaltBorder, backgroundColor: sg.cobaltWash },
  rank: {
    fontSize: fontSize.md,
    fontFamily: sg.font.display,
    color: sg.muted,
    width: 28,
  },
  emoji: { fontSize: 22 },
  rowMeta: { flex: 1, minWidth: 0 },
  rowName: { fontSize: fontSize.md, fontFamily: sg.font.bodyBold, color: sg.text },
  rowUn: { fontSize: fontSize.xs, color: sg.muted, marginTop: 2 },
  rowVal: { fontSize: fontSize.md, fontFamily: sg.font.display, color: sg.text },
  rowValFinancial: { color: sg.valueHi },
});
