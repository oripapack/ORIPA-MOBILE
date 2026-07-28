import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sg } from '../tokens/sg';
import { SgButton, SgCard, SgData, SgSectionHeader, SgTierTag } from '../components/ui';

/**
 * Dev-only gallery for the N2 "Neon Torii" shared components.
 * Reachable via EXPO_PUBLIC_DEV_SCREEN=UiGallery (never linked in product nav).
 */
export function DevUiGalleryScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + sg.space.lg, paddingBottom: sg.space.xxl }}
      >
        <Text style={styles.pageTitle}>Sg components — N2 Neon Torii</Text>

        <View style={styles.block}>
          <SgSectionHeader title="Just Pulled" actionLabel="LIVE ›" live onAction={() => {}} />
        </View>

        <View style={styles.block}>
          <SgButton label="Open a pack — $25.00" onPress={() => {}} />
          <View style={styles.gap} />
          <SgButton label="Back to packs" variant="line" onPress={() => {}} />
          <View style={styles.gap} />
          <SgButton label="Open a pack — $25.00" onPress={() => {}} disabled />
        </View>

        <View style={styles.block}>
          <SgCard>
            {/* Pack name — the one Fraunces use on this bench */}
            <Text style={styles.packName}>Kanto Origins</Text>
            <View style={styles.cardRow}>
              <SgData value="2,500" unit="Coins" size="lg" tone="gold" />
              <SgData value="214 / 500" unit="left" size="sm" />
            </View>
            {/* Slots: hairline bar + neutral mono numbers (no red, no blink) */}
            <View style={styles.slotsBar}>
              <View style={styles.slotsFill} />
            </View>
          </SgCard>
          <View style={styles.gap} />
          <SgCard raised>
            {/* §6 v2.2 — all 7 states: 6 tiers (3 colors split by form) + UNKNOWN.
                mythic = neon filled + glow / legendary = gold filled, black label /
                epic = gold outline / rare = muted outline / uncommon = muted text /
                common = muted text @50% / unknown = the tag renders NOTHING */}
            <View style={styles.tierList}>
              <SgTierTag tier="mythic" />
              <SgTierTag tier="legendary" />
              <SgTierTag tier="epic" />
              <SgTierTag tier="rare" />
              <SgTierTag tier="uncommon" />
              <SgTierTag tier="common" />
              <SgTierTag tier="unknown" />
            </View>
            <SgData value="UNKNOWN" unit="no tier data — tag above renders nothing" size="sm" />
            <View style={styles.gapSm} />
            <SgData value="+14,483" unit="Coins · trade-in complete" tone="success" size="md" />
          </SgCard>
        </View>

        <View style={styles.block}>
          <SgCard>
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

        <Text style={styles.pageTitle}>Raised panel</Text>
        <View style={styles.block}>
          <SgCard raised>
            <SgSectionHeader title="Your pull is in the vault" />
            <View style={styles.cardRow}>
              <SgData value="14,483" unit="Coins" tone="gold" size="lg" />
              <SgData value="$0" unit="shipping" size="lg" />
            </View>
          </SgCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: sg.bg },
  pageTitle: {
    fontFamily: sg.font.bodyBold,
    fontSize: 20,
    color: sg.text,
    paddingHorizontal: sg.space.lg,
    marginTop: sg.space.lg,
  },
  packName: {
    fontFamily: sg.font.display,
    fontSize: 22,
    color: sg.text,
  },
  block: { paddingHorizontal: sg.space.lg, marginTop: sg.space.lg },
  tierList: { gap: sg.space.sm, alignItems: 'flex-start', marginBottom: sg.space.sm },
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
    backgroundColor: sg.line,
    marginTop: sg.space.md,
  },
  slotsFill: {
    width: '43%',
    height: 2,
    borderRadius: 1,
    backgroundColor: sg.muted,
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
    color: sg.muted,
  },
});
