import React from 'react';
import { Pressable, Text, StyleSheet, type ViewStyle } from 'react-native';
import { ph } from '../../tokens/phTheme';
import { brandFont, fontSize } from '../../tokens/typography';

type Variant = 'primary' | 'secondary' | 'ghost';

export function PhButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' && styles.primaryLabel,
          variant === 'secondary' && styles.secondaryLabel,
          variant === 'ghost' && styles.ghostLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ph.radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  primary: { backgroundColor: ph.green },
  secondary: { backgroundColor: ph.surfaceHigh, borderWidth: 1, borderColor: ph.borderMd },
  ghost: { backgroundColor: 'transparent' },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.45 },
  label: { fontSize: fontSize.sm, fontFamily: brandFont.bold },
  primaryLabel: { color: ph.greenInk },
  secondaryLabel: { color: ph.text },
  ghostLabel: { color: ph.textSec },
});
