import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { packImageSource } from '../../../../data/mockPacks';
import type { Pack } from '../../../../data/mockPacks';
import type { GestureResponderHandlers } from 'react-native';
import type { PokePokeAnimValues } from './usePokePokeGesture';
import { sg } from '../../../../tokens/sg';

const PACK_W = 200;
const PACK_H = 270;
const HALF_H = PACK_H / 2;

/** Category → energy seam color */
const SEAM_COLOR: Record<string, string> = {
  onboarding: sg.success,
  micro: sg.warning,
  premium: sg.gold,
};

interface Props {
  pack: Pack;
  av: PokePokeAnimValues;
  panHandlers: GestureResponderHandlers;
  hintVisible: boolean;
}

export function PokePokePackTear({ pack, av, panHandlers, hintVisible: _ }: Props) {
  const seam = SEAM_COLOR[pack.category] ?? sg.text;
  const imgSrc = packImageSource(pack.imageUrl);

  return (
    <View style={styles.root} {...panHandlers}>
      {/* Top half */}
      <Animated.View
        style={[
          styles.half,
          styles.topHalf,
          { transform: [{ translateY: av.topHalfY }] },
        ]}
      >
        <View style={[styles.packFace, { backgroundColor: pack.imageColor }]}>
          {imgSrc != null ? (
            <Image source={imgSrc} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          ) : null}
          {/* Top sheen */}
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.02)']}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
        {/* Bottom edge glow of top half */}
        <Animated.View style={[styles.edgeGlowBottom, { opacity: av.energyOpacity }]}>
          <LinearGradient
            colors={['transparent', seam, 'rgba(255,255,255,0.9)']}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      </Animated.View>

      {/* Energy seam between halves */}
      <Animated.View
        style={[
          styles.seam,
          {
            opacity: av.energyOpacity,
            backgroundColor: seam,
            shadowColor: seam,
          },
        ]}
      />

      {/* Bottom half */}
      <Animated.View
        style={[
          styles.half,
          styles.bottomHalf,
          { transform: [{ translateY: av.bottomHalfY }] },
        ]}
      >
        {/* Top edge glow of bottom half */}
        <Animated.View style={[styles.edgeGlowTop, { opacity: av.energyOpacity }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', seam, 'transparent']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
        <View style={[styles.packFace, { backgroundColor: pack.imageColor }]}>
          {imgSrc != null ? (
            <Image
              source={imgSrc}
              style={[StyleSheet.absoluteFillObject, styles.bottomImage]}
              contentFit="cover"
            />
          ) : null}
          {/* Bottom vignette */}
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.42)']}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: PACK_W,
    alignItems: 'center',
  },
  half: {
    width: PACK_W,
    height: HALF_H,
    overflow: 'hidden',
    borderRadius: 10,
  },
  topHalf: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  bottomHalf: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  packFace: {
    width: PACK_W,
    height: PACK_H,
    position: 'absolute',
    left: 0,
  },
  bottomImage: {
    top: -HALF_H,
  },
  seam: {
    width: PACK_W,
    height: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  edgeGlowBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 18,
  },
  edgeGlowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    zIndex: 1,
  },
});
