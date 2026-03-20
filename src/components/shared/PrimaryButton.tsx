import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'red' | 'black';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({ label, onPress, variant = 'black', disabled, loading, style }: Props) {
  const bg = variant === 'red' ? colors.red : colors.nearBlack;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bg }, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  label: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.4,
  },
});
