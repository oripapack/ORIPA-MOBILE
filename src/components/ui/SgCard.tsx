import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { sg } from '../../tokens/sg';

interface Props {
  /** surface2 lifts one step (hover/emphasis surface). */
  raised?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Tokyo Arcade Vault panel: acrylic fill, aluminum keyline, and transport rail.
 * `sg.shadowHero` belongs to at most one hero element per screen.
 */
export function SgCard({ raised, style, children }: Props) {
  return (
    <View style={[styles.base, raised && styles.raised, style]}>
      <View style={styles.machineRail} pointerEvents="none">
        <View style={styles.railCobalt} />
        <View style={styles.railTeal} />
        <View style={styles.railSignal} />
      </View>
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
    shadowColor: sg.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  raised: { backgroundColor: sg.surface2 },
  machineRail: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    width: 76,
    flexDirection: 'row',
  },
  railCobalt: { flex: 3, backgroundColor: sg.gold },
  railTeal: { flex: 2, backgroundColor: sg.teal },
  railSignal: { flex: 1, backgroundColor: sg.neon },
});
