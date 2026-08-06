import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RarityTier } from '../../../shared/types/pack';
import { sg } from '../../tokens/sg';
/**
 * N2 §5-2/§6: the colored rarity foils (incl. purple) are removed. The ground
 * is a single achromatic surface2/surface gradient (placeholder until real
 * pack art). Tier chrome follows the SINGLE mapping path (§6 v2.2, see
 * src/lib/n2Rarity.ts); pack-level `rarityTier` (legacy card enum) has NO
 * defined tier membership, so its tier state is UNKNOWN — the frame shows NO
 * tier chrome, just the standard 1px `line` border (a low tier would falsely
 * claim "judged low"). The gradient plumbing stays so a §8 foil sweep can
 * ride on it later.
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
        <Text style={styles.pending}>PACK ART{`\n`}PENDING</Text>
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
    borderRadius: sg.radius.panel,
    borderWidth: 1, // 1px line rule (§3)
    borderColor: sg.line,
    backgroundColor: sg.surface2,
    overflow: 'hidden',
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seal: { height: 5, backgroundColor: sg.line, borderRadius: sg.radius.tag },
  art: {
    width: '82%',
    backgroundColor: sg.surface,
    borderRadius: sg.radius.tag,
    borderWidth: 1,
    borderColor: sg.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pending: {
    color: sg.muted,
    fontFamily: sg.font.dataBold,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  labelBlock: { alignItems: 'center' },
  category: { color: sg.muted, fontFamily: sg.font.bodyBold, letterSpacing: 1.4 },
  name: { color: sg.text, fontFamily: sg.font.bodyBold, textAlign: 'center', marginTop: 4 },
});
