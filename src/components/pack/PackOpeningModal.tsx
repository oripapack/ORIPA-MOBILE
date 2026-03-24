import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
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
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { ChipTagType, Pack } from '../../data/mockPacks';
import { useAppStore } from '../../store/useAppStore';
import { getAppLogoParts } from '../../config/app';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { transparentModalIOSProps } from '../../constants/modalPresentation';

/**
 * FIFA Ultimate Team–inspired pack flow:
 * Stadium tunnel → pack build-up + rarity light tunnel → burst flash → walkout card → confetti on high pulls.
 */

type PackOpenResult = {
  result: string;
  creditsWon: number;
  tier: RarityTier;
};

/** stadium = pack + lights; burst = flash; walkout = card flies in; done = idle + CTAs */
type FlowPhase = 'stadium' | 'burst' | 'walkout' | 'done';

const { width: WIN_W, height: WIN_H } = Dimensions.get('window');

const STADIUM_MS = 3200;
const BURST_MS = 420;
const WALKOUT_MS = 1100;

const PACK_OPENING_BRAND = getAppLogoParts();

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function packResultPool(pack: Pack, t: TFunction, packName: string) {
  const tags = pack.tags as ChipTagType[];
  const isGraded = tags.includes('graded');
  const isBest = tags.includes('best_value');
  const isHot = tags.includes('hot_drop') || tags.includes('chase_boost');
  const isNew = tags.includes('new') || tags.includes('new_user');

  const rarityCommon = [
    t('packOpening.resultCommon1', { packName }),
    t('packOpening.resultCommon2', { packName }),
    t('packOpening.resultCommon3', { packName }),
  ];
  const rarityRare = [
    t('packOpening.resultRare1', { packName }),
    t('packOpening.resultRare2', { packName }),
    t('packOpening.resultRare3', { packName }),
  ];
  const rarityLegendary = [
    t('packOpening.resultLegendary1', { packName }),
    t('packOpening.resultLegendary2', { packName }),
    t('packOpening.resultLegendary3', { packName }),
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

/** Rarity from payout ratio (aligned with mult bands from `packResultPool`). */
function tierFromRoll(creditsWon: number, creditPrice: number): RarityTier {
  const p = Math.max(1, creditPrice);
  const r = creditsWon / p;
  if (r >= 2.35) return 'mythic';
  if (r >= 1.9) return 'legendary';
  if (r >= 1.4) return 'epic';
  if (r >= 1.07) return 'rare';
  return 'common';
}

function generatePackOpenResult(pack: Pack, t: TFunction, packName: string): PackOpenResult {
  const { rarityCommon, rarityRare, rarityLegendary, minMult, maxMult } = packResultPool(pack, t, packName);
  const mult = minMult + Math.random() * (maxMult - minMult);
  const creditsWon = Math.max(0, Math.floor(pack.creditPrice * mult));

  const tier = tierFromRoll(creditsWon, pack.creditPrice);
  let result: string;
  if (tier === 'mythic' || tier === 'legendary') {
    result = pick(rarityLegendary);
  } else if (tier === 'epic' || tier === 'rare') {
    result = pick(rarityRare);
  } else {
    result = pick(rarityCommon);
  }

  return { result, creditsWon, tier };
}

const TIER_STYLES: Record<
  RarityTier,
  {
    label: string;
    accent: string;
    glow: string;
    border: string;
    emoji: string;
    beam: string;
    beamSoft: string;
    cardTop: string;
    ovrBg: string;
  }
> = {
  common: {
    label: 'COMMON',
    accent: '#4ADE80',
    glow: 'rgba(34, 197, 94, 0.55)',
    border: 'rgba(74, 222, 128, 0.95)',
    emoji: '●',
    beam: 'rgba(74, 222, 128, 0.45)',
    beamSoft: 'rgba(74, 222, 128, 0.14)',
    cardTop: '#0f1f14',
    ovrBg: '#15803D',
  },
  rare: {
    label: 'RARE',
    accent: '#60A5FA',
    glow: 'rgba(59, 130, 246, 0.65)',
    border: 'rgba(96, 165, 250, 1)',
    emoji: '✦',
    beam: 'rgba(59, 130, 246, 0.55)',
    beamSoft: 'rgba(59, 130, 246, 0.15)',
    cardTop: '#172554',
    ovrBg: '#2563EB',
  },
  epic: {
    label: 'EPIC',
    accent: '#C084FC',
    glow: 'rgba(168, 85, 247, 0.7)',
    border: 'rgba(192, 132, 252, 1)',
    emoji: '✧',
    beam: 'rgba(168, 85, 247, 0.5)',
    beamSoft: 'rgba(168, 85, 247, 0.14)',
    cardTop: '#2e1065',
    ovrBg: '#7C3AED',
  },
  legendary: {
    label: 'LEGENDARY',
    accent: '#FBBF24',
    glow: 'rgba(245, 196, 81, 0.75)',
    border: 'rgba(251, 191, 36, 1)',
    emoji: '★',
    beam: 'rgba(251, 191, 36, 0.6)',
    beamSoft: 'rgba(251, 191, 36, 0.18)',
    cardTop: '#422006',
    ovrBg: '#B45309',
  },
  mythic: {
    label: 'MYTHIC',
    accent: '#F87171',
    glow: 'rgba(239, 68, 68, 0.8)',
    border: 'rgba(248, 113, 113, 1)',
    emoji: '✦',
    beam: 'rgba(239, 68, 68, 0.55)',
    beamSoft: 'rgba(239, 68, 68, 0.16)',
    cardTop: '#450a0a',
    ovrBg: '#B91C1C',
  },
};

const PARTICLE_COUNT = 58;

function PackEnergyRings({ color, active }: { color: string; active: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  const sOuter = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.08] });
  const oOuter = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.48] });
  const sInner = pulse.interpolate({ inputRange: [0, 1], outputRange: [1.06, 0.9] });
  const oInner = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.34] });

  if (!active) return null;

  return (
    <View style={energyRingStyles.wrap} pointerEvents="none">
      <Animated.View
        style={[
          energyRingStyles.ring,
          energyRingStyles.ringOuter,
          {
            borderColor: color,
            transform: [{ scale: sOuter }],
            opacity: oOuter,
          },
        ]}
      />
      <Animated.View
        style={[
          energyRingStyles.ring,
          energyRingStyles.ringInner,
          {
            borderColor: color,
            transform: [{ scale: sInner }],
            opacity: oInner,
          },
        ]}
      />
    </View>
  );
}

const energyRingStyles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  ring: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  ringOuter: {
    width: 272,
    height: 332,
    borderRadius: radius.xl,
    borderWidth: 2,
  },
  ringInner: {
    width: 236,
    height: 296,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
});

function StadiumGradient() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={WIN_W} height={WIN_H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="stadiumGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#030712" />
            <Stop offset="0.22" stopColor="#0b1020" />
            <Stop offset="0.42" stopColor="#120a1e" />
            <Stop offset="0.58" stopColor="#0f172a" />
            <Stop offset="0.78" stopColor="#1a1035" />
            <Stop offset="1" stopColor="#020617" />
          </LinearGradient>
          <LinearGradient id="stadiumAurora" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="rgba(56, 189, 248, 0.14)" />
            <Stop offset="0.45" stopColor="rgba(168, 85, 247, 0.1)" />
            <Stop offset="1" stopColor="rgba(244, 63, 94, 0.08)" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={WIN_W} height={WIN_H} fill="url(#stadiumGrad)" />
        <Rect x={0} y={0} width={WIN_W} height={WIN_H} fill="url(#stadiumAurora)" opacity={0.85} />
      </Svg>
      <View style={styles.vignetteTop} />
      <View style={styles.vignetteBottom} />
    </View>
  );
}

function Spotlight({ pulse }: { pulse: Animated.Value }) {
  const op = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.38] });
  return (
    <Animated.View style={[styles.spotlightBlob, { opacity: op }]} pointerEvents="none">
      <View style={styles.spotlightInner} />
    </Animated.View>
  );
}

function RaritySweepBeams({ tier, active }: { tier: RarityTier; active: boolean }) {
  const x = useRef(new Animated.Value(0)).current;
  const tv = TIER_STYLES[tier];

  useEffect(() => {
    if (!active) {
      x.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(x, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [active, x]);

  const tx = x.interpolate({ inputRange: [0, 1], outputRange: [-WIN_W * 0.35, WIN_W * 0.35] });

  return (
    <View style={styles.beamsWrap} pointerEvents="none">
      {[0, 1, 2, 3, 4].map((i) => (
        <Animated.View
          key={i}
          style={[
            styles.beam,
            {
              left: (0.08 + i * 0.14) * WIN_W,
              backgroundColor: i % 2 === 0 ? tv.beam : tv.beamSoft,
              opacity: 0.28 + i * 0.12,
              transform: [{ translateX: tx }, { rotate: '6deg' }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function RareConfetti({ active, tier }: { active: boolean; tier: RarityTier }) {
  const progress = useRef(Array.from({ length: PARTICLE_COUNT }, () => new Animated.Value(0))).current;
  const angles = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }, (_, i) => (i / PARTICLE_COUNT) * Math.PI * 2 + i * 0.21),
    [],
  );
  const distances = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }, () => 110 + Math.random() * 100),
    [],
  );
  const spins = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }, () => (Math.random() > 0.5 ? 1 : -1) * (280 + Math.random() * 260)),
    [],
  );

  const dotColor =
    tier === 'mythic'
      ? '#EF4444'
      : tier === 'legendary'
        ? '#FBBF24'
        : tier === 'epic'
          ? '#A855F7'
          : tier === 'rare'
            ? '#60A5FA'
            : '#22C55E';

  useEffect(() => {
    if (!active) {
      progress.forEach((p) => p.setValue(0));
      return;
    }
    const anim = Animated.stagger(
      14,
      progress.map((p, i) =>
        Animated.timing(p, {
          toValue: 1,
          duration: 900 + (i % 6) * 20,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    );
    anim.start();
    return () => anim.stop();
  }, [active, progress]);

  if (!active) return null;

  return (
    <View style={confettiStyles.wrap} pointerEvents="none">
      {progress.map((p, i) => {
        const ang = angles[i] ?? 0;
        const dist = distances[i] ?? 100;
        const dx = Math.cos(ang) * dist;
        const dy = Math.sin(ang) * dist * 0.85;
        const tx = p.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
        const ty = p.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });
        const rot = p.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spins[i] ?? 300}deg`] });
        const op = p.interpolate({ inputRange: [0, 0.06, 0.9, 1], outputRange: [0, 1, 0.95, 0] });
        const size = 5 + (i % 5);
        return (
          <Animated.View
            key={i}
            style={[
              confettiStyles.dot,
              {
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                borderRadius: size / 2,
                opacity: op,
                transform: [{ translateX: tx }, { translateY: ty }, { rotate: rot }],
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

function RevealCta({
  visible,
  instant,
  children,
}: {
  visible: boolean;
  instant: boolean;
  children: React.ReactNode;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      translateY.setValue(28);
      return;
    }
    if (instant) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    translateY.setValue(28);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 108,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, instant, opacity, translateY]);

  if (!visible) return null;

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>
  );
}

const confettiStyles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
  },
  dot: {
    position: 'absolute',
    left: '50%',
    top: '42%',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});

export function PackOpeningModal() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const visible = useAppStore((s) => s.modals.packOpening);
  const selectedPack = useAppStore((s) => s.selectedPack);
  const packOpenSessionId = useAppStore((s) => s.packOpenSessionId);
  const closeModal = useAppStore((s) => s.closeModal);
  const openModal = useAppStore((s) => s.openModal);
  const setSelectedPack = useAppStore((s) => s.setSelectedPack);
  const applyPackOpenResult = useAppStore((s) => s.applyPackOpenResult);

  const [phase, setPhase] = useState<FlowPhase>('stadium');
  const [pending, setPending] = useState<PackOpenResult | null>(null);
  const [stadiumHint, setStadiumHint] = useState('');
  const [skippedToEnd, setSkippedToEnd] = useState(false);
  const didApplyRef = useRef(false);
  const rollRef = useRef<PackOpenResult | null>(null);

  const modalOpacity = useRef(new Animated.Value(0)).current;
  const spotlightPulse = useRef(new Animated.Value(0)).current;
  const packScale = useRef(new Animated.Value(0.45)).current;
  const packY = useRef(new Animated.Value(120)).current;
  const packShake = useRef(new Animated.Value(0)).current;
  const packOpacity = useRef(new Animated.Value(1)).current;
  const burstFlash = useRef(new Animated.Value(0)).current;
  const burstTint = useRef(new Animated.Value(0)).current;
  const walkoutY = useRef(new Animated.Value(520)).current;
  const walkoutScale = useRef(new Animated.Value(0.5)).current;
  const walkoutRotate = useRef(new Animated.Value(0)).current;
  const cardShine = useRef(new Animated.Value(0)).current;

  const glowLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const shakeLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timersRef = useRef<{
    burst?: ReturnType<typeof setTimeout>;
    walkout?: ReturnType<typeof setTimeout>;
    done?: ReturnType<typeof setTimeout>;
    hint?: ReturnType<typeof setTimeout>;
  }>({});

  const packShakeDeg = useMemo(
    () =>
      packShake.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: ['-4deg', '5deg', '-6deg', '4deg', '-4deg'],
      }),
    [packShake],
  );

  useEffect(() => {
    if (visible) void initPackOpeningFeedback();
    else void unloadPackOpeningFeedback();
  }, [visible]);

  /** Clear stale reveal when sheet closes so the next open doesn’t flash the previous roll. */
  useEffect(() => {
    if (visible) return;
    setPending(null);
    setPhase('stadium');
    setStadiumHint('');
    rollRef.current = null;
    didApplyRef.current = false;
    setSkippedToEnd(false);
  }, [visible]);

  const runWalkoutAnimation = (tier: RarityTier) => {
    walkoutY.setValue(520);
    const startScale =
      tier === 'mythic'
        ? 0.36
        : tier === 'legendary'
          ? 0.4
          : tier === 'epic'
            ? 0.43
            : tier === 'rare'
              ? 0.47
              : 0.52;
    walkoutScale.setValue(startScale);
    walkoutRotate.setValue(0);
    cardShine.setValue(0);

    const ySpring =
      tier === 'mythic'
        ? { friction: 4, tension: 64 }
        : tier === 'legendary'
          ? { friction: 5, tension: 68 }
          : tier === 'epic'
            ? { friction: 5, tension: 72 }
            : tier === 'rare'
              ? { friction: 6, tension: 74 }
              : { friction: 7, tension: 80 };

    const scaleSpring =
      tier === 'mythic' || tier === 'legendary'
        ? { friction: 4, tension: 74 }
        : { friction: 6, tension: 78 };

    Animated.parallel([
      Animated.spring(walkoutY, {
        toValue: 0,
        ...ySpring,
        useNativeDriver: true,
      }),
      Animated.spring(walkoutScale, {
        toValue: 1,
        ...scaleSpring,
        useNativeDriver: true,
      }),
      Animated.timing(walkoutRotate, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardShine, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const skipToEnd = () => {
    const roll = rollRef.current ?? pending;
    if (!roll) return;
    glowLoopRef.current?.stop();
    shakeLoopRef.current?.stop();
    Object.values(timersRef.current).forEach((id) => id && clearTimeout(id));
    timersRef.current = {};

    setSkippedToEnd(true);
    setPhase('done');
    packOpacity.setValue(0);
    burstFlash.setValue(0);
    burstTint.setValue(0);
    walkoutY.setValue(0);
    walkoutScale.setValue(1);
    walkoutRotate.setValue(1);
    cardShine.setValue(1);
    void playPackHit();
    hapticPackResult(roll.tier);
  };

  useEffect(() => {
    if (!visible || !selectedPack) return;

    didApplyRef.current = false;
    setSkippedToEnd(false);
    const loc = getLocalizedPackFields(selectedPack, t);
    const roll = generatePackOpenResult(selectedPack, t, loc.title);
    rollRef.current = roll;
    setPending(roll);
    setPhase('stadium');
    setStadiumHint(t('packOpening.opening'));

    modalOpacity.setValue(0);
    spotlightPulse.setValue(0);
    packScale.setValue(0.45);
    packY.setValue(120);
    packShake.setValue(0);
    packOpacity.setValue(1);
    burstFlash.setValue(0);
    burstTint.setValue(0);
    walkoutY.setValue(520);
    walkoutScale.setValue(0.5);
    walkoutRotate.setValue(0);
    cardShine.setValue(0);

    const spotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(spotlightPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(spotlightPulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    glowLoopRef.current = spotLoop;
    spotLoop.start();

    const shakeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(packShake, {
          toValue: 1,
          duration: 180,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(packShake, {
          toValue: 0,
          duration: 180,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    shakeLoopRef.current = shakeLoop;
    shakeLoop.start();

    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(packScale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.spring(packY, {
        toValue: 0,
        friction: 6,
        tension: 68,
        useNativeDriver: true,
      }),
    ]).start((ev) => {
      if (ev?.finished) {
        hapticPackEnter();
        void playPackTear();
      }
    });

    timersRef.current.hint = setTimeout(() => {
      setStadiumHint(t('packOpening.suspense'));
    }, 1400);

    timersRef.current.burst = setTimeout(() => {
      setPhase('burst');
      glowLoopRef.current?.stop();
      shakeLoopRef.current?.stop();
      void playPackReveal();
      hapticPackReveal();

      const chroma =
        roll.tier === 'mythic' || roll.tier === 'legendary' || roll.tier === 'epic';
      if (chroma) {
        burstTint.setValue(0);
        Animated.sequence([
          Animated.timing(burstTint, {
            toValue: 0.92,
            duration: 52,
            useNativeDriver: true,
          }),
          Animated.timing(burstTint, {
            toValue: 0,
            duration: 360,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }

      Animated.timing(packOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();

      Animated.sequence([
        Animated.timing(burstFlash, {
          toValue: 1,
          duration: chroma ? 55 : 70,
          useNativeDriver: true,
        }),
        Animated.timing(burstFlash, {
          toValue: 0,
          duration: chroma ? 300 : 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, STADIUM_MS);

    timersRef.current.walkout = setTimeout(() => {
      setPhase('walkout');
      runWalkoutAnimation(roll.tier);
      void playPackHit();
      hapticPackResult(roll.tier);
    }, STADIUM_MS + BURST_MS);

    timersRef.current.done = setTimeout(() => {
      setPhase('done');
    }, STADIUM_MS + BURST_MS + WALKOUT_MS);

    return () => {
      glowLoopRef.current?.stop();
      shakeLoopRef.current?.stop();
      Object.values(timersRef.current).forEach((id) => id && clearTimeout(id));
      timersRef.current = {};
    };
  }, [
    visible,
    selectedPack,
    packOpenSessionId,
    t,
    modalOpacity,
    spotlightPulse,
    packScale,
    packY,
    packShake,
    packOpacity,
    burstFlash,
    burstTint,
    walkoutY,
    walkoutScale,
    walkoutRotate,
    cardShine,
  ]);

  useEffect(() => {
    if (!visible || !selectedPack || !pending) return;
    if (didApplyRef.current) return;
    if (phase !== 'done') return;

    didApplyRef.current = true;
    applyPackOpenResult(pending);
  }, [applyPackOpenResult, pending, phase, selectedPack, visible]);

  const tierVisual = pending ? TIER_STYLES[pending.tier] : TIER_STYLES.common;
  const packTint = selectedPack?.imageColor ?? colors.nearBlack;

  const showConfetti =
    !!pending &&
    pending.tier !== 'common' &&
    (phase === 'walkout' || phase === 'done');

  const walkoutRotStr = walkoutRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['8deg', '0deg'],
  });

  const shineX = cardShine.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 220],
  });

  const goToWonPrizes = () => {
    closeModal('packOpening');
    setSelectedPack(null);
    openModal('wonPrizes');
  };

  const showSkip = phase !== 'done';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      {...transparentModalIOSProps}
      onRequestClose={() => {}}
    >
      <Pressable style={styles.rootPress} onPress={() => {}}>
        <StadiumGradient />
        <Spotlight pulse={spotlightPulse} />

        {phase === 'stadium' && pending && (
          <RaritySweepBeams tier={pending.tier} active />
        )}

        <Animated.View
          style={[
            styles.content,
            {
              opacity: modalOpacity,
              paddingTop: insets.top + spacing.sm,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.titleFifa}>{t('packOpening.title')}</Text>
              <Text style={styles.subFifa} numberOfLines={2}>
                {selectedPack ? getLocalizedPackFields(selectedPack, t).title : ''}
              </Text>
            </View>
            <View style={styles.headerRight}>
              {showSkip && (
                <TouchableOpacity onPress={skipToEnd} hitSlop={12} style={styles.skipBtn}>
                  <Text style={styles.skipText}>{t('packOpening.skip')}</Text>
                </TouchableOpacity>
              )}
              <View style={styles.livePillFifa}>
                <Text style={styles.liveDot}>●</Text>
                <Text style={styles.liveText}>{t('packOpening.live')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.stage}>
            {(phase === 'stadium' || phase === 'burst') && (
              <View style={styles.packStage}>
                {phase === 'stadium' && pending && (
                  <PackEnergyRings color={tierVisual.border} active />
                )}
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.packHalo,
                    {
                      borderColor: tierVisual.border,
                      shadowColor: tierVisual.glow,
                      opacity: packOpacity,
                    },
                  ]}
                />
                <Animated.View
                  style={{
                    opacity: packOpacity,
                    transform: [{ translateY: packY }, { rotate: packShakeDeg }, { scale: packScale }],
                  }}
                >
                  <View style={[styles.packArtFifa, { backgroundColor: packTint }]}>
                    <Text style={styles.packEmoji}>🎴</Text>
                    <Text style={styles.packArtTitle}>{PACK_OPENING_BRAND.primary.toUpperCase()}</Text>
                    {PACK_OPENING_BRAND.secondary ? (
                      <Text style={styles.packArtSub}>{PACK_OPENING_BRAND.secondary.toUpperCase()}</Text>
                    ) : null}
                    <Text style={styles.packHint}>{stadiumHint}</Text>
                  </View>
                </Animated.View>
              </View>
            )}

            <Animated.View
              pointerEvents="none"
              style={[
                styles.burstTintLayer,
                {
                  opacity: burstTint,
                  backgroundColor: pending ? TIER_STYLES[pending.tier].beam : 'transparent',
                },
              ]}
            />

            <Animated.View
              pointerEvents="none"
              style={[
                styles.burstLayer,
                {
                  opacity: burstFlash,
                },
              ]}
            />

            {(phase === 'walkout' || phase === 'done') && pending && (
              <View style={styles.walkoutArea}>
                <RareConfetti active={!!showConfetti} tier={pending.tier} />
                <Animated.View
                  style={[
                    styles.fifaCardOuter,
                    {
                      borderColor: tierVisual.border,
                      shadowColor: tierVisual.glow,
                      transform: [
                        { translateY: walkoutY },
                        { scale: walkoutScale },
                        { rotate: walkoutRotStr },
                      ],
                    },
                  ]}
                >
                  <View style={[styles.fifaCardTop, { backgroundColor: tierVisual.cardTop }]}>
                    <View style={[styles.ovrCircle, { backgroundColor: tierVisual.ovrBg }]}>
                      {/* Same exact figure as the bar below + Won Prizes convert (no K/M rounding). */}
                      <Text
                        style={styles.ovrNum}
                        numberOfLines={2}
                        adjustsFontSizeToFit
                        minimumFontScale={0.45}
                      >
                        {pending.creditsWon.toLocaleString()}
                      </Text>
                      <Text style={styles.ovrLbl}>CR</Text>
                    </View>
                    <View style={styles.fifaCardMeta}>
                      <Text style={[styles.fifaTierLbl, { color: tierVisual.accent }]}>
                        {tierVisual.emoji} {tierVisual.label}
                      </Text>
                      <Text style={styles.fifaHead}>{t('packOpening.youPulled')}</Text>
                      <Text style={styles.fifaName} numberOfLines={3}>
                        {pending.result}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.fifaCardBar}>
                    <Text style={[styles.fifaCreditsBig, { color: tierVisual.accent }]}>
                      {t('packOpening.creditsLabel', {
                        amount: pending.creditsWon.toLocaleString(),
                      })}
                    </Text>
                  </View>
                  <Animated.View
                    style={[
                      styles.cardShine,
                      {
                        opacity: cardShine,
                        transform: [{ translateX: shineX }],
                      },
                    ]}
                  />
                </Animated.View>
              </View>
            )}
          </View>

          <RevealCta visible={phase === 'done'} instant={skippedToEnd}>
            <View style={styles.ctaRow}>
              <PrimaryButton label={t('packOpening.continue')} variant="red" onPress={goToWonPrizes} style={styles.cta} />
              <SecondaryButton label={t('packOpening.openNext')} onPress={goToWonPrizes} />
            </View>
          </RevealCta>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  rootPress: {
    flex: 1,
    backgroundColor: '#000',
  },
  vignetteTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    height: '38%',
  },
  vignetteBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  spotlightBlob: {
    position: 'absolute',
    top: '6%',
    left: '10%',
    right: '10%',
    height: WIN_H * 0.42,
    alignItems: 'center',
  },
  spotlightInner: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: [{ scaleX: 1.15 }],
  },
  beamsWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 1,
  },
  beam: {
    position: 'absolute',
    top: '18%',
    width: 44,
    height: '70%',
    borderRadius: 8,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: spacing.base,
    zIndex: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  titleFifa: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: '#F8FAFC',
    marginBottom: 2,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  subFifa: {
    fontSize: fontSize.xs,
    color: 'rgba(248,250,252,0.45)',
    maxWidth: '80%',
    letterSpacing: 0.5,
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
  livePillFifa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  liveDot: {
    fontSize: 9,
    color: colors.red,
  },
  liveText: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
  },
  stage: {
    flex: 1,
    minHeight: 380,
    justifyContent: 'center',
  },
  packStage: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 260,
  },
  packHalo: {
    position: 'absolute',
    width: 240,
    height: 300,
    borderRadius: radius.xl,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 12,
  },
  packArtFifa: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    minWidth: 216,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  },
  packEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  packArtTitle: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    letterSpacing: 4,
  },
  packArtSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 4,
    marginTop: 6,
  },
  packHint: {
    marginTop: spacing.lg,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  burstTintLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 18,
  },
  burstLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 20,
  },
  walkoutArea: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    zIndex: 15,
  },
  fifaCardOuter: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 16,
  },
  fifaCardTop: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    minHeight: 168,
  },
  ovrCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  ovrNum: {
    color: '#fff',
    fontSize: 20,
    fontWeight: fontWeight.black,
    letterSpacing: -0.5,
  },
  ovrLbl: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: fontWeight.bold,
    marginTop: 2,
    letterSpacing: 2,
  },
  fifaCardMeta: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  fifaTierLbl: {
    fontSize: 11,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    marginBottom: 6,
  },
  fifaHead: {
    color: 'rgba(248,250,252,0.55)',
    fontSize: 10,
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fifaName: {
    color: '#F8FAFC',
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    lineHeight: 22,
  },
  fifaCardBar: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  fifaCreditsBig: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 72,
    marginLeft: -36,
    backgroundColor: 'rgba(255,255,255,0.14)',
    transform: [{ skewX: '-18deg' }],
  },
  ctaRow: {
    gap: spacing.sm,
  },
  cta: {
    marginBottom: 0,
  },
});
