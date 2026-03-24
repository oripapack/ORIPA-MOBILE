import React from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { radius } from '../../../tokens/spacing';

const { width: WIN_W, height: WIN_H } = Dimensions.get('window');

export const STAGE = { WIN_W, WIN_H };

export function StadiumGradient() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={WIN_W} height={WIN_H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="stadiumGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#030712" />
            <Stop offset="0.22" stopColor="#0b1020" />
            <Stop offset="0.42" stopColor="#120a1e" />
            <Stop offset="0.58" stopColor="#0f172a" />
            <Stop offset="0.78" stopColor="#1a1035" />
            <Stop offset="1" stopColor="#020617" />
          </LinearGradient>
          <LinearGradient id="stadiumAurora" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="rgba(56, 189, 248, 0.14)" />
            <Stop offset="0.45" stopColor="rgba(168, 85, 247, 0.1)" />
            <Stop offset="1" stopColor="rgba(244, 63, 94, 0.08)" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={WIN_W} height={WIN_H} fill="url(#stadiumGrad)" />
        <Rect x={0} y={0} width={WIN_W} height={WIN_H} fill="url(#stadiumAurora)" opacity={0.85} />
      </Svg>
      <View style={sharedStyles.vignetteTop} />
      <View style={sharedStyles.vignetteBottom} />
    </View>
  );
}

export function Spotlight({ pulse }: { pulse: Animated.Value }) {
  const op = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.38] });
  return (
    <Animated.View style={[sharedStyles.spotlightBlob, { opacity: op }]} pointerEvents="none">
      <View style={sharedStyles.spotlightInner} />
    </Animated.View>
  );
}

const sharedStyles = StyleSheet.create({
  vignetteTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    height: '38%',
  },
  vignetteBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  spotlightBlob: {
    position: 'absolute',
    top: '6%',
    left: '10%',
    right: '10%',
    height: WIN_H * 0.42,
    alignItems: 'center',
  },
  spotlightInner: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: [{ scaleX: 1.15 }],
  },
});

export const packArtBase = {
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingVertical: 32,
  paddingHorizontal: 32,
  borderRadius: radius.xl,
  borderWidth: 2,
  borderColor: 'rgba(255,255,255,0.18)',
  minWidth: 216,
  shadowColor: '#000',
  shadowOpacity: 0.5,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 12 },
};
