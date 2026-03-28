import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../tokens/colors';
import { fontSize, fontWeight } from '../../../tokens/typography';
import { radius, spacing } from '../../../tokens/spacing';
import { REVEAL_RARITY_VISUAL } from './rarityTokens';
import type { RevealCard, RevealRarity } from './types';

export function HeroCardView({
  card,
  revealRarity,
  valueText,
}: {
  card: RevealCard;
  revealRarity: RevealRarity;
  valueText: string;
}) {
  const tv = REVEAL_RARITY_VISUAL[revealRarity];
  return (
    <View style={[styles.outer, { borderColor: tv.border, shadowColor: tv.glow }]}>
      <View style={[styles.inner, { backgroundColor: 'rgba(2,6,23,0.92)' }]}>
        <View style={[styles.art, { backgroundColor: card.color }]}>
          <Text style={styles.artEmoji}>{card.image}</Text>
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {card.name}
        </Text>

        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: tv.ovrBg }]}>
            <Text style={styles.badgeText}>{tv.label}</Text>
          </View>
          <Text style={[styles.value, { color: tv.accent }]} numberOfLines={1}>
            {valueText}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    maxWidth: 320,
    borderRadius: radius.xl,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 26,
    elevation: 16,
    backgroundColor: 'rgba(2,6,23,0.7)',
  },
  inner: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  art: {
    height: 170,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  artEmoji: {
    fontSize: 64,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.white,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeight.black,
    letterSpacing: 1.6,
  },
  value: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    letterSpacing: -0.2,
  },
});

