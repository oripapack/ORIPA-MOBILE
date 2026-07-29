import React from 'react';
import { StyleSheet, View } from 'react-native';
import { sg } from '../../tokens/sg';

/** Flat N2 night chassis — kept for legacy callers; prefer `SgScreen` on new screens. */
export function HomeBackground() {
  return <View style={styles.wrap} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: sg.bg,
    zIndex: 0,
  },
});
