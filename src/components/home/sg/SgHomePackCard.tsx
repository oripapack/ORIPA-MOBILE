import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Pack } from '../../../data/mockPacks';
import { getCategoryFoil } from '../../../../shared/utils/foil';
import { sg } from '../../../tokens/sg';
import { SgData } from '../../ui';
import { navigationRef } from '../../../navigation/navigationRef';
import { useAppStore } from '../../../store/useAppStore';
import { useRequireAuth } from '../../../hooks/useRequireAuth';

const H_PAD = sg.space.md;

/**
 * Urushi pack card. Behavior is ported 1:1 from PhPackCard: tap → PackDetails,
 * "Open" → requireAuth → openPack. Presentation: satin card (no full border),
 * existing foil visual (radius: image role), neutral stock (no red), quiet
 * line-variant open action — shu belongs to the hero CTA only.
 */
export function SgHomePackCard({
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
      <View style={styles.satinTop} pointerEvents="none" />
      {/* Product visual — gloss role: existing foil gradient + fixed diagonal sheen */}
      <View style={styles.visualClip}>
        <LinearGradient colors={[foil.top, foil.mid, foil.bot]} style={styles.visual}>
          <View style={[styles.packShape, { borderColor: foil.accent }]}>
            <View style={styles.packArt} />
          </View>
          <Text style={styles.catLabel}>{(pack.tcgCategory ?? '').toUpperCase()}</Text>
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.10)', 'rgba(255,255,255,0)']}
            locations={[0.38, 0.47, 0.56]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </LinearGradient>
        {pack.isFeatured ? (
          <View style={styles.featuredChip}>
            <Text style={styles.featuredChipText}>FEATURED</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{pack.title}</Text>
        {pack.tagline ? <Text style={styles.tagline} numberOfLines={2}>{pack.tagline}</Text> : null}

        <View style={styles.statsRow}>
          {pack.buybackRate != null ? (
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Avg return</Text>
              <SgData value={`${pack.buybackRate}%`} size="sm" tone="jade" />
            </View>
          ) : null}
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Remaining</Text>
            <SgData value={pack.remainingInventory.toLocaleString()} size="sm" />
          </View>
          {pack.topCard ? (
            <View style={[styles.stat, styles.statFlex]}>
              <Text style={styles.statLabel}>Top hit</Text>
              <Text style={styles.statTopCard} numberOfLines={1}>{pack.topCard}</Text>
            </View>
          ) : null}
        </View>

        {/* Slots hairline — neutral, no red */}
        <View style={styles.slotsBar}>
          <View style={[styles.slotsFill, { width: `${Math.max(0, Math.min(1, fraction)) * 100}%` }]} />
        </View>

        <View style={styles.footer}>
          <SgData value={`$${priceUsd}`} size="lg" />
          <Pressable
            onPress={onOpen}
            style={({ pressed }) => [styles.openBtn, pressed && styles.openBtnPressed]}
            hitSlop={8}
          >
            <Text style={styles.openLabel}>Open Pack</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: sg.showroom.surface,
    borderRadius: sg.radius.card,
    overflow: 'hidden',
    marginBottom: sg.space.lg - 4,
    alignSelf: 'center',
  },
  pressed: { opacity: 0.92 },
  satinTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: sg.satinTopHighlight,
    zIndex: 2,
  },
  visualClip: {
    margin: sg.space.sm,
    borderRadius: sg.radius.image,
    overflow: 'hidden',
  },
  visual: {
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 168,
  },
  featuredChip: {
    position: 'absolute',
    top: 8, right: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: sg.radius.pill, // status chip — pill allowed
    backgroundColor: 'rgba(9,10,10,0.72)',
  },
  featuredChipText: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.2,
    color: sg.brass,
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
    fontFamily: sg.font.bodyMedium,
    fontSize: 9,
    color: 'rgba(232,229,222,0.4)',
    letterSpacing: 1.2,
  },
  info: { paddingHorizontal: sg.space.md, paddingTop: 6, paddingBottom: sg.space.md, gap: sg.space.sm },
  title: { fontFamily: sg.font.bodyBold, fontSize: 15, color: sg.showroom.text, lineHeight: 20 },
  tagline: { fontFamily: sg.font.body, fontSize: 11, color: sg.showroom.textMuted, lineHeight: 15 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sg.space.md, marginTop: 2 },
  stat: { gap: 2 },
  statFlex: { flex: 1, minWidth: 0 },
  statLabel: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 10,
    letterSpacing: 0.4,
    color: sg.showroom.textMuted,
  },
  statTopCard: { fontFamily: sg.font.bodyBold, fontSize: 12, color: sg.showroom.text },
  slotsBar: {
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(232,229,222,0.14)',
    marginTop: 2,
  },
  slotsFill: { height: 2, borderRadius: 1, backgroundColor: 'rgba(232,229,222,0.55)' },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  openBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: sg.radius.control,
    borderWidth: 1,
    borderColor: 'rgba(232,229,222,0.16)',
  },
  openBtnPressed: { backgroundColor: sg.showroom.raised },
  openLabel: { fontFamily: sg.font.bodyBold, fontSize: 12, color: sg.showroom.text },
});
