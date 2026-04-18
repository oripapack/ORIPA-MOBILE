import React, { type ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../tokens/colors';
import { radius, spacing } from '../../tokens/spacing';

const BR = 10;

const GRADIENTS = {
  /** Default — white mat with soft depth */
  vault: ['rgba(255,255,255,0.98)', 'rgba(245,242,235,0.99)'] as const,
  /** Featured — warm rag panel */
  felt: ['rgba(255,252,248,0.99)', 'rgba(232,228,220,0.98)'] as const,
};

export type VaultFill = keyof typeof GRADIENTS;

export type VaultFramedCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  fill?: VaultFill;
};

/**
 * Display-case frame: ink rail + corner brackets + soft paper fill.
 */
export function VaultFramedCard({ children, style, contentStyle, fill = 'vault' }: VaultFramedCardProps) {
  const grad = GRADIENTS[fill];
  return (
    <View style={[styles.outer, style]}>
      <LinearGradient colors={[...grad]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.rail} />
      <View style={styles.bracketTL} />
      <View style={styles.bracketBR} />
      <View style={[styles.inner, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 6,
  },
  rail: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 3,
    backgroundColor: colors.accent,
    opacity: 0.45,
    zIndex: 2,
  },
  bracketTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: BR,
    height: BR,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: colors.accentBorder,
    zIndex: 1,
  },
  bracketBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: BR,
    height: BR,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: colors.accentBorder,
    zIndex: 1,
  },
  inner: {
    padding: spacing.lg,
    paddingLeft: spacing.lg + 6,
  },
});
