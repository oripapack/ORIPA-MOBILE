import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import type { RarityTier } from '../../../audio/packOpeningFeedback';
import { radius } from '../../../tokens/spacing';
import { REVEAL_RARITY_VISUAL } from './rarityTokens';
import type { RevealRarity } from './types';
import { STAGE } from './sharedStage';

const PARTICLE_COUNT = 58;
const { WIN_W } = STAGE;

type Props = {
  revealRarity: RevealRarity;
  active: boolean;
};

export function PackEnergyRings({ color, active }: { color: string; active: boolean }) {
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
    <View style={ringStyles.wrap} pointerEvents="none">
      <Animated.View
        style={[
          ringStyles.ring,
          ringStyles.ringOuter,
          {
            borderColor: color,
            transform: [{ scale: sOuter }],
            opacity: oOuter,
          },
        ]}
      />
      <Animated.View
        style={[
          ringStyles.ring,
          ringStyles.ringInner,
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

const ringStyles = StyleSheet.create({
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

export function RaritySweepBeams({ revealRarity, active }: Props) {
  const x = useRef(new Animated.Value(0)).current;
  const tv = REVEAL_RARITY_VISUAL[revealRarity];

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
    <View style={beamStyles.wrap} pointerEvents="none">
      {[0, 1, 2, 3, 4].map((i) => (
        <Animated.View
          key={i}
          style={[
            beamStyles.beam,
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

const beamStyles = StyleSheet.create({
  wrap: {
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
});

/** Map legacy audio tier to confetti palette (keeps parity with store tiers). */
const TIER_CONFETTI: Record<RarityTier, string> = {
  common: '#22C55E',
  rare: '#60A5FA',
  epic: '#A855F7',
  legendary: '#FBBF24',
  mythic: '#EF4444',
};

export function RareConfetti({
  active,
  tier,
  revealRarity,
}: {
  active: boolean;
  tier: RarityTier;
  revealRarity: RevealRarity;
}) {
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
    revealRarity === 'chase'
      ? REVEAL_RARITY_VISUAL.chase.accent
      : revealRarity === 'ultra_rare'
        ? REVEAL_RARITY_VISUAL.ultra_rare.accent
        : TIER_CONFETTI[tier];

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
