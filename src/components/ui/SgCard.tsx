import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { sg, SgLayer } from '../../tokens/sg';

interface Props {
  /** showroom — satin sumi surface. gallery — washi surface + real shadow. */
  layer?: SgLayer;
  /** Showroom only: one sumi step brighter for stacked cards. */
  raised?: boolean;
  /** card 12px (default) / panel 16px for large sheets. */
  kind?: 'card' | 'panel';
  style?: ViewStyle;
  children: React.ReactNode;
}

/**
 * Satin material rule: NO full 1px borders. Elevation on dark reads through
 * the sumi lightness step + a top-edge inset highlight only.
 */
export function SgCard({ layer = 'showroom', raised, kind = 'card', style, children }: Props) {
  return (
    <View
      style={[
        styles.base,
        { borderRadius: kind === 'panel' ? sg.radius.panel : sg.radius.card },
        layer === 'showroom'
          ? [styles.showroom, raised && styles.showroomRaised]
          : styles.gallery,
        style,
      ]}
    >
      {layer === 'showroom' ? <View style={styles.satinTop} pointerEvents="none" /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: sg.space.md,
    overflow: 'hidden',
  },
  showroom: { backgroundColor: sg.showroom.surface },
  showroomRaised: { backgroundColor: sg.showroom.raised },
  satinTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: sg.satinTopHighlight,
  },
  gallery: {
    backgroundColor: sg.gallery.surface,
    ...sg.galleryShadow,
  },
});
