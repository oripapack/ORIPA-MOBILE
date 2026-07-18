import React from 'react';
import { Pressable, Text, StyleSheet, View, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { sg } from '../../tokens/sg';

interface Props {
  label: string;
  onPress: () => void;
  /**
   * shu  — primary CTA (朱). At most ONE per screen. Semi-gloss by rule:
   *        top 7% white gradient + inset top-edge highlight + dark shadow.
   * line — quiet secondary (hairline outline on dark surfaces).
   * Brass and jade are NOT button colors (rarity/decor and status text only).
   */
  variant?: 'shu' | 'line';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function SgButton({ label, onPress, variant = 'shu', disabled, loading, style }: Props) {
  const isShu = variant === 'shu';
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        isShu
          ? [styles.shu, pressed && styles.shuPressed, !disabled && sg.ctaShadow]
          : styles.line,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {isShu ? (
        <>
          {/* Semi-gloss: top sheen fading out by ~55% height */}
          <LinearGradient
            colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0)']}
            locations={[0, 0.55]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          {/* Inset top-edge highlight */}
          <View style={styles.topEdge} pointerEvents="none" />
        </>
      ) : null}
      <View style={styles.labelWrap} pointerEvents="none">
        {loading ? (
          <ActivityIndicator color={isShu ? sg.onShu : sg.showroom.text} size="small" />
        ) : (
          <Text style={[styles.label, !isShu && styles.labelLine]}>{label}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: sg.radius.control,
    paddingVertical: sg.space.md,
    paddingHorizontal: sg.space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shu: { backgroundColor: sg.shu },
  shuPressed: { backgroundColor: sg.shuHover },
  line: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(232,229,222,0.16)',
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  disabled: { opacity: 0.4 },
  labelWrap: { flexDirection: 'row', alignItems: 'center' },
  label: {
    fontFamily: sg.font.bodyBold,
    fontSize: 16,
    color: sg.onShu,
    letterSpacing: 0.2,
  },
  labelLine: { color: sg.showroom.text },
});
