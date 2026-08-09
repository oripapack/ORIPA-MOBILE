import React from 'react';
import { Pressable, Text, StyleSheet, View, ViewStyle, ActivityIndicator } from 'react-native';
import { sg } from '../../tokens/sg';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';

interface Props {
  label: string;
  onPress: () => void;
  /**
   * gold — the one value/primary CTA per screen.
   * line — quiet secondary (1px line border, no fill).
   */
  variant?: 'gold' | 'line';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function SgButton({ label, onPress, variant = 'gold', disabled, loading, style }: Props) {
  const isGold = variant === 'gold';
  const reduceMotion = useReducedMotionPreference();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        isGold ? [styles.gold, pressed && styles.goldPressed] : styles.line,
        pressed && styles.pressed,
        pressed && !reduceMotion && styles.pressedScale,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
    >
      <View style={styles.labelWrap} pointerEvents="none">
        {loading ? (
          <ActivityIndicator color={isGold ? sg.onValue : sg.text} size="small" />
        ) : (
          <Text style={[styles.label, !isGold && styles.labelLine]}>{label}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: sg.radius.btn,
    minHeight: sg.component.buttonPrimary.height,
    paddingVertical: 14,
    paddingHorizontal: sg.space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gold: {
    backgroundColor: sg.value,
  },
  goldPressed: { backgroundColor: sg.valueHi },
  line: {
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
  },
  pressed: { opacity: 0.88 },
  pressedScale: { transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.4 },
  labelWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  label: {
    fontFamily: sg.font.bodyBold,
    fontSize: 16,
    color: sg.onValue,
    letterSpacing: 0.1,
  },
  labelLine: { color: sg.text },
});
