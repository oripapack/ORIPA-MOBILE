import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { colors } from '../../tokens/colors';

const { width: W, height: H } = Dimensions.get('window');

/**
 * Felt wash + edge vignette + subtle top spotlight — vault / lobby atmosphere.
 */
export function HomeBackground() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="homeWash" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={colors.homeGradientTop} />
            <Stop offset="0.45" stopColor={colors.homeGradientMid} />
            <Stop offset="1" stopColor={colors.homeGradientBottom} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={W} height={H} fill="url(#homeWash)" />
      </Svg>
      <ExpoLinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.42)', 'transparent', 'rgba(0,0,0,0.38)']}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <ExpoLinearGradient
        pointerEvents="none"
        colors={['rgba(212,175,55,0.07)', 'transparent', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.35 }}
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
