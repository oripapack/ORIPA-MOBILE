import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Pack } from '../../../data/mockPacks';
import { PackVisual } from '../../ph/PackVisual';
import { SgButton } from '../../ui';
import { SgData } from '../../ui';
import { sg } from '../../../tokens/sg';

/**
 * Legacy full-height home hero (superseded by SgFeaturedPackCard in the
 * shelf-first layout — kept for reference, not rendered anywhere).
 * Tokens migrated to N2; the pack is the existing PackVisual asset.
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
      </View>

      {/* Pack name — Fraunces (heading role) */}
      <Text style={styles.title}>{pack.title}</Text>
      {pack.tagline ? <Text style={styles.setLine}>{pack.tagline}</Text> : null}

      <View style={styles.metaRow}>
        <SgData value={`$${priceUsd}`} size="lg" tone="gold" />
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
    color: sg.muted,
    letterSpacing: 2.2,
    marginBottom: sg.space.lg,
  },
  packZone: { alignItems: 'center', justifyContent: 'center', marginBottom: sg.space.md },
  title: {
    fontFamily: sg.font.display,
    fontSize: 30,
    lineHeight: 36,
    color: sg.text,
    textAlign: 'center',
    marginTop: sg.space.sm,
  },
  setLine: {
    fontFamily: sg.font.body,
    fontSize: 12,
    color: sg.muted,
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
    backgroundColor: sg.line,
    marginTop: sg.space.sm + 2,
  },
  slotsFill: {
    height: 2,
    borderRadius: 1,
    backgroundColor: sg.muted,
  },
  oddsLine: {
    fontFamily: sg.font.body,
    fontSize: 12,
    color: sg.muted,
    marginTop: sg.space.sm + 2,
    textAlign: 'center',
  },
  oddsStrong: { fontFamily: sg.font.bodyBold, color: sg.text },
  ctas: { width: '100%', marginTop: sg.space.lg, gap: sg.space.sm },
});
