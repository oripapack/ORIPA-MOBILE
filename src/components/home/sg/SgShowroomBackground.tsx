import React from 'react';
import { View, StyleSheet } from 'react-native';
import { sg } from '../../../tokens/sg';

/**
 * Screen ground — N2: the ground is pure night (`bg` #000000, §1/§3).
 * The old warm-spotlight lighting rig is removed; light now comes only from
 * surfaces sitting on the night, not from a scene lamp.
 */
export function SgShowroomBackground() {
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: sg.bg }]}
      pointerEvents="none"
    />
  );
}
