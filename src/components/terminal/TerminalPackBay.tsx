import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { RarityTier } from '../../../shared/types/pack';
import { PackVisual } from '../ph/PackVisual';
import { sg } from '../../tokens/sg';

type PackSize = 'sm' | 'md' | 'lg' | 'hero';

const EXHIBIT_IMAGE = require('../../../assets/home/tokyo-exhibit-chamber.jpg');

export function TerminalPackBay({
  name,
  category,
  rarityTier,
  size = 'md',
  showRail = true,
}: {
  name: string;
  category: string;
  rarityTier?: RarityTier;
  size?: PackSize;
  showRail?: boolean;
}) {
  return (
    <View style={[styles.shell, size === 'sm' && styles.shellSmall]}>
      <View style={styles.headerRail}>
        <Text style={styles.headerLabel}>TOKYO TERMINAL / PACK BAY</Text>
        <Text style={styles.headerCode}>PH-01</Text>
      </View>
      <View style={styles.inner}>
        <Image source={EXHIBIT_IMAGE} style={styles.exhibitTexture} resizeMode="cover" accessible={false} />
        <View style={styles.exhibitScrim} />
        <View style={styles.innerFrameOuter} />
        <View style={styles.innerFrameInner} />
        <View style={styles.lightTop} />
        <View style={styles.lightLeft} />
        <View style={styles.lightRight} />
        <View style={styles.packStage}>
          <PackVisual name={name} category={category} rarityTier={rarityTier} size={size} />
        </View>
        {showRail ? (
          <View style={styles.serviceRail}>
            <View style={styles.serviceBlue} />
            <View style={styles.serviceMint} />
            <View style={styles.serviceRed} />
          </View>
        ) : null}
        <View style={styles.basePlinth} />
        <View style={styles.baseRing} />
        <View style={styles.baseRingInner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignSelf: 'stretch',
    backgroundColor: sg.bayShell,
    borderWidth: 1,
    borderColor: sg.lineStrong,
    borderRadius: sg.radius.panel,
    overflow: 'hidden',
  },
  shellSmall: { minWidth: 132 },
  headerRail: {
    height: 25,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: sg.surface2,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  headerLabel: { fontFamily: sg.font.label, fontSize: 7, color: sg.muted, letterSpacing: 0.9 },
  headerCode: { fontFamily: sg.font.dataBold, fontSize: 8, color: sg.goldHi },
  inner: {
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.bayGlass,
    overflow: 'hidden',
  },
  exhibitTexture: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.28,
  },
  exhibitScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: sg.modalScrim },
  innerFrameOuter: {
    position: 'absolute', top: 5, right: 5, bottom: 5, left: 5,
    borderWidth: 1, borderColor: sg.ivoryLightSoft, borderRadius: sg.radius.tag,
  },
  innerFrameInner: {
    position: 'absolute', top: 9, right: 9, bottom: 9, left: 9,
    borderWidth: 1, borderColor: sg.cobaltBorder, borderRadius: sg.radius.tag,
  },
  lightTop: {
    position: 'absolute', top: 13, width: '56%', height: 15,
    borderWidth: 2, borderColor: sg.ivoryLight, borderRadius: sg.radius.pill,
    shadowColor: sg.text, shadowOpacity: 0.55, shadowRadius: 10,
  },
  lightLeft: { position: 'absolute', left: 13, top: 43, bottom: 30, width: 2, backgroundColor: sg.cobaltLightStrong },
  lightRight: { position: 'absolute', right: 13, top: 43, bottom: 30, width: 2, backgroundColor: sg.cobaltLightStrong },
  packStage: { zIndex: 2, marginVertical: 10 },
  serviceRail: { position: 'absolute', right: 17, top: 55, width: 7, gap: 4 },
  serviceBlue: { height: 30, backgroundColor: sg.gold },
  serviceMint: { height: 30, backgroundColor: sg.success },
  serviceRed: { height: 30, backgroundColor: sg.neon },
  baseRing: {
    position: 'absolute', bottom: 13, width: '54%', height: 14,
    borderWidth: 2, borderColor: sg.cobaltLightStrong, borderRadius: sg.radius.pill,
  },
  basePlinth: {
    position: 'absolute', bottom: 8, width: '60%', height: 18,
    backgroundColor: sg.surface2, borderWidth: 1, borderColor: sg.ivoryLightSoft,
    borderRadius: sg.radius.pill,
  },
  baseRingInner: {
    position: 'absolute', bottom: 16, width: '44%', height: 8,
    borderWidth: 1, borderColor: sg.ivoryLight, borderRadius: sg.radius.pill,
  },
});
