import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { sg } from '../../tokens/sg';

interface Props {
  /** surface2 lifts one step (hover/emphasis surface). */
  raised?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}

/**
 * N2 panel: surface fill, 1px `line` border (dividers are lines, not
 * shadows — §3), panel radius 13. No per-card shadows; `sg.shadowHero`
 * belongs to at most one hero element per screen, applied by the screen.
 */
export function SgCard({ raised, style, children }: Props) {
  return (
    <View style={[styles.base, raised && styles.raised, style]}>
      {children}
    </View>
  );
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
