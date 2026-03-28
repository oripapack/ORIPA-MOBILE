import React from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { radius } from '../../../tokens/spacing';

const { width: WIN_W, height: WIN_H } = Dimensions.get('window');

export const STAGE = { WIN_W, WIN_H };

/**
 * Single coherent “chamber”: smooth base wash + soft key + radial falloff — no harsh horizontal bands.
 */
export function StadiumGradient() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={WIN_W} height={WIN_H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="stadiumGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#030712" />
            <Stop offset="0.4" stopColor="#0a1020" />
            <Stop offset="0.72" stopColor="#080d18" />
            <Stop offset="1" stopColor="#02040a" />
          </LinearGradient>
          <RadialGradient id="chamberKey" cx="50%" cy="28%" r="78%" gradientUnits="objectBoundingBox">
            <Stop offset="0" stopColor="rgba(226, 232, 240, 0.11)" />
            <Stop offset="0.35" stopColor="rgba(148, 163, 184, 0.05)" />
            <Stop offset="0.65" stopColor="rgba(15, 23, 42, 0.02)" />
            <Stop offset="1" stopColor="transparent" />
          </RadialGradient>
          <RadialGradient id="chamberFalloff" cx="50%" cy="45%" r="92%" gradientUnits="objectBoundingBox">
            <Stop offset="0" stopColor="transparent" />
            <Stop offset="0.45" stopColor="rgba(0,0,0,0.12)" />
            <Stop offset="0.75" stopColor="rgba(0,0,0,0.42)" />
            <Stop offset="1" stopColor="rgba(0,0,0,0.78)" />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={WIN_W} height={WIN_H} fill="url(#stadiumGrad)" />
        <Rect x={0} y={0} width={WIN_W} height={WIN_H} fill="url(#chamberKey)" opacity={0.85} />
        <Rect x={0} y={0} width={WIN_W} height={WIN_H} fill="url(#chamberFalloff)" opacity={0.92} />
      </Svg>
    </View>
  );
}

export function Spotlight({ pulse }: { pulse: Animated.Value }) {
  const op = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.07, 0.26] });
  return (
    <Animated.View style={[sharedStyles.spotlightBlob, { opacity: op }]} pointerEvents="none">
      <View style={sharedStyles.spotlightInner} />
    </Animated.View>
  );
}

const sharedStyles = StyleSheet.create({
  spotlightBlob: {
    position: 'absolute',
    top: '5%',
    left: '4%',
    right: '4%',
    height: WIN_H * 0.52,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  spotlightInner: {
    width: '92%',
    height: '100%',
    borderRadius: 220,
    backgroundColor: 'rgba(248, 250, 252, 0.11)',
    transform: [{ scaleX: 1.02 }],
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
