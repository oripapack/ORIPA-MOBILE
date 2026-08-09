import React from 'react';
import { StyleSheet, View } from 'react-native';
import { sg } from '../../tokens/sg';

/** Quiet OLED ground. Structure comes from content hierarchy, not decorative rails. */
export function TerminalBackdrop() {
  return <View style={styles.root} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: sg.bg },
});
