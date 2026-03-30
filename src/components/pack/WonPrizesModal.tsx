import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { getLocalizedPackTitle } from '../../i18n/packCopy';
import type { PullRarityTier } from '../../data/mockUser';
import { WinningsSummaryCard } from './WinningsSummaryCard';

const TIER_POOL: Record<PullRarityTier, string> = {
  common: 'Common Prize Pool',
  rare: 'Rare Prize Pool',
  epic: 'Epic Prize Pool',
  legendary: 'Legendary Prize Pool',
  mythic: 'Mythic Prize Pool',
};

const TIER_BADGE: Record<PullRarityTier, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
};

/**
 * Post-opening flow (inspo: clove “Won Prizes”): choose ship vs convert to credits.
 * Credits are only added when user confirms convert or ship.
 */
export function WonPrizesModal() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const visible = useAppStore((s) => s.modals.wonPrizes);
  const closeModal = useAppStore((s) => s.closeModal);
  const pendingIds = useAppStore((s) => s.pendingFulfillmentPullIds);
  const user = useAppStore((s) => s.user);
  const finalizePullFulfillment = useAppStore((s) => s.finalizePullFulfillment);

  const [shipSelected, setShipSelected] = useState<Record<string, boolean>>({});
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setShipSelected({});
    setShowConvertConfirm(false);
  }, [visible, pendingIds.length]);

  /** Avoid ghost state: modal flag true but nothing to show — would block interaction on some devices. */
  useEffect(() => {
    if (!visible) return;
    if (pendingIds.length === 0) {
      closeModal('wonPrizes');
    }
  }, [visible, pendingIds.length, closeModal]);

  const pulls = useMemo(() => {
    const idSet = new Set(pendingIds);
    return user.pullHistory.filter((p) => idSet.has(p.id) && p.fulfillment === 'pending');
  }, [pendingIds, user.pullHistory]);

  const shipIds = useMemo(() => pulls.filter((p) => shipSelected[p.id]).map((p) => p.id), [pulls, shipSelected]);
  const convertIds = useMemo(() => pulls.filter((p) => !shipSelected[p.id]).map((p) => p.id), [pulls, shipSelected]);

  const shipCount = shipIds.length;
  const convertCount = convertIds.length;
  const convertAmount = useMemo(
    () => pulls.reduce((sum, p) => sum + (p.creditsWon ?? p.convertCreditValue ?? 0), 0),
    [pulls],
  );
  const convertSelectedAmount = useMemo(
    () =>
      pulls
        .filter((p) => !shipSelected[p.id])
        .reduce((sum, p) => sum + (p.creditsWon ?? p.convertCreditValue ?? 0), 0),
    [pulls, shipSelected],
  );

  const selectionState = useMemo(() => {
    if (shipCount === 0) return 'none' as const;
    if (convertCount === 0) return 'all' as const;
    return 'some' as const;
  }, [shipCount, convertCount]);

  const topHelperText = useMemo(() => {
    if (selectionState === 'all') return 'All selected cards will be shipped.';
    return 'Select the cards you want shipped. Everything else converts automatically.';
  }, [selectionState]);

  const summaryAmount = selectionState === 'none' ? convertAmount : convertSelectedAmount;

  const primaryCtaLabel = useMemo(() => {
    const coins = summaryAmount.toLocaleString();
    if (selectionState === 'all') return 'Ship Selected Cards';
    if (selectionState === 'none') return `Get ${coins} Coins`;
    return `Ship ${shipCount} + Get ${coins} Coins`;
  }, [selectionState, shipCount, summaryAmount]);

  const footerSubcopy = useMemo(() => {
    if (selectionState === 'all') return `${shipCount} card${shipCount === 1 ? '' : 's'} marked for shipping`;
    if (selectionState === 'none') return 'Unselected cards convert instantly to coins.';
    return `${convertCount} convert · ${shipCount} ship`;
  }, [selectionState, shipCount, convertCount]);

  const onPrimaryPress = () => {
    if (pulls.length === 0) return;
    if (shipCount > 0) {
      finalizePullFulfillment(shipIds, 'ship');
    }
    if (convertIds.length > 0) {
      setShowConvertConfirm(true);
    }
  };

  const onConfirmConvert = () => {
    setShowConvertConfirm(false);
    if (convertIds.length > 0) {
      finalizePullFulfillment(convertIds, 'convert');
    }
    setShipSelected({});
  };

  if (!visible) return null;
  if (pulls.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      {...transparentModalIOSProps}
      onRequestClose={() => {}}
    >
      <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Text style={styles.pageTitle}>Won Prizes</Text>
          </View>

          <Text style={styles.instructions}>
            Unselected cards convert instantly to coins. Shipping is optional.
          </Text>

          <WinningsSummaryCard amount={summaryAmount} currencyLabel="Coins" helperText={topHelperText} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Pending winnings · {pulls.length} item{pulls.length === 1 ? '' : 's'}
            </Text>
            <Text style={styles.sectionHint}>Tap to toggle shipping</Text>
          </View>

          {pulls.map((pull) => {
            const tier: PullRarityTier = pull.tier ?? 'common';
            const checked = !!shipSelected[pull.id];
            const itemValue = pull.creditsWon ?? pull.convertCreditValue ?? 0;
            return (
              <Pressable
                key={pull.id}
                style={[styles.itemCard, checked && styles.itemCardSelected]}
                onPress={() => setShipSelected((s) => ({ ...s, [pull.id]: !s[pull.id] }))}
              >
                <TouchableOpacity
                  style={[styles.checkbox, checked && styles.checkboxOn]}
                  onPress={() => setShipSelected((s) => ({ ...s, [pull.id]: !s[pull.id] }))}
                  activeOpacity={0.8}
                >
                  {checked ? <Text style={styles.checkmark}>✓</Text> : null}
                </TouchableOpacity>

                <View style={styles.thumb}>
                  <Text style={styles.thumbEmoji}>🎴</Text>
                  <View style={styles.thumbZoom}>
                    <Text style={styles.thumbZoomIcon}>🔍</Text>
                  </View>
                </View>

                <View style={styles.itemBody}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{TIER_BADGE[tier]}</Text>
                    </View>
                    <View style={[styles.intentPill, checked ? styles.intentShip : styles.intentConvert]}>
                      <Text style={styles.intentText}>{checked ? 'Shipping' : 'Converts'}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {pull.result ?? '—'}
                  </Text>
                  <Text style={styles.itemMeta} numberOfLines={1}>
                    {getLocalizedPackTitle(pull.packId, pull.packTitle, t)}
                  </Text>
                </View>

                <View style={styles.itemCoins}>
                  <Text style={styles.coinIcon}>🪙</Text>
                  <Text style={styles.itemCoinValue}>{itemValue.toLocaleString()}</Text>
                </View>
              </Pressable>
            );
          })}

          <Text style={styles.hint}>Select the cards you want shipped. Everything else converts automatically.</Text>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <PrimaryButton
            label={primaryCtaLabel}
            variant={selectionState === 'none' ? 'red' : 'black'}
            onPress={onPrimaryPress}
            style={styles.footerBtn}
          />
          <Text style={styles.footerSub}>
            {selectionState === 'all' ? 'Shipping only' : `🪙 ${summaryAmount.toLocaleString()} converts`}
            {'  ·  '}
            {footerSubcopy}
          </Text>
        </View>
      </View>

      {/* Confirmation — inspo: “Convert items to points” sheet */}
      <Modal visible={showConvertConfirm} transparent animationType="fade" {...transparentModalIOSProps}>
        <Pressable style={styles.confirmOverlay} onPress={() => setShowConvertConfirm(false)}>
          <Pressable style={styles.confirmCard} onPress={() => {}}>
            <TouchableOpacity style={styles.confirmClose} onPress={() => setShowConvertConfirm(false)}>
              <Text style={styles.confirmCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.confirmTitle}>Convert to coins</Text>
            <Text style={styles.confirmBody}>Coins will be added to your balance instantly.</Text>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Coins to be received</Text>
              <View style={styles.confirmValue}>
                <Text style={styles.coinIcon}>🪙</Text>
                <Text style={styles.confirmAmount}>{summaryAmount.toLocaleString()}</Text>
              </View>
            </View>
            <PrimaryButton label="Confirm" variant="red" onPress={onConfirmConvert} />
            <SecondaryButton label="Cancel" onPress={() => setShowConvertConfirm(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
  },
  scroll: {
    paddingHorizontal: spacing.base,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  instructions: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  sectionHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  itemCardSelected: {
    borderColor: colors.redGlow,
    backgroundColor: colors.surfaceElevated,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  checkboxOn: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: fontWeight.bold,
  },
  thumb: {
    width: 64,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: colors.nearBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: {
    fontSize: 28,
  },
  thumbZoom: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbZoomIcon: {
    fontSize: 10,
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.nearBlack,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  intentPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  intentShip: {
    backgroundColor: 'rgba(196, 30, 58, 0.14)',
    borderColor: 'rgba(196, 30, 58, 0.45)',
  },
  intentConvert: {
    backgroundColor: colors.goldSoft,
    borderColor: 'rgba(232, 197, 71, 0.35)',
  },
  intentText: {
    color: colors.textPrimary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
  },
  itemName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  itemMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemCoins: {
    alignItems: 'flex-end',
  },
  itemCoinValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  coinIcon: {
    fontSize: 14,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  footerBtn: {
    marginBottom: spacing.xs,
  },
  footerSub: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  confirmCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  confirmClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 2,
    padding: spacing.xs,
  },
  confirmCloseText: {
    fontSize: 18,
    color: colors.textMuted,
  },
  confirmTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    paddingRight: spacing.xl,
  },
  confirmBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  confirmRow: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  confirmLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  confirmValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confirmAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
});
