import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Pack } from '../../../data/mockPacks';
import { PackVisual } from '../../ph/PackVisual';
import { SgButton } from '../../ui';
import { SgData } from '../../ui';
import { sg } from '../../../tokens/sg';

/**
 * Urushi hero. The pack itself is the EXISTING PackVisual asset (no new 3D) —
 * only the presentation is new: it sits under the screen's single warm
 * spotlight with a grounded elliptical shadow.
 */
export function SgHomeHero({
  pack,
  onOpen,
  onBrowse,
}: {
  pack: Pack;
  onOpen: () => void;
  onBrowse: () => void;
}) {
  const fraction = pack.remainingFraction ?? pack.remainingInventory / Math.max(pack.totalInventory, 1);
  const priceUsd = (pack.creditPrice / 100).toFixed(0);

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>JAPANESE EXCLUSIVES — DIRECT FROM TOKYO</Text>

      <View style={styles.packZone}>
        <PackVisual
          name={pack.title}
          category={pack.tcgCategory ?? 'Pokémon TCG'}
          rarityTier={pack.rarityTier ?? 'epic'}
          size="hero"
        />
        <View style={styles.packShadow} />
      </View>

      {/* Pack name — Fraunces (allowed role) */}
      <Text style={styles.title}>{pack.title}</Text>
      {pack.tagline ? <Text style={styles.setLine}>{pack.tagline}</Text> : null}

      <View style={styles.metaRow}>
        <SgData value={`$${priceUsd}`} size="lg" />
        <SgData
          value={`${pack.remainingInventory.toLocaleString()} / ${pack.totalInventory.toLocaleString()}`}
          unit="left"
          size="sm"
        />
      </View>
      {/* Slots: hairline bar, neutral color (no red, no blinking) */}
      <View style={styles.slotsBar}>
        <View style={[styles.slotsFill, { width: `${Math.max(0, Math.min(1, fraction)) * 100}%` }]} />
      </View>
      {pack.topCard ? (
        <Text style={styles.oddsLine}>
          Top hit: <Text style={styles.oddsStrong}>{pack.topCard}</Text> — full odds on pack page
        </Text>
      ) : null}

      <View style={styles.ctas}>
        <SgButton label="Open Pack" onPress={onOpen} />
        <SgButton label="Browse All Packs" variant="line" onPress={onBrowse} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.lg,
    paddingBottom: sg.space.xl,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 10,
    color: sg.brass,
    letterSpacing: 2.2,
    marginBottom: sg.space.lg,
  },
  packZone: { alignItems: 'center', justifyContent: 'center', marginBottom: sg.space.md },
  packShadow: {
    width: 190,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginTop: -8,
    transform: [{ scaleY: 0.55 }],
    // soft edge: rely on low-opacity fill (RN has no radial blur primitive)
    opacity: 0.75,
  },
  title: {
    fontFamily: sg.font.display,
    fontSize: 30,
    lineHeight: 36,
    color: sg.showroom.text,
    textAlign: 'center',
    marginTop: sg.space.sm,
  },
  setLine: {
    fontFamily: sg.font.body,
    fontSize: 12,
    color: sg.showroom.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: sg.space.md,
    marginTop: sg.space.md,
  },
  slotsBar: {
    width: 200,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(232,229,222,0.14)',
    marginTop: sg.space.sm + 2,
  },
  slotsFill: {
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(232,229,222,0.55)',
  },
  oddsLine: {
    fontFamily: sg.font.body,
    fontSize: 12,
    color: sg.showroom.textMuted,
    marginTop: sg.space.sm + 2,
    textAlign: 'center',
  },
  oddsStrong: { fontFamily: sg.font.bodyBold, color: sg.showroom.text },
  ctas: { width: '100%', marginTop: sg.space.lg, gap: sg.space.sm },
});
