import React, { useCallback, useState } from 'react';
import { sg } from '../../tokens/sg';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

type Props = {
  onSubmit: (code: string) => Promise<void>;
  disabled?: boolean;
};

export function PromoCodeInput({ onSubmit, disabled }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = useCallback(async () => {
    const code = value.trim();
    if (!code || disabled || busy) return;
    Keyboard.dismiss();
    setBusy(true);
    try {
      await onSubmit(code);
      setValue('');
    } finally {
      setBusy(false);
    }
  }, [value, disabled, busy, onSubmit]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('promotions.codeLabel')}</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={t('promotions.codePlaceholder')}
          placeholderTextColor={sg.muted}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!disabled && !busy}
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.btn, (!value.trim() || busy) && styles.btnDisabled]}
          onPress={submit}
          disabled={!value.trim() || !!disabled || busy}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel={t('promotions.applyCode')}
        >
          {busy ? (
            <ActivityIndicator color={sg.onGold} size="small" />
          ) : (
            <Text style={styles.btnText}>{t('promotions.apply')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.md,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    backgroundColor: sg.surface,
  },
  btn: {
    backgroundColor: sg.gold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnText: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
  },
});
