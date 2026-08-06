import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { sg } from '../tokens/sg';
import { screenScroll } from '../tokens/layout';
import { useAppStore } from '../store/useAppStore';
import { useMembershipSimulationStore } from '../store/membershipSimulationStore';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { RootStackParamList, RootTabParamList } from '../navigation/types';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { AccountAuthCard } from '../components/account/AccountAuthCard';
import { deriveSocialProfileFromUser } from '../data/socialMock';
import { formatPoints } from '../lib/socialFormat';
import { SocialPullRow } from '../components/social/SocialPullRow';
import { SgScreen } from '../components/ui';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';
import { CollectorQuestRow } from '../components/account/CollectorQuestRow';
import { progressionFromTotalXp } from '../lib/collectorProgression';
import { countClaimableQuests, pickPreviewQuests } from '../lib/collectorQuestPreview';
import { AppHeader } from '../components/shared/AppHeader';
import { GlobalSearchModal } from '../components/search/GlobalSearchModal';

const PREVIEW_PULLS = 2;
const PREVIEW_QUESTS = 3;

type AccountNav = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Account'>,
  StackNavigationProp<RootStackParamList>
>;

export function AccountScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<AccountNav>();
  const user = useAppStore((s) => s.user);
  const coinBalance = useAppStore((s) => s.user.credits);
  const questProgress = useAppStore((s) => s.collectorQuestProgress);
  const claimQuest = useAppStore((s) => s.claimCollectorQuest);
  const streak = useAppStore((s) => s.collectorStreakDays);
  const streakBest = useAppStore((s) => s.collectorStreakBest);
  const { refreshControl } = usePullToRefresh();
  const { requireAuth } = useRequireAuth();
  const simulatedMemberTier = useMembershipSimulationStore((s) => s.simulatedTier);
  const [searchOpen, setSearchOpen] = useState(false);

  const socialProfile = useMemo(() => deriveSocialProfileFromUser(user), [user]);
  const prog = progressionFromTotalXp(user.xp);
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

  const recentPulls = useMemo(
    () => socialProfile.recentPulls.slice(0, PREVIEW_PULLS),
    [socialProfile.recentPulls],
  );

  return (
    <SgScreen>
      <AppHeader onSearch={() => setSearchOpen(true)} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
      <Text style={styles.pageTitle}>{t('account.title')}</Text>

      <AccountAuthCard />

      {/* 1 · Hero profile */}
      <VaultFramedCard style={styles.heroCard}>
        <View style={styles.heroTop}>
          <Text style={styles.heroAvatar}>
            {socialProfile.displayName.slice(0, 1).toUpperCase()}
          </Text>
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
            <Ionicons name="ribbon-outline" size={20} color={sg.gold} />
            <View style={styles.membershipCopy}>
              <Text style={styles.membershipLabel}>{t('account.heroMembership')}</Text>
              <Text style={styles.membershipValue} numberOfLines={1}>
                {simulatedMemberTier
                  ? t(`membership.badge_${simulatedMemberTier}`)
                  : t('membership.navTitle')}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={sg.muted} />
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
              {formatPoints(socialProfile.stats.totalEstimatedValue)}
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
            style={[styles.barFill, { width: `${prog.pctInLevel}%` as `${number}%` }]}
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
        <Text style={styles.bestVal}>{formatPoints(socialProfile.stats.bestPullValue)}</Text>
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
        <Text style={styles.tierPending}>{t('social.tierDataPending')}</Text>
      </VaultFramedCard>

      {/* 4 · Quick actions */}
      <Text style={styles.sectionEyebrow}>{t('account.sectionQuickActions')}</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickCell} onPress={goVault} activeOpacity={0.88}>
          <View style={styles.quickIconWrap}>
            <Ionicons name="file-tray-stacked-outline" size={22} color={sg.text} />
          </View>
          <Text style={styles.quickLabel}>{t('account.quickVault')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCell} onPress={goPullHistory} activeOpacity={0.88}>
          <View style={styles.quickIconWrap}>
            <Ionicons name="time-outline" size={22} color={sg.text} />
          </View>
          <Text style={styles.quickLabel}>{t('account.quickPullHistory')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCell} onPress={goLeaderboard} activeOpacity={0.88}>
          <View style={styles.quickIconWrap}>
            <Ionicons name="trophy-outline" size={22} color={sg.text} />
          </View>
          <Text style={styles.quickLabel}>{t('account.quickLeaderboard')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCell} onPress={goPromotions} activeOpacity={0.88}>
          <View style={styles.quickIconWrap}>
            <Ionicons name="gift-outline" size={22} color={sg.text} />
          </View>
          <Text style={styles.quickLabel}>{t('account.quickPromotions')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCell} onPress={goSettings} activeOpacity={0.88}>
          <View style={styles.quickIconWrap}>
            <Ionicons name="settings-outline" size={22} color={sg.text} />
          </View>
          <Text style={styles.quickLabel}>{t('account.quickSettings')}</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      <GlobalSearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    ...screenScroll,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.md,
    paddingBottom: 120,
  },
  pageTitle: {
    fontSize: 30,
    fontFamily: sg.font.display,
    color: sg.text,
    letterSpacing: -0.5,
    marginBottom: sg.space.md,
  },
  guestSignInCard: {
    marginBottom: sg.space.md,
  },
  guestSignInEyebrow: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.error,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: sg.space.xs,
  },
  guestSignInTitle: {
    fontSize: sg.type.lg,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    marginBottom: sg.space.sm,
  },
  guestSignInBody: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: sg.space.md,
  },
  guestSignInBtn: {
    backgroundColor: sg.error,
    borderRadius: sg.radius.panel,
    paddingVertical: sg.space.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  guestSignInBtnText: {
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  heroCard: {
    marginBottom: sg.space.lg,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
    marginBottom: sg.space.md,
  },
  heroAvatar: {
    width: 56,
    height: 56,
    lineHeight: 54,
    textAlign: 'center',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: sg.bg,
    fontSize: 20,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    borderWidth: 1,
    borderColor: sg.line,
  },
  heroMeta: {
    flex: 1,
    minWidth: 0,
  },
  heroName: {
    fontSize: sg.type.lg,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  heroUsername: {
    marginTop: 2,
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: sg.space.sm,
    paddingHorizontal: sg.space.sm,
    marginBottom: sg.space.sm,
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
  },
  membershipRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
    flex: 1,
    minWidth: 0,
  },
  membershipCopy: {
    flex: 1,
    minWidth: 0,
  },
  membershipLabel: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  membershipValue: {
    marginTop: 2,
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  levelLine: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    marginBottom: sg.space.md,
  },
  heroMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: sg.radius.panel,
    overflow: 'hidden',
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  heroMetric: {
    flex: 1,
    paddingVertical: sg.space.md,
    paddingHorizontal: sg.space.sm,
    alignItems: 'center',
  },
  heroMetricDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: sg.line,
  },
  heroMetricVal: {
    fontSize: sg.type.lg,
    fontFamily: sg.font.dataBold,
    color: sg.text,
    maxWidth: '100%',
    fontVariant: [...sg.numeric],
  },
  heroMetricLab: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  sectionEyebrow: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: sg.space.md,
    marginTop: sg.space.xs,
  },
  blockCard: {
    marginBottom: sg.space.lg,
  },
  blockInner: {
    padding: sg.space.lg,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sg.space.xs,
  },
  xpText: {
    fontSize: sg.type.sm,
    color: sg.muted,
    fontFamily: sg.font.bodyMedium,
    flex: 1,
    paddingRight: sg.space.sm,
  },
  xpPct: {
    fontSize: sg.type.sm,
    color: sg.muted,
    fontFamily: sg.font.dataBold,
    fontVariant: [...sg.numeric],
  },
  barTrack: {
    height: 8,
    backgroundColor: sg.line,
    borderRadius: sg.radius.tag,
    marginBottom: sg.space.md,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: sg.radius.tag,
    backgroundColor: sg.muted,
  },
  streakInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sg.space.md,
    paddingBottom: sg.space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: sg.line,
  },
  streakInlineVal: {
    fontSize: sg.type.xxl,
    fontFamily: sg.font.dataBold,
    color: sg.text,
    fontVariant: [...sg.numeric],
  },
  streakInlineLab: {
    fontSize: sg.type.xs,
    color: sg.muted,
    marginTop: 2,
    fontFamily: sg.font.bodyMedium,
  },
  streakInlineRight: {
    alignItems: 'flex-end',
  },
  streakInlineBestLab: {
    fontSize: sg.type.xs,
    color: sg.muted,
  },
  streakInlineBestVal: {
    fontSize: sg.type.lg,
    fontFamily: sg.font.dataBold,
    color: sg.text,
    marginTop: 2,
    fontVariant: [...sg.numeric],
  },
  claimCta: {
    marginTop: sg.space.sm,
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.panel,
    paddingVertical: sg.space.md,
    alignItems: 'center',
  },
  claimCtaText: {
    color: sg.text,
    fontFamily: sg.font.bodyBold,
    fontSize: sg.type.sm,
  },
  viewAllQuestsBtn: {
    marginTop: sg.space.md,
    alignItems: 'center',
  },
  viewAllQuestsText: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.gold,
  },
  tierLink: {
    marginTop: sg.space.sm,
    alignItems: 'center',
  },
  tierLinkText: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
  bestCard: {
    marginBottom: sg.space.md,
  },
  bestInner: {
    padding: sg.space.lg,
  },
  bestKicker: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: sg.space.xs,
  },
  bestName: {
    fontSize: sg.type.lg,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    marginBottom: sg.space.sm,
  },
  bestVal: {
    fontSize: sg.type.hero - 4,
    fontFamily: sg.font.dataBold,
    color: sg.gold,
    fontVariant: [...sg.numeric],
  },
  bestSub: {
    marginTop: 4,
    fontSize: sg.type.xs,
    color: sg.muted,
  },
  subsection: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    marginBottom: sg.space.sm,
    marginTop: sg.space.xs,
  },
  subsectionInCard: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    marginBottom: sg.space.sm,
  },
  emptyPulls: {
    fontSize: sg.type.sm,
    color: sg.muted,
    marginBottom: sg.space.md,
  },
  rarityCard: {
    marginTop: sg.space.md,
    marginBottom: sg.space.lg,
  },
  rarityInner: {
    padding: sg.space.lg,
  },
  tierPending: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 20,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: sg.space.sm,
    marginBottom: sg.space.lg,
  },
  quickCell: {
    width: '48%',
    backgroundColor: sg.surface,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    paddingVertical: sg.space.md,
    paddingHorizontal: sg.space.sm,
    alignItems: 'center',
    gap: sg.space.sm,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: sg.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    textAlign: 'center',
  },
});
