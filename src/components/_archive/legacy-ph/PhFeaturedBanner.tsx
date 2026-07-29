import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Pack } from '../../data/mockPacks';
import { getCategoryFoil } from '../../lib/packFoil';
import { ph } from '../../tokens/phTheme';
import { brandFont, fontSize } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { StatusBadge } from './PhBadge';
import { PhProgressBar } from './PhProgressBar';
import { navigationRef } from '../../navigation/navigationRef';

export function PhFeaturedBanner({ pack }: { pack: Pack }) {
  const foil = getCategoryFoil(pack.tcgCategory ?? 'Pokémon TCG');
  const fraction = pack.remainingFraction ?? 0.8;
  const priceUsd = (pack.creditPrice / 100).toFixed(0);
  const urgent = fraction < 0.35;

  return (
    <Pressable
      onPress={() => {
        if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: pack.id });
      }}
      style={[styles.wrap, urgent && styles.urgent]}
    >
      <LinearGradient colors={[foil.top, ph.surface]} style={styles.gradient}>
        <View style={styles.content}>
          <StatusBadge variant="featured">Featured</StatusBadge>
          <Text style={styles.name}>{pack.title}</Text>
          <Text style={styles.tagline}>{pack.tagline}</Text>
          <PhProgressBar fraction={fraction} />
          <View style={styles.footer}>
            <Text style={styles.price}>${priceUsd}</Text>
            <View style={styles.openPill}>
              <Text style={styles.openText}>View Pack</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    borderRadius: ph.radius.xl,
    borderWidth: 1,
    borderColor: ph.borderMd,
    overflow: 'hidden',
  },
  urgent: { borderColor: ph.redBorder },
  gradient: { padding: spacing.md },
  content: { gap: 6 },
  name: { fontSize: fontSize.lg, fontFamily: brandFont.black, color: ph.text, marginTop: 4 },
  tagline: { fontSize: 12, color: ph.textSec, lineHeight: 17 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  price: { fontSize: 18, fontFamily: brandFont.black, color: ph.text },
  openPill: { marginLeft: 'auto', backgroundColor: ph.green, paddingHorizontal: 12, paddingVertical: 6, borderRadius: ph.radius.pill },
  openText: { fontSize: 12, fontFamily: brandFont.bold, color: ph.greenInk },
});
