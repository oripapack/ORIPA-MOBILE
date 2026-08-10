import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Reanimated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { sg } from '../tokens/sg';
import { SgButton } from '../components/ui';
import { navigationRef } from '../navigation/navigationRef';
import { useAppStore } from '../store/useAppStore';
import { MOCK_RESULT_PULLS, type ResultCard, type ResultPullData, type MockResultVariant } from '../data/mockResultPull';
import type { N2TierState } from '../lib/n2Rarity';
import { TerminalBackdrop } from '../components/terminal';

const BADGE_STAGGER_MS = 80;
const BADGE_COUNT = 3;
/** Unlock CTAs as the last badge settles (~spring settle window). */
const ACTIONS_REVEAL_MS = BADGE_STAGGER_MS * (BADGE_COUNT - 1) + 280;

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

function formatRarityLabel(tier: N2TierState): string {
  if (tier === 'unknown') return 'UNVERIFIED';
  return tier.toUpperCase();
}

function yearFromIso(iso: string): string {
  const y = new Date(iso).getFullYear();
  return Number.isFinite(y) ? String(y) : String(new Date().getFullYear());
}

/** Short attribute chip — first token of "FIRE / POKÉMON" → "FIRE". */
function shortTypeLabel(cardType?: string): string {
  if (!cardType?.trim()) return 'CARD';
  const first = cardType.split(/[/\s]+/).find((p) => p.trim().length > 0);
  return (first ?? cardType).trim().toUpperCase();
}

type SpecBadgeDef = { key: string; text: string; emphasis?: boolean };

function buildSpecBadges(card: ResultCard, serial: string, fallbackYear: string): SpecBadgeDef[] {
  return [
    { key: 'year', text: String(card.year ?? fallbackYear) },
    { key: 'type', text: shortTypeLabel(card.cardType) },
    {
      key: 'rarity',
      text: `${formatRarityLabel(card.tier)} // MINT #${serial}`,
      emphasis: true,
    },
  ];
}

function SpecBadge({
  text,
  delayMs,
  reduceMotion,
  emphasis,
}: {
  text: string;
  delayMs: number;
  reduceMotion: boolean;
  emphasis?: boolean;
}) {
  const progress = useSharedValue(reduceMotion ? 1 : 0);
  const sheen = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      sheen.value = 0;
      return;
    }
    progress.value = 0;
    sheen.value = 0;
    progress.value = withDelay(
      delayMs,
      withSpring(1, { damping: 13, stiffness: 260, mass: 0.7 }, (finished) => {
        if (finished) {
          sheen.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) });
        }
      }),
    );
  }, [delayMs, progress, reduceMotion, sheen, text]);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 12 },
      { scale: 0.8 + progress.value * 0.2 },
    ],
  }));

  const sheenStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sheen.value, [0, 0.15, 0.55, 1], [0, 0.7, 0.4, 0]),
    transform: [{ translateX: interpolate(sheen.value, [0, 1], [-56, 120]) }, { skewX: '-18deg' }],
  }));

  return (
    <Reanimated.View
      style={[styles.specBadge, emphasis && styles.specBadgeEmphasis, badgeStyle]}
    >
      <Text style={[styles.specBadgeText, emphasis && styles.specBadgeTextEmphasis]} numberOfLines={1}>
        {text}
      </Text>
      {!reduceMotion ? (
        <Reanimated.View style={[styles.specSheen, sheenStyle]} pointerEvents="none">
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.42)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Reanimated.View>
      ) : null}
    </Reanimated.View>
  );
}

function SpecBadgesRow({
  card,
  serial,
  pulledAt,
  reduceMotion,
  onComplete,
}: {
  card: ResultCard;
  serial: string;
  pulledAt: string;
  reduceMotion: boolean;
  onComplete: () => void;
}) {
  const badges = useMemo(
    () => buildSpecBadges(card, serial, yearFromIso(pulledAt)),
    [card, pulledAt, serial],
  );
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    completedRef.current = false;
    if (reduceMotion) {
      finish();
      return;
    }
    const timer = setTimeout(() => finish(), ACTIONS_REVEAL_MS);
    return () => clearTimeout(timer);
  }, [badges, finish, reduceMotion]);

  const a11y = badges.map((b) => b.text).join(' · ');

  return (
    <View style={styles.specRow} accessibilityLabel={a11y}>
      {badges.map((badge, i) => (
        <SpecBadge
          key={badge.key}
          text={badge.text}
          delayMs={i * BADGE_STAGGER_MS}
          reduceMotion={reduceMotion}
          emphasis={badge.emphasis}
        />
      ))}
    </View>
  );
}

export function ResultScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const finalize = useAppStore((s) => s.finalizePendingFulfillment);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [printDone, setPrintDone] = useState(false);
  const actionsProgress = useSharedValue(0);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduceMotion(!!v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    actionsProgress.value = withTiming(printDone ? 1 : 0, {
      duration: printDone ? 340 : 0,
      easing: Easing.out(Easing.cubic),
    });
  }, [printDone, actionsProgress]);

  const actionsStyle = useAnimatedStyle(() => ({
    opacity: 0.22 + actionsProgress.value * 0.78,
    transform: [{ translateY: (1 - actionsProgress.value) * 14 }],
  }));

  const params = route.params;
  const pull = params?.pull ?? MOCK_RESULT_PULLS[params?.mock ?? '5'];
  const pullIds = params?.pullIds;

  useEffect(() => {
    setPrintDone(reduceMotion);
    actionsProgress.value = reduceMotion ? 1 : 0;
  }, [pull.pullId, reduceMotion, actionsProgress]);

  const onPrintComplete = useCallback(() => {
    setPrintDone(true);
  }, []);

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

  const openTradeSheet = useCallback(() => {
    if (!printDone || finalizing) return;
    setSheetOpen(true);
  }, [finalizing, printDone]);

  const onConfirmTradeIn = async () => {
    if (!printDone || finalizing) return;
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
    if (!printDone || finalizing) return;
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
        <View style={styles.unavailableContent}>
          <Text style={styles.unavailableEyebrow}>Pull record</Text>
          <Text style={styles.unavailableTitle}>No live pull record was provided.</Text>
          <Text style={styles.unavailableBody}>
            Return to Packs and open a live pack. Result details appear only after a verified opening response.
          </Text>
          <SgButton label="Return to Packs" variant="line" onPress={() => goTabs()} style={styles.unavailableCta} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <TerminalBackdrop />
      {/* ── 1. Header band ── */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Pull record</Text>
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
            contentContainerStyle={[
              styles.cardsContent,
              !multi && styles.cardsContentCentered,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* 3a. Hero — card + auth feed, vertically centered in the panel */}
            <View style={styles.heroBlock}>
              <View style={styles.heroStage}>
                <View style={styles.heroAuraOuter} pointerEvents="none" />
                <View style={styles.heroAuraInner} pointerEvents="none" />
                <View style={styles.heroShadow}>
                  <View style={styles.heroImgClip}>
                    {hero.imageUrl ? (
                      <Image source={{ uri: hero.imageUrl }} style={styles.heroImg} contentFit="cover" />
                    ) : (
                      <ResultArtPlaceholder />
                    )}
                  </View>
                </View>
              </View>
              <SpecBadgesRow
                card={hero}
                serial={pull.pullId}
                pulledAt={pull.pulledAt}
                reduceMotion={reduceMotion}
                onComplete={onPrintComplete}
              />
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
              <Text style={styles.totalLabel}>Total trade-in value</Text>
              <Text style={styles.totalCount}>{count} cards</Text>
            </View>
            <Text style={styles.totalValue}>{fmtPoints(pull.totalTradeInValuePoints)}</Text>
          </View>
        ) : null}
      </View>

      {/* ── 4. Action bar — rises after auth printout finishes ── */}
      <Reanimated.View
        style={[styles.actionBar, actionsStyle]}
        pointerEvents={printDone ? 'auto' : 'none'}
      >
        <SgButton
          label={ctaLabel}
          onPress={openTradeSheet}
          disabled={!printDone || finalizing}
          style={styles.cta}
        />
        <Text style={styles.disclaimer}>100% of listed value, in Points.</Text>
        <SgButton
          label="Keep in Vault"
          variant="line"
          onPress={() => void onKeepInVault()}
          disabled={!printDone}
          loading={finalizing && !sheetOpen}
          style={styles.secondary}
        />
      </Reanimated.View>

      {/* ── 5. Footer ── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Text style={styles.footerText}>Odds and fairness record</Text>
      </View>

      {/* ── Confirm sheet — trade-in never commits instantly ── */}
      <Modal visible={sheetOpen} transparent animationType="fade" onRequestClose={() => setSheetOpen(false)}>
        <View style={styles.sheetOverlay}>
          {/* Backdrop dismiss = cancel: no conversion happens without explicit confirm */}
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setSheetOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>{multi ? `Trade in ${count} cards?` : 'Trade in 1 card?'}</Text>
            <Text style={styles.sheetAmount}>{points}</Text>
            <Text style={styles.sheetAmountSub}>Points · 100% of listed value</Text>
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
        <Text style={[styles.artCode, compact && styles.artCodeCompact]}>Card artwork</Text>
        <Text style={styles.artStatus}>Preview unavailable</Text>
      </View>
      <View style={styles.artBottomRail} />
    </View>
  );
}

const styles = StyleSheet.create({
  unavailableRoot: {
    justifyContent: 'center',
  },
  unavailableContent: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
    paddingHorizontal: sg.space.lg,
  },
  unavailableEyebrow: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 13,
    letterSpacing: 0,
    color: sg.warning,
    marginBottom: sg.space.sm,
  },
  unavailableTitle: {
    fontFamily: sg.font.display,
    fontSize: sg.type.title.fontSize,
    lineHeight: sg.type.title.lineHeight,
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
    minHeight: 48,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sg.space.lg,
  },
  headerLabel: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 13,
    letterSpacing: 0,
    color: sg.muted,
  },
  headerId: {
    fontFamily: sg.font.data,
    fontSize: 12,
    color: sg.muted, // certificate number, not a value → never gold
    fontVariant: [...sg.numeric],
  },

  // 2. Title
  titleBlock: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10 },
  packName: {
    fontFamily: sg.font.display,
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -0.5,
    color: sg.text,
  },
  stamp: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
    color: sg.muted,
    marginTop: sg.space.sm,
  },

  // 3. Card panel — dark surface, 1px line (the old bright plane is gone)
  panel: {
    flex: 1,
    marginHorizontal: sg.space.md,
    backgroundColor: sg.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    borderRadius: sg.radius.panel,
    overflow: 'hidden',
  },
  cardsScrollWrap: { flex: 1 },
  cardsContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36 },
  /** Single-card pulls: park [card + auth feed] in the vertical middle of the panel. */
  cardsContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  heroBlock: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  heroStage: {
    width: 236,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAuraOuter: {
    position: 'absolute',
    width: 236,
    height: 300,
    borderRadius: 999,
    backgroundColor: sg.cobaltWash,
  },
  heroAuraInner: {
    position: 'absolute',
    width: 200,
    height: 260,
    borderRadius: 999,
    backgroundColor: sg.cobaltWashStrong,
    ...sg.glowCobalt,
  },
  // shadowHero lives ONLY here on this screen (§3 — one hero per screen)
  heroShadow: {
    width: 176,
    height: 246,
    borderRadius: 12,
    backgroundColor: sg.surface2,
    ...sg.shadowHero,
  },
  heroImgClip: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  heroImg: { width: '100%', height: '100%' },
  specRow: {
    alignSelf: 'stretch',
    marginTop: 14,
    paddingHorizontal: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  specBadge: {
    overflow: 'hidden',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: sg.radius.pill,
    backgroundColor: 'rgba(8,14,28,0.72)',
    borderWidth: 1,
    borderColor: sg.cobaltBorder,
  },
  specBadgeEmphasis: {
    borderColor: sg.neonBorder,
    backgroundColor: 'rgba(12,16,30,0.78)',
    ...sg.glowNeon,
  },
  specBadgeText: {
    fontFamily: sg.font.dataBold,
    fontSize: 12.5,
    letterSpacing: 0.6,
    color: sg.text,
    fontVariant: [...sg.numeric],
  },
  specBadgeTextEmphasis: {
    letterSpacing: 0.35,
    fontSize: 11.5,
  },
  specSheen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 36,
    left: 0,
  },
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    borderRadius: sg.radius.btn,
    backgroundColor: sg.surface2,
  },
  artFrameCompact: { width: '78%' },
  artCode: {
    fontFamily: sg.font.bodyBold,
    fontSize: 14,
    color: sg.text,
    textAlign: 'center',
  },
  artCodeCompact: { fontSize: 9 },
  artStatus: {
    marginTop: sg.space.xs,
    fontFamily: sg.font.bodyMedium,
    fontSize: 10,
    letterSpacing: 0,
    color: sg.muted,
  },
  artBottomRail: {
    width: '60%',
    height: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.lineStrong,
    borderRadius: sg.radius.pill,
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
    color: sg.value,
    marginTop: 2,
    fontVariant: [...sg.numeric],
  },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 46 },
  totalRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: sg.line,
    paddingVertical: sg.space.md,
    paddingHorizontal: sg.space.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 12,
    letterSpacing: 0,
    color: sg.muted,
  },
  totalCount: {
    fontFamily: sg.font.body,
    fontSize: 11,
    color: sg.muted,
    marginTop: 4,
    fontVariant: [...sg.numeric],
  },
  totalValue: {
    fontFamily: sg.font.dataBold,
    fontSize: 24,
    color: sg.value,
    fontVariant: [...sg.numeric],
  },

  // 4. Action bar
  actionBar: {
    padding: sg.space.md,
    backgroundColor: sg.surface,
    borderRadius: sg.radius.panel,
    marginTop: sg.space.sm,
    marginHorizontal: sg.space.md,
  },
  cta: { height: 54, paddingVertical: 0 },
  disclaimer: {
    fontFamily: sg.font.body,
    fontSize: 12,
    lineHeight: 18,
    color: sg.muted,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  secondary: { height: 50, paddingVertical: 0, backgroundColor: sg.surface2 },

  // 5. Footer
  footer: {
    minHeight: 44,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: { fontFamily: sg.font.bodyMedium, fontSize: 12, color: sg.muted },

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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: sg.line,
    paddingHorizontal: sg.space.lg,
    paddingTop: sg.space.sm,
    paddingBottom: sg.space.lg,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: sg.radius.pill,
    backgroundColor: sg.lineStrong,
    marginBottom: sg.space.lg,
  },
  sheetTitle: {
    fontFamily: sg.font.display,
    fontSize: sg.type.title.fontSize,
    lineHeight: sg.type.title.lineHeight,
    color: sg.text,
  },
  sheetAmount: {
    fontFamily: sg.font.dataBold,
    fontSize: 34,
    color: sg.value,
    marginTop: 14,
    fontVariant: [...sg.numeric],
  },
  sheetAmountSub: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 12,
    letterSpacing: 0,
    color: sg.muted,
    marginTop: 4,
  },
  sheetBody: {
    fontFamily: sg.font.body,
    fontSize: sg.type.body.fontSize,
    color: sg.muted,
    marginTop: 14,
    marginBottom: 20,
    lineHeight: sg.type.body.lineHeight,
  },
  sheetCancel: { height: 50, paddingVertical: 0, backgroundColor: sg.surface2, marginTop: 10 },
});
