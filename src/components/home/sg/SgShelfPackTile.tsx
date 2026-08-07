import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Pack } from '../../../data/mockPacks';
import { PackVisual } from '../../ph/PackVisual';
import { sg } from '../../../tokens/sg';
import { SgData } from '../../ui';
import { navigationRef } from '../../../navigation/navigationRef';
import { usePackOdds } from '../../../hooks/usePackOdds';

export function SgShelfPackTile({ pack }: { pack: Pack }) {
  const { odds, loading } = usePackOdds(pack);
  const releaseBlocked = !__DEV__ && !odds.isLive;
  const fraction = pack.remainingFraction ?? pack.remainingInventory / Math.max(pack.totalInventory, 1);
  const lowStock = fraction < 0.1;
  const goDetail = () => {
    if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: pack.id });
  };

  return (
    <Pressable
      onPress={goDetail}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`View ${pack.title} pack details`}
    >
      <View style={styles.routeRow}>
        <Text style={styles.route}>PK-{pack.id.slice(0, 2).toUpperCase()}</Text>
        {releaseBlocked ? (
          <Text style={styles.waiting}>WAITING</Text>
        ) : pack.isNew ? (
          <Text style={styles.newText}>NEW</Text>
        ) : (
          <Text style={styles.online}>READY</Text>
        )}
      </View>
      <View style={styles.visual}>
        <View style={styles.visualFrame} />
        <View style={styles.light} />
        <View style={styles.sideLightLeft} />
        <View style={styles.sideLightRight} />
        <View style={styles.plinth} />
        <View style={styles.plinthRing} />
        <PackVisual name={pack.title} category={pack.tcgCategory ?? 'TCG'} rarityTier={pack.rarityTier} size="sm" />
      </View>
      <Text style={styles.name} numberOfLines={2}>{pack.title}</Text>
      {releaseBlocked ? (
        <View style={styles.syncRow}>
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>{loading ? 'CHECKING LIVE DATA' : 'PACK DATA UNAVAILABLE'}</Text>
        </View>
      ) : (
        <View style={styles.metaRow}>
          <SgData value={pack.creditPrice.toLocaleString()} unit="Points" size="sm" tone="gold" />
          <SgData value={pack.remainingInventory.toLocaleString()} unit="left" size="sm" tone={lowStock ? 'success' : 'default'} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, backgroundColor: sg.surface, borderWidth: 1, borderColor: sg.line, borderRadius: sg.radius.panel, padding: 9, overflow: 'hidden' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  routeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  route: { fontFamily: sg.font.data, fontSize: 7.5, color: sg.chrome, letterSpacing: 0.7 },
  newText: { fontFamily: sg.font.label, fontSize: 7.5, color: sg.neon, letterSpacing: 0.7 },
  online: { fontFamily: sg.font.label, fontSize: 7.5, color: sg.success, letterSpacing: 0.55 },
  waiting: { fontFamily: sg.font.label, fontSize: 7.5, color: sg.warning, letterSpacing: 0.55 },
  visual: { height: 150, alignItems: 'center', justifyContent: 'center', marginTop: 6, backgroundColor: sg.bayShell, borderWidth: 1, borderColor: sg.lineStrong, overflow: 'hidden' },
  visualFrame: { position: 'absolute', top: 4, right: 4, bottom: 4, left: 4, borderWidth: 1, borderColor: sg.cobaltBorder, borderRadius: sg.radius.tag },
  light: { position: 'absolute', top: 9, width: 62, height: 9, borderWidth: 1.5, borderColor: sg.ivoryLightSoft, borderRadius: sg.radius.pill },
  sideLightLeft: { position: 'absolute', left: 8, top: 30, bottom: 19, width: 1, backgroundColor: sg.cobaltLight },
  sideLightRight: { position: 'absolute', right: 8, top: 30, bottom: 19, width: 1, backgroundColor: sg.cobaltLight },
  plinth: { position: 'absolute', bottom: 7, width: 76, height: 12, backgroundColor: sg.surface2, borderWidth: 1, borderColor: sg.lineStrong, borderRadius: sg.radius.pill },
  plinthRing: { position: 'absolute', bottom: 11, width: 58, height: 6, borderWidth: 1, borderColor: sg.cobaltLightStrong, borderRadius: sg.radius.pill },
  name: { fontFamily: sg.font.bodyBold, fontSize: 13, lineHeight: 16, color: sg.text, marginTop: 9, minHeight: 32 },
  metaRow: { gap: 3, marginTop: 6 },
  syncRow: {
    minHeight: 34,
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: sg.radius.pill,
    backgroundColor: sg.warning,
  },
  syncText: {
    flex: 1,
    fontFamily: sg.font.label,
    fontSize: 7,
    lineHeight: 10,
    letterSpacing: 0.45,
    color: sg.warning,
  },
});
