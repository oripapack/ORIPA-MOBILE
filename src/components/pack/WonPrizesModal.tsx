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
            Choose the prizes you want shipped. Any unselected prizes will be converted into points.
          </Text>

          <View style={styles.poolHeader}>
            <Text style={styles.poolTitle}>
              Pending pulls · {pulls.length} item{pulls.length === 1 ? '' : 's'}
            </Text>
            <View style={styles.poolCoins}>
              <Text style={styles.coinIcon}>🪙</Text>
              <Text style={styles.poolCoinValue}>{convertAmount.toLocaleString()}</Text>
            </View>
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
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{TIER_BADGE[tier]}</Text>
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

          <Text style={styles.hint}>
            Tap items to mark for shipping. Unselected items will be converted into points.
          </Text>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <PrimaryButton
            label={shipCount > 0 ? `${shipCount} to ship + convert the rest` : 'Convert all into Points'}
            variant={shipCount > 0 ? 'black' : 'red'}
            onPress={onPrimaryPress}
            style={styles.footerBtn}
          />
          <Text style={styles.footerSub}>🪙 {convertSelectedAmount.toLocaleString()} will be converted</Text>
        </View>
      </View>

      {/* Confirmation — inspo: “Convert items to points” sheet */}
      <Modal visible={showConvertConfirm} transparent animationType="fade" {...transparentModalIOSProps}>
        <Pressable style={styles.confirmOverlay} onPress={() => setShowConvertConfirm(false)}>
          <Pressable style={styles.confirmCard} onPress={() => {}}>
            <TouchableOpacity style={styles.confirmClose} onPress={() => setShowConvertConfirm(false)}>
              <Text style={styles.confirmCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.confirmTitle}>Convert items to points</Text>
            <Text style={styles.confirmBody}>Converted points will be added to your points balance.</Text>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Points to be Received</Text>
              <View style={styles.confirmValue}>
                <Text style={styles.coinIcon}>🪙</Text>
                <Text style={styles.confirmAmount}>{convertSelectedAmount.toLocaleString()}</Text>
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
    marginBottom: spacing.lg,
  },
  poolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  poolTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  poolCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  poolCoinValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.sm,
  },
  itemCardSelected: {
    borderColor: 'rgba(225, 29, 46, 0.45)',
    backgroundColor: '#FFF5F5',
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
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.nearBlack,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginBottom: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
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
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
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
