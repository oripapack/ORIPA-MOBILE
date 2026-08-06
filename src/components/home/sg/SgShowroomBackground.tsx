import React from 'react';
import { View, StyleSheet } from 'react-native';
import { sg } from '../../../tokens/sg';

/**
 * Tokyo Arcade Vault screen ground — flat porcelain keeps the product bay crisp.
 * Depth comes from acrylic panels and the single hero chassis, not a decorative
 * background image.
 */
export function SgShowroomBackground() {
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: sg.bg }]}
      pointerEvents="none"
    />
  );
}
