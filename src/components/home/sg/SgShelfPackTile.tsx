import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Pack } from '../../../data/mockPacks';
import { getCategoryFoil } from '../../../../shared/utils/foil';
import { sg } from '../../../tokens/sg';
import { SgData } from '../../ui';
import { navigationRef } from '../../../navigation/navigationRef';

/**
 * 2-column shelf tile (N2). Tap → PackDetails. NEW is a quiet tag chip
 * (real `isNew` data). Remaining count is always the real number; low stock
 * flips to `success` semantics (§4: stock lives in success green) — never
 * red, never blinking.
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
      <View style={styles.visualClip}>
        <LinearGradient colors={[foil.top, foil.mid, foil.bot]} style={styles.visual}>
          <View style={[styles.packShape, { borderColor: foil.accent }]} />
        </LinearGradient>
        {pack.isNew ? (
          <View style={styles.newChip}>
            <Text style={styles.newChipText}>NEW</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={2}>{pack.title}</Text>
      <View style={styles.metaRow}>
        <SgData value={`$${priceUsd}`} size="md" tone="gold" />
        <SgData
          value={pack.remainingInventory.toLocaleString()}
          unit="left"
          size="sm"
          tone={lowStock ? 'success' : 'default'}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: sg.radius.panel,
    padding: sg.space.sm,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.92 },
  visualClip: { borderRadius: sg.radius.tag, overflow: 'hidden' },
  visual: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packShape: {
    width: 52,
    height: 74,
    borderRadius: sg.radius.tag,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  newChip: {
    position: 'absolute',
    top: 6, right: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: sg.radius.tag,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  newChipText: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 8.5,
    letterSpacing: 1.1,
    color: sg.text,
  },
  name: {
    fontFamily: sg.font.bodyBold,
    fontSize: 13,
    lineHeight: 17,
    color: sg.text,
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
