import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Pack } from '../../data/mockPacks';
import { getCategoryFoil } from '../../../shared/utils/foil';
import { ph } from '../../tokens/phTheme';
import { brandFont, fontSize } from '../../tokens/typography';
import { BuybackBadge, StatusBadge } from './PhBadge';
import { PhProgressBar } from './PhProgressBar';
import { navigationRef } from '../../navigation/navigationRef';
import { useAppStore } from '../../store/useAppStore';
import { useRequireAuth } from '../../hooks/useRequireAuth';

const CARD_W = (Dimensions.get('window').width - 48) / 2 - 6;

export function PhPackCard({ pack, onPress }: { pack: Pack; onPress?: () => void }) {
  const { requireAuth } = useRequireAuth();
  const openPack = useAppStore((s) => s.openPack);
  const foil = getCategoryFoil(pack.tcgCategory ?? 'Multi TCG');
  const fraction = pack.remainingFraction ?? pack.remainingInventory / Math.max(pack.totalInventory, 1);
  const priceUsd = (pack.creditPrice / 100).toFixed(0);

  const goDetail = () => {
    if (onPress) { onPress(); return; }
    if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: pack.id });
  };

  const onOpen = () => {
    requireAuth(() => { void openPack(pack); });
  };

  return (
    <Pressable onPress={goDetail} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <LinearGradient colors={[foil.top, foil.mid, foil.bot]} style={styles.visual}>
        <View style={styles.badges}>
          {pack.isFeatured ? <StatusBadge variant="featured">Featured</StatusBadge> : null}
          {pack.buybackRate != null ? <BuybackBadge rate={pack.buybackRate} /> : null}
        </View>
        <View style={[styles.packShape, { borderColor: foil.accent }]}>
          <LinearGradient colors={[foil.top, foil.mid, foil.bot]} style={StyleSheet.absoluteFill} />
          <View style={styles.packArt} />
          <Text style={styles.packShapeName} numberOfLines={2}>{pack.title}</Text>
        </View>
        <Text style={styles.catLabel}>{(pack.tcgCategory ?? '').toUpperCase()}</Text>
      </LinearGradient>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{pack.title}</Text>
        {pack.tagline ? <Text style={styles.tagline} numberOfLines={2}>{pack.tagline}</Text> : null}
        <PhProgressBar fraction={fraction} />
        <View style={styles.footer}>
          <Text style={styles.price}>${priceUsd}</Text>
          <Pressable onPress={(e) => { e.stopPropagation?.(); onOpen(); }} style={styles.openBtn}>
            <Text style={styles.openLabel}>Open</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    backgroundColor: ph.surface,
    borderRadius: ph.radius.lg,
    borderWidth: 1,
    borderColor: ph.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  pressed: { opacity: 0.92, transform: [{ translateY: -2 }] },
  visual: { padding: 16, alignItems: 'center', minHeight: 200 },
  badges: { position: 'absolute', top: 10, right: 10, gap: 6, alignItems: 'flex-end', zIndex: 2 },
  packShape: {
    width: 90, height: 126, borderRadius: 10, borderWidth: 1.5,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'space-between', padding: 8,
  },
  packArt: { width: '82%', height: 56, backgroundColor: 'rgba(0,0,0,0.38)', borderRadius: 4 },
  packShapeName: { fontSize: 8, fontFamily: brandFont.black, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  catLabel: { marginTop: 10, fontSize: 9, color: 'rgba(255,255,255,0.32)', letterSpacing: 1.4, fontFamily: brandFont.semibold },
  info: { padding: 14, gap: 6 },
  title: { fontSize: fontSize.sm, fontFamily: brandFont.black, color: ph.text },
  tagline: { fontSize: 11, color: ph.textMuted, lineHeight: 16 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  price: { fontSize: 18, fontFamily: brandFont.black, color: ph.text },
  openBtn: { marginLeft: 'auto', backgroundColor: ph.green, paddingHorizontal: 14, paddingVertical: 7, borderRadius: ph.radius.pill },
  openLabel: { fontSize: 11, fontFamily: brandFont.bold, color: ph.greenInk },
});
