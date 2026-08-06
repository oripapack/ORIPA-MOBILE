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

/**
 * Shared pack cover. The user-approved Tokyo Pack 01 artwork supplies the foil
 * material, heat-sealed edges and printed face; product name/category remain in
 * surrounding accessible UI rather than being baked into generated variants.
 */
export function PackVisual({
  name,
  category,
  rarityTier: _rarityTier = 'epic',
  size = 'md',
}: {
  name: string;
  category: string;
  /** Kept for API compatibility; verified odds tiers are rendered separately. */
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
      <Image
        source={TOKYO_PACK_IMAGE}
        style={styles.image}
        resizeMode="contain"
        accessible={false}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    resizeMode: 'contain',
  },
});
