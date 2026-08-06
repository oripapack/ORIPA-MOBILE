import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RarityTier } from '../../../shared/types/pack';
import { sg } from '../../tokens/sg';
/**
 * Generic Tokyo Arcade Vault package shell. It deliberately avoids third-party
 * logos, card photography and image-like gradients; approved art can replace
 * the labeled media panel later. `rarityTier` stays API-compatible but does not
 * alter the package color because pack rarity is not a verified odds tier.
 */

type Size = 'sm' | 'md' | 'lg' | 'hero';

const DIMS: Record<Size, { w: number; h: number; artH: number; fs1: number; fs2: number }> = {
  sm: { w: 100, h: 140, artH: 64, fs1: 9, fs2: 7 },
  md: { w: 140, h: 196, artH: 90, fs1: 11, fs2: 8 },
  lg: { w: 180, h: 252, artH: 120, fs1: 13, fs2: 9 },
  hero: { w: 220, h: 308, artH: 150, fs1: 15, fs2: 10 },
};

export function PackVisual({
  name,
  category,
  rarityTier: _rarityTier = 'epic',
  size = 'md',
}: {
  name: string;
  category: string;
  /** Kept for API compatibility — has no defined odds-tier membership yet, so it no longer drives color. */
  rarityTier?: RarityTier;
  size?: Size;
}) {
  const d = DIMS[size];

  return (
    <View style={[styles.wrap, { width: d.w, height: d.h }]}>
      <View style={[styles.seal, { width: '100%' }]} />
      <View style={[styles.art, { height: d.artH }]}>
        <Text style={styles.series}>TOKYO SERIES / 01</Text>
        <Text style={styles.pending}>PACK ART{`\n`}PENDING</Text>
        <View style={styles.laneRow}>
          <View style={styles.laneCobalt} />
          <View style={styles.laneTeal} />
          <View style={styles.laneSignal} />
        </View>
      </View>
      <View style={styles.labelBlock}>
        <Text style={[styles.category, { fontSize: d.fs2 }]}>{category.toUpperCase()}</Text>
        <Text style={[styles.name, { fontSize: d.fs1 }]} numberOfLines={2}>{name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: sg.radius.tag,
    borderWidth: 1, // 1px line rule (§3)
    borderColor: sg.ink,
    backgroundColor: sg.ink,
    overflow: 'hidden',
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seal: { height: 5, backgroundColor: sg.chrome, borderRadius: 1 },
  art: {
    width: '82%',
    backgroundColor: sg.surface,
    borderRadius: sg.radius.tag,
    borderWidth: 1,
    borderColor: sg.line,
    alignItems: 'center',
    justifyContent: 'center',
    padding: sg.space.sm,
  },
  series: {
    position: 'absolute',
    top: 6,
    left: 6,
    color: sg.text,
    fontFamily: sg.font.dataBold,
    fontSize: 5,
    letterSpacing: 0.5,
  },
  pending: {
    color: sg.muted,
    fontFamily: sg.font.dataBold,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  laneRow: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    height: 5,
    flexDirection: 'row',
    gap: 2,
  },
  laneCobalt: { flex: 3, backgroundColor: sg.gold },
  laneTeal: { flex: 2, backgroundColor: sg.teal },
  laneSignal: { flex: 1, backgroundColor: sg.neon },
  labelBlock: { alignItems: 'center' },
  category: { color: sg.chrome, fontFamily: sg.font.bodyBold, letterSpacing: 1.4 },
  name: { color: sg.onInk, fontFamily: sg.font.bodyBold, textAlign: 'center', marginTop: 4 },
});
