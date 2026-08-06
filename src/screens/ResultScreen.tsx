import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { sg } from '../tokens/sg';
import { SgButton, SgTierTag } from '../components/ui';
import { navigationRef } from '../navigation/navigationRef';
import { useAppStore } from '../store/useAppStore';
import { MOCK_RESULT_PULLS, type ResultCard, type ResultPullData, type MockResultVariant } from '../data/mockResultPull';

/**
 * Result screen — task1-result-screen-spec.md on N2 v2.4 tokens.
 *
 * Entered after the opening sequence has faded to black; no entry transition
 * of its own. Not yet wired to the opening flow (Yutaka domain): callers pass
 * `pull` (+ optional store `pullIds` for real finalize actions); without
 * params the screen renders MOCK data for review.
 *
 * Copy is intentionally hardcoded English per the spec ("英語ロケール・その
 * まま使う") — locale keys come later with the flow wiring.
 *
 * Leaving without choosing NEVER converts to Coins: no action is taken on
 * unmount, so pending pulls stay pending (vault-by-default is the flow-side
 * contract).
 */

type Props = {
  route: {
    params?: {
      /** Real payload from the opening flow (not wired yet). */
      pull?: ResultPullData;
      /** Store pull ids — when present, CTA/vault call finalizePendingFulfillment. */
      pullIds?: string[];
      /** Dev-only: pick a MOCK variant when no pull is passed. */
      mock?: MockResultVariant;
    };
  };
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** "JUL 27, 2026 · 14:32 JST · TOKYO" — manual UTC+9 (no Intl on Hermes). */
function formatStampJst(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 9 * 3600e3);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} · ${hh}:${mm} JST · TOKYO`;
}

function groupThousands(intStr: string): string {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function fmtUsd(v: number): string {
  const [int, dec] = v.toFixed(2).split('.');
  return `$${groupThousands(int)}.${dec}`;
}

/** 100 Coins = $1.00 — same rate the rest of the app uses (VaultScreen etc.). */
function usdToCoins(usd: number): number {
  return Math.round(usd * 100);
}

export function ResultScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const finalize = useAppStore((s) => s.finalizePendingFulfillment);
  const [sheetOpen, setSheetOpen] = useState(false);

  const params = route.params;
  const pull = params?.pull ?? MOCK_RESULT_PULLS[params?.mock ?? '5'];
  const pullIds = params?.pullIds;

  const { hero, rest } = useMemo(() => {
    const best = pull.cards.reduce((a, c) => (c.listedValueUsd > a.listedValueUsd ? c : a), pull.cards[0]);
    return { hero: best, rest: pull.cards.filter((c) => c !== best) };
  }, [pull.cards]);

  const count = pull.cards.length;
  const multi = count > 1;
  const coins = groupThousands(String(usdToCoins(pull.totalListedValueUsd)));
  const ctaLabel = multi ? `Trade in all — ${coins} Coins` : `Trade in — ${coins} Coins`;

  const goTabs = (screen?: 'Vault') => {
    if (!navigationRef.isReady()) return;
    if (screen) navigationRef.navigate('MainTabs', { screen });
    else navigationRef.navigate('MainTabs');
  };

  const onConfirmTradeIn = () => {
    setSheetOpen(false);
    // Real wiring: convert every pull of this opening. With mock data there is
    // nothing to finalize — state stays untouched.
    if (pullIds?.length) void finalize({ vaultIds: [], convertIds: pullIds });
    goTabs();
  };

  const onKeepInVault = () => {
    // Spec: no confirmation for the Vault path.
    if (pullIds?.length) void finalize({ vaultIds: pullIds, convertIds: [] });
    goTabs('Vault');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── 1. Header band ── */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>PULL RECORD</Text>
        <Text style={styles.headerId}>#{pull.pullId}</Text>
      </View>

      {/* ── 2. Title ── */}
      <View style={styles.titleBlock}>
        <Text style={styles.packName}>{pull.packName}</Text>
        <Text style={styles.stamp}>{formatStampJst(pull.pulledAt)}</Text>
      </View>

      {/* ── 3. Card panel ── */}
      <View style={styles.panel}>
        <View style={styles.cardsScrollWrap}>
          <ScrollView
            contentContainerStyle={styles.cardsContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 3a. Hero — the single highest-value card */}
            <View style={styles.heroBlock}>
              <View style={styles.heroShadow}>
                <View style={styles.heroImgClip}>
                  <Image source={{ uri: hero.imageUrl }} style={styles.heroImg} contentFit="cover" />
                </View>
              </View>
              <Text style={styles.heroName} numberOfLines={2}>{hero.name}</Text>
              {/* Tier via SgTierTag badge context — UNKNOWN (all cards today) renders nothing */}
              <View style={styles.heroTag}>
                <SgTierTag tier={hero.tier} context="badge" />
              </View>
              <Text style={styles.heroValue}>{fmtUsd(hero.listedValueUsd)}</Text>
            </View>

            {multi ? (
              <>
                {/* 3b. Divider — a line, never a shadow */}
                <View style={styles.divider} />

                {/* 3c. Grid — 4 columns, no shadows */}
                <View style={styles.grid}>
                  {rest.map((c, i) => (
                    <GridCell key={`${c.name}-${i}`} card={c} />
                  ))}
                </View>
              </>
            ) : null}
          </ScrollView>
          {/* Scroll fade into the panel ground (spec's "bg" read as the panel surface) */}
          <LinearGradient
            colors={['rgba(16,16,19,0)', sg.surface]} // sg.surface with alpha 0 → 1
            style={styles.fade}
            pointerEvents="none"
          />
        </View>

        {/* 3d. Total row — pinned to the panel bottom */}
        {multi ? (
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>TOTAL LISTED VALUE</Text>
              <Text style={styles.totalCount}>{count} CARDS</Text>
            </View>
            <Text style={styles.totalValue}>{fmtUsd(pull.totalListedValueUsd)}</Text>
          </View>
        ) : null}
      </View>

      {/* ── 4. Action bar ── */}
      <View style={styles.actionBar}>
        <SgButton label={ctaLabel} onPress={() => setSheetOpen(true)} style={styles.cta} />
        <Text style={styles.disclaimer}>100% of listed value, in Coins.</Text>
        <SgButton label="Keep in Vault" variant="line" onPress={onKeepInVault} style={styles.secondary} />
      </View>

      {/* ── 5. Footer ── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Text style={styles.footerText}>Odds applied · Fairness Record →</Text>
      </View>

      {/* ── Confirm sheet — trade-in never commits instantly ── */}
      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <View style={styles.sheetOverlay}>
          {/* Backdrop dismiss = cancel: no conversion happens without explicit confirm */}
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setSheetOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>{multi ? `Trade in ${count} cards?` : 'Trade in 1 card?'}</Text>
            <Text style={styles.sheetAmount}>{coins}</Text>
            <Text style={styles.sheetAmountSub}>COINS · 100% OF LISTED VALUE</Text>
            <Text style={styles.sheetBody}>
              {multi
                ? `All ${count} cards will be traded in for Coins at their listed value.`
                : 'This card will be traded in for Coins at its listed value.'}
            </Text>
            <SgButton label="Trade in" onPress={onConfirmTradeIn} style={styles.cta} />
            <SgButton label="Cancel" variant="line" onPress={() => setSheetOpen(false)} style={styles.sheetCancel} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function GridCell({ card }: { card: ResultCard }) {
  return (
    <View style={styles.cell}>
      <View style={styles.cellImgClip}>
        <Image source={{ uri: card.imageUrl }} style={styles.cellImg} contentFit="cover" />
      </View>
      <Text style={styles.cellName} numberOfLines={2}>{card.name}</Text>
      <Text style={styles.cellValue}>{fmtUsd(card.listedValueUsd)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: sg.bg },

  // 1. Header band
  header: {
    height: 52,
    backgroundColor: sg.surface,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerLabel: {
    fontFamily: sg.font.data,
    fontSize: 10.5,
    letterSpacing: 10.5 * 0.2,
    color: sg.muted,
  },
  headerId: {
    fontFamily: sg.font.data,
    fontSize: 12,
    color: sg.muted, // certificate number, not a value → never gold
    fontVariant: [...sg.numeric],
  },

  // 2. Title
  titleBlock: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  packName: {
    fontFamily: sg.font.display,
    fontSize: 26,
    lineHeight: 29, // 1.10
    letterSpacing: 26 * -0.015,
    color: sg.text,
  },
  stamp: {
    fontFamily: sg.font.data,
    fontSize: 10.5,
    letterSpacing: 10.5 * 0.07,
    color: sg.muted,
    marginTop: 7,
    fontVariant: [...sg.numeric],
  },

  // 3. Card panel — dark surface, 1px line (the old bright plane is gone)
  panel: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: sg.radius.panel,
    overflow: 'hidden',
  },
  cardsScrollWrap: { flex: 1 },
  cardsContent: { padding: 20, paddingBottom: 46 },
  heroBlock: { alignItems: 'center' },
  // shadowHero lives ONLY here on this screen (§3 — one hero per screen)
  heroShadow: {
    width: 152,
    height: 212,
    borderRadius: 10,
    backgroundColor: sg.surface2,
    ...sg.shadowHero,
  },
  heroImgClip: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  heroImg: { width: '100%', height: '100%' },
  heroName: {
    fontFamily: sg.font.bodyBold, // spec 600 — loaded weights are 400/500/700, 700 is the closest
    fontSize: 16,
    color: sg.text,
    marginTop: 16,
    textAlign: 'center',
  },
  heroTag: { marginTop: 8 },
  heroValue: {
    fontFamily: sg.font.dataBold,
    fontSize: 19,
    color: sg.gold,
    marginTop: 11,
    fontVariant: [...sg.numeric],
  },
  divider: { height: 1, backgroundColor: sg.line, marginTop: 20, marginBottom: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  cell: { width: 80 },
  cellImgClip: { width: 80, height: 112, borderRadius: 10, overflow: 'hidden', backgroundColor: sg.surface2 },
  cellImg: { width: '100%', height: '100%' },
  cellName: {
    fontFamily: sg.font.body,
    fontSize: 10.5,
    color: sg.text,
    marginTop: 6,
    lineHeight: 13,
  },
  cellValue: {
    fontFamily: sg.font.dataBold,
    fontSize: 11.5,
    color: sg.gold,
    marginTop: 2,
    fontVariant: [...sg.numeric],
  },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 46 },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: sg.line,
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontFamily: sg.font.data,
    fontSize: 9.5,
    letterSpacing: 9.5 * 0.18,
    color: sg.muted,
  },
  totalCount: {
    fontFamily: sg.font.data,
    fontSize: 9.5,
    color: sg.muted,
    marginTop: 4,
    fontVariant: [...sg.numeric],
  },
  totalValue: {
    fontFamily: sg.font.dataBold,
    fontSize: 24,
    color: sg.gold,
    fontVariant: [...sg.numeric],
  },

  // 4. Action bar
  actionBar: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: sg.surface,
    borderTopWidth: 1,
    borderTopColor: sg.line,
    marginTop: 16,
  },
  cta: { height: 54, paddingVertical: 0 },
  disclaimer: {
    fontFamily: sg.font.body,
    fontSize: 11,
    color: sg.muted,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  secondary: { height: 50, paddingVertical: 0, backgroundColor: sg.surface2 },

  // 5. Footer
  footer: {
    height: 40,
    backgroundColor: sg.surface,
    borderTopWidth: 1,
    borderTopColor: sg.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: { fontFamily: sg.font.body, fontSize: 11.5, color: sg.muted },

  // Confirm sheet
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)', // sinks the CTA behind the sheet
  },
  sheet: {
    backgroundColor: sg.surface2,
    borderTopLeftRadius: sg.radius.panel,
    borderTopRightRadius: sg.radius.panel,
    borderTopWidth: 1,
    borderTopColor: sg.line,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: sg.line,
    marginBottom: 18,
  },
  sheetTitle: {
    fontFamily: sg.font.bodyBold, // spec 600 → closest loaded weight
    fontSize: 21,
    color: sg.text,
  },
  sheetAmount: {
    fontFamily: sg.font.dataBold,
    fontSize: 34,
    color: sg.gold,
    marginTop: 14,
    fontVariant: [...sg.numeric],
  },
  sheetAmountSub: {
    fontFamily: sg.font.data,
    fontSize: 9.5,
    letterSpacing: 9.5 * 0.18,
    textTransform: 'uppercase',
    color: sg.muted,
    marginTop: 4,
  },
  sheetBody: {
    fontFamily: sg.font.body,
    fontSize: 13.5,
    color: sg.muted,
    marginTop: 14,
    marginBottom: 20,
    lineHeight: 19,
  },
  sheetCancel: { height: 50, paddingVertical: 0, backgroundColor: sg.surface2, marginTop: 10 },
});
