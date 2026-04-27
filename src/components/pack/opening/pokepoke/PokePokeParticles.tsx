import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import type { RevealRarity } from '../types';
import { REVEAL_RARITY_VISUAL } from '../rarityTokens';

const PARTICLE_COUNT = 12;

interface Particle {
  angle: number;
  distance: number;
  size: number;
  delay: number;
  duration: number;
}

function makeParticles(rarity: RevealRarity): Particle[] {
  const base = rarity === 'chase' ? 14 : rarity === 'ultra_rare' ? 12 : 10;
  return Array.from({ length: base }, (_, i) => ({
    angle: (360 / base) * i + Math.random() * 24 - 12,
    distance: 80 + Math.random() * (rarity === 'chase' ? 140 : 100),
    size: 4 + Math.random() * (rarity === 'chase' ? 8 : 5),
    delay: Math.random() * 80,
    duration: 460 + Math.random() * 240,
  }));
}

interface Props {
  rarity: RevealRarity;
  /** Animated.Value driven 0→1 to trigger the burst */
  trigger: Animated.Value;
}

export function PokePokeParticles({ rarity, trigger }: Props) {
  const tv = REVEAL_RARITY_VISUAL[rarity];
  const particles = useRef(makeParticles(rarity)).current;

  const anims = useRef(
    particles.map(() => ({
      xy: new Animated.ValueXY({ x: 0, y: 0 }),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    const listener = trigger.addListener(({ value }) => {
      if (value > 0.01) {
        trigger.removeAllListeners();
        particles.forEach((p, i) => {
          const rad = (p.angle * Math.PI) / 180;
          const tx = Math.cos(rad) * p.distance;
          const ty = Math.sin(rad) * p.distance;

          Animated.sequence([
            Animated.delay(p.delay),
            Animated.parallel([
              Animated.timing(anims[i].opacity, {
                toValue: 1,
                duration: 80,
                useNativeDriver: true,
              }),
              Animated.spring(anims[i].scale, {
                toValue: 1,
                friction: 4,
                tension: 180,
                useNativeDriver: true,
              }),
              Animated.timing(anims[i].xy, {
                toValue: { x: tx, y: ty },
                duration: p.duration,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(anims[i].opacity, {
              toValue: 0,
              duration: p.duration * 0.45,
              useNativeDriver: true,
            }),
          ]).start();
        });
      }
    });

    return () => {
      trigger.removeListener(listener);
    };
  }, [trigger, anims, particles]);

  if (rarity === 'common') return null;

  const color = tv.accent;
  const colorAlt = rarity === 'chase' ? '#FCD34D' : rarity === 'ultra_rare' ? '#C084FC' : '#93C5FD';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: i % 2 === 0 ? color : colorAlt,
              opacity: anims[i].opacity,
              transform: [
                { translateX: anims[i].xy.x },
                { translateY: anims[i].xy.y },
                { scale: anims[i].scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    left: '50%',
    marginTop: -2,
    marginLeft: -2,
  },
});
