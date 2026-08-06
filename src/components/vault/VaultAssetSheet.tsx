import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { sgVault } from '../../tokens/sgVault';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { getLocalizedPackTitle } from '../../i18n/packCopy';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import type { Pull } from '../../data/mockUser';
import { formatVaultTimeLeft, vaultExpiryNoticeActive, vaultMillisRemaining } from '../../lib/vaultTime';
import { VAULT_HOLD_DAYS } from '../../lib/vaultConstants';
import { ListForSaleModal } from './ListForSaleModal';
import { useAppStore } from '../../store/useAppStore';
import { formatVaultExchangeUsd } from '../../lib/vaultExchange';
import { confirmUserAction, showUserMessage } from '../../utils/showUserMessage';

type Props = {
  visible: boolean;
  pull: Pull | null;
  onClose: () => void;
  onRequestShipment: (pullId: string) => void | Promise<boolean>;
  onConvertToCoins: (pullId: string) => void;
};

export function VaultAssetSheet({
  visible,
  pull,
  onClose,
  onRequestShipment,
  onConvertToCoins,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [listOpen, setListOpen] = useState(false);
  const listVaultPullForSale = useAppStore((s) => s.listVaultPullForSale);
  const unlistVaultPullForSale = useAppStore((s) => s.unlistVaultPullForSale);

  const coinValue = pull ? pull.creditsWon ?? pull.convertCreditValue ?? 0 : 0;
  const isVaulted = pull?.fulfillment === 'vaulted';
  const isShipped = pull?.fulfillment === 'shipped';
  const listedUsd = pull?.vaultExchangeListUsd;
  const suggestedListUsd = Math.max(5, Math.round(coinValue / 20));

  const timerLine = useMemo(() => {
    if (!pull || !isVaulted || !pull.vaultExpiresAt) return null;
    const ms = vaultMillisRemaining(pull);
    if (ms == null) return null;
    return formatVaultTimeLeft(ms, t);
  }, [pull, isVaulted, t]);

  const showExpiryNotice = pull ? vaultExpiryNoticeActive(pull) : false;

  if (!pull) return null;

  const confirmShip = () => {
    confirmUserAction({
      title: t('vaultAsset.requestShipTitle'),
      message: t('vaultAsset.requestShipBody'),
      cancelLabel: t('vaultAsset.cancel'),
      confirmLabel: t('vaultAsset.requestShipConfirm'),
      onConfirm: () => {
        void (async () => {
          const ok = await onRequestShipment(pull.id);
          if (ok) onClose();
        })();
      },
    });
  };

  const confirmConvert = () => {
    confirmUserAction({
      title: t('vaultAsset.convertTitle'),
      message: t('vaultAsset.convertBody', { coins: coinValue.toLocaleString() }),
      cancelLabel: t('vaultAsset.cancel'),
      confirmLabel: t('vaultAsset.convertConfirm'),
      destructive: true,
      onConfirm: () => {
        onConvertToCoins(pull.id);
        onClose();
      },
    });
  };

  const onTrade = () => {
    showUserMessage(t('vaultAsset.soonTitle'), t('vaultAsset.tradeSoonBody'));
  };

  const confirmUnlist = () => {
    confirmUserAction({
      title: t('vaultAsset.ctaUnlist'),
      message: t('vaultAsset.unlistBody'),
      cancelLabel: t('vaultAsset.cancel'),
      confirmLabel: t('vaultAsset.ctaUnlist'),
      destructive: true,
      onConfirm: () => {
        unlistVaultPullForSale(pull.id);
        onClose();
      },
    });
  };

  const onConfirmListPrice = (price: number) => {
    const ok = listVaultPullForSale(pull.id, price);
    setListOpen(false);
    if (ok) onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        {...transparentModalIOSProps}
        onRequestClose={onClose}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable
            style={[styles.sheet, { paddingBottom: insets.bottom + sgVault.space.lg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.grabberWrap}>
              <View style={styles.grabber} />
            </View>

            <Text style={styles.kicker}>{t('vaultAsset.sheetKicker')}</Text>
            <Text style={styles.title} numberOfLines={3}>
              {pull.result}
            </Text>
            <Text style={styles.pack} numberOfLines={2}>
              {getLocalizedPackTitle(pull.packId, pull.packTitle, t)}
            </Text>

            {listedUsd != null && listedUsd >= 1 ? (
              <View style={styles.listedBanner}>
                <Text style={styles.listedBannerText}>
                  {t('vaultAsset.listedLine', { price: formatVaultExchangeUsd(listedUsd) })}
                </Text>
              </View>
            ) : null}

            {isVaulted && timerLine ? (
              <View style={[styles.timerCard, showExpiryNotice && styles.timerCardUrgent]}>
                <Text style={[styles.timerLabel, showExpiryNotice && styles.timerLabelUrgent]}>
                  {showExpiryNotice ? t('vaultAsset.timerUrgent') : t('vaultAsset.timerLabel')}
                </Text>
                <Text style={styles.timerValue}>{timerLine}</Text>
                <Text style={styles.timerFine}>
                  {t('vaultAsset.timerFine', { days: pull.vaultHoldDays ?? VAULT_HOLD_DAYS })}
                </Text>
              </View>
            ) : null}

            {isShipped ? (
              <View style={styles.statusBanner}>
                <Text style={styles.statusBannerText}>{t('vaultAsset.shipStatusLine')}</Text>
              </View>
            ) : null}

            {isVaulted ? (
              <>
                <PrimaryButton label={t('vaultAsset.ctaShip')} onPress={confirmShip} style={styles.cta} />
                <View style={styles.rowButtons}>
                  <TouchableOpacity style={styles.secondaryHalf} onPress={onTrade} accessibilityRole="button">
                    <Text style={styles.secondaryHalfText}>{t('vaultAsset.ctaTrade')}</Text>
                    <Text style={styles.soonPill}>{t('vaultAsset.soonPill')}</Text>
                  </TouchableOpacity>
                  {listedUsd != null && listedUsd >= 1 ? (
                    <TouchableOpacity
                      style={styles.secondaryHalf}
                      onPress={confirmUnlist}
                      accessibilityRole="button"
                    >
                      <Text style={styles.secondaryHalfText}>{t('vaultAsset.ctaUnlist')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.secondaryHalfAccent}
                      onPress={() => setListOpen(true)}
                      accessibilityRole="button"
                    >
                      <Text style={styles.secondaryHalfTextAccent}>{t('vaultAsset.ctaList')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <SecondaryButton
                  label={t('vaultAsset.ctaConvert', { coins: coinValue.toLocaleString() })}
                  onPress={confirmConvert}
                />
              </>
            ) : null}

            {!isVaulted && !isShipped ? (
              <Text style={styles.readOnly}>{t('vaultAsset.readOnly')}</Text>
            ) : null}

            <TouchableOpacity onPress={onClose} style={styles.dismiss} accessibilityRole="button">
              <Text style={styles.dismissText}>{t('vaultAsset.close')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <ListForSaleModal
        visible={listOpen}
        suggestedPriceUsd={suggestedListUsd}
        onClose={() => setListOpen(false)}
        onConfirm={onConfirmListPrice}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: sgVault.surface,
    borderTopLeftRadius: sgVault.radius.panel,
    borderTopRightRadius: sgVault.radius.panel,
    paddingHorizontal: sgVault.space.lg,
    paddingTop: sgVault.space.sm,
    borderTopWidth: 1,
    borderColor: sgVault.line,
  },
  grabberWrap: { alignItems: 'center', marginBottom: sgVault.space.md },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: sgVault.line,
  },
  kicker: {
    fontSize: 11,
    fontFamily: sgVault.font.dataBold,
    color: sgVault.gold,
    letterSpacing: 1.2,
    marginBottom: sgVault.space.xs,
  },
  title: {
    fontSize: 24,
    fontFamily: sgVault.font.display,
    color: sgVault.text,
    marginBottom: sgVault.space.xs,
  },
  pack: {
    fontSize: 13,
    fontFamily: sgVault.font.body,
    color: sgVault.muted,
    marginBottom: sgVault.space.lg,
    lineHeight: 20,
  },
  listedBanner: {
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderRadius: sgVault.radius.panel,
    padding: sgVault.space.md,
    marginBottom: sgVault.space.md,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.38)',
  },
  listedBannerText: {
    fontSize: 13,
    fontFamily: sgVault.font.bodyMedium,
    color: sgVault.gold,
    lineHeight: 20,
  },
  timerCard: {
    backgroundColor: sgVault.bg,
    borderRadius: sgVault.radius.panel,
    padding: sgVault.space.md,
    marginBottom: sgVault.space.lg,
    borderWidth: 1,
    borderColor: sgVault.line,
  },
  timerCardUrgent: {
    borderColor: 'rgba(212,175,55,0.55)',
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  timerLabel: {
    fontSize: 11,
    fontFamily: sgVault.font.dataBold,
    color: sgVault.muted,
    marginBottom: 4,
  },
  timerLabelUrgent: {
    color: sgVault.gold,
  },
  timerValue: {
    fontSize: 18,
    fontFamily: sgVault.font.dataBold,
    color: sgVault.text,
    fontVariant: [...sgVault.numeric],
  },
  timerFine: {
    fontSize: 11,
    fontFamily: sgVault.font.body,
    color: sgVault.muted,
    marginTop: sgVault.space.xs,
    lineHeight: 18,
  },
  statusBanner: {
    backgroundColor: sgVault.surface2,
    borderRadius: sgVault.radius.panel,
    padding: sgVault.space.md,
    marginBottom: sgVault.space.lg,
  },
  statusBannerText: {
    fontSize: 13,
    fontFamily: sgVault.font.bodyMedium,
    color: sgVault.muted,
    lineHeight: 20,
  },
  cta: { marginBottom: sgVault.space.md },
  rowButtons: {
    flexDirection: 'row',
    gap: sgVault.space.sm,
    marginBottom: sgVault.space.md,
  },
  secondaryHalf: {
    flex: 1,
    backgroundColor: sgVault.surface2,
    borderRadius: sgVault.radius.btn,
    paddingVertical: sgVault.space.md,
    paddingHorizontal: sgVault.space.sm,
    borderWidth: 1,
    borderColor: sgVault.line,
    alignItems: 'center',
  },
  secondaryHalfAccent: {
    flex: 1,
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderRadius: sgVault.radius.btn,
    paddingVertical: sgVault.space.md,
    paddingHorizontal: sgVault.space.sm,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.38)',
    alignItems: 'center',
  },
  secondaryHalfText: {
    fontSize: 11,
    fontFamily: sgVault.font.bodyBold,
    color: sgVault.text,
    textAlign: 'center',
  },
  secondaryHalfTextAccent: {
    fontSize: 11,
    fontFamily: sgVault.font.bodyBold,
    color: sgVault.gold,
    textAlign: 'center',
  },
  soonPill: {
    marginTop: 6,
    fontSize: 10,
    fontFamily: sgVault.font.dataBold,
    color: sgVault.muted,
    letterSpacing: 0.6,
  },
  readOnly: {
    fontSize: 13,
    color: sgVault.muted,
    textAlign: 'center',
    marginBottom: sgVault.space.lg,
  },
  dismiss: { alignItems: 'center', marginTop: sgVault.space.md, paddingVertical: sgVault.space.sm },
  dismissText: {
    fontSize: 13,
    fontFamily: sgVault.font.bodyMedium,
    color: sgVault.muted,
  },
});
