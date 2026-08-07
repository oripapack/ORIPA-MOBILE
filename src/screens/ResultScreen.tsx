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
import { TerminalBackdrop } from '../components/terminal';

/**
 * Result screen — task1-result-screen-spec.md on N2 v2.4 tokens.
 *
 * Entered after the opening sequence has faded to black; no entry transition
 * of its own. The opening flow passes `pull` plus store `pullIds` for real
 * finalize actions; without params the screen renders MOCK data for review.
 *
 * Copy is intentionally hardcoded English per the spec ("英語ロケール・その
 * まま使う") — locale keys come later with the flow wiring.
 *
 * Leaving without choosing NEVER converts to Points: no action is taken on
 * unmount, so pending pulls stay pending (vault-by-default is the flow-side
 * contract).
 */

type Props = {
  route: {
    params?: {
      /** Runtime payload from the opening flow. */
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

function fmtPoints(value: number): string {
  return `${groupThousands(String(Math.max(0, Math.round(value))))} Points`;
}

export function ResultScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const finalize = useAppStore((s) => s.finalizePendingFulfillment);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const params = route.params;
  const pull = params?.pull ?? MOCK_RESULT_PULLS[params?.mock ?? '5'];
  const pullIds = params?.pullIds;

  const { hero, rest } = useMemo(() => {
    const best = pull.cards.reduce(
      (a, c) => (c.tradeInValuePoints > a.tradeInValuePoints ? c : a),
      pull.cards[0],
    );
    return { hero: best, rest: pull.cards.filter((c) => c !== best) };
  }, [pull.cards]);

  const count = pull.cards.length;
  const multi = count > 1;
  const points = groupThousands(String(Math.max(0, Math.round(pull.totalTradeInValuePoints))));
  const ctaLabel = multi ? `Trade in all — ${points} Points` : `Trade in — ${points} Points`;

  const goTabs = (screen?: 'Vault') => {
    if (!navigationRef.isReady()) return;
    if (screen) navigationRef.navigate('MainTabs', { screen });
    else navigationRef.navigate('MainTabs');
  };

  const onConfirmTradeIn = async () => {
    if (finalizing) return;
    setFinalizing(true);
    try {
      // With isolated mock data there is nothing to finalize; runtime pulls
      // wait for the store/API result before leaving this record.
      if (pullIds?.length) {
        const ok = await finalize({ vaultIds: [], convertIds: pullIds });
        if (!ok) return;
      }
      setSheetOpen(false);
      goTabs();
    } finally {
      setFinalizing(false);
    }
  };

  const onKeepInVault = async () => {
    if (finalizing) return;
    setFinalizing(true);
    try {
      // Spec: no confirmation for the Vault path.
      if (pullIds?.length) {
        const ok = await finalize({ vaultIds: pullIds, convertIds: [] });
        if (!ok) return;
      }
      goTabs('Vault');
    } finally {
      setFinalizing(false);
    }
  };

  if (!params?.pull && !__DEV__) {
    return (
      <View style={[styles.root, styles.unavailableRoot, { paddingTop: insets.top }]}>
        <TerminalBackdrop />
        <Text style={styles.unavailableEyebrow}>PULL RECORD / STATUS</Text>
        <Text style={styles.unavailableTitle}>No live pull record was provided.</Text>
        <Text style={styles.unavailableBody}>
          Return to Packs and open a live pack. Result details appear only after a verified opening response.
        </Text>
        <SgButton label="Return to Packs" onPress={() => goTabs()} style={styles.unavailableCta} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <TerminalBackdrop />
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
                  {hero.imageUrl ? (
                    <Image source={{ uri: hero.imageUrl }} style={styles.heroImg} contentFit="cover" />
                  ) : (
                    <ResultArtPlaceholder />
                  )}
                </View>
              </View>
              <Text style={styles.heroName} numberOfLines={2}>{hero.name}</Text>
              {/* Tier via SgTierTag badge context — UNKNOWN (all cards today) renders nothing */}
              <View style={styles.heroTag}>
                <SgTierTag tier={hero.tier} context="badge" />
              </View>
              <Text style={styles.heroValue}>{fmtPoints(hero.tradeInValuePoints)}</Text>
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
            colors={[sg.surfaceTransparent, sg.surface]}
            style={styles.fade}
            pointerEvents="none"
          />
        </View>

        {/* 3d. Total row — pinned to the panel bottom */}
        {multi ? (
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>TOTAL TRADE IN VALUE</Text>
              <Text style={styles.totalCount}>{count} CARDS</Text>
            </View>
            <Text style={styles.totalValue}>{fmtPoints(pull.totalTradeInValuePoints)}</Text>
          </View>
        ) : null}
      </View>

      {/* ── 4. Action bar ── */}
      <View style={styles.actionBar}>
        <SgButton label={ctaLabel} onPress={() => setSheetOpen(true)} style={styles.cta} />
        <Text style={styles.disclaimer}>100% of listed value, in Points.</Text>
        <SgButton
          label="Keep in Vault"
          variant="line"
          onPress={() => void onKeepInVault()}
          loading={finalizing && !sheetOpen}
          style={styles.secondary}
        />
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
            <Text style={styles.sheetAmount}>{points}</Text>
            <Text style={styles.sheetAmountSub}>POINTS · 100% OF LISTED VALUE</Text>
            <Text style={styles.sheetBody}>
              {multi
                ? `All ${count} cards will be traded in for Points at their listed value.`
                : 'This card will be traded in for Points at its listed value.'}
            </Text>
            <SgButton
              label="Trade in"
              onPress={() => void onConfirmTradeIn()}
              loading={finalizing}
              style={styles.cta}
            />
            <SgButton
              label="Cancel"
              variant="line"
              onPress={() => setSheetOpen(false)}
              disabled={finalizing}
              style={styles.sheetCancel}
            />
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
        {card.imageUrl ? (
          <Image source={{ uri: card.imageUrl }} style={styles.cellImg} contentFit="cover" />
        ) : (
          <ResultArtPlaceholder compact />
        )}
      </View>
      <Text style={styles.cellName} numberOfLines={2}>{card.name}</Text>
      <Text style={styles.cellValue}>{fmtPoints(card.tradeInValuePoints)}</Text>
    </View>
  );
}

function ResultArtPlaceholder({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.artPlaceholder}>
      <View style={styles.artTopRail} />
      <View style={[styles.artFrame, compact && styles.artFrameCompact]}>
        <Text style={[styles.artCode, compact && styles.artCodeCompact]}>CARD ART</Text>
        <Text style={styles.artStatus}>PENDING</Text>
      </View>
      <View style={styles.artBottomRail} />
    </View>
  );
}

const styles = StyleSheet.create({
  unavailableRoot: {
    paddingHorizontal: sg.space.lg,
    justifyContent: 'center',
  },
  unavailableEyebrow: {
    fontFamily: sg.font.label,
    fontSize: 9,
    letterSpacing: 1.1,
    color: sg.warning,
    marginBottom: sg.space.sm,
  },
  unavailableTitle: {
    fontFamily: sg.font.display,
    fontSize: 30,
    lineHeight: 33,
    color: sg.text,
    marginBottom: sg.space.md,
  },
  unavailableBody: {
    fontFamily: sg.font.body,
    fontSize: 14,
    lineHeight: 22,
    color: sg.muted,
  },
  unavailableCta: {
    alignSelf: 'stretch',
    marginTop: sg.space.xl,
  },
  root: { flex: 1, backgroundColor: sg.bg },

  // 1. Header band
  header: {
    height: 52,
    backgroundColor: sg.component.dock.background,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerLabel: {
    fontFamily: sg.font.label,
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
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -0.9,
    textTransform: 'uppercase',
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
  heroImgClip: { flex: 1, borderRadius: sg.radius.panel, overflow: 'hidden' },
  heroImg: { width: '100%', height: '100%' },
  artPlaceholder: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: sg.space.sm,
    backgroundColor: sg.bayShell,
  },
  artTopRail: { width: '72%', height: 2, backgroundColor: sg.ivoryLightSoft },
  artFrame: {
    width: '72%',
    aspectRatio: 0.72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: sg.cobaltBorderStrong,
    backgroundColor: sg.surface2,
  },
  artFrameCompact: { width: '78%' },
  artCode: {
    fontFamily: sg.font.display,
    fontSize: 16,
    color: sg.text,
    textAlign: 'center',
  },
  artCodeCompact: { fontSize: 9 },
  artStatus: {
    marginTop: sg.space.xs,
    fontFamily: sg.font.label,
    fontSize: 7,
    letterSpacing: 0.8,
    color: sg.muted,
  },
  artBottomRail: {
    width: '60%',
    height: 5,
    borderWidth: 1,
    borderColor: sg.cobaltBorder,
    borderRadius: sg.radius.pill,
  },
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
  cellImgClip: { width: 80, height: 112, borderRadius: sg.radius.panel, overflow: 'hidden', backgroundColor: sg.surface2 },
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
    backgroundColor: sg.modalScrim,
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
