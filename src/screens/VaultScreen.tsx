import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CompositeNavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppHeader } from '../components/shared/AppHeader';
import { SgScreen } from '../components/ui';
import { GlobalSearchModal } from '../components/search/GlobalSearchModal';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';
import { VaultAssetSheet } from '../components/vault/VaultAssetSheet';
import { PortfolioCard } from '../components/vault/PortfolioCard';
import { useVaultPullsSorted } from '../lib/vaultPulls';
import { formatVaultTimeLeft, vaultExpiryNoticeActive, vaultMillisRemaining } from '../lib/vaultTime';
import { VAULT_HOLD_DAYS } from '../lib/vaultConstants';
import { formatVaultExchangeUsd } from '../lib/vaultExchange';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useGuestBrowseStore } from '../store/guestBrowseStore';
import { isClerkEnabled } from '../config/clerk';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList, RootTabParamList } from '../navigation/types';
import { getLocalizedPackTitle } from '../i18n/packCopy';
import { sgVault } from '../tokens/sgVault';
import { fontSize, brandFont } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import type { Pull, PullRarityTier } from '../data/mockUser';

type VaultNav = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Vault'>,
  StackNavigationProp<RootStackParamList>
>;

const TIER_ACCENT: Record<PullRarityTier, string> = {
  common: '#94A3B8',
  rare: '#60A5FA',
  epic: '#A855F7',
  legendary: '#FBBF24',
  mythic: '#FB7185',
};

const TIER_GLOW: Record<PullRarityTier, string> = {
  common: 'rgba(148, 163, 184, 0.08)',
  rare: 'rgba(96, 165, 250, 0.1)',
  epic: 'rgba(168, 85, 247, 0.12)',
  legendary: 'rgba(251, 191, 36, 0.14)',
  mythic: 'rgba(251, 113, 133, 0.14)',
};

function tierAccent(tier: PullRarityTier | undefined): string {
  if (!tier) return sgVault.muted;
  return TIER_ACCENT[tier];
}

function tierGlow(tier: PullRarityTier | undefined): string {
  if (!tier) return 'transparent';
  return TIER_GLOW[tier];
}

function coinsToUsdText(coins: number): string {
  const usd = coins / 100;
  if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
  if (usd >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(usd);
  }
  return `$${usd.toFixed(2)}`;
}

export function VaultScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<VaultNav>();
  const { refreshControl } = usePullToRefresh();
  const { requireAuth } = useRequireAuth();
  const clerkSignedIn = useGuestBrowseStore((s) => s.clerkSignedIn);
  const forceAuthWall = useGuestBrowseStore((s) => s.forceAuthWall);
  const openModal = useAppStore((s) => s.openModal);
  const requestVaultShipment = useAppStore((s) => s.requestVaultShipment);
  const convertVaultPullToCoins = useAppStore((s) => s.convertVaultPullToCoins);
  const processVaultExpiries = useAppStore((s) => s.processVaultExpiries);
  const pulls = useVaultPullsSorted();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sheetPull, setSheetPull] = useState<Pull | null>(null);

  useFocusEffect(
    useCallback(() => {
      processVaultExpiries();
    }, [processVaultExpiries]),
  );

  const showGuestGate = isClerkEnabled && !clerkSignedIn;

  const goPullHistory = useCallback(() => {
    requireAuth(() => navigation.navigate('PullHistory'));
  }, [navigation, requireAuth]);

  const goHome = useCallback(() => {
    navigation.navigate('Home' as never);
  }, [navigation]);

  const horizontalPad = spacing.base;
  const gap = spacing.sm;
  const tileWidth = useMemo(
    () => Math.max(140, (width - horizontalPad * 2 - gap) / 2),
    [width],
  );

  const onTilePress = useCallback(
    (pull: Pull) => {
      if (pull.fulfillment === 'pending') {
        openModal('wonPrizes');
        return;
      }
      if (pull.fulfillment === 'vaulted' || pull.fulfillment === 'shipped') {
        setSheetPull(pull);
      }
    },
    [openModal],
  );

  const ListHeader = useMemo(
    () => (
      <View style={styles.headerBlock}>
        <Text style={styles.pageEyebrow}>{t('vaultScreen.eyebrow')}</Text>
        <Text style={styles.pageTitle}>{t('vaultScreen.title')}</Text>

        {/* Portfolio summary card */}
        <PortfolioCard pulls={pulls} />

        <TouchableOpacity onPress={goPullHistory} accessibilityRole="button" style={styles.historyLinkWrap}>
          <Text style={styles.historyLink}>{t('vaultScreen.pullHistoryLink')}</Text>
        </TouchableOpacity>
      </View>
    ),
    [goPullHistory, pulls, t],
  );

  const EmptyState = useMemo(
    () => (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>{t('vaultScreen.emptyTitle')}</Text>
        <Text style={styles.emptyBody}>{t('vaultScreen.emptyBody')}</Text>
        <TouchableOpacity style={styles.emptyCta} onPress={goHome} activeOpacity={0.88} accessibilityRole="button">
          <Text style={styles.emptyCtaText}>Open a Pack →</Text>
        </TouchableOpacity>
      </View>
    ),
    [goHome, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: Pull }) => (
      <VaultTile pull={item} width={tileWidth} onPress={() => onTilePress(item)} />
    ),
    [tileWidth, onTilePress],
  );

  if (showGuestGate) {
    return (
      <SgScreen skin="vault">
        <AppHeader onSearch={() => setSearchOpen(true)} />
        <FlatList
          key="vault-guest-list"
          data={[]}
          keyExtractor={() => 'guest'}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              {ListHeader}
              <VaultFramedCard style={styles.guestCard} contentStyle={styles.guestInner}>
                <Text style={styles.guestTitle}>{t('vaultScreen.guestTitle')}</Text>
                <Text style={styles.guestBody}>{t('vaultScreen.guestBody')}</Text>
                <TouchableOpacity
                  style={styles.guestCta}
                  onPress={() => forceAuthWall()}
                  accessibilityRole="button"
                >
                  <Text style={styles.guestCtaText}>{t('vaultScreen.guestCta')}</Text>
                </TouchableOpacity>
              </VaultFramedCard>
            </>
          }
          contentContainerStyle={[
            styles.listContent,
            {
              paddingHorizontal: horizontalPad,
              paddingBottom: insets.bottom + spacing.xxxl,
            },
          ]}
          refreshControl={refreshControl}
        />
        <GlobalSearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
        <VaultAssetSheet
          visible={sheetPull != null}
          pull={sheetPull}
          onClose={() => setSheetPull(null)}
          onRequestShipment={requestVaultShipment}
          onConvertToCoins={convertVaultPullToCoins}
        />
      </SgScreen>
    );
  }

  return (
    <SgScreen skin="vault">
      <AppHeader onSearch={() => setSearchOpen(true)} />
      <FlatList
        key="vault-grid-list"
        data={pulls}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: horizontalPad,
            paddingBottom: insets.bottom + spacing.xxxl,
          },
        ]}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      />
      <GlobalSearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
      <VaultAssetSheet
        visible={sheetPull != null}
        pull={sheetPull}
        onClose={() => setSheetPull(null)}
        onRequestShipment={requestVaultShipment}
        onConvertToCoins={convertVaultPullToCoins}
      />
    </SgScreen>
  );
}

function VaultTile({
  pull,
  width,
  onPress,
}: {
  pull: Pull;
  width: number;
  onPress: () => void;
}) {
  const { t, i18n } = useTranslation();
  const accent = tierAccent(pull.tier);
  const glow = tierGlow(pull.tier);

  const isListed = (pull.vaultExchangeListUsd ?? 0) >= 1;
  const isVaulted = pull.fulfillment === 'vaulted';
  const urgent = isVaulted && vaultExpiryNoticeActive(pull);
  const timerMs = isVaulted ? vaultMillisRemaining(pull) : null;
  const timerLabel =
    timerMs != null && timerMs > 0 ? formatVaultTimeLeft(timerMs, t) : null;

  const pressable =
    pull.fulfillment === 'pending' ||
    pull.fulfillment === 'vaulted' ||
    pull.fulfillment === 'shipped';

  const statusKey =
    pull.fulfillment === 'pending'
      ? 'vaultScreen.statusPending'
      : pull.fulfillment === 'shipped'
        ? 'vaultScreen.statusShipped'
        : pull.fulfillment === 'vaulted'
          ? 'vaultScreen.statusVaulted'
          : 'vaultScreen.statusKept';

  const valueText = coinsToUsdText(pull.creditsWon);

  return (
    <TouchableOpacity
      activeOpacity={pressable ? 0.88 : 1}
      onPress={pressable ? onPress : undefined}
      disabled={!pressable}
      style={[styles.tileWrap, { width }]}
      accessibilityRole={pressable ? 'button' : 'text'}
      accessibilityLabel={`${pull.result}. ${t(statusKey)}`}
    >
      <VaultFramedCard
        style={[
          styles.tileCard,
          isVaulted && styles.tileCardVault,
          { backgroundColor: glow },
        ]}
        contentStyle={styles.tileInner}
      >
        {/* Tier accent dot */}
        <View style={[styles.tierDot, { backgroundColor: accent }]} />

        {/* Card name */}
        <Text style={styles.tileResult} numberOfLines={3}>
          {pull.result}
        </Text>

        {/* Pack name */}
        <Text style={styles.tilePack} numberOfLines={2}>
          {getLocalizedPackTitle(pull.packId, pull.packTitle, t)}
        </Text>

        {/* Date */}
        <Text style={styles.tileMeta}>
          {pull.timestamp.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
        </Text>

        {/* Timer */}
        {timerLabel ? (
          <Text style={[styles.tileTimer, urgent && styles.tileTimerUrgent]} numberOfLines={1}>
            {urgent ? t('vaultScreen.notifyBeforeConvert') : timerLabel}
          </Text>
        ) : null}

        {/* Value + Listed badge row */}
        <View style={styles.tileValueRow}>
          <Text style={[styles.tileValue, { color: accent }]}>{valueText}</Text>
          {isListed ? (
            <View style={styles.tileListedBadge}>
              <Text style={styles.tileListedBadgeText}>LISTED</Text>
            </View>
          ) : null}
        </View>

        {/* Status */}
        <Text
          style={[
            styles.tileStatus,
            pull.fulfillment === 'pending' && styles.tileStatusPending,
            urgent && styles.tileStatusUrgent,
          ]}
        >
          {t(statusKey)}
        </Text>
      </VaultFramedCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingTop: spacing.sm, flexGrow: 1 },
  headerBlock: { marginBottom: spacing.md },
  pageEyebrow: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: sgVault.gold,
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
  },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontFamily: brandFont.black,
    color: sgVault.text,
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  historyLinkWrap: {
    marginTop: spacing.xs,
  },
  historyLink: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: sgVault.gold,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  tileWrap: {},
  tileCard: { minHeight: 168 },
  tileCardVault: {
    borderColor: 'rgba(212,175,55,0.38)',
  },
  tileInner: {
    padding: spacing.md,
    minHeight: 168,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  tileResult: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: sgVault.text,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  tilePack: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.medium,
    color: sgVault.muted,
    lineHeight: 18,
    flex: 1,
  },
  tileMeta: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.regular,
    color: sgVault.muted,
    marginTop: spacing.sm,
  },
  tileTimer: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: sgVault.muted,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  tileTimerUrgent: {
    color: sgVault.gold,
  },
  tileValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tileValue: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.black,
    letterSpacing: -0.2,
  },
  tileListedBadge: {
    backgroundColor: 'rgba(61,220,151,0.12)',
    borderRadius: radius.sm,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(61,220,151,0.35)',
  },
  tileListedBadgeText: {
    fontSize: 8,
    fontFamily: brandFont.black,
    color: sgVault.up,
    letterSpacing: 0.5,
  },
  tileStatus: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.semibold,
    color: sgVault.muted,
    marginTop: 2,
  },
  tileStatusPending: {
    color: sgVault.gold,
  },
  tileStatusUrgent: {
    color: sgVault.gold,
  },
  // Empty state
  emptyWrap: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    backgroundColor: sgVault.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: sgVault.line,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontFamily: brandFont.bold,
    color: sgVault.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
    color: sgVault.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  emptyCta: {
    backgroundColor: sgVault.gold,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
  },
  emptyCtaText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: sgVault.onGold,
    letterSpacing: 0.3,
  },
  // Guest gate
  guestCard: { marginTop: spacing.md },
  guestInner: { padding: spacing.xl },
  guestTitle: {
    fontSize: fontSize.md,
    fontFamily: brandFont.black,
    color: sgVault.text,
    marginBottom: spacing.sm,
  },
  guestBody: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
    color: sgVault.muted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  guestCta: {
    alignSelf: 'flex-start',
    backgroundColor: sgVault.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  guestCtaText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: sgVault.text,
  },
});
