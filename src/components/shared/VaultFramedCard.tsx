import React, { type ReactNode } from 'react';
import { sg } from '../../tokens/sg';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

const BR = 10;

const FILLS = {
  vault: sg.surface,
  felt: sg.surface2,
};

export type VaultFill = keyof typeof FILLS;

export type VaultFramedCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  fill?: VaultFill;
};

/**
 * N2 collection frame: a flat trust surface with restrained inset keylines.
 * No decorative gradient, permanent neon rail, or per-card shadow.
 */
export function VaultFramedCard({ children, style, contentStyle, fill = 'vault' }: VaultFramedCardProps) {
  return (
    <View style={[styles.outer, { backgroundColor: FILLS[fill] }, style]}>
      <View style={styles.topKeyline} />
      <View style={styles.bracketTL} />
      <View style={styles.bracketBR} />
      <View style={[styles.inner, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: sg.radius.panel,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: sg.line,
  },
  topKeyline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    backgroundColor: sg.muted,
    opacity: 0.2,
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
    padding: sg.space.md,
  },
});
