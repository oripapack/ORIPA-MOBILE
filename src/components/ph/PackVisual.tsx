import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { RarityTier } from '../../../shared/types/pack';
import { getCategoryFoil } from '../../../shared/utils/foil';
import { ph } from '../../tokens/phTheme';
import { brandFont } from '../../tokens/typography';

const RARITY_FOIL: Record<RarityTier, { top: string; mid: string; bot: string; border: string }> = {
  common: { top: '#1e293b', mid: '#334155', bot: '#1e293b', border: 'rgba(148,163,184,0.22)' },
  rare: { top: '#0f2040', mid: '#1e4080', bot: '#0f2040', border: 'rgba(96,165,250,0.32)' },
  epic: { top: '#1a0f30', mid: '#3d1e6e', bot: '#1a0f30', border: 'rgba(168,85,247,0.36)' },
  legendary: { top: '#281400', mid: '#5c3000', bot: '#1a0d00', border: 'rgba(245,158,11,0.40)' },
  mythic: { top: '#200d18', mid: '#5c1a38', bot: '#200d18', border: 'rgba(236,72,153,0.38)' },
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
  const f = RARITY_FOIL[rarityTier] ?? catFoil;
  const d = DIMS[size];

  return (
    <View style={[styles.wrap, { width: d.w, height: d.h, borderColor: f.border }]}>
      <LinearGradient
        colors={[f.top, f.mid, f.bot]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.seal, { width: '100%' }]} />
      <View style={[styles.art, { height: d.artH, borderColor: `${f.border}` }]} />
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
    borderWidth: 1.5,
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
