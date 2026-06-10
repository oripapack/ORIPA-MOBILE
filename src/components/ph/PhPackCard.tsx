import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Pack } from '../../data/mockPacks';
import { getCategoryFoil } from '../../../shared/utils/foil';
import { ph } from '../../tokens/phTheme';
import { brandFont, fontSize } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import { StatusBadge } from './PhBadge';
import { PhProgressBar } from './PhProgressBar';
import { navigationRef } from '../../navigation/navigationRef';
import { useAppStore } from '../../store/useAppStore';
import { useRequireAuth } from '../../hooks/useRequireAuth';

const H_PAD = spacing.base;

export function PhPackCard({
  pack,
  onPress,
}: {
  pack: Pack;
  onPress?: () => void;
}) {
  const { width: screenW } = useWindowDimensions();
  const { requireAuth } = useRequireAuth();
  const openPack = useAppStore((s) => s.openPack);
  const foil = getCategoryFoil(pack.tcgCategory ?? 'Multi TCG');
  const fraction = pack.remainingFraction ?? pack.remainingInventory / Math.max(pack.totalInventory, 1);
  const priceUsd = (pack.creditPrice / 100).toFixed(0);

  const cardWidth = useMemo(() => screenW - H_PAD * 2, [screenW]);

  const goDetail = () => {
    if (onPress) { onPress(); return; }
    if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: pack.id });
  };

  const onOpen = () => {
    requireAuth(() => { void openPack(pack); });
  };

  return (
    <Pressable
      onPress={goDetail}
      style={({ pressed }) => [styles.card, { width: cardWidth }, pressed && styles.pressed]}
    >
      <LinearGradient colors={[foil.top, foil.mid, foil.bot]} style={styles.visual}>
        {pack.isFeatured ? (
          <View style={styles.badges}>
            <StatusBadge variant="featured">Featured</StatusBadge>
          </View>
        ) : null}
        <View style={[styles.packShape, { borderColor: foil.accent }]}>
          <View style={styles.packArt} />
        </View>
        <Text style={styles.catLabel}>{(pack.tcgCategory ?? '').toUpperCase()}</Text>
      </LinearGradient>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{pack.title}</Text>
        {pack.tagline ? <Text style={styles.tagline} numberOfLines={2}>{pack.tagline}</Text> : null}
        <PhProgressBar fraction={fraction} />
        <View style={styles.footer}>
          <Text style={styles.price}>${priceUsd}</Text>
          <Pressable onPress={onOpen} style={styles.openBtn} hitSlop={8}>
            <Text style={styles.openLabel}>Open</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ph.surface,
    borderRadius: ph.radius.lg,
    borderWidth: 1,
    borderColor: ph.border,
    overflow: 'hidden',
    marginBottom: 20,
    alignSelf: 'center',
  },
  pressed: { opacity: 0.92 },
  visual: {
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 168,
  },
  badges: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  packShape: {
    width: 78,
    height: 108,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  packArt: {
    width: '78%',
    height: 54,
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderRadius: 4,
  },
  catLabel: {
    marginTop: 12,
    fontSize: 9,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.2,
    fontFamily: brandFont.semibold,
  },
  info: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, gap: 8 },
  title: { fontSize: fontSize.sm, fontFamily: brandFont.black, color: ph.text, lineHeight: 18 },
  tagline: { fontSize: 11, color: ph.textMuted, lineHeight: 15 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  price: { fontSize: 18, fontFamily: brandFont.black, color: ph.text },
  openBtn: {
    marginLeft: 'auto',
    backgroundColor: ph.green,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: ph.radius.pill,
  },
  openLabel: { fontSize: 12, fontFamily: brandFont.bold, color: ph.greenInk },
});
