import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Pack } from '../../../data/mockPacks';
import { getCategoryFoil } from '../../../../shared/utils/foil';
import { sg } from '../../../tokens/sg';
import { SgData } from '../../ui';
import { navigationRef } from '../../../navigation/navigationRef';

/**
 * 2-column shelf tile. Tap → PackDetails. NEW is a quiet brass status pill
 * (real `isNew` data). Remaining count is always the real number; it is
 * promoted to brass below 10% — never red, never blinking.
 */
export function SgShelfPackTile({ pack }: { pack: Pack }) {
  const foil = getCategoryFoil(pack.tcgCategory ?? 'Multi TCG');
  const fraction = pack.remainingFraction ?? pack.remainingInventory / Math.max(pack.totalInventory, 1);
  const lowStock = fraction < 0.1;
  const priceUsd = (pack.creditPrice / 100).toFixed(0);

  const goDetail = () => {
    if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: pack.id });
  };

  return (
    <Pressable onPress={goDetail} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <View style={styles.satinTop} pointerEvents="none" />
      <View style={styles.visualClip}>
        <LinearGradient colors={[foil.top, foil.mid, foil.bot]} style={styles.visual}>
          <View style={[styles.packShape, { borderColor: foil.accent }]} />
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']}
            locations={[0.38, 0.47, 0.56]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </LinearGradient>
        {pack.isNew ? (
          <View style={styles.newChip}>
            <Text style={styles.newChipText}>NEW</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={2}>{pack.title}</Text>
      <View style={styles.metaRow}>
        <SgData value={`$${priceUsd}`} size="md" />
        <SgData
          value={pack.remainingInventory.toLocaleString()}
          unit="left"
          size="sm"
          tone={lowStock ? 'brass' : 'default'}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: sg.showroom.surface,
    borderRadius: sg.radius.card,
    padding: sg.space.sm,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.92 },
  satinTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: sg.satinTopHighlight,
    zIndex: 2,
  },
  visualClip: { borderRadius: sg.radius.image, overflow: 'hidden' },
  visual: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packShape: {
    width: 52,
    height: 74,
    borderRadius: 7,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  newChip: {
    position: 'absolute',
    top: 6, right: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: sg.radius.pill, // status chip — pill allowed
    backgroundColor: 'rgba(9,10,10,0.72)',
  },
  newChipText: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 8.5,
    letterSpacing: 1.1,
    color: sg.brass,
  },
  name: {
    fontFamily: sg.font.bodyBold,
    fontSize: 13,
    lineHeight: 17,
    color: sg.showroom.text,
    marginTop: sg.space.sm,
    minHeight: 34,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: sg.space.xs,
  },
});
