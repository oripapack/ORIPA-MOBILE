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
import { HomeBackground } from '../components/shared/HomeBackground';
import { AppHeader } from '../components/shared/AppHeader';
import { GlobalSearchModal } from '../components/search/GlobalSearchModal';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';
import { VaultAssetSheet } from '../components/vault/VaultAssetSheet';
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
import { colors } from '../tokens/colors';
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

function tierAccent(tier: PullRarityTier | undefined): string {
  if (!tier) return colors.textMuted;
  return TIER_ACCENT[tier];
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
        <Text style={styles.lead}>{t('vaultScreen.lead')}</Text>
        <VaultFramedCard style={styles.benefitsCard} contentStyle={styles.benefitsInner}>
          <Text style={styles.benefitsTitle}>{t('vaultScreen.benefitsTitle')}</Text>
          <Text style={styles.benefitLine}>{t('vaultScreen.benefit1')}</Text>
          <Text style={styles.benefitLine}>{t('vaultScreen.benefit2')}</Text>
          <Text style={styles.benefitLine}>{t('vaultScreen.benefit3')}</Text>
          <Text style={styles.benefitLine}>{t('vaultScreen.benefit4')}</Text>
          <Text style={styles.benefitLine}>{t('vaultScreen.benefit5')}</Text>
          <Text style={styles.benefitFine}>{t('vaultScreen.benefitFine', { days: VAULT_HOLD_DAYS })}</Text>
        </VaultFramedCard>
        <TouchableOpacity onPress={goPullHistory} accessibilityRole="button">
          <Text style={styles.historyLink}>{t('vaultScreen.pullHistoryLink')}</Text>
        </TouchableOpacity>
      </View>
    ),
    [goPullHistory, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: Pull }) => (
      <VaultTile pull={item} width={tileWidth} onPress={() => onTilePress(item)} />
    ),
    [tileWidth, onTilePress],
  );

  if (showGuestGate) {
    return (
      <View style={styles.container}>
        <HomeBackground />
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HomeBackground />
      <AppHeader onSearch={() => setSearchOpen(true)} />
      <FlatList
        key="vault-grid-list"
        data={pulls}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <VaultFramedCard style={styles.emptyCard} contentStyle={styles.emptyInner}>
            <Text style={styles.emptyTitle}>{t('vaultScreen.emptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('vaultScreen.emptyBody')}</Text>
          </VaultFramedCard>
        }
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
    </View>
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
  const statusKey =
    pull.fulfillment === 'pending'
      ? 'vaultScreen.statusPending'
      : pull.fulfillment === 'shipped'
        ? 'vaultScreen.statusShipped'
        : pull.fulfillment === 'vaulted'
          ? 'vaultScreen.statusVaulted'
          : 'vaultScreen.statusKept';

  const isVaulted = pull.fulfillment === 'vaulted';
  const urgent = isVaulted && vaultExpiryNoticeActive(pull);
  const timerMs = isVaulted ? vaultMillisRemaining(pull) : null;
  const timerLabel =
    timerMs != null && timerMs > 0 ? formatVaultTimeLeft(timerMs, t) : null;

  const pressable = pull.fulfillment === 'pending' || pull.fulfillment === 'vaulted' || pull.fulfillment === 'shipped';

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
        style={[styles.tileCard, isVaulted && styles.tileCardVault]}
        contentStyle={styles.tileInner}
      >
        <View style={[styles.tierDot, { backgroundColor: accent }]} />
        <Text style={styles.tileResult} numberOfLines={3}>
          {pull.result}
        </Text>
        <Text style={styles.tilePack} numberOfLines={2}>
          {getLocalizedPackTitle(pull.packId, pull.packTitle, t)}
        </Text>
        <Text style={styles.tileMeta}>
          {pull.timestamp.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
        </Text>
        {timerLabel ? (
          <Text style={[styles.tileTimer, urgent && styles.tileTimerUrgent]} numberOfLines={1}>
            {urgent ? t('vaultScreen.notifyBeforeConvert') : timerLabel}
          </Text>
        ) : null}
        {pull.vaultExchangeListUsd != null && pull.vaultExchangeListUsd >= 1 ? (
          <View style={styles.tileListedPill}>
            <Text style={styles.tileListedPillText}>
              {t('vaultScreen.listedPill', { price: formatVaultExchangeUsd(pull.vaultExchangeListUsd) })}
            </Text>
          </View>
        ) : null}
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
  container: { flex: 1, backgroundColor: colors.homeGradientBottom },
  listContent: { paddingTop: spacing.sm, flexGrow: 1 },
  headerBlock: { marginBottom: spacing.lg },
  pageEyebrow: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: colors.gold,
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
  },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  lead: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  historyLink: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.accent,
    marginTop: spacing.md,
  },
  benefitsCard: { marginTop: spacing.md, marginBottom: spacing.sm },
  benefitsInner: { padding: spacing.lg },
  benefitsTitle: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  benefitLine: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.medium,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  benefitFine: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.semibold,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  tileWrap: {},
  tileCard: { minHeight: 168 },
  tileCardVault: {
    borderColor: colors.goldBorder,
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
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  tilePack: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.medium,
    color: colors.textMuted,
    lineHeight: 18,
    flex: 1,
  },
  tileMeta: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.regular,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  tileTimer: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  tileTimerUrgent: {
    color: colors.gold,
  },
  tileListedPill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  tileListedPillText: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: colors.accentDark,
    letterSpacing: 0.3,
  },
  tileStatus: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.semibold,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tileStatusPending: {
    color: colors.gold,
  },
  tileStatusUrgent: {
    color: colors.gold,
  },
  emptyCard: { marginTop: spacing.md },
  emptyInner: { padding: spacing.xl, alignItems: 'center' },
  emptyTitle: {
    fontSize: fontSize.md,
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  guestCard: { marginTop: spacing.md },
  guestInner: { padding: spacing.xl },
  guestTitle: {
    fontSize: fontSize.md,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  guestBody: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  guestCta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.red,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  guestCtaText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: colors.white,
  },
});
