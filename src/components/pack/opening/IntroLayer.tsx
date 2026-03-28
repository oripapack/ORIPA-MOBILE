import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../tokens/colors';
import { fontSize, fontWeight } from '../../../tokens/typography';
import { spacing } from '../../../tokens/spacing';
import { REVEAL_RARITY_VISUAL } from './rarityTokens';
import { packArtBase } from './sharedStage';
import type { RevealRarity } from './types';

export function IntroLayer({
  opacity,
  scale,
  glow,
  packTint,
  revealRarity,
}: {
  opacity: Animated.Value;
  scale: Animated.Value;
  glow: Animated.Value;
  packTint: string;
  revealRarity: RevealRarity;
}) {
  const tv = REVEAL_RARITY_VISUAL[revealRarity];
  return (
    <Animated.View style={[styles.wrap, { opacity, transform: [{ scale }] }]} pointerEvents="none">
      <Animated.View style={[styles.halo, { borderColor: tv.border, shadowColor: tv.glow, opacity: glow }]} />
      <View style={[packArtBase, { backgroundColor: packTint }]}>
        <Text style={styles.emoji}>🎴</Text>
        <Text style={styles.title}>PULLHUB</Text>
        <Text style={styles.body}>Opening pack...</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 230,
  },
  halo: {
    position: 'absolute',
    width: 220,
    height: 280,
    borderRadius: 18,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 10,
  },
  emoji: {
    fontSize: 44,
    marginBottom: 6,
  },
  title: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    letterSpacing: 4,
  },
  body: {
    marginTop: spacing.md,
    color: 'rgba(255,255,255,0.65)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1,
  },
});
