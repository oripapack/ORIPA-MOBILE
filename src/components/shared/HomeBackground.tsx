import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { colors } from '../../tokens/colors';

const { width: W, height: H } = Dimensions.get('window');

/**
 * Soft lilac-tinted wash — TCG hobby energy without darkening the UI.
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
        colors={[
          'rgba(255,255,255,0.55)',
          'rgba(124,58,237,0.04)',
          'rgba(79,70,229,0.06)',
        ]}
        locations={[0, 0.45, 1]}
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
