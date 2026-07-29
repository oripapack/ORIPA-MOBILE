import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Pack } from '../../data/mockPacks';
import { PackVisual } from './PackVisual';
import { PhButton } from './PhButton';
import { ph } from '../../tokens/phTheme';
import { brandFont, fontSize } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';

export function PhHomeHero({
  pack,
  onOpen,
  onBrowse,
}: {
  pack: Pack;
  onOpen: () => void;
  onBrowse: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.heroVisual}>
        <View style={styles.backPack}>
          <PackVisual name="Obsidian Flames" category="Pokémon TCG" rarityTier="legendary" size="lg" />
        </View>
        <View style={styles.frontPack}>
          <PackVisual
            name={pack.title}
            category={pack.tcgCategory ?? 'Pokémon TCG'}
            rarityTier={pack.rarityTier ?? 'epic'}
            size="hero"
          />
        </View>
      </View>

      <Text style={styles.eyebrow}>PREMIUM MYSTERY PACKS</Text>
      <Text style={styles.headline}>Pull real cards.{'\n'}Own the moment.</Text>
      <Text style={styles.lead}>
        Graded slabs, alt-arts, and chase hits — every pull verified and vault-ready.
      </Text>

      <View style={styles.ctas}>
        <PhButton label="Open a Pack" onPress={onOpen} style={styles.ctaPrimary} />
        <PhButton label="Browse All" onPress={onBrowse} variant="secondary" style={styles.ctaSecondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  heroVisual: { height: 340, width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  backPack: { position: 'absolute', right: 24, opacity: 0.4, transform: [{ rotate: '6deg' }, { translateY: 10 }] },
  frontPack: { transform: [{ rotate: '-4deg' }], zIndex: 2 },
  eyebrow: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: ph.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  headline: {
    fontSize: 34,
    fontFamily: brandFont.black,
    color: ph.text,
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 38,
  },
  lead: {
    fontSize: fontSize.sm,
    color: ph.textSec,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.md,
    maxWidth: 320,
  },
  ctas: { width: '100%', marginTop: spacing.xl, gap: spacing.sm },
  ctaPrimary: { width: '100%' },
  ctaSecondary: { width: '100%' },
});
