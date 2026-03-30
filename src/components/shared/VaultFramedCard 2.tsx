import React, { type ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../tokens/colors';
import { radius, spacing } from '../../tokens/spacing';

const BR = 10;

const GRADIENTS = {
  /** Default — deep blue vault + holo edge */
  vault: ['rgba(14,22,40,0.98)', 'rgba(8,12,22,0.99)'] as const,
  /** Deeper void — featured / emphasis */
  felt: ['rgba(6,10,20,0.98)', 'rgba(3,6,14,0.99)'] as const,
};

export type VaultFill = keyof typeof GRADIENTS;

export type VaultFramedCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  fill?: VaultFill;
};

/**
 * Shared “display case” frame: left gold rail + corner brackets + gradient fill.
 * Use for primary content blocks so the app reads as one premium system.
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
    borderColor: colors.accentBorder,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 10,
  },
  rail: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 3,
    backgroundColor: colors.accent,
    opacity: 0.55,
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
    borderColor: 'rgba(56, 189, 248, 0.28)',
    zIndex: 1,
  },
  inner: {
    padding: spacing.lg,
    paddingLeft: spacing.lg + 6,
  },
});
