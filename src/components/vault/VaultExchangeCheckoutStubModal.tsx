import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { sgVault } from '../../tokens/sgVault';
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
};

export function VaultExchangeCheckoutStubModal({
  visible,
  itemTitle,
  listPriceUsd,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" {...transparentModalIOSProps}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.card, { paddingBottom: insets.bottom + sgVault.space.lg }]}>
          <Text style={styles.kicker}>{t('vaultExchange.checkoutKicker')}</Text>
          <Text style={styles.title}>{t('vaultExchange.checkoutTitle')}</Text>
          <Text style={styles.item} numberOfLines={2}>
            {itemTitle}
          </Text>
          <Text style={styles.price}>{formatVaultExchangeUsd(listPriceUsd)}</Text>
          <Text style={styles.body}>{t('vaultExchange.checkoutBody')}</Text>
          <PrimaryButton
            label={t('vaultExchange.checkoutSimulateCta')}
            onPress={onClose}
            disabled
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
    backgroundColor: sgVault.surface,
    borderTopLeftRadius: sgVault.radius.panel,
    borderTopRightRadius: sgVault.radius.panel,
    padding: sgVault.space.lg,
    borderTopWidth: 1,
    borderColor: sgVault.line,
  },
  kicker: {
    fontSize: sgVault.type.xs,
    fontFamily: sgVault.font.bodyBold,
    color: sgVault.gold,
    letterSpacing: 1.1,
    marginBottom: sgVault.space.xs,
  },
  title: {
    fontSize: sgVault.type.xl,
    fontFamily: sgVault.font.display,
    color: sgVault.text,
    marginBottom: sgVault.space.sm,
  },
  item: {
    fontSize: sgVault.type.sm,
    fontFamily: sgVault.font.bodyMedium,
    color: sgVault.muted,
    marginBottom: sgVault.space.xs,
  },
  price: {
    fontSize: sgVault.type.xxl,
    fontFamily: sgVault.font.dataBold,
    fontVariant: ['tabular-nums'],
    color: sgVault.text,
    marginBottom: sgVault.space.md,
  },
  body: {
    fontSize: sgVault.type.sm,
    color: sgVault.muted,
    lineHeight: 22,
    marginBottom: sgVault.space.lg,
  },
  primary: { marginBottom: sgVault.space.sm },
});
