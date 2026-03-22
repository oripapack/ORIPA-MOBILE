import React, { useMemo } from 'react';
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
import { getLocalizedPackTitle } from '../i18n/packCopy';
import { RootStackParamList, RootTabParamList } from '../navigation/types';
import { ClerkAccountSection } from '../components/account/ClerkAccountSection';

const shortcutIds = ['notif', 'hot', 'history', 'promos'] as const;
const shortcutIcons: Record<(typeof shortcutIds)[number], string> = {
  notif: '🔔',
  hot: '🔥',
  history: '📋',
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
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AccountNav>();
  const user = useAppStore((s) => s.user);
  const { refreshControl } = usePullToRefresh();

  const completedPulls = user.pullHistory.filter((p) => p.fulfillment !== 'pending');
  const pct = Math.min(100, Math.round((user.xp / user.xpToNextTier) * 100));

  const tierColors: Record<string, string> = {
    Starter: '#6B7280',
    Bronze: '#92400E',
    Silver: '#6B7280',
    Gold: '#B45309',
  };
  const tierColor = tierColors[user.tier] ?? colors.textSecondary;

  const shortcuts = useMemo(
    () => shortcutIds.map((id) => ({ id, icon: shortcutIcons[id], label: t(`shortcuts.${id}`) })),
    [t],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      <Text style={styles.pageTitle}>{t('account.title')}</Text>

      <ClerkAccountSection />

      {/* Tier card (from former Rewards tab) */}
      <View style={styles.tierCard}>
        <View style={styles.tierTop}>
          <View>
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
          <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: tierColor }]} />
        </View>

        <TouchableOpacity style={styles.viewBenefitsBtn}>
          <Text style={styles.viewBenefitsText}>{t('rewards.viewBenefits')}</Text>
        </TouchableOpacity>
      </View>

      {/* Member ID */}
      <View style={styles.memberCard}>
        <View style={styles.memberRow}>
          <View>
            <Text style={styles.memberLabel}>{t('account.memberId')}</Text>
            <Text style={styles.memberId}>{user.memberId}</Text>
          </View>
          {!user.isVerified && (
            <TouchableOpacity style={styles.verifyBtn}>
              <Text style={styles.verifyBtnText}>{t('account.verifyIdentity')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Shortcut grid */}
      <View style={styles.shortcutGrid}>
        {shortcuts.map((s) => (
          <TouchableOpacity key={s.id} style={styles.shortcutItem} activeOpacity={0.7}>
            <Text style={styles.shortcutIcon}>{s.icon}</Text>
            <Text style={styles.shortcutLabel}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pull History */}
      <Text style={styles.pullSectionTitle}>{t('rewards.pullHistory')}</Text>
      {completedPulls.map((pull) => (
        <View key={pull.id} style={styles.pullCard}>
          <View style={styles.pullLeft}>
            <Text style={styles.pullEmoji}>✨</Text>
            <View style={styles.pullTextCol}>
              <Text style={styles.pullResult} numberOfLines={2}>
                {pull.result}
              </Text>
              <Text style={styles.pullPack} numberOfLines={2} ellipsizeMode="tail">
                {getLocalizedPackTitle(pull.packId, pull.packTitle, t)}
              </Text>
            </View>
          </View>
          <View style={styles.pullRight}>
            <Text style={styles.pullCredits} numberOfLines={1}>
              {pull.fulfillment === 'shipped'
                ? t('rewards.shipped')
                : `+${pull.creditsWon.toLocaleString()}`}
            </Text>
            <Text style={styles.pullDate}>
              {pull.timestamp.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>
      ))}

      {completedPulls.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>{t('rewards.noPullsTitle')}</Text>
          <Text style={styles.emptyBody}>{t('rewards.noPullsBody')}</Text>
        </View>
      )}

      {/* Account section */}
      <Text style={styles.sectionHeader}>{t('account.sectionAccount')}</Text>
      <View style={styles.listGroup}>
        {accountRowKeys.map((key) => (
          <ListRow
            key={key}
            label={t(`accountRows.${key}`)}
            icon={<Text>{accountIcons[key]}</Text>}
          />
        ))}
      </View>

      {/* Support section */}
      <Text style={styles.sectionHeader}>{t('account.sectionSupport')}</Text>
      <View style={styles.listGroup}>
        {supportRowKeys.map((key) => (
          <ListRow key={key} label={t(`supportRows.${key}`)} icon={<Text>{supportIcons[key]}</Text>} />
        ))}
      </View>

      {/* Settings → stack screen */}
      <Text style={styles.sectionHeader}>{t('account.sectionMore')}</Text>
      <View style={styles.listGroup}>
        <ListRow
          label={t('settings.title')}
          icon={<Text>⚙️</Text>}
          onPress={() => navigation.navigate('Settings')}
        />
        <ListRow
          label={t('account.logout')}
          icon={<Text>🚪</Text>}
          destructive
          showChevron={false}
          onPress={() => {}}
        />
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
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  tierCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  tierTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  tierEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  tierName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  tierBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierBadgeText: {
    fontSize: 24,
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
  memberCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  memberLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  memberId: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  verifyBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  verifyBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.nearBlack,
  },
  shortcutGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  shortcutItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: spacing.base,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutIcon: {
    fontSize: 22,
  },
  shortcutLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pullSectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  pullCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pullLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
    /** Critical: clip long titles so they can’t draw over the status column (esp. “Shipped”). */
    overflow: 'hidden',
    paddingRight: spacing.xs,
  },
  pullTextCol: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  pullEmoji: {
    fontSize: 24,
    marginTop: 2,
  },
  pullResult: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    width: '100%',
  },
  pullPack: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    width: '100%',
  },
  /** Reserved lane: wide enough for “Shipped” / 発送済み etc. so status never overlaps titles. */
  pullRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
    flexGrow: 0,
    marginLeft: spacing.sm,
    minWidth: 124,
    paddingLeft: spacing.xs,
  },
  pullCredits: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.green,
    textAlign: 'right',
    width: '100%',
  },
  pullDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
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
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
