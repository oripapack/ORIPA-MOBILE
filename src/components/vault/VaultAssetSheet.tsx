import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { getLocalizedPackTitle } from '../../i18n/packCopy';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import type { Pull } from '../../data/mockUser';
import { formatVaultTimeLeft, vaultExpiryNoticeActive, vaultMillisRemaining } from '../../lib/vaultTime';
import { VAULT_HOLD_DAYS } from '../../lib/vaultConstants';

type Props = {
  visible: boolean;
  pull: Pull | null;
  onClose: () => void;
  onRequestShipment: (pullId: string) => void;
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

  const coinValue = pull ? pull.creditsWon ?? pull.convertCreditValue ?? 0 : 0;
  const isVaulted = pull?.fulfillment === 'vaulted';
  const isShipped = pull?.fulfillment === 'shipped';

  const timerLine = useMemo(() => {
    if (!pull || !isVaulted || !pull.vaultExpiresAt) return null;
    const ms = vaultMillisRemaining(pull);
    if (ms == null) return null;
    return formatVaultTimeLeft(ms, t);
  }, [pull, isVaulted, t]);

  const showExpiryNotice = pull ? vaultExpiryNoticeActive(pull) : false;

  if (!pull) return null;

  const confirmShip = () => {
    Alert.alert(
      t('vaultAsset.requestShipTitle'),
      t('vaultAsset.requestShipBody'),
      [
        { text: t('vaultAsset.cancel'), style: 'cancel' },
        {
          text: t('vaultAsset.requestShipConfirm'),
          style: 'default',
          onPress: () => {
            onRequestShipment(pull.id);
            onClose();
          },
        },
      ],
    );
  };

  const confirmConvert = () => {
    Alert.alert(
      t('vaultAsset.convertTitle'),
      t('vaultAsset.convertBody', { coins: coinValue.toLocaleString() }),
      [
        { text: t('vaultAsset.cancel'), style: 'cancel' },
        {
          text: t('vaultAsset.convertConfirm'),
          style: 'destructive',
          onPress: () => {
            onConvertToCoins(pull.id);
            onClose();
          },
        },
      ],
    );
  };

  const onTrade = () => {
    Alert.alert(t('vaultAsset.soonTitle'), t('vaultAsset.tradeSoonBody'));
  };

  const onList = () => {
    Alert.alert(t('vaultAsset.soonTitle'), t('vaultAsset.listSoonBody'));
  };

  return (
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
                <TouchableOpacity style={styles.secondaryHalf} onPress={onList} accessibilityRole="button">
                  <Text style={styles.secondaryHalfText}>{t('vaultAsset.ctaList')}</Text>
                  <Text style={styles.soonPill}>{t('vaultAsset.soonPill')}</Text>
                </TouchableOpacity>
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
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  grabberWrap: { alignItems: 'center', marginBottom: spacing.md },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  kicker: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: colors.gold,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  pack: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  timerCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  timerCardUrgent: {
    borderColor: colors.goldBorderHeavy,
    backgroundColor: colors.goldWash,
  },
  timerLabel: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    marginBottom: 4,
  },
  timerLabelUrgent: {
    color: colors.gold,
  },
  timerValue: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
  },
  timerFine: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.medium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  statusBanner: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  statusBannerText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
    color: colors.textSecondary,
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
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  secondaryHalfText: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  soonPill: {
    marginTop: 6,
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  readOnly: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  dismiss: { alignItems: 'center', marginTop: spacing.md, paddingVertical: spacing.sm },
  dismissText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.textMuted,
  },
});
