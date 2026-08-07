import React from 'react';
import { Image, View, Text, Pressable, StyleSheet } from 'react-native';
import type { Pack } from '../../../data/mockPacks';
import { sg } from '../../../tokens/sg';
import { SgData } from '../../ui';
import { navigationRef } from '../../../navigation/navigationRef';
import { usePackOdds } from '../../../hooks/usePackOdds';

const PRODUCT_EXHIBIT_IMAGE = require('../../../../assets/home/tokyo-exhibit-product-wide.jpg');

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
        <Image
          source={PRODUCT_EXHIBIT_IMAGE}
          style={styles.productPhoto}
          resizeMode="cover"
          accessible={false}
        />
        <View style={styles.visualFrame} pointerEvents="none" />
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
  visual: { height: 162, marginTop: 6, backgroundColor: sg.bayShell, borderWidth: 1, borderColor: sg.lineStrong, overflow: 'hidden' },
  productPhoto: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  visualFrame: { position: 'absolute', top: 4, right: 4, bottom: 4, left: 4, borderWidth: 1, borderColor: sg.ivoryLightSoft, borderRadius: sg.radius.tag },
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
