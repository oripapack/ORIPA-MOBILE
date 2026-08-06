import React from 'react';
import { Pressable, Text, StyleSheet, View, ViewStyle, ActivityIndicator } from 'react-native';
import { sg } from '../../tokens/sg';

interface Props {
  label: string;
  onPress: () => void;
  /**
   * gold — the ONE cobalt primary CTA per screen (legacy variant name).
   * line — quiet secondary (1px line border, no fill).
   */
  variant?: 'gold' | 'line';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function SgButton({ label, onPress, variant = 'gold', disabled, loading, style }: Props) {
  const isGold = variant === 'gold';
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        isGold ? [styles.gold, pressed && styles.goldPressed] : styles.line,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.labelWrap} pointerEvents="none">
        {loading ? (
          <ActivityIndicator color={isGold ? sg.onGold : sg.text} size="small" />
        ) : (
          <>
            <Text style={[styles.label, !isGold && styles.labelLine]}>{label}</Text>
            {isGold ? <Text style={styles.arrow}>→</Text> : null}
          </>
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
    backgroundColor: sg.gold,
    borderWidth: 1,
    borderColor: sg.goldHi,
    ...sg.glowCobalt,
  },
  goldPressed: { backgroundColor: sg.goldHi },
  line: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: sg.line,
  },
  disabled: { opacity: 0.4 },
  labelWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  label: {
    fontFamily: sg.font.label,
    fontSize: 14,
    color: sg.onGold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  labelLine: { color: sg.text },
  arrow: { fontFamily: sg.font.bodyBold, fontSize: 20, lineHeight: 22, color: sg.onGold },
});
