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
import type { Pull } from '../data/mockUser';

type VaultNav = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Vault'>,
  StackNavigationProp<RootStackParamList>
>;

function pointsText(points: number): string {
  return `${points.toLocaleString('en-US')} pts`;
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

  const horizontalPad = sgVault.space.md;
  const gap = sgVault.space.sm;
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
              paddingBottom: insets.bottom + sgVault.space.xxl,
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
            paddingBottom: insets.bottom + sgVault.space.xxl,
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

  const valueText = pointsText(pull.creditsWon);

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
        ]}
        contentStyle={styles.tileInner}
      >
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
          <Text style={styles.tileValue}>{valueText}</Text>
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
  listContent: { paddingTop: sgVault.space.sm, flexGrow: 1 },
  headerBlock: { marginBottom: sgVault.space.md },
  pageEyebrow: {
    fontSize: sgVault.type.xs,
    fontFamily: sgVault.font.bodyBold,
    color: sgVault.gold,
    letterSpacing: 1.4,
    marginBottom: sgVault.space.xs,
  },
  pageTitle: {
    fontSize: 30,
    fontFamily: sgVault.font.display,
    color: sgVault.text,
    letterSpacing: -0.5,
    marginBottom: sgVault.space.md,
  },
  historyLinkWrap: {
    marginTop: sgVault.space.xs,
  },
  historyLink: {
    fontSize: sgVault.type.sm,
    fontFamily: sgVault.font.bodyMedium,
    color: sgVault.gold,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: sgVault.space.sm,
    gap: sgVault.space.sm,
  },
  tileWrap: {},
  tileCard: { minHeight: 168 },
  tileCardVault: {
    borderColor: sgVault.accentLine,
  },
  tileInner: {
    padding: sgVault.space.md,
    minHeight: 168,
  },
  tileResult: {
    fontSize: sgVault.type.sm,
    fontFamily: sgVault.font.bodyBold,
    color: sgVault.text,
    lineHeight: 20,
    marginBottom: sgVault.space.xs,
  },
  tilePack: {
    fontSize: sgVault.type.xs,
    fontFamily: sgVault.font.bodyMedium,
    color: sgVault.muted,
    lineHeight: 18,
    flex: 1,
  },
  tileMeta: {
    fontSize: sgVault.type.xs,
    fontFamily: sgVault.font.data,
    color: sgVault.muted,
    marginTop: sgVault.space.sm,
    fontVariant: [...sgVault.numeric],
  },
  tileTimer: {
    fontSize: 10,
    fontFamily: sgVault.font.bodyBold,
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
    gap: sgVault.space.xs,
    marginTop: sgVault.space.sm,
  },
  tileValue: {
    fontSize: sgVault.type.sm,
    fontFamily: sgVault.font.dataBold,
    letterSpacing: -0.2,
    fontVariant: [...sgVault.numeric],
    color: sgVault.text,
  },
  tileListedBadge: {
    backgroundColor: sgVault.successWash,
    borderRadius: sgVault.radius.tag,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: sgVault.successLine,
  },
  tileListedBadgeText: {
    fontSize: 8,
    fontFamily: sgVault.font.bodyBold,
    color: sgVault.up,
    letterSpacing: 0.5,
  },
  tileStatus: {
    fontSize: sgVault.type.xs,
    fontFamily: sgVault.font.bodyMedium,
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
    marginTop: sgVault.space.lg,
    alignItems: 'center',
    paddingHorizontal: sgVault.space.lg,
    paddingVertical: sgVault.space.lg,
    backgroundColor: sgVault.surface,
    borderRadius: sgVault.radius.panel,
    borderWidth: 1,
    borderColor: sgVault.line,
  },
  emptyTitle: {
    fontSize: sgVault.type.md,
    fontFamily: sgVault.font.bodyBold,
    color: sgVault.text,
    marginBottom: sgVault.space.sm,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: sgVault.type.sm,
    fontFamily: sgVault.font.bodyMedium,
    color: sgVault.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: sgVault.space.lg,
  },
  emptyCta: {
    backgroundColor: sgVault.gold,
    paddingVertical: sgVault.space.md,
    paddingHorizontal: sgVault.space.lg,
    borderRadius: sgVault.radius.panel,
  },
  emptyCtaText: {
    fontSize: sgVault.type.sm,
    fontFamily: sgVault.font.bodyBold,
    color: sgVault.onGold,
    letterSpacing: 0.3,
  },
  // Guest gate
  guestCard: { marginTop: sgVault.space.md },
  guestInner: { padding: sgVault.space.lg },
  guestTitle: {
    fontSize: sgVault.type.md,
    fontFamily: sgVault.font.bodyBold,
    color: sgVault.text,
    marginBottom: sgVault.space.sm,
  },
  guestBody: {
    fontSize: sgVault.type.sm,
    fontFamily: sgVault.font.bodyMedium,
    color: sgVault.muted,
    lineHeight: 22,
    marginBottom: sgVault.space.lg,
  },
  guestCta: {
    alignSelf: 'flex-start',
    backgroundColor: sgVault.gold,
    paddingVertical: sgVault.space.md,
    paddingHorizontal: sgVault.space.lg,
    borderRadius: sgVault.radius.panel,
  },
  guestCtaText: {
    fontSize: sgVault.type.sm,
    fontFamily: sgVault.font.bodyBold,
    color: sgVault.onGold,
  },
});
