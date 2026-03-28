import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { RevealResultCard } from './RevealResultCard';
import type { PackRollResult, RevealRarity } from './types';

export function RevealLayer({
  roll,
  revealRarity,
  dimOpacity,
  flashOpacity,
  rotate,
  floatY,
}: {
  roll: PackRollResult;
  revealRarity: RevealRarity;
  dimOpacity: Animated.Value;
  flashOpacity: Animated.Value;
  rotate: Animated.Value;
  floatY: Animated.Value;
}) {
  const rotateStr = rotate.interpolate({
    inputRange: [0, 90],
    outputRange: ['0deg', '90deg'],
  });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.dim, { opacity: dimOpacity }]} />
      <Animated.View style={[styles.flash, { opacity: flashOpacity }]} />
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ perspective: 1200 }, { rotateX: rotateStr }, { translateY: floatY }] }}>
          <RevealResultCard creditsWon={roll.creditsWon} resultText={roll.result} revealRarity={revealRarity} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,1)',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
