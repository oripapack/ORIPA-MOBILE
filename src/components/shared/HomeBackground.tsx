import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { colors } from '../../tokens/colors';

const { width: W, height: H } = Dimensions.get('window');

/**
 * Multi-stop jewel wash + soft radial “orbs” for spatial depth (reads 3D / lit stage).
 */
export function HomeBackground() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="homeWash" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={colors.homeGradientTop} />
            <Stop offset="0.42" stopColor={colors.homeGradientMid} />
            <Stop offset="1" stopColor={colors.homeGradientBottom} />
          </LinearGradient>

          <RadialGradient
            id="orbAmethyst"
            cx={W * 0.22}
            cy={H * 0.08}
            rx={W * 0.52}
            ry={H * 0.36}
            fx={W * 0.22}
            fy={H * 0.08}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#C084FC" stopOpacity={0.22} />
            <Stop offset="0.4" stopColor="#7E22CE" stopOpacity={0.07} />
            <Stop offset="1" stopColor="#07050F" stopOpacity={0} />
          </RadialGradient>

          <RadialGradient
            id="orbSapphire"
            cx={W * 0.82}
            cy={H * 0.28}
            rx={W * 0.42}
            ry={H * 0.34}
            fx={W * 0.82}
            fy={H * 0.28}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#38BDF8" stopOpacity={0.14} />
            <Stop offset="0.55" stopColor="#0F1730" stopOpacity={0.03} />
            <Stop offset="1" stopColor="#07050F" stopOpacity={0} />
          </RadialGradient>

          <RadialGradient
            id="orbGold"
            cx={W * 0.55}
            cy={H * 0.92}
            rx={W * 0.65}
            ry={H * 0.38}
            fx={W * 0.55}
            fy={H * 0.92}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#E8C547" stopOpacity={0.11} />
            <Stop offset="0.5" stopColor="#C9A227" stopOpacity={0.04} />
            <Stop offset="1" stopColor="#07050F" stopOpacity={0} />
          </RadialGradient>

          <LinearGradient id="floorDepth" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity={0} />
            <Stop offset="0.72" stopColor="#000000" stopOpacity={0.08} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.32} />
          </LinearGradient>
        </Defs>

        <Rect x={0} y={0} width={W} height={H} fill="url(#homeWash)" />
        <Rect x={0} y={0} width={W} height={H} fill="url(#orbAmethyst)" />
        <Rect x={0} y={0} width={W} height={H} fill="url(#orbSapphire)" />
        <Rect x={0} y={0} width={W} height={H} fill="url(#orbGold)" />
        <Rect x={0} y={0} width={W} height={H} fill="url(#floorDepth)" />
      </Svg>

      <ExpoLinearGradient
        pointerEvents="none"
        colors={[
          'rgba(232,197,71,0.06)',
          'rgba(192,132,252,0.07)',
          'rgba(56,189,248,0.05)',
          'rgba(45,212,191,0.04)',
        ]}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});
