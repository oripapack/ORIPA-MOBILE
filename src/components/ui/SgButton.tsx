import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { sg } from '../../tokens/sg';

interface Props {
  label: string;
  onPress: () => void;
  /**
   * gold — compatibility name for the cobalt primary/value action.
   *        Signal red is a moment color and must never fill a CTA.
   * line — quiet secondary (1px line border, no fill).
   */
  variant?: 'gold' | 'line';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SgButton({ label, onPress, variant = 'gold', disabled, loading, style }: Props) {
  const isGold = variant === 'gold';
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        isGold
          ? [styles.gold, pressed && styles.goldPressed]
          : [styles.line, pressed && styles.linePressed],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled), busy: Boolean(loading) }}
    >
      <View style={styles.labelWrap} pointerEvents="none">
        {loading ? (
          <ActivityIndicator color={isGold ? sg.onGold : sg.text} size="small" />
        ) : (
          <Text style={[styles.label, !isGold && styles.labelLine]}>{label}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: sg.radius.btn,
    paddingVertical: sg.space.md,
    paddingHorizontal: sg.space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gold: { backgroundColor: sg.gold },
  goldPressed: { backgroundColor: sg.goldHi },
  line: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: sg.line,
  },
  linePressed: { backgroundColor: sg.surface2 },
  disabled: { opacity: 0.4 },
  labelWrap: { flexDirection: 'row', alignItems: 'center' },
  label: {
    fontFamily: sg.font.bodyBold,
    fontSize: 16,
    color: sg.onGold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  labelLine: { color: sg.text },
});
