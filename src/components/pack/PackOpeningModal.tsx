import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  hapticPackEnter,
  hapticPackReveal,
  hapticPackResult,
  initPackOpeningFeedback,
  playPackHit,
  playPackReveal,
  playPackTear,
  unloadPackOpeningFeedback,
  type RarityTier,
} from '../../audio/packOpeningFeedback';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import { ChipTagType, Pack } from '../../data/mockPacks';
import { useAppStore } from '../../store/useAppStore';

/**
 * Pack opening (ref #9 style flow):
 * 1) Open pack (from store) → 2) Pack + glow → 3) 1.5s suspense → 4) Card reveal → 5) Confetti if rare+
 * Optional: Skip, Open next (→ Won Prizes same as Continue).
 */

type PackOpenResult = {
  result: string;
  creditsWon: number;
  tier: RarityTier;
};

/** Pack entrance, then mystery hold, then flip to result, then idle. */
type FlowPhase = 'glow' | 'suspense' | 'reveal' | 'done';

const PACK_ENTER_MS = 400;
const SUSPENSE_MS = 1500;
/** Time from mount until reveal starts (after pack is in + glow). */
const MS_UNTIL_REVEAL = PACK_ENTER_MS + SUSPENSE_MS;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function packResultPool(pack: Pack) {
  const tags = pack.tags as ChipTagType[];
  const isGraded = tags.includes('graded');
  const isBest = tags.includes('best_value');
  const isHot = tags.includes('hot_drop') || tags.includes('chase_boost');
  const isNew = tags.includes('new') || tags.includes('new_user');

  const rarityCommon = [
    `Common hit from ${pack.title}`,
    `Standard pull from ${pack.title}`,
    `Everyday card from ${pack.title}`,
  ];
  const rarityRare = [
    `Rare hit from ${pack.title}`,
    `Ultra pull from ${pack.title}`,
    `Special card from ${pack.title}`,
  ];
  const rarityLegendary = [
    `Legendary hit from ${pack.title}`,
    `Mythic pull from ${pack.title}`,
    `Game-changing card from ${pack.title}`,
  ];

  let minMult = 0.2;
  let maxMult = 1.6;
  if (isNew) {
    minMult = 0.25;
    maxMult = 1.8;
  }
  if (isHot) {
    minMult = 0.35;
    maxMult = 2.2;
  }
  if (isBest) {
    minMult = 0.65;
    maxMult = 2.7;
  }
  if (isGraded) {
    minMult = 0.6;
    maxMult = 3.0;
  }

  return { rarityCommon, rarityRare, rarityLegendary, minMult, maxMult };
}

function generatePackOpenResult(pack: Pack): PackOpenResult {
  const { rarityCommon, rarityRare, rarityLegendary, minMult, maxMult } = packResultPool(pack);
  const mult = minMult + Math.random() * (maxMult - minMult);
  const creditsWon = Math.max(0, Math.floor(pack.creditPrice * mult));

  const high = creditsWon >= Math.floor(pack.creditPrice * 1.8);
  const mid = creditsWon >= Math.floor(pack.creditPrice * 1.1);

  const tier: RarityTier = high ? 'legendary' : mid ? 'rare' : 'common';
  const result = high ? pick(rarityLegendary) : mid ? pick(rarityRare) : pick(rarityCommon);

  return { result, creditsWon, tier };
}

const TIER_STYLES: Record<
  RarityTier,
  { label: string; accent: string; glow: string; border: string; emoji: string }
> = {
  common: {
    label: 'COMMON',
    accent: colors.textSecondary,
    glow: 'rgba(107, 114, 128, 0.35)',
    border: 'rgba(107, 114, 128, 0.45)',
    emoji: '◆',
  },
  rare: {
    label: 'RARE',
    accent: '#2563EB',
    glow: 'rgba(37, 99, 235, 0.45)',
    border: 'rgba(59, 130, 246, 0.85)',
    emoji: '✦',
  },
  legendary: {
    label: 'LEGENDARY',
    accent: colors.gold,
    glow: 'rgba(245, 196, 81, 0.55)',
    border: 'rgba(245, 196, 81, 0.95)',
    emoji: '★',
  },
};

const PARTICLE_COUNT = 18;

function RareConfetti({ active, tier }: { active: boolean; tier: RarityTier }) {
  const progress = useRef(Array.from({ length: PARTICLE_COUNT }, () => new Animated.Value(0))).current;
  const angles = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }, (_, i) => (i / PARTICLE_COUNT) * Math.PI * 2 + i * 0.31),
    [],
  );

  const dotColor = tier === 'legendary' ? colors.gold : '#3B82F6';

  useEffect(() => {
    if (!active) {
      progress.forEach((p) => p.setValue(0));
      return;
    }
    const anim = Animated.stagger(
      38,
      progress.map((p) =>
        Animated.spring(p, { toValue: 1, friction: 7, tension: 95, useNativeDriver: true }),
      ),
    );
    anim.start();
    return () => anim.stop();
  }, [active, progress]);

  if (!active) return null;

  return (
    <View style={confettiStyles.wrap} pointerEvents="none">
      {progress.map((p, i) => {
        const dx = Math.cos(angles[i] ?? 0) * 80;
        const dy = Math.sin(angles[i] ?? 0) * 80;
        const tx = p.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
        const ty = p.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });
        const op = p.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0.88] });
        return (
          <Animated.View
            key={i}
            style={[
              confettiStyles.dotAnchor,
              {
                opacity: op,
                transform: [{ translateX: tx }, { translateY: ty }],
                backgroundColor: dotColor,
                shadowColor: dotColor,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const confettiStyles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
  },
  dotAnchor: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 7,
    height: 7,
    marginLeft: -3.5,
    marginTop: -3.5,
    borderRadius: 4,
    shadowOpacity: 0.85,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});

export function PackOpeningModal() {
  const insets = useSafeAreaInsets();

  const visible = useAppStore((s) => s.modals.packOpening);
  const selectedPack = useAppStore((s) => s.selectedPack);
  const closeModal = useAppStore((s) => s.closeModal);
  const openModal = useAppStore((s) => s.openModal);
  const setSelectedPack = useAppStore((s) => s.setSelectedPack);
  const applyPackOpenResult = useAppStore((s) => s.applyPackOpenResult);

  const [phase, setPhase] = useState<FlowPhase>('glow');
  const [pending, setPending] = useState<PackOpenResult | null>(null);
  const [suspenseHint, setSuspenseHint] = useState('Opening…');
  const didApplyRef = useRef(false);
  /** Same roll as `pending` — for Skip before next paint. */
  const rollRef = useRef<PackOpenResult | null>(null);

  const modalOpacity = useRef(new Animated.Value(0)).current;
  const cardEnter = useRef(new Animated.Value(0.88)).current;
  const packGlowLoop = useRef(new Animated.Value(0)).current;
  const revealTilt = useRef(new Animated.Value(0)).current;
  const mysteryOpacity = useRef(new Animated.Value(1)).current;
  const resultPop = useRef(new Animated.Value(0)).current;
  const resultGlow = useRef(new Animated.Value(0)).current;

  const glowLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timersRef = useRef<{ reveal?: ReturnType<typeof setTimeout>; label?: ReturnType<typeof setTimeout> }>({});

  const revealTiltDeg = useMemo(
    () => revealTilt.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '8deg'] }),
    [revealTilt],
  );

  const packGlowOpacity = useMemo(
    () => packGlowLoop.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.95] }),
    [packGlowLoop],
  );

  const packGlowScale = useMemo(
    () => packGlowLoop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }),
    [packGlowLoop],
  );

  useEffect(() => {
    if (visible) void initPackOpeningFeedback();
    else void unloadPackOpeningFeedback();
  }, [visible]);

  const skipToEnd = () => {
    const roll = rollRef.current ?? pending;
    if (!roll) return;
    glowLoopRef.current?.stop();
    if (timersRef.current.reveal) clearTimeout(timersRef.current.reveal);
    if (timersRef.current.label) clearTimeout(timersRef.current.label);

    setPhase('done');
    revealTilt.setValue(1);
    mysteryOpacity.setValue(0);
    resultPop.setValue(1);
    resultGlow.setValue(1);
    void playPackHit();
    hapticPackResult(roll.tier);
  };

  useEffect(() => {
    if (!visible || !selectedPack) return;

    didApplyRef.current = false;
    const roll = generatePackOpenResult(selectedPack);
    rollRef.current = roll;
    setPending(roll);
    setPhase('glow');
    setSuspenseHint('Opening…');

    modalOpacity.setValue(0);
    cardEnter.setValue(0.88);
    packGlowLoop.setValue(0);
    revealTilt.setValue(0);
    mysteryOpacity.setValue(1);
    resultPop.setValue(0);
    resultGlow.setValue(0);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(packGlowLoop, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(packGlowLoop, {
          toValue: 0,
          duration: 750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    glowLoopRef.current = loop;
    loop.start();

    Animated.parallel([
      Animated.timing(modalOpacity, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(cardEnter, { toValue: 1, friction: 7, tension: 82, useNativeDriver: true }),
    ]).start((ev) => {
      if (ev?.finished) {
        hapticPackEnter();
        void playPackTear();
      }
    });

    timersRef.current.label = setTimeout(() => {
      setPhase('suspense');
      setSuspenseHint('What did you pull?');
    }, PACK_ENTER_MS);

    timersRef.current.reveal = setTimeout(() => {
      setPhase('reveal');
      glowLoopRef.current?.stop();
      void playPackReveal();
      hapticPackReveal();
      Animated.sequence([
        Animated.timing(revealTilt, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.delay(100),
      ]).start(() => {
        setPhase('done');
        void playPackHit();
        hapticPackResult(roll.tier);
        Animated.parallel([
          Animated.timing(mysteryOpacity, { toValue: 0, duration: 240, useNativeDriver: true }),
          Animated.spring(resultPop, { toValue: 1, friction: 7, tension: 110, useNativeDriver: true }),
          Animated.timing(resultGlow, { toValue: 1, duration: 280, useNativeDriver: true }),
        ]).start();
      });
    }, MS_UNTIL_REVEAL);

    return () => {
      glowLoopRef.current?.stop();
      if (timersRef.current.reveal) clearTimeout(timersRef.current.reveal);
      if (timersRef.current.label) clearTimeout(timersRef.current.label);
    };
  }, [visible, selectedPack, modalOpacity, cardEnter, packGlowLoop, revealTilt, mysteryOpacity, resultPop, resultGlow]);

  useEffect(() => {
    if (!visible || !selectedPack || !pending) return;
    if (didApplyRef.current) return;
    if (phase !== 'done') return;

    didApplyRef.current = true;
    applyPackOpenResult(pending);
  }, [applyPackOpenResult, pending, phase, selectedPack, visible]);

  const tierVisual = pending ? TIER_STYLES[pending.tier] : TIER_STYLES.common;
  const packTint = selectedPack?.imageColor ?? colors.nearBlack;

  const showConfetti = phase === 'done' && pending && (pending.tier === 'rare' || pending.tier === 'legendary');

  const goToWonPrizes = () => {
    closeModal('packOpening');
    setSelectedPack(null);
    openModal('wonPrizes');
  };

  const showSkip = phase !== 'done';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <Pressable style={styles.overlay} onPress={() => {}}>
        <Animated.View
          style={[
            styles.fullscreen,
            {
              opacity: modalOpacity,
              paddingTop: insets.top + spacing.sm,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.title}>Pack opening</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {selectedPack ? selectedPack.title : ''}
              </Text>
            </View>
            <View style={styles.headerRight}>
              {showSkip && (
                <TouchableOpacity onPress={skipToEnd} hitSlop={12} style={styles.skipBtn}>
                  <Text style={styles.skipText}>Skip ▸</Text>
                </TouchableOpacity>
              )}
              <View style={[styles.livePill, { borderColor: 'rgba(255,255,255,0.18)' }]}>
                <Text style={styles.liveDot}>●</Text>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
          </View>

          <View style={styles.stageWrap}>
            {/* Step 2: Pack + glow */}
            <View style={styles.packWrap}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.packGlowAura,
                  {
                    opacity: packGlowOpacity,
                    transform: [{ scale: packGlowScale }],
                  },
                ]}
              />
              <Animated.View style={{ transform: [{ scale: cardEnter }] }}>
                <View style={[styles.packArtInner, { backgroundColor: packTint }]}>
                  <Text style={styles.packEmoji}>🎴</Text>
                  <Text style={styles.packArtTitle}>VAULT</Text>
                  <Text style={styles.packArtSub}>PACK</Text>
                </View>
              </Animated.View>
            </View>

            {/* Steps 3–5: suspense → reveal → confetti */}
            <View style={styles.revealBox}>
              <View style={[styles.revealInner, { backgroundColor: packTint }]}>
                <RareConfetti active={!!showConfetti} tier={pending?.tier ?? 'rare'} />

                <Animated.View style={[styles.mysteryLayer, { opacity: mysteryOpacity }]}>
                  <Text style={styles.mysteryMark}>?</Text>
                  <Text style={styles.mysteryHint}>
                    {phase === 'suspense' || phase === 'glow' ? suspenseHint : 'Revealing…'}
                  </Text>
                  {(phase === 'suspense' || phase === 'glow') && (
                    <Text style={styles.suspenseDots}>• • •</Text>
                  )}
                </Animated.View>

                <Animated.View
                  style={[
                    styles.resultLayer,
                    {
                      opacity: resultPop,
                      transform: [
                        { scale: resultPop.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
                        { rotate: revealTiltDeg },
                      ],
                    },
                  ]}
                >
                  <View style={[styles.tierBadge, { borderColor: tierVisual.border }]}>
                    <Text style={[styles.tierBadgeText, { color: tierVisual.accent }]}>
                      {tierVisual.emoji} {tierVisual.label}
                    </Text>
                  </View>
                  <Text style={styles.resultHeadline}>You pulled</Text>
                  <Text style={styles.resultText}>{pending?.result ?? '—'}</Text>
                  <Text style={styles.resultCredits}>+{pending?.creditsWon.toLocaleString()} credits</Text>
                </Animated.View>

                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.glowRing,
                    {
                      borderColor: tierVisual.border,
                      shadowColor: tierVisual.glow,
                      opacity: resultGlow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.92] }),
                      transform: [
                        {
                          scale: resultGlow.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.02] }),
                        },
                      ],
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {phase === 'done' && (
            <View style={styles.ctaRow}>
              <PrimaryButton label="Continue" variant="red" onPress={goToWonPrizes} style={styles.cta} />
              <SecondaryButton label="Open next" onPress={goToWonPrizes} />
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#050508',
  },
  fullscreen: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    zIndex: 2,
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.75)',
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.black,
    color: colors.white,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.55)',
    maxWidth: '78%',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  liveDot: {
    fontSize: 10,
    color: colors.red,
  },
  liveText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
  },
  stageWrap: {
    flexGrow: 1,
    minHeight: 360,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.base,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  packWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    minHeight: 200,
  },
  packGlowAura: {
    position: 'absolute',
    width: 200,
    height: 260,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 24,
    elevation: 8,
  },
  packArtInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    minWidth: 200,
  },
  packEmoji: {
    fontSize: 44,
    marginBottom: 2,
  },
  packArtTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
  },
  packArtSub: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 3,
    marginTop: 4,
  },
  revealBox: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  revealInner: {
    minHeight: 168,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    overflow: 'hidden',
  },
  mysteryLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  mysteryMark: {
    fontSize: 56,
    fontWeight: fontWeight.black,
    color: 'rgba(255,255,255,0.22)',
    marginBottom: spacing.sm,
  },
  mysteryHint: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    lineHeight: 20,
  },
  suspenseDots: {
    marginTop: spacing.md,
    fontSize: fontSize.lg,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 4,
  },
  resultLayer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  tierBadge: {
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  tierBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    letterSpacing: 1.4,
  },
  resultHeadline: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  resultText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  resultCredits: {
    color: colors.gold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 0,
  },
  ctaRow: {
    gap: spacing.sm,
  },
  cta: {
    marginBottom: 0,
  },
});
