import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { sgVault } from '../../tokens/sgVault';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import { formatVaultExchangeUsd } from '../../lib/vaultExchange';

const PRESETS = [25, 49, 99, 199, 499] as const;

type Props = {
  visible: boolean;
  /** Hint from coin value / tier — whole USD. */
  suggestedPriceUsd: number;
  onClose: () => void;
  onConfirm: (priceUsd: number) => void;
};

export function ListForSaleModal({ visible, suggestedPriceUsd, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const hint = Math.max(5, Math.round(suggestedPriceUsd));
  const [raw, setRaw] = useState(String(hint));

  useEffect(() => {
    if (!visible) return;
    setRaw(String(Math.max(5, Math.floor(suggestedPriceUsd))));
  }, [visible, suggestedPriceUsd]);

  const parsed = Math.max(1, Math.floor(Number(raw.replace(/[^0-9]/g, '')) || 0));

  return (
    <Modal visible={visible} transparent animationType="fade" {...transparentModalIOSProps}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.card, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Text style={styles.title}>{t('vaultList.title')}</Text>
          <Text style={styles.body}>{t('vaultList.body')}</Text>
          <Text style={styles.label}>{t('vaultList.priceLabel')}</Text>
          <TextInput
            value={raw}
            onChangeText={setRaw}
            keyboardType="number-pad"
            placeholder={t('vaultList.pricePlaceholder')}
            placeholderTextColor={sgVault.muted}
            style={styles.input}
          />
          <View style={styles.presets}>
            {PRESETS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.preset, parsed === p && styles.presetOn]}
                onPress={() => setRaw(String(p))}
              >
                <Text style={[styles.presetText, parsed === p && styles.presetTextOn]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <PrimaryButton
            label={t('vaultList.confirm', { price: formatVaultExchangeUsd(parsed) })}
            onPress={() => onConfirm(parsed)}
            style={styles.cta}
          />
          <SecondaryButton label={t('vaultAsset.close')} onPress={onClose} />
        </View>
      </KeyboardAvoidingView>
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
  title: {
    fontSize: fontSize.xl,
    fontFamily: brandFont.black,
    color: sgVault.text,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: fontSize.sm,
    color: sgVault.muted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: sgVault.muted,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: sgVault.line,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: sgVault.text,
    backgroundColor: sgVault.bg,
    marginBottom: spacing.md,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  preset: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: sgVault.line,
    backgroundColor: sgVault.surface2,
  },
  presetOn: {
    borderColor: sgVault.cobaltBorder,
    backgroundColor: sgVault.cobaltWash,
  },
  presetText: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: sgVault.muted,
  },
  presetTextOn: {
    color: sgVault.gold,
  },
  cta: { marginBottom: spacing.sm },
});
