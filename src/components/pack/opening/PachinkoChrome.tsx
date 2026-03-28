import React, { useEffect, useMemo } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const RAIL_DOTS = 9;
const SPARKS = 14;

type SparkLevel = 0 | 1 | 2;

/**
 * Pachinko-parlor chrome: side “LED” rails + falling sparks (cheap, native-driver friendly).
 */
export function PachinkoChrome({
  railShimmer,
  accent,
  sparkLevel,
}: {
  railShimmer: Animated.Value;
  accent: string;
  sparkLevel: SparkLevel;
}) {
  const railOpacity = railShimmer.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const sparks = useMemo(() => Array.from({ length: SPARKS }, () => new Animated.Value(0)), []);

  useEffect(() => {
    if (sparkLevel === 0) {
      sparks.forEach((s) => s.setValue(0));
      return;
    }
    const dur = sparkLevel === 2 ? 900 : 1400;
    const stagger = sparkLevel === 2 ? 38 : 55;
    const anims = sparks.map((s, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * stagger),
          Animated.timing(s, {
            toValue: 1,
            duration: dur,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(s, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [sparkLevel, sparks]);

  const seeds = useMemo(
    () =>
      sparks.map((_, i) => ({
        x: ((i * 47) % 100) / 100,
        w: 2 + (i % 3),
        len: 10 + (i % 5) * 4,
        op: 0.25 + (i % 4) * 0.12,
      })),
    [sparks],
  );

  return (
    <View style={styles.wrap} pointerEvents="none">
      {sparkLevel > 0 ? (
        <View style={styles.sparkLayer}>
          {sparks.map((p, i) => {
            const s = seeds[i]!;
            const ty = p.interpolate({ inputRange: [0, 1], outputRange: [-24, 420] });
            const op = p.interpolate({
              inputRange: [0, 0.08, 0.88, 1],
              outputRange: [0, s.op * (sparkLevel === 2 ? 1.15 : 0.85), s.op * 0.5, 0],
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.spark,
                  {
                    left: `${8 + s.x * 84}%`,
                    width: s.w,
                    height: s.len,
                    opacity: op,
                    backgroundColor: accent,
                    transform: [{ translateY: ty }, { rotate: `${(i % 5) - 2}deg` }],
                  },
                ]}
              />
            );
          })}
        </View>
      ) : null}

      <Animated.View style={[styles.railCol, styles.railLeft, { opacity: railOpacity }]}>
        {Array.from({ length: RAIL_DOTS }).map((_, i) => (
          <View
            key={`L${i}`}
            style={[
              styles.led,
              {
                backgroundColor: accent,
                opacity: 0.35 + (i % 3) * 0.18,
                shadowColor: accent,
              },
            ]}
          />
        ))}
      </Animated.View>
      <Animated.View style={[styles.railCol, styles.railRight, { opacity: railOpacity }]}>
        {Array.from({ length: RAIL_DOTS }).map((_, i) => (
          <View
            key={`R${i}`}
            style={[
              styles.led,
              {
                backgroundColor: accent,
                opacity: 0.32 + ((i + 1) % 3) * 0.2,
                shadowColor: accent,
              },
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View
        style={[
          styles.marquee,
          {
            opacity: railOpacity,
            borderColor: `${accent}66`,
            shadowColor: accent,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
  },
  sparkLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  spark: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 6,
  },
  railCol: {
    position: 'absolute',
    top: '14%',
    bottom: '22%',
    width: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  railLeft: { left: 6 },
  railRight: { right: 6 },
  led: {
    width: 7,
    height: 7,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 5,
  },
  marquee: {
    position: 'absolute',
    top: '11%',
    left: '14%',
    right: '14%',
    height: 3,
    borderRadius: 2,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    zIndex: 1,
  },
});
