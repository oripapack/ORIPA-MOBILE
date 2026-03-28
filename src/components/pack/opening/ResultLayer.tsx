import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../tokens/colors';
import { fontSize, fontWeight } from '../../../tokens/typography';
import type { PackRollResult, RevealRarity } from './types';
import { REVEAL_RARITY_VISUAL } from './rarityTokens';

export function ResultLayer({
  roll,
  revealRarity,
  valueOpacity,
}: {
  roll: PackRollResult;
  revealRarity: RevealRarity;
  valueOpacity: Animated.Value;
}) {
  const tv = REVEAL_RARITY_VISUAL[revealRarity];
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.label}>ESTIMATED VALUE</Text>
      <Animated.Text style={[styles.value, { opacity: valueOpacity, color: tv.accent }]}>
        {roll.creditsWon.toLocaleString()} CR
      </Animated.Text>
      <Text style={styles.subtitle}>{tv.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    alignItems: 'center',
    zIndex: 30,
  },
  label: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    letterSpacing: 1.3,
    color: colors.textMuted,
  },
  value: {
    marginTop: 4,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 1.1,
  },
});
