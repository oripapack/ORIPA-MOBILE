import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { fontWeight } from '../../../tokens/typography';
import { radius, spacing } from '../../../tokens/spacing';
import type { RevealCard } from './types';
import { REVEAL_RARITY_VISUAL } from './rarityTokens';

const CARD_W = 86;
const GAP = 10;
const CARD_H = 112;

function StripCard({ card, dimmed }: { card: RevealCard; dimmed: boolean }) {
  const tv = REVEAL_RARITY_VISUAL[card.rarity];
  return (
    <View
      style={[
        styles.stripCard,
        {
          borderColor: tv.border,
          shadowColor: tv.glow,
          opacity: dimmed ? 0.45 : 1,
        },
      ]}
    >
      <View style={[styles.cardArt, { backgroundColor: card.color }]}>
        <Text style={styles.cardEmoji}>{card.image}</Text>
      </View>
      <Text style={styles.cardName} numberOfLines={1}>
        {card.name}
      </Text>
    </View>
  );
}

export function ReelLayer({
  strip,
  winIndex,
  x,
  opacity,
}: {
  strip: RevealCard[];
  winIndex: number;
  x: Animated.Value;
  opacity: Animated.Value;
}) {
  return (
    <Animated.View style={[styles.wrap, { opacity }]}>
      <View style={styles.mask}>
        <Animated.View style={[styles.stripRow, { transform: [{ translateX: x }] }]}>
          {strip.map((card, i) => (
            <StripCard key={`${card.id}-${i}`} card={card} dimmed={i !== winIndex} />
          ))}
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
  },
  mask: {
    width: '100%',
    height: CARD_H + 56,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  stripRow: {
    flexDirection: 'row',
    gap: GAP,
    paddingVertical: spacing.sm,
  },
  stripCard: {
    width: CARD_W,
    borderRadius: radius.md,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 6,
    padding: 4,
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  cardArt: {
    height: 64,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardName: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: 'rgba(248,250,252,0.75)',
    textAlign: 'center',
  },
});
