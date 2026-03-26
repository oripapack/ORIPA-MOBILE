import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../tokens/colors';

const { width: W, height: H } = Dimensions.get('window');

/**
 * Soft vertical wash behind the home catalog — reads “premium shell” without heavy imagery.
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});
