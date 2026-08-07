import React, { useState } from 'react';
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
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { getLocalizedPackTitle } from '../../i18n/packCopy';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import type { Pull } from '../../data/mockUser';
import { ListForSaleModal } from './ListForSaleModal';
import { useAppStore } from '../../store/useAppStore';
import { formatVaultExchangeUsd } from '../../lib/vaultExchange';
import { confirmUserAction, showUserMessage } from '../../utils/showUserMessage';

type Props = {
  visible: boolean;
  pull: Pull | null;
  onClose: () => void;
  onRequestShipment: (pullId: string) => void | Promise<boolean>;
  onConvertToCoins: (pullId: string) => void | Promise<boolean>;
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
        void (async () => {
          const ok = await onConvertToCoins(pull.id);
          if (ok !== false) onClose();
        })();
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
            style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
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
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: sgVault.line,
  },
  grabberWrap: { alignItems: 'center', marginBottom: spacing.md },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: sgVault.line,
  },
  kicker: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: sgVault.gold,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: brandFont.black,
    color: sgVault.text,
    marginBottom: spacing.xs,
  },
  pack: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
    color: sgVault.muted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  listedBanner: {
    backgroundColor: 'rgba(61,220,151,0.12)',
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: sgVault.cobaltBorder,
  },
  listedBannerText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: sgVault.gold,
    lineHeight: 20,
  },
  statusBanner: {
    backgroundColor: sgVault.surface2,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  statusBannerText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
    color: sgVault.muted,
    lineHeight: 20,
  },
  cta: { marginBottom: spacing.md },
  rowButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  secondaryHalf: {
    flex: 1,
    backgroundColor: sgVault.surface2,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: sgVault.line,
    alignItems: 'center',
  },
  secondaryHalfAccent: {
    flex: 1,
    backgroundColor: 'rgba(61,220,151,0.12)',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: sgVault.cobaltBorder,
    alignItems: 'center',
  },
  secondaryHalfText: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: sgVault.text,
    textAlign: 'center',
  },
  secondaryHalfTextAccent: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: sgVault.gold,
    textAlign: 'center',
  },
  soonPill: {
    marginTop: 6,
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: sgVault.muted,
    letterSpacing: 0.6,
  },
  readOnly: {
    fontSize: fontSize.sm,
    color: sgVault.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  dismiss: { alignItems: 'center', marginTop: spacing.md, paddingVertical: spacing.sm },
  dismissText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: sgVault.muted,
  },
});
