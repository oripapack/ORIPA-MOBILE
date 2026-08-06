import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { RarityTier } from '../../../shared/types/pack';
import { sg } from '../../tokens/sg';
import { PackVisual } from '../ph/PackVisual';

const CHAMBER_IMAGE = require('../../../assets/home/tokyo-arcade-vault-chamber.png');

type Props = {
  name: string;
  category: string;
  rarityTier?: RarityTier;
  variant?: 'home' | 'detail';
};

/**
 * User-supplied Tokyo Arcade Vault chamber with a generic, unlicensed pack
 * shell layered above it. The source image is intentionally used as artwork,
 * not recreated with gradients or synthetic CSS lighting.
 */
export function TokyoArcadePackCover({
  name,
  category,
  rarityTier = 'epic',
  variant = 'home',
}: Props) {
  const detail = variant === 'detail';

  return (
    <View
      style={[styles.frame, detail ? styles.detailFrame : styles.homeFrame]}
      accessibilityRole="image"
      accessibilityLabel={`${name} pack in Tokyo Arcade Vault display`}
    >
      <Image
        source={CHAMBER_IMAGE}
        style={styles.chamberImage}
        resizeMode="stretch"
        accessible={false}
        accessibilityIgnoresInvertColors
      />

      <View style={[styles.pack, detail ? styles.detailPack : styles.homePack]}>
        <PackVisual
          name={name}
          category={category}
          rarityTier={rarityTier}
          size={detail ? 'hero' : 'lg'}
        />
      </View>

      <View style={[styles.sideLane, detail && styles.detailSideLane]} pointerEvents="none">
        <View style={styles.sideCobalt} />
        <View style={styles.sideTeal} />
        <View style={styles.sideSignal} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: sg.surface,
  },
  chamberImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'fill',
    resizeMode: 'stretch',
  },
  homeFrame: {
    alignSelf: 'stretch',
    height: 392,
    borderRadius: sg.radius.panel,
  },
  detailFrame: {
    width: '100%',
    maxWidth: 408,
    height: 456,
    borderRadius: sg.radius.panel,
  },
  pack: {
    zIndex: 1,
    shadowColor: sg.ink,
    shadowOpacity: 0.26,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 7,
  },
  homePack: { marginTop: 10 },
  detailPack: { marginTop: 18 },
  sideLane: {
    position: 'absolute',
    zIndex: 2,
    right: 12,
    top: 108,
    width: 18,
    height: 146,
    gap: 4,
  },
  detailSideLane: {
    right: 16,
    top: 124,
    width: 20,
    height: 170,
  },
  sideCobalt: { flex: 2, backgroundColor: sg.gold, borderRadius: 2 },
  sideTeal: { flex: 2, backgroundColor: sg.teal, borderRadius: 2 },
  sideSignal: { flex: 1, backgroundColor: sg.neon, borderRadius: 2 },
});
