import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import { formatVaultExchangeUsd } from '../../lib/vaultExchange';

type Props = {
  visible: boolean;
  /** Card / item title for context. */
  itemTitle: string;
  listPriceUsd: number;
  onClose: () => void;
  /** Demo: completes purchase without real PSP (production: Stripe PaymentSheet). */
  onSimulatePaid: () => void;
};

export function VaultExchangeCheckoutStubModal({
  visible,
  itemTitle,
  listPriceUsd,
  onClose,
  onSimulatePaid,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" {...transparentModalIOSProps}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.card, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Text style={styles.kicker}>{t('vaultExchange.checkoutKicker')}</Text>
          <Text style={styles.title}>{t('vaultExchange.checkoutTitle')}</Text>
          <Text style={styles.item} numberOfLines={2}>
            {itemTitle}
          </Text>
          <Text style={styles.price}>{formatVaultExchangeUsd(listPriceUsd)}</Text>
          <Text style={styles.body}>{t('vaultExchange.checkoutBody')}</Text>
          <PrimaryButton
            label={t('vaultExchange.checkoutSimulateCta', { price: formatVaultExchangeUsd(listPriceUsd) })}
            onPress={onSimulatePaid}
            style={styles.primary}
          />
          <SecondaryButton label={t('vaultExchange.checkoutCancel')} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  kicker: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: colors.gold,
    letterSpacing: 1.1,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  item: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: fontSize.xxl,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  primary: { marginBottom: spacing.sm },
});
