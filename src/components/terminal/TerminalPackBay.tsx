import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { RarityTier } from '../../../shared/types/pack';
import { sg } from '../../tokens/sg';
import { PackProductExhibit } from './PackProductExhibit';

type PackSize = 'sm' | 'md' | 'lg' | 'hero';

export function TerminalPackBay({
  name,
  category,
  packId,
  rarityTier,
  size = 'md',
  showRail = true,
}: {
  name: string;
  category: string;
  packId?: string;
  rarityTier?: RarityTier;
  size?: PackSize;
  showRail?: boolean;
}) {
  return (
    <View
      style={[styles.shell, size === 'sm' && styles.shellSmall]}
      accessibilityRole="image"
      accessibilityLabel={`${name} · ${category} pack display`}
    >
      <View style={styles.headerRail}>
        <Text style={styles.headerLabel}>TOKYO TERMINAL / PACK BAY</Text>
        <Text style={styles.headerCode}>PH-01</Text>
      </View>
      <View
        style={[
          styles.inner,
          size === 'sm' && styles.innerSmall,
          size === 'lg' && styles.innerLarge,
          size === 'hero' && styles.innerHero,
        ]}
      >
        <PackProductExhibit name={name} category={category} packId={packId} layout="portrait" />
        {showRail ? (
          <View style={styles.casePlate} pointerEvents="none">
            <Text style={styles.casePlateCode}>CASE / 01</Text>
            <Text style={styles.casePlateLabel}>PHYSICAL PACK DISPLAY</Text>
          </View>
        ) : null}
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
    backgroundColor: sg.bayGlass,
    overflow: 'hidden',
  },
  innerSmall: { minHeight: 180 },
  innerLarge: { minHeight: 320 },
  innerHero: { minHeight: 360 },
  casePlate: {
    position: 'absolute', left: sg.space.sm, bottom: sg.space.sm,
    paddingHorizontal: sg.space.sm, paddingVertical: 6,
    backgroundColor: sg.functionalScrim,
    borderWidth: 1, borderColor: sg.lineStrong,
    borderRadius: sg.radius.tag,
  },
  casePlateCode: { fontFamily: sg.font.dataBold, fontSize: 8, color: sg.goldHi, fontVariant: [...sg.numeric] },
  casePlateLabel: { marginTop: 2, fontFamily: sg.font.label, fontSize: 6.5, color: sg.text, letterSpacing: 0.55 },
});
