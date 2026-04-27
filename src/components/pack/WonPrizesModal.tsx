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
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import { useAppStore } from '../../store/useAppStore';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { getLocalizedPackTitle } from '../../i18n/packCopy';
import type { PullRarityTier } from '../../data/mockUser';
import { WinningsSummaryCard } from './WinningsSummaryCard';
import { VAULT_HOLD_DAYS } from '../../lib/vaultConstants';

const TIER_BADGE: Record<PullRarityTier, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
};

/**
 * Post-opening fulfillment: convert to credits by default; optionally check rows to store in Vault.
 * Shipping is initiated later from the Vault.
 */
export function WonPrizesModal() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const visible = useAppStore((s) => s.modals.wonPrizes);
  const closeModal = useAppStore((s) => s.closeModal);
  const pendingIds = useAppStore((s) => s.pendingFulfillmentPullIds);
  const user = useAppStore((s) => s.user);
  const finalizePendingFulfillment = useAppStore((s) => s.finalizePendingFulfillment);

  /** When true, this pull is stored in the Vault; when false, it converts to credits (default). */
  const [vaultSelected, setVaultSelected] = useState<Record<string, boolean>>({});
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setVaultSelected({});
    setShowConvertConfirm(false);
  }, [visible, pendingIds.length]);

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

  const vaultIds = useMemo(
    () => pulls.filter((p) => vaultSelected[p.id]).map((p) => p.id),
    [pulls, vaultSelected],
  );
  const convertIds = useMemo(
    () => pulls.filter((p) => !vaultSelected[p.id]).map((p) => p.id),
    [pulls, vaultSelected],
  );

  const vaultCount = vaultIds.length;
  const convertCount = convertIds.length;

  const convertAmountTotal = useMemo(
    () => pulls.reduce((sum, p) => sum + (p.creditsWon ?? p.convertCreditValue ?? 0), 0),
    [pulls],
  );
  const creditsToReceiveAmount = useMemo(
    () =>
      pulls
        .filter((p) => !vaultSelected[p.id])
        .reduce((sum, p) => sum + (p.creditsWon ?? p.convertCreditValue ?? 0), 0),
    [pulls, vaultSelected],
  );

  const selectionState = useMemo(() => {
    if (convertCount === 0) return 'allVault' as const;
    if (vaultCount === 0) return 'allConvert' as const;
    return 'mixed' as const;
  }, [vaultCount, convertCount]);

  const summaryCardAmount = selectionState === 'allConvert' ? convertAmountTotal : creditsToReceiveAmount;

  const summaryHelperText = useMemo(() => {
    if (selectionState === 'allVault') {
      return t('wonPrizesModal.summaryAllVault', { days: VAULT_HOLD_DAYS });
    }
    if (selectionState === 'allConvert') {
      return t('wonPrizesModal.summaryAllConvert');
    }
    return t('wonPrizesModal.summaryMixed', { days: VAULT_HOLD_DAYS });
  }, [selectionState, t]);

  const primaryCtaLabel = useMemo(() => {
    const coins = creditsToReceiveAmount.toLocaleString();
    if (selectionState === 'allVault') return t('wonPrizesModal.ctaAllVault');
    if (selectionState === 'allConvert') return t('wonPrizesModal.ctaAllConvert', { coins });
    return t('wonPrizesModal.ctaMixed', { vaultCount, coins });
  }, [selectionState, creditsToReceiveAmount, vaultCount, t]);

  const footerSubcopy = useMemo(() => {
    if (selectionState === 'allVault') return t('wonPrizesModal.footerAllVault', { count: vaultCount });
    if (selectionState === 'allConvert') return t('wonPrizesModal.footerAllConvert');
    return t('wonPrizesModal.footerMixed', { vaultCount, convertCount });
  }, [selectionState, vaultCount, convertCount, t]);

  const runFulfillment = () => {
    finalizePendingFulfillment({ vaultIds, convertIds });
    setVaultSelected({});
  };

  const onPrimaryPress = () => {
    if (pulls.length === 0) return;
    if (convertCount > 0) {
      setShowConvertConfirm(true);
      return;
    }
    runFulfillment();
  };

  const onConfirmConvert = () => {
    setShowConvertConfirm(false);
    runFulfillment();
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
            <Text style={styles.pageTitle}>{t('wonPrizesModal.title')}</Text>
          </View>

          <Text style={styles.instructions}>{t('wonPrizesModal.lead')}</Text>

          <WinningsSummaryCard
            label={t('wonPrizesModal.summaryLabel')}
            amount={summaryCardAmount}
            currencyLabel={t('wonPrizesModal.coinsLabel')}
            helperText={summaryHelperText}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('wonPrizesModal.sectionTitle', { count: pulls.length })}
            </Text>
            <Text style={styles.sectionHint}>{t('wonPrizesModal.sectionHint')}</Text>
          </View>

          {pulls.map((pull) => {
            const tier: PullRarityTier = pull.tier ?? 'common';
            const toVault = !!vaultSelected[pull.id];
            const itemValue = pull.creditsWon ?? pull.convertCreditValue ?? 0;
            return (
              <Pressable
                key={pull.id}
                style={[styles.itemCard, toVault && styles.itemCardVaultPick]}
                onPress={() => setVaultSelected((s) => ({ ...s, [pull.id]: !s[pull.id] }))}
              >
                <TouchableOpacity
                  style={[styles.checkbox, toVault && styles.checkboxVaultOn]}
                  onPress={() => setVaultSelected((s) => ({ ...s, [pull.id]: !s[pull.id] }))}
                  activeOpacity={0.8}
                >
                  {toVault ? <Text style={styles.checkmark}>✓</Text> : null}
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
                    <View style={[styles.intentPill, toVault ? styles.intentVault : styles.intentConvert]}>
                      <Text style={styles.intentText}>
                        {toVault ? t('wonPrizesModal.pillVault') : t('wonPrizesModal.pillConvert')}
                      </Text>
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

          <Text style={styles.hint}>{t('wonPrizesModal.checkboxHint')}</Text>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <PrimaryButton
            label={primaryCtaLabel}
            variant={selectionState === 'allVault' ? 'black' : 'red'}
            onPress={onPrimaryPress}
            style={styles.footerBtn}
          />
          <Text style={styles.footerSub}>
            {selectionState === 'allConvert'
              ? t('wonPrizesModal.footerCoinsOnly', { coins: creditsToReceiveAmount.toLocaleString() })
              : t('wonPrizesModal.footerVaultLine', { days: VAULT_HOLD_DAYS })}
            {'  ·  '}
            {footerSubcopy}
          </Text>
        </View>
      </View>

      <Modal visible={showConvertConfirm} transparent animationType="fade" {...transparentModalIOSProps}>
        <Pressable style={styles.confirmOverlay} onPress={() => setShowConvertConfirm(false)}>
          <Pressable style={styles.confirmCard} onPress={() => {}}>
            <TouchableOpacity style={styles.confirmClose} onPress={() => setShowConvertConfirm(false)}>
              <Text style={styles.confirmCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.confirmTitle}>{t('wonPrizesModal.confirmTitle')}</Text>
            <Text style={styles.confirmBody}>{t('wonPrizesModal.confirmBody')}</Text>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>{t('wonPrizesModal.confirmCoinsLabel')}</Text>
              <View style={styles.confirmValue}>
                <Text style={styles.coinIcon}>🪙</Text>
                <Text style={styles.confirmAmount}>{creditsToReceiveAmount.toLocaleString()}</Text>
              </View>
            </View>
            {vaultCount > 0 ? (
              <Text style={styles.confirmVaultNote}>
                {t('wonPrizesModal.confirmVaultNote', { count: vaultCount, days: VAULT_HOLD_DAYS })}
              </Text>
            ) : null}
            <PrimaryButton label={t('wonPrizesModal.confirmCta')} variant="red" onPress={onConfirmConvert} />
            <SecondaryButton label={t('wonPrizesModal.confirmCancel')} onPress={() => setShowConvertConfirm(false)} />
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
    fontFamily: brandFont.black,
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
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  sectionHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontFamily: brandFont.medium,
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
  itemCardVaultPick: {
    borderColor: colors.goldBorderHeavy,
    backgroundColor: colors.goldTintSubtle,
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
  checkboxVaultOn: {
    backgroundColor: colors.gold,
    borderColor: colors.goldDark,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontFamily: brandFont.bold,
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
    backgroundColor: colors.surfaceElevated,
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
    fontFamily: brandFont.bold,
  },
  intentPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  intentVault: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.goldBorderStrong,
  },
  intentConvert: {
    backgroundColor: 'rgba(196, 30, 58, 0.14)',
    borderColor: 'rgba(196, 30, 58, 0.45)',
  },
  intentText: {
    color: colors.textPrimary,
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    letterSpacing: 0.2,
  },
  itemName: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
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
    fontFamily: brandFont.bold,
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
    fontFamily: brandFont.bold,
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
    fontFamily: brandFont.black,
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
    marginBottom: spacing.md,
  },
  confirmLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontFamily: brandFont.medium,
  },
  confirmValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confirmAmount: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
  },
  confirmVaultNote: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.medium,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
});
