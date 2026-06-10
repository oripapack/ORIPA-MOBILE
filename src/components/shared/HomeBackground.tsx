import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../tokens/colors';

const { width: W, height: H } = Dimensions.get('window');

/** Subtle dark wash — Phygitals near-black with soft green depth. */
export function HomeBackground() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="homeWash" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={colors.homeGradientTop} />
            <Stop offset="0.5" stopColor={colors.homeGradientMid} />
            <Stop offset="1" stopColor={colors.homeGradientBottom} />
          </LinearGradient>

          <RadialGradient
            id="orbGreen"
            cx={W * 0.5}
            cy={H * 0.12}
            rx={W * 0.7}
            ry={H * 0.35}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#22C55E" stopOpacity={0.07} />
            <Stop offset="0.55" stopColor="#0e0e12" stopOpacity={0.02} />
            <Stop offset="1" stopColor="#050507" stopOpacity={0} />
          </RadialGradient>

          <LinearGradient id="floorDepth" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity={0} />
            <Stop offset="0.8" stopColor="#000000" stopOpacity={0.18} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.35} />
          </LinearGradient>
        </Defs>

        <Rect x={0} y={0} width={W} height={H} fill="url(#homeWash)" />
        <Rect x={0} y={0} width={W} height={H} fill="url(#orbGreen)" />
        <Rect x={0} y={0} width={W} height={H} fill="url(#floorDepth)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});
