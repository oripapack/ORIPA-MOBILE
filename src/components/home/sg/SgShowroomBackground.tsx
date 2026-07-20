import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { sg } from '../../../tokens/sg';

/**
 * Showroom lighting (Urushi Archive): ONE warm spotlight from top-center +
 * vertical darkening toward the bottom. Components never self-illuminate —
 * this is the single light source for the whole screen.
 */
export function SgShowroomBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: sg.showroom.bg }]} />
      <Svg width="100%" height={420} style={styles.spot}>
        <Defs>
          <RadialGradient id="warmSpot" cx="50%" cy="10%" rx="55%" ry="90%">
            <Stop offset="0%" stopColor="#FFFAEE" stopOpacity={0.085} />
            <Stop offset="70%" stopColor="#FFFAEE" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#warmSpot)" />
      </Svg>
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.30)']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  spot: { position: 'absolute', top: 0, left: 0, right: 0 },
});
