import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import {
  buildMinimalSocialProfile,
  deriveSocialProfileFromUser,
  getActivityHighlights,
  getSocialProfile,
  type SocialUserProfile,
} from '../data/socialMock';
import { formatUsd } from '../lib/socialFormat';
import { SocialPullRow } from '../components/social/SocialPullRow';
import { RarityBreakdownMini } from '../components/social/RarityBreakdownMini';
import { ActivityStrip } from '../components/social/ActivityStrip';
import { CompareStatsModal } from '../components/social/CompareStatsModal';

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
  const isFriend = friends.some((f) => f.username === normalized);

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
      headerTintColor: colors.textPrimary,
      headerTitleStyle: { fontWeight: fontWeight.bold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: colors.surfaceElevated },
    });
  }, [navigation, profile, t]);

  const meProfile = useMemo(() => deriveSocialProfileFromUser(user), [user]);

  if (!isSelf && !isFriend) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + spacing.xl }]}>
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
      <View style={[styles.center, { paddingTop: insets.top + spacing.xl }]}>
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
          { paddingBottom: insets.bottom + spacing.xxxl, paddingTop: spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.avatar}>{profile.avatarEmoji}</Text>
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
            <Text style={styles.statVal}>{formatUsd(s.totalEstimatedValue)}</Text>
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

        <Text style={styles.section}>{t('social.bestPull')}</Text>
        <View style={styles.bestCard}>
          <Text style={styles.bestName} numberOfLines={2}>
            {s.bestPullCardName}
          </Text>
          <Text style={styles.bestVal}>{formatUsd(s.bestPullValue)}</Text>
          <Text style={styles.bestSub}>{t('social.estimatedValue')}</Text>
        </View>

        <Text style={styles.section}>{t('social.rarityMix')}</Text>
        <RarityBreakdownMini breakdown={s.rarityBreakdown} />

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
              onPress={() => Alert.alert(t('social.giftTitle'), t('social.giftBody'))}
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
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.base },
  center: { flex: 1, paddingHorizontal: spacing.lg, backgroundColor: colors.background },
  errTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errBody: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.lg },
  errBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.nearBlack,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  errBtnText: { color: colors.white, fontWeight: fontWeight.bold },
  hero: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md, alignItems: 'center' },
  avatar: {
    fontSize: 48,
    width: 72,
    height: 72,
    textAlign: 'center',
    lineHeight: 72,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  heroText: { flex: 1, minWidth: 0 },
  dn: { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.textPrimary },
  un: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted, marginTop: 2 },
  status: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.red,
    marginTop: spacing.xs,
  },
  bio: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  joined: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing.lg },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCell: {
    width: '47%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
  },
  statVal: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.textPrimary },
  statLab: { fontSize: 10, fontWeight: fontWeight.bold, color: colors.textMuted, marginTop: 4, letterSpacing: 0.5 },
  section: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  bestCard: {
    backgroundColor: colors.casinoFelt,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.casinoFeltBorder,
  },
  bestName: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.white, marginBottom: spacing.sm },
  bestVal: { fontSize: fontSize.hero - 4, fontWeight: fontWeight.black, color: colors.casinoGold },
  bestSub: { fontSize: fontSize.xs, color: 'rgba(248,250,252,0.65)', marginTop: 4 },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
  btnDark: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.nearBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDarkText: { color: colors.white, fontWeight: fontWeight.black, fontSize: fontSize.md },
  btnOutline: {
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: { color: colors.textPrimary, fontWeight: fontWeight.black, fontSize: fontSize.md },
  btnGhost: { height: 48, alignItems: 'center', justifyContent: 'center' },
  btnGhostText: { color: colors.textSecondary, fontWeight: fontWeight.semibold, fontSize: fontSize.sm },
  selfLb: { marginTop: spacing.md },
  emptyPulls: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
