import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { sgVault } from '../../tokens/sgVault';
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
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: sgVault.modalScrim },
  card: {
    backgroundColor: sgVault.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderColor: sgVault.line,
  },
  kicker: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: sgVault.gold,
    letterSpacing: 1.1,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: brandFont.black,
    color: sgVault.text,
    marginBottom: spacing.sm,
  },
  item: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: sgVault.muted,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: fontSize.xxl,
    fontFamily: brandFont.black,
    color: sgVault.text,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: fontSize.sm,
    color: sgVault.muted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  primary: { marginBottom: spacing.sm },
});
