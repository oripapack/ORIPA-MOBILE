import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { RarityTier } from '../../../shared/types/pack';
import { PackVisual } from '../ph/PackVisual';
import { sg } from '../../tokens/sg';

type PackSize = 'sm' | 'md' | 'lg' | 'hero';

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
        <View style={styles.baseRing} />
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
  lightTop: {
    position: 'absolute', top: 16, width: '56%', height: 3,
    backgroundColor: sg.ivoryLight,
    shadowColor: sg.text, shadowOpacity: 0.55, shadowRadius: 10,
  },
  lightLeft: { position: 'absolute', left: 11, top: 40, bottom: 26, width: 2, backgroundColor: sg.cobaltLight },
  lightRight: { position: 'absolute', right: 11, top: 40, bottom: 26, width: 2, backgroundColor: sg.cobaltLight },
  packStage: { zIndex: 2, marginVertical: 10 },
  serviceRail: { position: 'absolute', right: 17, top: 55, width: 7, gap: 4 },
  serviceBlue: { height: 30, backgroundColor: sg.gold },
  serviceMint: { height: 30, backgroundColor: sg.success },
  serviceRed: { height: 30, backgroundColor: sg.neon },
  baseRing: {
    position: 'absolute', bottom: 13, width: '52%', height: 10,
    borderWidth: 2, borderColor: sg.cobaltLightStrong, borderRadius: 999,
  },
});
