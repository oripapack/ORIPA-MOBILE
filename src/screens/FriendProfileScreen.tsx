import React, { useLayoutEffect, useMemo, useState } from 'react';
import { sg } from '../tokens/sg';
import {
  Platform,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import {
  buildMinimalSocialProfile,
  deriveSocialProfileFromUser,
  getActivityHighlights,
  getSocialProfile,
  type SocialUserProfile,
} from '../data/socialMock';
import { formatPoints } from '../lib/socialFormat';
import { SocialPullRow } from '../components/social/SocialPullRow';
import { ActivityStrip } from '../components/social/ActivityStrip';
import { CompareStatsModal } from '../components/social/CompareStatsModal';
import { FriendVaultShowcaseSection } from '../components/friends/FriendVaultShowcaseSection';
import { showUserMessage } from '../utils/showUserMessage';

type Nav = StackNavigationProp<RootStackParamList, 'FriendProfile'>;
type Rt = RouteProp<RootStackParamList, 'FriendProfile'>;

export function FriendProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { username } = route.params;

  const user = useAppStore((s) => s.user);
  const friends = useAppStore((s) => s.friends);

  const [compareOpen, setCompareOpen] = useState(false);

  const normalized = username.trim().toLowerCase();
  const isSelf = user.username.trim().toLowerCase() === normalized;
  const isVisualPreview =
    process.env.EXPO_PUBLIC_UI_PREVIEW === '1' && Platform.OS === 'web';
  const isFriend = isVisualPreview || friends.some((f) => f.username === normalized);

  const profile: SocialUserProfile | null = useMemo(() => {
    if (isSelf) return deriveSocialProfileFromUser(user);
    const rich = getSocialProfile(normalized);
    if (rich) return rich;
    const entry = friends.find((f) => f.username === normalized);
    if (entry) return buildMinimalSocialProfile(entry);
    return null;
  }, [isSelf, normalized, user, friends]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: profile ? `@${profile.username}` : t('social.profileNavTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: sg.bg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: sg.line,
      },
    });
  }, [navigation, profile, t]);

  const meProfile = useMemo(() => deriveSocialProfileFromUser(user), [user]);

  if (!isSelf && !isFriend) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + sg.space.lg }]}>
        <Text style={styles.errTitle}>{t('social.notFriendTitle')}</Text>
        <Text style={styles.errBody}>{t('social.notFriendBody')}</Text>
        <TouchableOpacity style={styles.errBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.errBtnText}>{t('social.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + sg.space.lg }]}>
        <Text style={styles.errTitle}>{t('social.profileMissingTitle')}</Text>
        <Text style={styles.errBody}>{t('social.profileMissingBody')}</Text>
        <TouchableOpacity style={styles.errBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.errBtnText}>{t('social.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const s = profile.stats;
  const highlights = getActivityHighlights(profile);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + sg.space.xxl, paddingTop: sg.space.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.avatar}>{profile.displayName.slice(0, 1).toUpperCase()}</Text>
          <View style={styles.heroText}>
            <Text style={styles.dn}>{profile.displayName}</Text>
            <Text style={styles.un}>@{profile.username}</Text>
            {profile.status ? <Text style={styles.status}>{profile.status}</Text> : null}
          </View>
        </View>
        <Text style={styles.bio}>{profile.bio}</Text>
        <Text style={styles.joined}>
          {t('social.joined', { date: new Date(profile.joinDateIso).toLocaleDateString() })}
        </Text>

        <View style={styles.statGrid}>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{s.packsOpened}</Text>
            <Text style={styles.statLab}>{t('social.statPacks')}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{formatPoints(s.totalEstimatedValue)}</Text>
            <Text style={styles.statLab}>{t('social.statValue')}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{s.chaseHits}</Text>
            <Text style={styles.statLab}>{t('social.statChase')}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statVal}>{profile.luckScore}</Text>
            <Text style={styles.statLab}>{t('social.statLuck')}</Text>
          </View>
        </View>

        <FriendVaultShowcaseSection
          sellerUsername={normalized}
          isSelf={isSelf}
          friendEntry={friends.find((f) => f.username === normalized) ?? null}
        />

        <Text style={styles.section}>{t('social.bestPull')}</Text>
        <View style={styles.bestCard}>
          <Text style={styles.bestName} numberOfLines={2}>
            {s.bestPullCardName}
          </Text>
          <Text style={styles.bestVal}>{formatPoints(s.bestPullValue)}</Text>
          <Text style={styles.bestSub}>{t('social.estimatedValue')}</Text>
        </View>

        <Text style={styles.section}>{t('social.rarityMix')}</Text>
        <View style={styles.tierPendingCard}>
          <Text style={styles.tierPending}>{t('social.tierDataPending')}</Text>
        </View>

        <Text style={styles.section}>{t('social.highlights')}</Text>
        <ActivityStrip items={highlights} />

        <Text style={styles.section}>{t('social.recentPulls')}</Text>
        {profile.recentPulls.length === 0 ? (
          <Text style={styles.emptyPulls}>{t('social.noRecentPulls')}</Text>
        ) : (
          profile.recentPulls.map((p) => <SocialPullRow key={p.id} pull={p} />)
        )}

        {!isSelf ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.btnDark}
              onPress={() => setCompareOpen(true)}
              activeOpacity={0.88}
            >
              <Text style={styles.btnDarkText}>{t('social.compare')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => navigation.navigate('FriendsLeaderboard')}
              activeOpacity={0.88}
            >
              <Text style={styles.btnOutlineText}>{t('social.openLeaderboard')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnGhost}
              onPress={() => showUserMessage(t('social.giftTitle'), t('social.giftBody'))}
              activeOpacity={0.88}
            >
              <Text style={styles.btnGhostText}>{t('social.sendDemoPack')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.btnOutline, styles.selfLb]}
            onPress={() => navigation.navigate('FriendsLeaderboard')}
            activeOpacity={0.88}
          >
            <Text style={styles.btnOutlineText}>{t('social.openLeaderboard')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {!isSelf && profile ? (
        <CompareStatsModal
          visible={compareOpen}
          onClose={() => setCompareOpen(false)}
          me={meProfile}
          friend={profile}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: sg.bg },
  scroll: { paddingHorizontal: sg.space.md },
  center: { flex: 1, paddingHorizontal: sg.space.lg, backgroundColor: sg.bg },
  errTitle: {
    fontSize: sg.type.lg,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: sg.space.sm,
  },
  errBody: { fontSize: sg.type.sm, color: sg.muted, lineHeight: 20, marginBottom: sg.space.lg },
  errBtn: {
    alignSelf: 'flex-start',
    backgroundColor: sg.surface2,
    paddingHorizontal: sg.space.lg,
    paddingVertical: sg.space.md,
    borderRadius: sg.radius.panel,
  },
  errBtnText: { color: sg.text, fontFamily: sg.font.bodyBold },
  hero: { flexDirection: 'row', gap: sg.space.md, marginBottom: sg.space.md, alignItems: 'center' },
  avatar: {
    fontSize: 22,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    width: 72,
    height: 72,
    textAlign: 'center',
    lineHeight: 72,
    backgroundColor: sg.surface2,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: sg.line,
  },
  heroText: { flex: 1, minWidth: 0 },
  dn: { fontSize: sg.type.xl, fontFamily: sg.font.display, color: sg.text },
  un: { fontSize: sg.type.sm, fontFamily: sg.font.bodyMedium, color: sg.muted, marginTop: 2 },
  status: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    marginTop: sg.space.xs,
  },
  bio: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 21,
    marginBottom: sg.space.sm,
  },
  joined: { fontSize: sg.type.xs, color: sg.muted, marginBottom: sg.space.lg },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sg.space.sm,
    marginBottom: sg.space.lg,
  },
  statCell: {
    width: '47%',
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.panel,
    padding: sg.space.md,
    borderWidth: 1,
    borderColor: sg.line,
  },
  statVal: {
    fontSize: sg.type.lg,
    fontFamily: sg.font.dataBold,
    color: sg.text,
    fontVariant: [...sg.numeric],
  },
  statLab: { fontSize: 10, fontFamily: sg.font.bodyBold, color: sg.muted, marginTop: 4, letterSpacing: 0.5 },
  section: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: sg.space.md,
    marginTop: sg.space.sm,
  },
  bestCard: {
    backgroundColor: sg.surface,
    borderRadius: sg.radius.panel,
    padding: sg.space.lg,
    marginBottom: sg.space.lg,
    borderWidth: 1,
    borderColor: sg.line,
  },
  bestName: { fontSize: sg.type.lg, fontFamily: sg.font.bodyBold, color: sg.text, marginBottom: sg.space.sm },
  bestVal: {
    fontSize: sg.type.hero - 4,
    fontFamily: sg.font.dataBold,
    color: sg.gold,
    fontVariant: [...sg.numeric],
  },
  bestSub: { fontSize: sg.type.xs, color: sg.muted, marginTop: 4 },
  tierPendingCard: {
    backgroundColor: sg.surface,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    padding: sg.space.md,
    marginBottom: sg.space.lg,
  },
  tierPending: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 20,
  },
  actions: { gap: sg.space.sm, marginTop: sg.space.lg },
  btnDark: {
    height: 52,
    borderRadius: sg.radius.btn,
    backgroundColor: sg.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDarkText: { color: sg.onGold, fontFamily: sg.font.bodyBold, fontSize: sg.type.md },
  btnOutline: {
    height: 52,
    borderRadius: sg.radius.btn,
    borderWidth: 1,
    borderColor: sg.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: { color: sg.text, fontFamily: sg.font.bodyBold, fontSize: sg.type.md },
  btnGhost: { height: 48, alignItems: 'center', justifyContent: 'center' },
  btnGhostText: { color: sg.muted, fontFamily: sg.font.bodyMedium, fontSize: sg.type.sm },
  selfLb: { marginTop: sg.space.md },
  emptyPulls: {
    fontSize: sg.type.sm,
    color: sg.muted,
    marginBottom: sg.space.md,
  },
});
