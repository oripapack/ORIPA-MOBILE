import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fontSize, fontWeight } from '../../../tokens/typography';
import { radius, spacing } from '../../../tokens/spacing';
import { REVEAL_RARITY_VISUAL } from './rarityTokens';
import { HERO_CARD_STOCK } from './heroVisualTokens';
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
    <View style={[styles.shell, { borderColor: 'rgba(255,255,255,0.14)' }]}>
      {/* Physical edge: outer bevel + cool rim light */}
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)', 'rgba(0,0,0,0.35)']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.outerBevel}
      />
      <View style={[styles.raritySpine, { backgroundColor: tv.accent }]} />

      <View style={styles.innerStock}>
        <View style={[styles.artWindow, { borderColor: `${tv.accent}33` }]}>
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)']}
            style={styles.artVignette}
            pointerEvents="none"
          />
          <View style={[styles.artField, { backgroundColor: card.color }]}>
            <Text style={styles.artEmoji}>{card.image}</Text>
          </View>
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.nameLabel}>Card</Text>
          <Text style={styles.name} numberOfLines={2}>
            {card.name}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={[styles.rarityPill, { borderColor: `${tv.accent}55` }]}>
            <Text style={[styles.rarityText, { color: tv.accent }]}>{tv.label}</Text>
          </View>
          <View style={styles.valueCol}>
            <Text style={styles.estLabel}>Est. value</Text>
            <Text style={[styles.valueNum, { color: HERO_CARD_STOCK.nameplate }]} numberOfLines={1}>
              {valueText}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/** Trading-card–like slab (width:height ≈ 1 : 1.35). Fixed width so `%` never collapses inside 3D transforms. */
export const HERO_CARD_WIDTH = 300;

const styles = StyleSheet.create({
  shell: {
    width: HERO_CARD_WIDTH,
    maxWidth: '100%',
    alignSelf: 'center',
    borderRadius: radius.lg + 2,
    borderWidth: 1,
    backgroundColor: HERO_CARD_STOCK.frameOuter,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 18,
    overflow: 'hidden',
  },
  outerBevel: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
    pointerEvents: 'none',
  },
  raritySpine: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 4,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    zIndex: 2,
  },
  innerStock: {
    marginLeft: 5,
    marginRight: 4,
    marginVertical: 4,
    borderRadius: radius.lg,
    padding: spacing.md,
    paddingLeft: spacing.md + 2,
    paddingBottom: spacing.md + 2,
    backgroundColor: HERO_CARD_STOCK.stock,
    gap: spacing.sm,
  },
  artWindow: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#020617',
    width: '100%',
    height: 152,
  },
  artVignette: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  artField: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artEmoji: {
    fontSize: 56,
  },
  nameBlock: {
    gap: 4,
  },
  nameLabel: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: HERO_CARD_STOCK.micro,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: HERO_CARD_STOCK.nameplate,
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'nowrap',
  },
  rarityPill: {
    flexShrink: 0,
    maxWidth: '52%',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rarityText: {
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 1.2,
  },
  valueCol: {
    flexShrink: 1,
    flexGrow: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 96,
    maxWidth: '48%',
  },
  estLabel: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: HERO_CARD_STOCK.micro,
    letterSpacing: 0.8,
    marginBottom: 2,
    textAlign: 'right',
  },
  valueNum: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    letterSpacing: -0.3,
    textAlign: 'right',
  },
});
