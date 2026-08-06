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
    marginTop: sg.space.md,
  },
  label: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 0.6,
    marginBottom: sg.space.sm,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: sg.space.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: sg.radius.btn,
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.md,
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
    backgroundColor: sg.surface,
  },
  btn: {
    backgroundColor: sg.gold,
    borderRadius: sg.radius.btn,
    paddingHorizontal: sg.space.lg,
    paddingVertical: sg.space.md,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnText: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
  },
});
