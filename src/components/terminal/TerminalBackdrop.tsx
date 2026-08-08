import React from 'react';
import { StyleSheet, View } from 'react-native';
import { sg } from '../../tokens/sg';

/** Quiet transit-grid ground used behind every Tokyo Night Terminal screen. */
export function TerminalBackdrop() {
  return (
    <View style={styles.root} pointerEvents="none">
      <View style={styles.leftRail} />
      <View style={styles.rightRail} />
      <View style={styles.topSignal} />
      <View style={styles.crossLineOne} />
      <View style={styles.crossLineTwo} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: sg.bg, overflow: 'hidden' },
  leftRail: {
    position: 'absolute', left: 18, top: 0, bottom: 0, width: 1,
    backgroundColor: sg.backdropRail,
  },
  rightRail: {
    position: 'absolute', right: 18, top: 0, bottom: 0, width: 1,
    backgroundColor: sg.backdropRail,
  },
  topSignal: {
    position: 'absolute', left: 18, top: 0, width: 78, height: 2,
    backgroundColor: sg.gold,
  },
  crossLineOne: {
    position: 'absolute', left: 0, right: 0, top: '33%', height: 1,
    backgroundColor: sg.backdropGrid,
  },
  crossLineTwo: {
    position: 'absolute', left: 0, right: 0, top: '68%', height: 1,
    backgroundColor: sg.backdropGrid,
  },
});
