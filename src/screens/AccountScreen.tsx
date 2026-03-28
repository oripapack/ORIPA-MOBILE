import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { useAppStore } from '../store/useAppStore';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { RootStackParamList, RootTabParamList } from '../navigation/types';
import { isClerkEnabled } from '../config/clerk';
import { useGuestBrowseStore } from '../store/guestBrowseStore';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { deriveSocialProfileFromUser, getActivityHighlights } from '../data/socialMock';
import { formatUsd } from '../lib/socialFormat';
import { SocialPullRow } from '../components/social/SocialPullRow';
import { RarityBreakdownMini } from '../components/social/RarityBreakdownMini';
import { ActivityStrip } from '../components/social/ActivityStrip';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';
import { ListRow } from '../components/shared/ListRow';

type AccountNav = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Account'>,
  StackNavigationProp<RootStackParamList>
>;

export function AccountScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AccountNav>();
  const user = useAppStore((s) => s.user);
  const { refreshControl } = usePullToRefresh();
  const clerkSignedIn = useGuestBrowseStore((s) => s.clerkSignedIn);
  const forceAuthWall = useGuestBrowseStore((s) => s.forceAuthWall);
  const { requireAuth } = useRequireAuth();

  const showGuestSignInCard = isClerkEnabled && !clerkSignedIn;
  const socialProfile = useMemo(() => deriveSocialProfileFromUser(user), [user]);

  const onGuestSignIn = useCallback(() => {
    forceAuthWall();
  }, [forceAuthWall]);

  const pct = Math.min(100, Math.round((user.xp / user.xpToNextTier) * 100));
  const highlights = useMemo(() => getActivityHighlights(socialProfile), [socialProfile]);

  const tierColors: Record<string, string> = {
    Starter: '#6B7280',
    Bronze: '#92400E',
    Silver: '#6B7280',
    Gold: '#B45309',
  };
  const tierColor = tierColors[user.tier] ?? colors.textSecondary;

  const goPullHistory = useCallback(() => {
    requireAuth(() => navigation.navigate('PullHistory'));
  }, [navigation, requireAuth]);

  const goPromotions = useCallback(() => {
    requireAuth(() => navigation.navigate('Promotions'));
  }, [navigation, requireAuth]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>{t('account.title')}</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('settings.title')}
        >
          <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {showGuestSignInCard ? (
        <VaultFramedCard style={styles.guestSignInCard}>
          <Text style={styles.guestSignInEyebrow}>{t('account.guestSignInEyebrow')}</Text>
          <Text style={styles.guestSignInTitle}>{t('account.guestSignInTitle')}</Text>
          <Text style={styles.guestSignInBody}>{t('account.guestSignInBody')}</Text>
          <TouchableOpacity
            style={styles.guestSignInBtn}
            onPress={onGuestSignIn}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={t('account.guestSignInCta')}
          >
            <Text style={styles.guestSignInBtnText}>{t('account.guestSignInCta')}</Text>
          </TouchableOpacity>
        </VaultFramedCard>
      ) : null}

      <VaultFramedCard style={styles.profileCard}>
        <View style={styles.profileHero}>
          <Text style={styles.profileAvatar}>{socialProfile.avatarEmoji}</Text>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName} numberOfLines={1}>
              {socialProfile.displayName}
            </Text>
            <Text style={styles.profileUsername} numberOfLines={1}>
              @{socialProfile.username}
            </Text>
            {socialProfile.status ? (
              <Text style={styles.profileStatus} numberOfLines={1}>
                {socialProfile.status}
              </Text>
            ) : null}
          </View>
        </View>
        <Text style={styles.profileBio} numberOfLines={3}>
          {socialProfile.bio}
        </Text>
        <View style={styles.profileStatsRow}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatVal}>{socialProfile.stats.packsOpened}</Text>
            <Text style={styles.profileStatLab}>Packs</Text>
          </View>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatVal}>{formatUsd(socialProfile.stats.totalEstimatedValue)}</Text>
            <Text style={styles.profileStatLab}>Value</Text>
          </View>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatVal}>{socialProfile.luckScore}</Text>
            <Text style={styles.profileStatLab}>Luck</Text>
          </View>
        </View>
        <Text style={styles.joined}>
          {t('social.joined', { date: new Date(socialProfile.joinDateIso).toLocaleDateString() })}
        </Text>
      </VaultFramedCard>

      {/* Tier + display name — primary profile block */}
      <VaultFramedCard style={styles.tierCard} contentStyle={styles.tierCardInner}>
        <Text style={styles.tierDisplayName} numberOfLines={2}>
          {user.displayName}
        </Text>
        <View style={styles.tierTop}>
          <View style={styles.tierTitleBlock}>
            <Text style={styles.tierEyebrow}>{t('rewards.tier')}</Text>
            <Text style={[styles.tierName, { color: tierColor }]}>{user.tier.toUpperCase()}</Text>
          </View>
          <View style={styles.tierBadge}>
            <Text style={styles.tierBadgeText}>🏆</Text>
          </View>
        </View>

        <View style={styles.xpRow}>
          <Text style={styles.xpText}>
            {user.xp.toLocaleString()} / {user.xpToNextTier.toLocaleString()} XP
          </Text>
          <Text style={styles.xpPct}>{pct}%</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%` as `${number}%`, backgroundColor: tierColor }]} />
        </View>

        <TouchableOpacity
          style={styles.viewBenefitsBtn}
          onPress={() => navigation.navigate('TierBenefits')}
          activeOpacity={0.75}
        >
          <Text style={styles.viewBenefitsText}>{t('rewards.viewBenefits')}</Text>
        </TouchableOpacity>
      </VaultFramedCard>

      <Text style={styles.section}>{t('account.sectionRewards')}</Text>
      <VaultFramedCard style={styles.rewardsCard} contentStyle={styles.rewardsCardInner}>
        <ListRow
          label={t('promotions.enterFromAccount')}
          icon={<Text>🎁</Text>}
          onPress={goPromotions}
        />
      </VaultFramedCard>

      <VaultFramedCard style={styles.statGridWrap}>
        <View style={styles.statGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statVal}>{socialProfile.stats.packsOpened}</Text>
          <Text style={styles.statLab}>{t('social.statPacks')}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statVal}>{formatUsd(socialProfile.stats.totalEstimatedValue)}</Text>
          <Text style={styles.statLab}>{t('social.statValue')}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statVal}>{socialProfile.stats.chaseHits}</Text>
          <Text style={styles.statLab}>{t('social.statChase')}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statVal}>{socialProfile.luckScore}</Text>
          <Text style={styles.statLab}>{t('social.statLuck')}</Text>
        </View>
        </View>
      </VaultFramedCard>

      <Text style={styles.section}>{t('social.bestPull')}</Text>
      <VaultFramedCard fill="felt" style={styles.bestCard}>
        <Text style={styles.bestName} numberOfLines={2}>
          {socialProfile.stats.bestPullCardName}
        </Text>
        <Text style={styles.bestVal}>{formatUsd(socialProfile.stats.bestPullValue)}</Text>
        <Text style={styles.bestSub}>{t('social.estimatedValue')}</Text>
      </VaultFramedCard>

      <Text style={styles.section}>{t('social.rarityMix')}</Text>
      <RarityBreakdownMini breakdown={socialProfile.stats.rarityBreakdown} />

      <Text style={styles.section}>{t('social.highlights')}</Text>
      <ActivityStrip items={highlights} />

      <Text style={styles.section}>{t('social.recentPulls')}</Text>
      {socialProfile.recentPulls.length === 0 ? (
        <Text style={styles.emptyPulls}>{t('social.noRecentPulls')}</Text>
      ) : (
        socialProfile.recentPulls.map((pull) => <SocialPullRow key={pull.id} pull={pull} />)
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnDark} onPress={goPullHistory} activeOpacity={0.88}>
          <Text style={styles.btnDarkText}>{t('account.pullHistoryCta')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.navigate('FriendsLeaderboard')}
          activeOpacity={0.88}
        >
          <Text style={styles.btnOutlineText}>{t('social.openLeaderboard')}</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: 120,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guestSignInCard: {
    marginBottom: spacing.base,
  },
  guestSignInEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.red,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  guestSignInTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  guestSignInBody: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  guestSignInBtn: {
    backgroundColor: colors.red,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  guestSignInBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  tierCard: {
    marginBottom: spacing.base,
  },
  tierCardInner: {
    paddingTop: spacing.xl + 2,
    paddingBottom: spacing.xl + 2,
  },
  profileCard: {
    marginBottom: spacing.base,
  },
  statGridWrap: {
    marginBottom: spacing.lg,
  },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    lineHeight: 48,
    textAlign: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.background,
    fontSize: 26,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileMeta: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  profileUsername: {
    marginTop: 2,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  profileStatus: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.red,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  profileBio: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  profileStatsRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  profileStat: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: 'rgba(2,6,23,0.24)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
  },
  profileStatVal: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  profileStatLab: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  joined: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  tierDisplayName: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: -0.8,
    marginBottom: spacing.lg,
    lineHeight: 40,
  },
  tierTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  tierTitleBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  tierEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  tierName: {
    fontSize: fontSize.hero - 2,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  tierBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierBadgeText: {
    fontSize: 28,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  xpText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  xpPct: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    marginBottom: spacing.base,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  viewBenefitsBtn: {
    alignSelf: 'flex-start',
  },
  viewBenefitsText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.red,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCell: {
    width: '47%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
  },
  statVal: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  statLab: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  section: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  rewardsCard: {
    marginBottom: spacing.lg,
  },
  rewardsCardInner: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
    paddingLeft: 11,
  },
  bestCard: {
    marginBottom: spacing.lg,
  },
  bestName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  bestVal: {
    fontSize: fontSize.hero - 4,
    fontWeight: fontWeight.black,
    color: colors.casinoGold,
  },
  bestSub: {
    marginTop: 4,
    fontSize: fontSize.xs,
    color: 'rgba(248,250,252,0.65)',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  btnDark: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.nearBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDarkText: {
    color: colors.white,
    fontWeight: fontWeight.black,
    fontSize: fontSize.md,
  },
  btnOutline: {
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  emptyPulls: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
