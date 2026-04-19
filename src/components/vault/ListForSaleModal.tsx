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
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';

const PRESETS = [100, 250, 500, 1000, 2500] as const;

type Props = {
  visible: boolean;
  suggestedCredits: number;
  onClose: () => void;
  onConfirm: (priceCredits: number) => void;
};

export function ListForSaleModal({ visible, suggestedCredits, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [raw, setRaw] = useState(String(Math.max(100, suggestedCredits)));

  useEffect(() => {
    if (!visible) return;
    setRaw(String(Math.max(100, Math.floor(suggestedCredits))));
  }, [visible, suggestedCredits]);

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
            placeholderTextColor={colors.textMuted}
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
            label={t('vaultList.confirm', { coins: parsed.toLocaleString() })}
            variant="red"
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
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    backgroundColor: colors.background,
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
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceMuted,
  },
  presetOn: {
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentSoft,
  },
  presetText: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: colors.textSecondary,
  },
  presetTextOn: {
    color: colors.accentDark,
  },
  cta: { marginBottom: spacing.sm },
});
