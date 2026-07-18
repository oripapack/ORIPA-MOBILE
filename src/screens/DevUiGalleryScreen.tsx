import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sg } from '../tokens/sg';
import { SgButton, SgCard, SgData, SgSectionHeader } from '../components/ui';

/**
 * Dev-only gallery for the "Stage & Gallery" shared components (Urushi Archive).
 * Reachable via EXPO_PUBLIC_DEV_SCREEN=UiGallery (never linked in product nav).
 *
 * Lighting note: the warm top-center radial spot is implemented per-screen on
 * web (CSS). Here we approximate the vertical falloff only — components must
 * never self-illuminate, so this bench stays honest about elevation reading.
 */
export function DevUiGalleryScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      {/* Single-light rule: vertical darkening toward the bottom */}
      <LinearGradient
        colors={['rgba(255,250,238,0.05)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.30)']}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + sg.space.lg, paddingBottom: sg.space.xxl }}
      >
        <Text style={styles.pageTitle}>Sg components — Urushi Archive</Text>

        <View style={styles.block}>
          <SgSectionHeader title="Just Pulled" actionLabel="LIVE ›" live onAction={() => {}} />
        </View>

        <View style={styles.block}>
          <SgButton label="Open Pack" onPress={() => {}} />
          <View style={styles.gap} />
          <SgButton label="Back to packs" variant="line" onPress={() => {}} />
          <View style={styles.gap} />
          <SgButton label="Open Pack" onPress={() => {}} disabled />
        </View>

        <View style={styles.block}>
          <SgCard>
            {/* Pack name — the one Fraunces use on this bench */}
            <Text style={styles.packName}>Kanto Origins</Text>
            <View style={styles.cardRow}>
              <SgData value="2,500" unit="Coins" size="lg" />
              <SgData value="214 / 500" unit="left" size="sm" />
            </View>
            {/* Slots: hairline bar + neutral mono numbers (no red, no blink) */}
            <View style={styles.slotsBar}>
              <View style={styles.slotsFill} />
            </View>
          </SgCard>
          <View style={styles.gap} />
          <SgCard raised>
            {/* brass = rarity/decor detail, jade = financial status TEXT */}
            <SgData value="MYTHIC · 1 of 4" unit="rarity" tone="brass" size="sm" />
            <View style={styles.gapSm} />
            <SgData value="+14,483" unit="Coins · trade-in complete" tone="jade" size="md" />
          </SgCard>
        </View>

        <View style={styles.block}>
          <SgCard kind="panel">
            <SgSectionHeader title="Fairness record" actionLabel="VERIFY ›" onAction={() => {}} />
            <View style={styles.fairRow}>
              <Text style={styles.fairLabel}>Server commitment</Text>
              <SgData value="a41f…9c2e" size="sm" />
            </View>
            <View style={styles.fairRow}>
              <Text style={styles.fairLabel}>Client seed</Text>
              <SgData value="7b03…d114" size="sm" />
            </View>
            <View style={styles.fairRow}>
              <Text style={styles.fairLabel}>Opening #</Text>
              <SgData value="287" size="sm" />
            </View>
          </SgCard>
        </View>

        <Text style={styles.pageTitle}>Gallery layer (washi)</Text>
        <View style={styles.galleryZone}>
          <SgCard layer="gallery">
            <SgSectionHeader title="Your pull is in the vault" layer="gallery" />
            <View style={styles.cardRow}>
              <SgData value="14,483" unit="Coins" tone="jade" layer="gallery" size="lg" />
              <SgData value="$0" unit="shipping" layer="gallery" size="lg" />
            </View>
          </SgCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: sg.showroom.bg },
  pageTitle: {
    fontFamily: sg.font.bodyBold,
    fontSize: 20,
    color: sg.showroom.text,
    paddingHorizontal: sg.space.lg,
    marginTop: sg.space.lg,
  },
  packName: {
    fontFamily: sg.font.display,
    fontSize: 22,
    color: sg.showroom.text,
  },
  block: { paddingHorizontal: sg.space.lg, marginTop: sg.space.lg },
  gap: { height: sg.space.sm },
  gapSm: { height: sg.space.xs },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: sg.space.md,
  },
  slotsBar: {
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(232,229,222,0.14)',
    marginTop: sg.space.md,
  },
  slotsFill: {
    width: '43%',
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(232,229,222,0.55)',
  },
  fairRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: sg.space.md,
  },
  fairLabel: {
    fontFamily: sg.font.body,
    fontSize: 13,
    color: sg.showroom.textMuted,
  },
  galleryZone: {
    backgroundColor: sg.gallery.bg,
    padding: sg.space.lg,
    marginTop: sg.space.lg,
    borderRadius: sg.radius.panel,
    marginHorizontal: sg.space.lg,
  },
});
