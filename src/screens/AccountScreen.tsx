import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../tokens/colors';
import { fontSize, brandFont } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { screenRoot, screenScroll } from '../tokens/layout';
import { useAppStore } from '../store/useAppStore';
import { useMembershipSimulationStore } from '../store/membershipSimulationStore';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { RootStackParamList, RootTabParamList } from '../navigation/types';
import { isClerkEnabled } from '../config/clerk';
import { useGuestBrowseStore } from '../store/guestBrowseStore';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { deriveSocialProfileFromUser } from '../data/socialMock';
import { formatUsd } from '../lib/socialFormat';
import { SocialPullRow } from '../components/social/SocialPullRow';
import { RarityBreakdownMini } from '../components/social/RarityBreakdownMini';
import { HomeBackground } from '../components/shared/HomeBackground';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';
import { CollectorQuestRow } from '../components/account/CollectorQuestRow';
import { progressionFromTotalXp } from '../lib/collectorProgression';
import { countClaimableQuests, pickPreviewQuests } from '../lib/collectorQuestPreview';

const PREVIEW_PULLS = 2;
const PREVIEW_QUESTS = 3;

type AccountNav = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Account'>,
  StackNavigationProp<RootStackParamList>
>;

export function AccountScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AccountNav>();
  const user = useAppStore((s) => s.user);
  const coinBalance = useAppStore((s) => s.user.credits);
  const questProgress = useAppStore((s) => s.collectorQuestProgress);
  const claimQuest = useAppStore((s) => s.claimCollectorQuest);
  const streak = useAppStore((s) => s.collectorStreakDays);
  const streakBest = useAppStore((s) => s.collectorStreakBest);
  const { refreshControl } = usePullToRefresh();
  const clerkSignedIn = useGuestBrowseStore((s) => s.clerkSignedIn);
  const forceAuthWall = useGuestBrowseStore((s) => s.forceAuthWall);
  const { requireAuth } = useRequireAuth();
  const simulatedMemberTier = useMembershipSimulationStore((s) => s.simulatedTier);

  const showGuestSignInCard = isClerkEnabled && !clerkSignedIn;
  const socialProfile = useMemo(() => deriveSocialProfileFromUser(user), [user]);
  const prog = progressionFromTotalXp(user.xp);
  const tierColors: Record<string, string> = {
    Starter: colors.accentDark,
    Bronze: colors.goldDark,
    Silver: colors.accentSapphire,
    Gold: colors.gold,
  };
  const tierColor = tierColors[user.tier] ?? colors.textSecondary;

  const previewQuests = useMemo(() => pickPreviewQuests(questProgress, PREVIEW_QUESTS), [questProgress]);
  const claimableCount = useMemo(() => countClaimableQuests(questProgress), [questProgress]);

  const onClaim = useCallback(
    (id: string) => {
      claimQuest(id);
    },
    [claimQuest],
  );

  const goPullHistory = useCallback(() => {
    requireAuth(() => navigation.navigate('PullHistory'));
  }, [navigation, requireAuth]);

  const goPromotions = useCallback(() => {
    requireAuth(() => navigation.navigate('Promotions'));
  }, [navigation, requireAuth]);

  const goLeaderboard = useCallback(() => {
    navigation.navigate('FriendsLeaderboard');
  }, [navigation]);

  const goVault = useCallback(() => {
    navigation.navigate('Vault');
  }, [navigation]);

  const goQuests = useCallback(() => {
    navigation.navigate('CollectorQuests');
  }, [navigation]);

  const goMembership = useCallback(() => {
    requireAuth(() => navigation.navigate('Membership'));
  }, [navigation, requireAuth]);

  const goTierBenefits = useCallback(() => {
    navigation.navigate('TierBenefits');
  }, [navigation]);

  const goSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const onGuestSignIn = useCallback(() => {
    forceAuthWall();
  }, [forceAuthWall]);

  const recentPulls = useMemo(
    () => socialProfile.recentPulls.slice(0, PREVIEW_PULLS),
    [socialProfile.recentPulls],
  );

  return (
    <View style={styles.screenRoot}>
      <HomeBackground />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
      <Text style={styles.pageTitle}>{t('account.title')}</Text>

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

      {/* 1 · Hero profile */}
      <VaultFramedCard style={styles.heroCard}>
        <View style={styles.heroTop}>
          <Text style={styles.heroAvatar}>{socialProfile.avatarEmoji}</Text>
          <View style={styles.heroMeta}>
            <Text style={styles.heroName} numberOfLines={1}>
              {socialProfile.displayName}
            </Text>
            <Text style={styles.heroUsername} numberOfLines={1}>
              @{socialProfile.username}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.membershipRow}
          onPress={goMembership}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={t('account.heroMembership')}
        >
          <View style={styles.membershipRowLeft}>
            <Ionicons name="ribbon-outline" size={20} color={colors.gold} />
            <View style={styles.membershipCopy}>
              <Text style={styles.membershipLabel}>{t('account.heroMembership')}</Text>
              <Text style={styles.membershipValue} numberOfLines={1}>
                {simulatedMemberTier
                  ? t(`membership.badge_${simulatedMemberTier}`)
                  : t('membership.navTitle')}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.levelLine}>
          {t('account.heroLevelLine', {
            level: prog.level,
            rank: t(`progression.rankBand_${prog.rankBand}`),
          })}
        </Text>

        <View style={styles.heroMetrics}>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricVal}>{coinBalance.toLocaleString()}</Text>
            <Text style={styles.heroMetricLab}>{t('account.heroCoins')}</Text>
          </View>
          <View style={styles.heroMetricDivider} />
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricVal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {formatUsd(socialProfile.stats.totalEstimatedValue)}
            </Text>
            <Text style={styles.heroMetricLab}>{t('account.heroVaultValue')}</Text>
          </View>
        </View>
      </VaultFramedCard>

      {/* 2 · Progression snapshot */}
      <Text style={styles.sectionEyebrow}>{t('account.sectionProgression')}</Text>
      <VaultFramedCard style={styles.blockCard} contentStyle={styles.blockInner}>
        <View style={styles.xpRow}>
          <Text style={styles.xpText}>
            {t('progression.xpIntoLevel', {
              current: prog.xpIntoLevel.toLocaleString(),
              next: prog.xpForNextLevel.toLocaleString(),
            })}
          </Text>
          <Text style={styles.xpPct}>{prog.pctInLevel}%</Text>
        </View>
        <View style={styles.barTrack}>
          <View
            style={[styles.barFill, { width: `${prog.pctInLevel}%` as `${number}%`, backgroundColor: tierColor }]}
          />
        </View>

        <View style={styles.streakInline}>
          <View>
            <Text style={styles.streakInlineVal}>{streak}</Text>
            <Text style={styles.streakInlineLab}>{t('progression.streakDaysLabel')}</Text>
          </View>
          <View style={styles.streakInlineRight}>
            <Text style={styles.streakInlineBestLab}>{t('progression.streakBest')}</Text>
            <Text style={styles.streakInlineBestVal}>{streakBest}</Text>
          </View>
        </View>

        {previewQuests.map((def, idx) => (
          <CollectorQuestRow
            key={def.id}
            def={def}
            row={questProgress[def.id]}
            onClaim={onClaim}
            compact
            isLast={idx === previewQuests.length - 1}
          />
        ))}

        {claimableCount > 0 ? (
          <TouchableOpacity style={styles.claimCta} onPress={goQuests} activeOpacity={0.88}>
            <Text style={styles.claimCtaText}>
              {t('account.claimRewardsCta', { count: claimableCount })}
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity onPress={goQuests} hitSlop={8} style={styles.viewAllQuestsBtn}>
          <Text style={styles.viewAllQuestsText}>{t('account.viewAllQuests')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goTierBenefits} hitSlop={8} style={styles.tierLink}>
          <Text style={styles.tierLinkText}>{t('account.viewTierBenefitsLink')}</Text>
        </TouchableOpacity>
      </VaultFramedCard>

      {/* 3 · Collection highlights */}
      <Text style={styles.sectionEyebrow}>{t('account.sectionCollection')}</Text>
      <VaultFramedCard style={styles.bestCard} contentStyle={styles.bestInner}>
        <Text style={styles.bestKicker}>{t('social.bestPull')}</Text>
        <Text style={styles.bestName} numberOfLines={2}>
          {socialProfile.stats.bestPullCardName}
        </Text>
        <Text style={styles.bestVal}>{formatUsd(socialProfile.stats.bestPullValue)}</Text>
        <Text style={styles.bestSub}>{t('social.estimatedValue')}</Text>
      </VaultFramedCard>

      <Text style={styles.subsection}>{t('social.recentPulls')}</Text>
      {recentPulls.length === 0 ? (
        <Text style={styles.emptyPulls}>{t('social.noRecentPulls')}</Text>
      ) : (
        recentPulls.map((pull) => <SocialPullRow key={pull.id} pull={pull} />)
      )}

      <VaultFramedCard style={styles.rarityCard} contentStyle={styles.rarityInner}>
        <Text style={styles.subsectionInCard}>{t('social.rarityMix')}</Text>
        <RarityBreakdownMini breakdown={socialProfile.stats.rarityBreakdown} />
      </VaultFramedCard>

      {/* 4 · Quick actions */}
      <Text style={styles.sectionEyebrow}>{t('account.sectionQuickActions')}</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickCell} onPress={goVault} activeOpacity={0.88}>
          <View style={styles.quickIconWrap}>
            <Ionicons name="file-tray-stacked-outline" size={22} color={colors.textPrimary} />
          </View>
          <Text style={styles.quickLabel}>{t('account.quickVault')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCell} onPress={goPullHistory} activeOpacity={0.88}>
          <View style={styles.quickIconWrap}>
            <Ionicons name="time-outline" size={22} color={colors.textPrimary} />
          </View>
          <Text style={styles.quickLabel}>{t('account.quickPullHistory')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCell} onPress={goLeaderboard} activeOpacity={0.88}>
          <View style={styles.quickIconWrap}>
            <Ionicons name="trophy-outline" size={22} color={colors.textPrimary} />
          </View>
          <Text style={styles.quickLabel}>{t('account.quickLeaderboard')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCell} onPress={goPromotions} activeOpacity={0.88}>
          <View style={styles.quickIconWrap}>
            <Ionicons name="gift-outline" size={22} color={colors.textPrimary} />
          </View>
          <Text style={styles.quickLabel}>{t('account.quickPromotions')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCell} onPress={goSettings} activeOpacity={0.88}>
          <View style={styles.quickIconWrap}>
            <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
          </View>
          <Text style={styles.quickLabel}>{t('account.quickSettings')}</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    ...screenRoot,
    backgroundColor: colors.homeGradientBottom,
  },
  container: {
    ...screenScroll,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: 120,
  },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.base,
  },
  guestSignInCard: {
    marginBottom: spacing.base,
  },
  guestSignInEyebrow: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: colors.red,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  guestSignInTitle: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  guestSignInBody: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.regular,
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
    fontFamily: brandFont.bold,
    color: colors.white,
  },
  heroCard: {
    marginBottom: spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroAvatar: {
    width: 56,
    height: 56,
    lineHeight: 54,
    textAlign: 'center',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.background,
    fontSize: 30,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroMeta: {
    flex: 1,
    minWidth: 0,
  },
  heroName: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
  },
  heroUsername: {
    marginTop: 2,
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.textMuted,
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  membershipRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  membershipCopy: {
    flex: 1,
    minWidth: 0,
  },
  membershipLabel: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  membershipValue: {
    marginTop: 2,
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
  },
  levelLine: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  heroMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroMetric: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  heroMetricDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.borderLight,
  },
  heroMetricVal: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    maxWidth: '100%',
  },
  heroMetricLab: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  sectionEyebrow: {
    fontSize: 10,
    fontFamily: brandFont.black,
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  blockCard: {
    marginBottom: spacing.lg,
  },
  blockInner: {
    padding: spacing.lg,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  xpText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: brandFont.medium,
    flex: 1,
    paddingRight: spacing.sm,
  },
  xpPct: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: brandFont.semibold,
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  streakInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  streakInlineVal: {
    fontSize: fontSize.xxl,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
  },
  streakInlineLab: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: brandFont.medium,
  },
  streakInlineRight: {
    alignItems: 'flex-end',
  },
  streakInlineBestLab: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  streakInlineBestVal: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    marginTop: 2,
  },
  claimCta: {
    marginTop: spacing.sm,
    backgroundColor: colors.nearBlack,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  claimCtaText: {
    color: colors.white,
    fontFamily: brandFont.bold,
    fontSize: fontSize.sm,
  },
  viewAllQuestsBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  viewAllQuestsText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.accentDark,
  },
  tierLink: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  tierLinkText: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.medium,
    color: colors.textMuted,
  },
  bestCard: {
    marginBottom: spacing.md,
  },
  bestInner: {
    padding: spacing.lg,
  },
  bestKicker: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  bestName: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  bestVal: {
    fontSize: fontSize.hero - 4,
    fontFamily: brandFont.black,
    color: colors.accent,
  },
  bestSub: {
    marginTop: 4,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  subsection: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  subsectionInCard: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyPulls: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  rarityCard: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  rarityInner: {
    padding: spacing.lg,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  quickCell: {
    width: '48%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
