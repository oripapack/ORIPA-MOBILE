import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, ActivityIndicator } from 'react-native';
import { sg } from '../../tokens/sg';

interface Props {
  label: string;
  onPress: () => void;
  /** @deprecated Prefer the default cobalt CTA. `red` maps to line/secondary. */
  variant?: 'red' | 'black' | 'gold' | 'line';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

/** Tokyo Arcade Vault primary CTA — cobalt fill and porcelain label. */
export function PrimaryButton({ label, onPress, variant = 'gold', disabled, loading, style }: Props) {
  const isLine = variant === 'red' || variant === 'line';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isLine ? styles.line : styles.gold,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.88}
    >
      <View style={styles.labelWrap} pointerEvents="none">
        {loading ? (
          <ActivityIndicator color={isLine ? sg.text : sg.onGold} size="small" />
        ) : (
          <Text style={[styles.label, isLine && styles.labelLine]}>{label}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: sg.radius.btn,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: sg.space.md,
    paddingHorizontal: sg.space.lg,
  },
  gold: {
    backgroundColor: sg.gold,
  },
  line: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: sg.line,
  },
  labelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: sg.onGold,
    fontSize: 16,
    fontFamily: sg.font.bodyBold,
    letterSpacing: 0.2,
  },
  labelLine: {
    color: sg.text,
  },
  disabled: {
    opacity: 0.4,
  },
});
