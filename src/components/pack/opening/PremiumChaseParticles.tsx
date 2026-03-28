import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { REVEAL_RARITY_VISUAL } from './rarityTokens';
import type { RevealRarity } from './types';

const COUNT = 20; // fewer, larger, slower

export function PremiumChaseParticles({ active, revealRarity }: { active: boolean; revealRarity: RevealRarity }) {
  const tv = REVEAL_RARITY_VISUAL[revealRarity];
  const progress = useRef(Array.from({ length: COUNT }, () => new Animated.Value(0))).current;

  const seed = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        ang: (i / COUNT) * Math.PI * 2 + i * 0.27,
        dist: 120 + (i % 5) * 18,
        spin: (i % 2 === 0 ? 1 : -1) * (180 + (i % 7) * 25),
        size: 10 + (i % 4) * 2,
        delay: (i % 6) * 22,
      })),
    [],
  );

  useEffect(() => {
    if (!active) {
      progress.forEach((p) => p.setValue(0));
      return;
    }
    const anim = Animated.stagger(
      20,
      progress.map((p, i) =>
        Animated.timing(p, {
          toValue: 1,
          duration: 1400 + (i % 6) * 45,
          delay: seed[i]?.delay ?? 0,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    );
    anim.start();
    return () => anim.stop();
  }, [active, progress, seed]);

  if (!active) return null;

  const dotColor = tv.accent;

  return (
    <View style={styles.wrap} pointerEvents="none">
      {progress.map((p, i) => {
        const s = seed[i]!;
        const dx = Math.cos(s.ang) * s.dist;
        const dy = Math.sin(s.ang) * s.dist * 0.75;
        const tx = p.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
        const ty = p.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });
        const rot = p.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${s.spin}deg`] });
        const op = p.interpolate({ inputRange: [0, 0.05, 0.85, 1], outputRange: [0, 0.95, 0.85, 0] });
        const sc = p.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0.6, 1, 0.9] });

        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                width: s.size,
                height: s.size,
                marginLeft: -s.size / 2,
                marginTop: -s.size / 2,
                borderRadius: s.size / 2,
                opacity: op,
                backgroundColor: dotColor,
                shadowColor: dotColor,
                transform: [{ translateX: tx }, { translateY: ty }, { rotate: rot }, { scale: sc }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 19,
  },
  dot: {
    position: 'absolute',
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});

