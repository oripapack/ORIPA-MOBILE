import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { sg } from '../../tokens/sg';

interface Props {
  /** surface2 lifts one step (hover/emphasis surface). */
  raised?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}

/** Quiet grouped surface: shape and spacing carry hierarchy without decorative rails. */
export function SgCard({ raised, style, children }: Props) {
  return <View style={[styles.base, raised && styles.raised, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: sg.radius.panel,
    padding: sg.space.md,
    overflow: 'hidden',
  },
  raised: { backgroundColor: sg.surface2 },
});
