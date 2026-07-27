import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { RarityTier } from '../../../shared/types/pack';
import { getCategoryFoil } from '../../../shared/utils/foil';
import { ph } from '../../tokens/phTheme';
import { brandFont } from '../../tokens/typography';
import { sg } from '../../tokens/sg';
import { rankFromRarityLabel } from '../../lib/n2Rarity';

/**
 * N2 §5-2/§6: the colored rarity foils (incl. purple) are removed. The ground
 * is a single achromatic surface2/surface gradient (placeholder until real
 * pack art); rarity now differs ONLY by the 1px border in the §6 rank colors
 * — CHASE neon / HIT gold / BASE muted@50%. The gradient plumbing stays so a
 * §8 foil sweep can ride on it later.
 */
const RANK_BORDER: Record<'chase' | 'hit' | 'base', string> = {
  chase: sg.neon,
  hit: sg.gold,
  base: 'rgba(142,140,133,0.5)', // muted @50%
};

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
  rarityTier = 'epic',
  size = 'md',
}: {
  name: string;
  category: string;
  rarityTier?: RarityTier;
  size?: Size;
}) {
  const catFoil = getCategoryFoil(category);
  const border = RANK_BORDER[rankFromRarityLabel(rarityTier)];
  const d = DIMS[size];

  return (
    <View style={[styles.wrap, { width: d.w, height: d.h, borderColor: border }]}>
      <LinearGradient
        colors={[catFoil.top, catFoil.mid, catFoil.bot]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.seal, { width: '100%' }]} />
      <View style={[styles.art, { height: d.artH, borderColor: border }]} />
      <View style={styles.labelBlock}>
        <Text style={[styles.category, { fontSize: d.fs2 }]}>{category.toUpperCase()}</Text>
        <Text style={[styles.name, { fontSize: d.fs1 }]} numberOfLines={2}>{name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: ph.radius.lg,
    borderWidth: 1, // 1px line rule (§3)
    overflow: 'hidden',
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seal: { height: 5, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 1 },
  art: {
    width: '82%',
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderRadius: 6,
    borderWidth: 1,
  },
  labelBlock: { alignItems: 'center' },
  category: { color: 'rgba(255,255,255,0.45)', fontFamily: brandFont.bold, letterSpacing: 1.4 },
  name: { color: 'rgba(255,255,255,0.92)', fontFamily: brandFont.black, textAlign: 'center', marginTop: 4 },
});
