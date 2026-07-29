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
    requireAuth(() => { void openPack(pack); }, { allowUnauthenticatedPackOpen: true });
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

        {/* Transparency stats row */}
        <View style={styles.statsRow}>
          {pack.buybackRate != null ? (
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>Avg Return</Text>
              <Text style={[styles.statValue, { color: pack.buybackRate >= 90 ? ph.green : pack.buybackRate >= 75 ? '#a3e635' : ph.textSec }]}>
                {pack.buybackRate}%
              </Text>
            </View>
          ) : null}
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={[styles.statValue, pack.remainingInventory < 50 ? styles.statLow : null]}>
              {pack.remainingInventory.toLocaleString()}
            </Text>
          </View>
          {pack.topCard ? (
            <View style={[styles.statPill, styles.statPillFlex]}>
              <Text style={styles.statLabel}>Top Hit</Text>
              <Text style={styles.statTopCard} numberOfLines={1}>{pack.topCard}</Text>
            </View>
          ) : null}
        </View>

        <PhProgressBar fraction={fraction} />
        <View style={styles.footer}>
          <Text style={styles.price}>${priceUsd}</Text>
          <Pressable onPress={onOpen} style={styles.openBtn} hitSlop={8}>
            <Text style={styles.openLabel}>Open Pack</Text>
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
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ph.radius.pill,
    backgroundColor: ph.surfaceRaise,
    borderWidth: 1,
    borderColor: ph.border,
  },
  statPillFlex: { flex: 1, minWidth: 0 },
  statLabel: {
    fontSize: 10,
    fontFamily: brandFont.semibold,
    color: ph.textMuted,
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 10,
    fontFamily: brandFont.black,
    color: ph.text,
  },
  statLow: { color: '#dc2626' },
  statTopCard: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: ph.text,
    flex: 1,
    minWidth: 0,
  },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  price: { fontSize: 20, fontFamily: brandFont.black, color: ph.text },
  openBtn: {
    marginLeft: 'auto',
    backgroundColor: ph.green,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: ph.radius.pill,
  },
  openLabel: { fontSize: 12, fontFamily: brandFont.black, color: ph.greenInk },
});
