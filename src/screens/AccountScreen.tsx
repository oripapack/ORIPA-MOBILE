import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { ListRow } from '../components/shared/ListRow';
import { useAppStore } from '../store/useAppStore';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { RootStackParamList, RootTabParamList } from '../navigation/types';
import { ClerkAccountSection } from '../components/account/ClerkAccountSection';
import { isClerkEnabled } from '../config/clerk';
import { useGuestBrowseStore } from '../store/guestBrowseStore';
import { AccountSignOutFooter } from '../components/account/AccountSignOutFooter';
import { PullHistoryRow, useCompletedPullsSorted } from '../components/account/PullHistoryRow';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { openExternalUrl } from '../utils/openExternalUrl';
import { SUPPORT_EMAIL } from '../config/app';

/** Secondary quick links — pull history is the primary chip above (full list lives on PullHistory). */
const secondaryShortcutIds = ['notif', 'hot', 'promos'] as const;
const secondaryShortcutIcons: Record<(typeof secondaryShortcutIds)[number], string> = {
  notif: '🔔',
  hot: '🔥',
  promos: '🎟️',
};

const accountRowKeys = ['shipping', 'payout', 'identity', 'linked'] as const;
const accountIcons: Record<(typeof accountRowKeys)[number], string> = {
  shipping: '📦',
  payout: '🏦',
  identity: '🪪',
  linked: '🔗',
};

const supportRowKeys = ['help', 'contact', 'faq'] as const;
const supportIcons: Record<(typeof supportRowKeys)[number], string> = {
  help: '❓',
  contact: '💬',
  faq: '📖',
};

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

  const onGuestSignIn = useCallback(() => {
    forceAuthWall();
  }, [forceAuthWall]);

  const completedSorted = useCompletedPullsSorted();
  const latestWins = useMemo(() => completedSorted.slice(0, 3), [completedSorted]);
  const pct = Math.min(100, Math.round((user.xp / user.xpToNextTier) * 100));

  const tierColors: Record<string, string> = {
    Starter: '#6B7280',
    Bronze: '#92400E',
    Silver: '#6B7280',
    Gold: '#B45309',
  };
  const tierColor = tierColors[user.tier] ?? colors.textSecondary;

  const secondaryShortcuts = useMemo(
    () =>
      secondaryShortcutIds.map((id) => ({
        id,
        icon: secondaryShortcutIcons[id],
        label: t(`shortcuts.${id}`),
      })),
    [t],
  );

  const goPullHistory = useCallback(() => {
    requireAuth(() => navigation.navigate('PullHistory'));
  }, [navigation, requireAuth]);

  const onSecondaryShortcut = useCallback(
    (id: (typeof secondaryShortcutIds)[number]) => {
      requireAuth(() => {
        if (id === 'notif') navigation.navigate('Notifications');
        if (id === 'hot') navigation.navigate('HotDropsInfo');
        if (id === 'promos') navigation.navigate('PromosInfo');
      });
    },
    [navigation, requireAuth],
  );

  const onAccountRow = useCallback(
    (key: (typeof accountRowKeys)[number]) => {
      requireAuth(() => {
        if (key === 'shipping') navigation.navigate('ShippingAddress');
        if (key === 'payout') navigation.navigate('PayoutMethod');
        if (key === 'identity') navigation.navigate('IdentityVerification');
        if (key === 'linked') navigation.navigate('LinkedAccounts');
      });
    },
    [navigation, requireAuth],
  );

  const onSupportRow = useCallback(
    (key: (typeof supportRowKeys)[number]) => {
      if (key === 'help' || key === 'faq') {
        navigation.navigate('HelpCenter');
        return;
      }
      void openExternalUrl(`mailto:${SUPPORT_EMAIL}`, t('supportRows.contact'));
    },
    [navigation, t],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      <Text style={styles.pageTitle}>{t('account.title')}</Text>

      {showGuestSignInCard ? (
        <View style={styles.guestSignInCard}>
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
        </View>
      ) : null}

      {/* Tier + display name — primary profile block */}
      <View style={styles.tierCard}>
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
      </View>

      <ClerkAccountSection />

      {!user.isVerified ? (
        <TouchableOpacity
          style={styles.verifyIdentityCard}
          onPress={() => requireAuth(() => navigation.navigate('IdentityVerification'))}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('account.verifyIdentity')}
        >
          <View style={styles.verifyIdentityRow}>
            <Text style={styles.verifyIdentityText}>{t('account.verifyIdentity')}</Text>
            <Text style={styles.verifyIdentityChevron}>›</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* Player desk: full history is primary; everything else is secondary */}
      <View style={styles.casinoStrip}>
        <Text style={styles.casinoEyebrow}>{t('account.playerDeskEyebrow')}</Text>
        <TouchableOpacity
          style={styles.pullHistoryPrimary}
          onPress={goPullHistory}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel={t('account.pullHistoryCta')}
        >
          <Text style={styles.pullHistoryPrimaryEmoji}>🎰</Text>
          <View style={styles.pullHistoryPrimaryCopy}>
            <Text style={styles.pullHistoryPrimaryTitle}>{t('account.pullHistoryCta')}</Text>
            <Text style={styles.pullHistoryPrimarySub}>{t('account.pullHistorySub')}</Text>
          </View>
          <Text style={styles.pullHistoryChevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.casinoDivider} />

        <View style={styles.secondaryRow}>
          {secondaryShortcuts.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.secondaryItem}
              activeOpacity={0.75}
              onPress={() => onSecondaryShortcut(s.id)}
            >
              <Text style={styles.secondaryIcon}>{s.icon}</Text>
              <Text style={styles.secondaryLabel} numberOfLines={2}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Latest wins preview — full log is PullHistory */}
      <Text style={styles.pullSectionTitle}>{t('rewards.latestWins')}</Text>
      {latestWins.map((pull) => (
        <PullHistoryRow key={pull.id} pull={pull} />
      ))}

      {latestWins.length > 0 ? (
        <TouchableOpacity
          style={styles.viewHistoryBtn}
          onPress={goPullHistory}
          activeOpacity={0.85}
        >
          <Text style={styles.viewHistoryText}>{t('rewards.viewFullHistory')}</Text>
        </TouchableOpacity>
      ) : null}

      {latestWins.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎲</Text>
          <Text style={styles.emptyTitle}>{t('rewards.noPullsTitle')}</Text>
          <Text style={styles.emptyBody}>{t('rewards.noPullsBody')}</Text>
        </View>
      )}

      <Text style={styles.sectionHeader}>{t('account.sectionAccount')}</Text>
      <View style={styles.listGroup}>
        {accountRowKeys.map((key) => (
          <ListRow
            key={key}
            label={t(`accountRows.${key}`)}
            icon={<Text>{accountIcons[key]}</Text>}
            onPress={() => onAccountRow(key)}
          />
        ))}
      </View>

      <Text style={styles.sectionHeader}>{t('account.sectionSupport')}</Text>
      <View style={styles.listGroup}>
        {supportRowKeys.map((key) => (
          <ListRow
            key={key}
            label={t(`supportRows.${key}`)}
            icon={<Text>{supportIcons[key]}</Text>}
            onPress={() => onSupportRow(key)}
          />
        ))}
      </View>

      <Text style={styles.sectionHeader}>{t('account.sectionMore')}</Text>
      <View style={styles.listGroup}>
        <ListRow
          label={t('settings.title')}
          icon={<Text>⚙️</Text>}
          onPress={() => navigation.navigate('Settings')}
        />
      </View>

      <AccountSignOutFooter visible={isClerkEnabled && clerkSignedIn} />
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
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.base,
    letterSpacing: -0.5,
  },
  guestSignInCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
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
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.xl + 4,
    marginBottom: spacing.base,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
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
  verifyIdentityCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  verifyIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  verifyIdentityText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  verifyIdentityChevron: {
    fontSize: 22,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
  },
  casinoStrip: {
    backgroundColor: colors.casinoFelt,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.casinoFeltBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  casinoEyebrow: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.casinoGold,
    letterSpacing: 2,
    marginBottom: spacing.md,
    opacity: 0.9,
  },
  pullHistoryPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(240, 193, 76, 0.45)',
  },
  pullHistoryPrimaryEmoji: {
    fontSize: 28,
  },
  pullHistoryPrimaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  pullHistoryPrimaryTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.white,
    letterSpacing: 0.3,
  },
  pullHistoryPrimarySub: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: 'rgba(248,250,252,0.55)',
    marginTop: 2,
    lineHeight: 16,
  },
  pullHistoryChevron: {
    fontSize: 28,
    fontWeight: fontWeight.regular,
    color: colors.casinoGold,
    marginTop: -2,
  },
  casinoDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: spacing.md,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 72,
  },
  secondaryIcon: {
    fontSize: 22,
  },
  secondaryLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: 'rgba(248,250,252,0.88)',
    textAlign: 'center',
    lineHeight: 13,
  },
  pullSectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    letterSpacing: -0.2,
  },
  viewHistoryBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  viewHistoryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.red,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.base,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.base,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  listGroup: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
