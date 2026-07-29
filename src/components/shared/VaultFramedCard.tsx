import React, { type ReactNode } from 'react';
import { sg } from '../../tokens/sg';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radius, spacing } from '../../tokens/spacing';

const BR = 10;

const GRADIENTS = {
  /** Default — dark satin mat with gallery depth */
  vault: ['rgba(36, 30, 58, 0.97)', 'rgba(22, 18, 42, 0.99)'] as const,
  /** Featured — warmer plum panel */
  felt: ['rgba(42, 34, 64, 0.99)', 'rgba(28, 24, 48, 0.98)'] as const,
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
    borderColor: sg.line,
    shadowColor: 'rgba(0,0,0,0.72)',
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
    backgroundColor: sg.neon,
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
    borderColor: sg.line,
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
    borderColor: sg.line,
    zIndex: 1,
  },
  inner: {
    padding: spacing.lg,
    paddingLeft: spacing.lg + 6,
  },
});
