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
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import { formatVaultExchangeUsd } from '../../lib/vaultExchange';

const PRESETS = [25, 49, 99, 199, 499] as const;

type Props = {
  visible: boolean;
  /** Hint from the internal Point value / tier — whole USD. */
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
        <View style={[styles.card, { paddingBottom: insets.bottom + sgVault.space.lg }]}>
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
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  card: {
    backgroundColor: sgVault.surface,
    borderTopLeftRadius: sgVault.radius.panel,
    borderTopRightRadius: sgVault.radius.panel,
    padding: sgVault.space.lg,
    borderTopWidth: 1,
    borderColor: sgVault.line,
  },
  title: {
    fontSize: 24,
    fontFamily: sgVault.font.display,
    color: sgVault.text,
    marginBottom: sgVault.space.sm,
  },
  body: {
    fontSize: 13,
    color: sgVault.muted,
    lineHeight: 20,
    marginBottom: sgVault.space.lg,
  },
  label: {
    fontSize: 11,
    fontFamily: sgVault.font.dataBold,
    color: sgVault.muted,
    marginBottom: sgVault.space.xs,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: sgVault.line,
    borderRadius: sgVault.radius.btn,
    paddingVertical: sgVault.space.md,
    paddingHorizontal: sgVault.space.md,
    fontSize: 18,
    fontFamily: sgVault.font.dataBold,
    color: sgVault.text,
    backgroundColor: sgVault.bg,
    marginBottom: sgVault.space.md,
    fontVariant: [...sgVault.numeric],
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sgVault.space.sm,
    marginBottom: sgVault.space.lg,
  },
  preset: {
    paddingVertical: sgVault.space.sm,
    paddingHorizontal: sgVault.space.md,
    borderRadius: sgVault.radius.tag,
    borderWidth: 1,
    borderColor: sgVault.line,
    backgroundColor: sgVault.surface2,
  },
  presetOn: {
    borderColor: 'rgba(212,175,55,0.38)',
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  presetText: {
    fontSize: 11,
    fontFamily: sgVault.font.dataBold,
    color: sgVault.muted,
    fontVariant: [...sgVault.numeric],
  },
  presetTextOn: {
    color: sgVault.gold,
  },
  cta: { marginBottom: sgVault.space.sm },
});
