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
 * Legacy single-column pack card (superseded by SgShelfPackTile in the
 * shelf-first layout — kept for reference, not rendered anywhere).
 * Behavior port from PhPackCard: tap → PackDetails, "Open" → requireAuth →
 * openPack. Tokens migrated to N2; the quiet line-variant open action stays —
 * the gold CTA belongs to the featured card only.
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
      <View style={styles.visualClip}>
        <LinearGradient colors={[foil.top, foil.mid, foil.bot]} style={styles.visual}>
          <View style={[styles.packShape, { borderColor: foil.accent }]}>
            <View style={styles.packArt} />
          </View>
          <Text style={styles.catLabel}>{(pack.tcgCategory ?? '').toUpperCase()}</Text>
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
              <SgData value={`${pack.buybackRate}%`} size="sm" tone="gold" />
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
          <SgData value={`$${priceUsd}`} size="lg" tone="gold" />
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
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: sg.radius.panel,
    overflow: 'hidden',
    marginBottom: sg.space.lg - 4,
    alignSelf: 'center',
  },
  pressed: { opacity: 0.92 },
  visualClip: {
    margin: sg.space.sm,
    borderRadius: sg.radius.tag,
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
    borderRadius: sg.radius.tag,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  featuredChipText: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.2,
    color: sg.text,
  },
  packShape: {
    width: 78,
    height: 108,
    borderRadius: sg.radius.btn,
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
    borderRadius: sg.radius.tag,
  },
  catLabel: {
    marginTop: 12,
    fontFamily: sg.font.bodyMedium,
    fontSize: 9,
    color: 'rgba(240,238,232,0.4)',
    letterSpacing: 1.2,
  },
  info: { paddingHorizontal: sg.space.md, paddingTop: 6, paddingBottom: sg.space.md, gap: sg.space.sm },
  title: { fontFamily: sg.font.bodyBold, fontSize: 15, color: sg.text, lineHeight: 20 },
  tagline: { fontFamily: sg.font.body, fontSize: 11, color: sg.muted, lineHeight: 15 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sg.space.md, marginTop: 2 },
  stat: { gap: 2 },
  statFlex: { flex: 1, minWidth: 0 },
  statLabel: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 10,
    letterSpacing: 0.4,
    color: sg.muted,
  },
  statTopCard: { fontFamily: sg.font.bodyBold, fontSize: 12, color: sg.text },
  slotsBar: {
    height: 2,
    borderRadius: 1,
    backgroundColor: sg.line,
    marginTop: 2,
  },
  slotsFill: { height: 2, borderRadius: 1, backgroundColor: sg.muted },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  openBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: sg.radius.btn,
    borderWidth: 1,
    borderColor: sg.line,
  },
  openBtnPressed: { backgroundColor: sg.surface2 },
  openLabel: { fontFamily: sg.font.bodyBold, fontSize: 12, color: sg.text },
});
