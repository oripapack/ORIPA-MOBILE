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
 * Smoked terminal panel: sharp chassis, thin steel line, blue signal rail.
 */
export function SgCard({ raised, style, children }: Props) {
  return (
    <View style={[styles.base, raised && styles.raised, style]}>
      <View style={styles.signalRail} pointerEvents="none" />
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
  signalRail: { position: 'absolute', left: 0, top: 0, width: 24, height: 2, backgroundColor: sg.gold },
});
