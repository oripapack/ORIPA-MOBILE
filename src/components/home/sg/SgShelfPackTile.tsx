import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Pack } from '../../../data/mockPacks';
import { PackVisual } from '../../ph/PackVisual';
import { sg } from '../../../tokens/sg';
import { SgData } from '../../ui';
import { navigationRef } from '../../../navigation/navigationRef';

export function SgShelfPackTile({ pack }: { pack: Pack }) {
  const fraction = pack.remainingFraction ?? pack.remainingInventory / Math.max(pack.totalInventory, 1);
  const lowStock = fraction < 0.1;
  const goDetail = () => {
    if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: pack.id });
  };

  return (
    <Pressable onPress={goDetail} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <View style={styles.routeRow}>
        <Text style={styles.route}>PK-{pack.id.slice(0, 2).toUpperCase()}</Text>
        {pack.isNew ? <Text style={styles.newText}>NEW</Text> : <Text style={styles.online}>READY</Text>}
      </View>
      <View style={styles.visual}>
        <View style={styles.light} />
        <PackVisual name={pack.title} category={pack.tcgCategory ?? 'TCG'} rarityTier={pack.rarityTier} size="sm" />
      </View>
      <Text style={styles.name} numberOfLines={2}>{pack.title}</Text>
      <View style={styles.metaRow}>
        <SgData value={pack.creditPrice.toLocaleString()} unit="PTS" size="sm" tone="gold" />
        <SgData value={pack.remainingInventory.toLocaleString()} unit="left" size="sm" tone={lowStock ? 'success' : 'default'} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, backgroundColor: sg.surface, borderWidth: 1, borderColor: sg.line, borderRadius: sg.radius.panel, padding: 9, overflow: 'hidden' },
  pressed: { opacity: 0.86 },
  routeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  route: { fontFamily: sg.font.data, fontSize: 7.5, color: sg.chrome, letterSpacing: 0.7 },
  newText: { fontFamily: sg.font.label, fontSize: 7.5, color: sg.neon, letterSpacing: 0.7 },
  online: { fontFamily: sg.font.label, fontSize: 7.5, color: sg.success, letterSpacing: 0.55 },
  visual: { height: 150, alignItems: 'center', justifyContent: 'center', marginTop: 6, backgroundColor: sg.surface2, borderWidth: 1, borderColor: sg.line },
  light: { position: 'absolute', top: 10, width: 62, height: 2, backgroundColor: sg.ivoryLightSoft },
  name: { fontFamily: sg.font.bodyBold, fontSize: 13, lineHeight: 16, color: sg.text, marginTop: 9, minHeight: 32 },
  metaRow: { gap: 3, marginTop: 6 },
});
