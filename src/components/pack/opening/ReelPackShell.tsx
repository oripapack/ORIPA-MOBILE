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
};

/**
 * Reel slot uses the same sealed-pack art as `HeroRevealEngine` (dual `HeroPackFace`),
 * scaled to the reel cell — not the flat placeholder shell.
 */
export function ReelPackShell({ width, height, tint, lockEmphasis = 0 }: Props) {
  const halfW = width / 2;
  const cornerR = Math.max(7, Math.min(16, Math.round((18 * width) / 210)));
  const e = Math.max(0, Math.min(1, lockEmphasis));

  return (
    <View
      style={[
        styles.wrap,
        {
          width,
          height,
          borderRadius: cornerR,
          shadowOpacity: 0.18 + e * 0.42,
          shadowRadius: 10 + e * 16,
          elevation: 5 + e * 10,
        },
      ]}
    >
      {/* Foil wrapper base (dark navy → ink) */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(2,6,23,0.92)', 'rgba(15,23,42,0.78)', 'rgba(2,6,23,0.92)']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: cornerR, opacity: 0.55 }]}
      />
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
        <HeroPackFace side="left" packAccent={tint} />
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
        <HeroPackFace side="right" packAccent={tint} />
      </View>

      {/* Premium foil rim + studio lighting (no outcome cues; purely material). */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(255,255,255,0.14)',
          'rgba(255,255,255,0.02)',
          'rgba(0,0,0,0.25)',
        ]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: cornerR,
            opacity: 0.75 + e * 0.18,
          },
        ]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(255,255,255,0.0)',
          'rgba(255,255,255,0.12)',
          'rgba(255,255,255,0.0)',
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[
          styles.sheen,
          {
            borderRadius: cornerR,
            opacity: 0.55 + e * 0.15,
          },
        ]}
      />

      {/* Pull Hub mark (minimal, physical stamp) */}
      <View pointerEvents="none" style={styles.emblemWrap}>
        <View
          style={[
            styles.emblemOuter,
            {
              opacity: 0.72 + e * 0.22,
              shadowOpacity: 0.18 + e * 0.22,
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.05)', 'rgba(0,0,0,0.25)']}
            locations={[0, 0.6, 1]}
            start={{ x: 0.2, y: 0.1 }}
            end={{ x: 0.85, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.emblemInner} />
        </View>
      </View>

      {/* Crimp seals (top/bottom) — subtle ridges so it reads like a real wrapper */}
      <View pointerEvents="none" style={[styles.crimp, styles.crimpTop]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.02)', 'rgba(0,0,0,0.42)']}
          locations={[0, 0.55, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View pointerEvents="none" style={[styles.crimp, styles.crimpBottom]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.48)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.0)']}
          locations={[0, 0.55, 1]}
          start={{ x: 0.25, y: 1 }}
          end={{ x: 0.8, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Rarity stripe (non-spoiler): uses pack tint but kept restrained */}
      <View pointerEvents="none" style={[styles.rarityStripe, { backgroundColor: tint, opacity: 0.10 + e * 0.08 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
    backgroundColor: '#06090c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
  },
  sheen: {
    ...StyleSheet.absoluteFillObject,
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
  emblemWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(2,6,23,0.35)',
    shadowColor: 'rgba(255,255,255,0.45)',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(248,250,252,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  crimp: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 14,
    opacity: 0.9,
  },
  crimpTop: {
    top: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.14)',
  },
  crimpBottom: {
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  rarityStripe: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 54,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
});
