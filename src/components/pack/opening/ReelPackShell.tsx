import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HeroPackFace } from './HeroPackFace';

type Props = {
  width: number;
  height: number;
  tint: string;
  /** 0 = normal, 1 = locked-in emphasis on winning slot */
  lockEmphasis?: number;
  /**
   * Retail-style sleeve: stronger brand wash, holo strip + micro print, seam highlight, outer rim.
   * Set false for a flatter “demo” shell.
   */
  retailPresentation?: boolean;
};

/**
 * Reel slot uses the same sealed-pack art as `HeroRevealEngine` (dual `HeroPackFace`),
 * scaled to the reel cell — not the flat placeholder shell.
 */
export function ReelPackShell({
  width,
  height,
  tint,
  lockEmphasis = 0,
  retailPresentation = true,
}: Props) {
  const halfW = width / 2;
  const cornerR = Math.max(7, Math.min(16, Math.round((18 * width) / 210)));
  const faceChrome = retailPresentation
    ? { accentWash: 0.16 as const, showProductChrome: true as const }
    : { accentWash: 0.08 as const, showProductChrome: false as const };
  const baseShadow = retailPresentation ? 0.18 : 0.12;

  return (
    <View
      style={[
        styles.wrap,
        {
          width,
          height,
          borderRadius: cornerR,
          shadowOpacity: baseShadow + lockEmphasis * 0.34,
          shadowRadius: 8 + lockEmphasis * 10,
          elevation: 4 + lockEmphasis * 6,
        },
      ]}
    >
      <View
        style={[
          styles.halfLeft,
          {
            width: halfW,
            height,
            borderTopLeftRadius: cornerR,
            borderBottomLeftRadius: cornerR,
          },
        ]}
      >
        <HeroPackFace side="left" packAccent={tint} {...faceChrome} />
      </View>
      <View
        style={[
          styles.halfRight,
          {
            width: halfW,
            height,
            borderTopRightRadius: cornerR,
            borderBottomRightRadius: cornerR,
          },
        ]}
      >
        <HeroPackFace side="right" packAccent={tint} {...faceChrome} />
      </View>
      {retailPresentation ? (
        <View pointerEvents="none" style={[styles.seamGloss, { top: height * 0.06, bottom: height * 0.06 }]}>
          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'rgba(255,255,255,0.2)', 'rgba(0,0,0,0.5)']}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      ) : null}
      {retailPresentation ? (
        <View
          pointerEvents="none"
          style={[
            styles.outerRim,
            {
              borderRadius: cornerR,
              borderColor: 'rgba(255,255,255,0.2)',
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
    backgroundColor: '#06090c',
    shadowColor: '#f8fafc',
    shadowOffset: { width: 0, height: 0 },
  },
  seamGloss: {
    position: 'absolute',
    left: '50%',
    width: 3,
    marginLeft: -1.5,
    zIndex: 6,
    borderRadius: 2,
    overflow: 'hidden',
  },
  outerRim: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.25,
    zIndex: 8,
  },
  halfLeft: {
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRightWidth: 0,
    backgroundColor: '#06090c',
  },
  halfRight: {
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
    borderLeftWidth: 0,
    backgroundColor: '#06090c',
  },
});
