import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../../../tokens/sg';
import { fontSize } from '../../../tokens/typography';
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
  const { t } = useTranslation();
  const tv = REVEAL_RARITY_VISUAL[revealRarity];
  return (
    <Animated.View style={[styles.wrap, { opacity, transform: [{ scale }] }]} pointerEvents="none">
      <Animated.View style={[styles.halo, { borderColor: tv.border, shadowColor: tv.glow, opacity: glow }]} />
      <View style={[packArtBase, { backgroundColor: packTint }]}>
        <Text style={styles.emoji}>🎴</Text>
        <Text style={styles.title}>{t('packOpeningEngine.brandTitle')}</Text>
        <Text style={styles.body}>{t('packOpeningEngine.openingPack')}</Text>
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
    color: sg.text,
    fontSize: fontSize.lg,
    fontFamily: sg.font.bodyBold,
    letterSpacing: 4,
  },
  body: {
    marginTop: sg.space.md,
    color: sg.muted,
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    letterSpacing: 1,
  },
});
