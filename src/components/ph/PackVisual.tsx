import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { RarityTier } from '../../../shared/types/pack';

const TOKYO_PACK_IMAGE = require('../../../assets/home/tokyo-pack-01.png');

type Size = 'sm' | 'md' | 'lg' | 'hero';

const DIMS: Record<Size, { w: number; h: number }> = {
  sm: { w: 100, h: 140 },
  md: { w: 140, h: 196 },
  lg: { w: 180, h: 252 },
  hero: { w: 220, h: 308 },
};

/** User-approved, original Pull Hub foil pack artwork shared across the app. */
export function PackVisual({
  name,
  category,
  rarityTier: _rarityTier = 'epic',
  size = 'md',
}: {
  name: string;
  category: string;
  rarityTier?: RarityTier;
  size?: Size;
}) {
  const d = DIMS[size];

  return (
    <View
      style={[styles.wrap, { width: d.w, height: d.h }]}
      accessibilityRole="image"
      accessibilityLabel={`${name} · ${category} pack`}
    >
      <Image source={TOKYO_PACK_IMAGE} style={styles.image} resizeMode="contain" accessible={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
});
