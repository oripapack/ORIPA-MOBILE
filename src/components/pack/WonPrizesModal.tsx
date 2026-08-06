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
import Ionicons from '@expo/vector-icons/Ionicons';
import { sg } from '../../tokens/sg';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import { useAppStore } from '../../store/useAppStore';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { getLocalizedPackTitle } from '../../i18n/packCopy';
import type { PullRarityTier } from '../../data/mockUser';
import { WinningsSummaryCard } from './WinningsSummaryCard';
import { VAULT_HOLD_DAYS } from '../../lib/vaultConstants';

const TIER_BADGE: Record<PullRarityTier, string> = {
  common: 'BASE',
  rare: 'BASE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
  mythic: 'MYTHIC',
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
      <View style={[styles.screen, { paddingTop: insets.top + sg.space.sm }]}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + sg.space.lg }]}
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
                  {toVault ? <Ionicons name="checkmark" size={15} color={sg.onGold} /> : null}
                </TouchableOpacity>

                <View style={styles.thumb}>
                  <Ionicons name="albums-outline" size={27} color={sg.muted} />
                  <View style={styles.thumbZoom}>
                    <Ionicons name="search" size={11} color={sg.text} />
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
                  <Text style={styles.pointsUnit}>PTS</Text>
                  <Text style={styles.itemCoinValue}>{itemValue.toLocaleString()}</Text>
                </View>
              </Pressable>
            );
          })}

          <Text style={styles.hint}>{t('wonPrizesModal.checkboxHint')}</Text>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + sg.space.md }]}>
          <PrimaryButton
            label={primaryCtaLabel}
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
              <Ionicons name="close" size={20} color={sg.muted} />
            </TouchableOpacity>
            <Text style={styles.confirmTitle}>{t('wonPrizesModal.confirmTitle')}</Text>
            <Text style={styles.confirmBody}>{t('wonPrizesModal.confirmBody')}</Text>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>{t('wonPrizesModal.confirmCoinsLabel')}</Text>
              <View style={styles.confirmValue}>
                <Text style={styles.pointsUnit}>PTS</Text>
                <Text style={styles.confirmAmount}>{creditsToReceiveAmount.toLocaleString()}</Text>
              </View>
            </View>
            {vaultCount > 0 ? (
              <Text style={styles.confirmVaultNote}>
                {t('wonPrizesModal.confirmVaultNote', { count: vaultCount, days: VAULT_HOLD_DAYS })}
              </Text>
            ) : null}
            <PrimaryButton label={t('wonPrizesModal.confirmCta')} onPress={onConfirmConvert} />
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
    backgroundColor: sg.surface,
  },
  scroll: {
    paddingHorizontal: sg.space.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sg.space.sm,
  },
  pageTitle: {
    fontSize: sg.type.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
  },
  instructions: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: sg.space.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: sg.space.xl,
    marginBottom: sg.space.sm,
    gap: sg.space.md,
  },
  sectionTitle: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    flex: 1,
  },
  sectionHint: {
    fontSize: sg.type.xs,
    color: sg.muted,
    fontFamily: sg.font.bodyMedium,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.panel,
    padding: sg.space.md,
    borderWidth: 2,
    borderColor: sg.line,
    gap: sg.space.sm,
    marginBottom: sg.space.sm,
  },
  itemCardVaultPick: {
    borderColor: sg.gold,
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: sg.radius.tag,
    borderWidth: 2,
    borderColor: sg.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.surface,
  },
  checkboxVaultOn: {
    backgroundColor: sg.gold,
    borderColor: sg.goldHi,
  },
  thumb: {
    width: 64,
    height: 88,
    borderRadius: sg.radius.btn,
    backgroundColor: sg.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbZoom: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: sg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: sg.space.sm,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: sg.bg,
    paddingHorizontal: sg.space.sm,
    paddingVertical: 2,
    borderRadius: sg.radius.tag,
  },
  badgeText: {
    color: sg.text,
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
  },
  intentPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: sg.space.sm,
    paddingVertical: 4,
    borderRadius: sg.radius.tag,
    borderWidth: 1,
  },
  intentVault: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderColor: sg.gold,
  },
  intentConvert: {
    backgroundColor: sg.surface,
    borderColor: sg.line,
  },
  intentText: {
    color: sg.text,
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    letterSpacing: 0.2,
  },
  itemName: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
  },
  itemMeta: {
    fontSize: sg.type.xs,
    color: sg.muted,
    marginTop: 2,
  },
  itemCoins: {
    alignItems: 'flex-end',
  },
  itemCoinValue: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.dataBold,
    color: sg.text,
    fontVariant: [...sg.numeric],
  },
  pointsUnit: {
    fontSize: 8,
    fontFamily: sg.font.dataBold,
    color: sg.muted,
    letterSpacing: 1,
  },
  hint: {
    fontSize: sg.type.xs,
    color: sg.muted,
    marginTop: sg.space.md,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: sg.space.md,
    borderTopWidth: 1,
    borderTopColor: sg.line,
    paddingTop: sg.space.md,
    backgroundColor: sg.surface,
  },
  footerBtn: {
    marginBottom: sg.space.xs,
  },
  footerSub: {
    textAlign: 'center',
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    lineHeight: 18,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: sg.space.xl,
  },
  confirmCard: {
    backgroundColor: sg.surface,
    borderRadius: sg.radius.panel,
    padding: sg.space.xl,
  },
  confirmClose: {
    position: 'absolute',
    top: sg.space.md,
    right: sg.space.md,
    zIndex: 2,
    padding: sg.space.xs,
  },
  confirmTitle: {
    fontSize: sg.type.xl,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: sg.space.sm,
    paddingRight: sg.space.xl,
  },
  confirmBody: {
    fontSize: sg.type.sm,
    color: sg.muted,
    marginBottom: sg.space.lg,
    lineHeight: 20,
  },
  confirmRow: {
    backgroundColor: sg.bg,
    borderRadius: sg.radius.panel,
    padding: sg.space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sg.space.md,
  },
  confirmLabel: {
    fontSize: sg.type.sm,
    color: sg.muted,
    fontFamily: sg.font.bodyMedium,
  },
  confirmValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confirmAmount: {
    fontSize: sg.type.lg,
    fontFamily: sg.font.dataBold,
    color: sg.text,
    fontVariant: [...sg.numeric],
  },
  confirmVaultNote: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    marginBottom: sg.space.lg,
    lineHeight: 18,
  },
});
