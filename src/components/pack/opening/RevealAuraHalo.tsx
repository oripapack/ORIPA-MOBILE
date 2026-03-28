import React from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

/**
 * Atmospheric rarity light: radial haze + faint ring — not a flat tinted oval.
 */
export function RevealAuraHalo({ accent, opacity }: { accent: string; opacity: Animated.Value }) {
  const cx = W / 2;
  const cy = H * 0.34;
  const r = Math.max(W, H) * 0.58;

  return (
    <Animated.View style={[styles.wrap, { opacity }]} pointerEvents="none">
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="revealHaze" gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={r}>
            <Stop offset="0" stopColor={accent} stopOpacity={0.28} />
            <Stop offset="0.22" stopColor={accent} stopOpacity={0.12} />
            <Stop offset="0.48" stopColor={accent} stopOpacity={0.04} />
            <Stop offset="0.78" stopColor={accent} stopOpacity={0.01} />
            <Stop offset="1" stopColor="transparent" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={W} height={H} fill="url(#revealHaze)" />
      </Svg>
      <View style={styles.ringRow} pointerEvents="none">
        <View
          style={[
            styles.ring,
            {
              borderColor: `${accent}26`,
              shadowColor: accent,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const ringSize = Math.min(W, H) * 0.7;

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 12,
  },
  ringRow: {
    position: 'absolute',
    top: '12%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  ring: {
    width: ringSize,
    height: ringSize * 0.9,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
  },
});
