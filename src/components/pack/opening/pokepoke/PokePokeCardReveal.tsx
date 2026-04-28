import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HeroCardView } from '../HeroCardView';
import { REVEAL_RARITY_VISUAL } from '../rarityTokens';
import type { RevealCard, RevealRarity } from '../types';
import type { PokePokeAnimValues } from './usePokePokeGesture';

/** Rarity → shimmer color palette (ポケポケ holographic look) */
const SHIMMER_COLORS: Record<RevealRarity, readonly [string, string, string, string, string]> = {
  common:     ['transparent', 'rgba(255,255,255,0.18)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0.18)', 'transparent'],
  rare:       ['transparent', 'rgba(147,197,253,0.22)', 'rgba(255,255,255,0.45)', 'rgba(147,197,253,0.22)', 'transparent'],
  ultra_rare: ['transparent', 'rgba(192,132,252,0.28)', 'rgba(255,255,255,0.55)', 'rgba(196,239,255,0.28)', 'transparent'],
  chase:      ['transparent', 'rgba(255,0,128,0.30)',   'rgba(255,255,255,0.60)', 'rgba(64,224,208,0.30)', 'transparent'],
};

interface Props {
  card: RevealCard;
  revealRarity: RevealRarity;
  valueText: string;
  av: PokePokeAnimValues;
}

export function PokePokeCardReveal({ card, revealRarity, valueText, av }: Props) {
  const tv = REVEAL_RARITY_VISUAL[revealRarity];
  const shimmerColors = SHIMMER_COLORS[revealRarity];

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: av.cardOpacity,
          transform: [
            { translateY: av.cardY },
            { scale: av.cardScale },
          ],
        },
      ]}
    >
      {/* Rarity aura behind card */}
      <Animated.View
        style={[
          styles.aura,
          {
            opacity: av.auraOpacity,
            backgroundColor: tv.glow,
            shadowColor: tv.accent,
          },
        ]}
      />

      {/* Card + shimmer overlay */}
      <View style={styles.cardContainer}>
        <HeroCardView card={card} revealRarity={revealRarity} valueText={valueText} />

        {/* Holographic shimmer sweep */}
        {revealRarity !== 'common' ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shimmerWrapper,
              { transform: [{ translateX: av.shimmerX }, { rotate: '20deg' }] },
            ]}
          >
            <LinearGradient
              colors={shimmerColors}
              locations={[0, 0.3, 0.5, 0.7, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmer}
            />
          </Animated.View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  aura: {
    position: 'absolute',
    width: 260,
    height: 340,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 32,
    elevation: 20,
  },
  cardContainer: {
    overflow: 'hidden',
    borderRadius: 14,
    position: 'relative',
  },
  shimmerWrapper: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    width: 100,
  },
  shimmer: {
    flex: 1,
  },
});
