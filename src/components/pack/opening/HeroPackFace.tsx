import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAppLogoParts } from '../../../config/app';
import { fontSize, fontWeight } from '../../../tokens/typography';
import { radius } from '../../../tokens/spacing';
import { HERO_PACK } from './heroVisualTokens';

type Side = 'left' | 'right';

/**
 * Branded sealed-pack face (one half of the tear). No generic “PACK” slab.
 */
export function HeroPackFace({ side, packAccent }: { side: Side; packAccent: string }) {
  const { primary, secondary } = getAppLogoParts();

  return (
    <View style={styles.clip}>
      <LinearGradient
        colors={[HERO_PACK.faceGradientTop, HERO_PACK.faceGradientBottom]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {/* Foil / print sheen */}
      <LinearGradient
        colors={HERO_PACK.foilGloss}
        start={{ x: 0, y: 0.2 }}
        end={{ x: 1, y: 0.85 }}
        style={styles.foilSheen}
        pointerEvents="none"
      />
      {/* Accent spine seam */}
      <View style={[styles.spine, side === 'left' ? styles.spineRight : styles.spineLeft]} />

      <View style={styles.edgeTop} pointerEvents="none" />
      <View style={styles.edgeBottom} pointerEvents="none" />
      <View style={styles.sealLine} pointerEvents="none" />

      {side === 'left' ? (
        <View style={styles.leftContent}>
          <View style={styles.wordmarkBlock}>
            <Text style={styles.brandPrimary}>{primary}</Text>
            {secondary ? <Text style={styles.brandSecondary}>{secondary}</Text> : null}
          </View>
          <View style={[styles.accentRule, { backgroundColor: packAccent }]} />
          <Text style={styles.series}>Official sealed product</Text>
        </View>
      ) : (
        <View style={styles.rightContent}>
          <Text style={styles.sealed}>SEALED</Text>
          <Text style={styles.cert}>Certified rip</Text>
          <View style={[styles.tintSwatch, { borderColor: packAccent }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    flex: 1,
    overflow: 'hidden',
    borderColor: HERO_PACK.edgeHighlight,
  },
  foilSheen: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  edgeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  edgeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  /** Subtle tear-strip cue across the face */
  sealLine: {
    position: 'absolute',
    top: '46%',
    left: '10%',
    right: '10%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  spine: {
    position: 'absolute',
    top: '8%',
    bottom: '8%',
    width: 3,
    backgroundColor: HERO_PACK.spine,
    opacity: 0.95,
  },
  spineRight: { right: 0 },
  spineLeft: { left: 0 },
  leftContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 28,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  wordmarkBlock: {
    gap: 2,
  },
  brandPrimary: {
    color: 'rgba(248, 250, 252, 0.96)',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    letterSpacing: -0.8,
  },
  brandSecondary: {
    color: 'rgba(226, 232, 240, 0.75)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  accentRule: {
    marginTop: 14,
    height: 2,
    width: 48,
    borderRadius: 2,
    opacity: 0.85,
  },
  series: {
    marginTop: 12,
    color: 'rgba(148, 163, 184, 0.9)',
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  rightContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 36,
    alignItems: 'center',
  },
  sealed: {
    color: 'rgba(248, 250, 252, 0.92)',
    fontSize: 13,
    fontWeight: fontWeight.black,
    letterSpacing: 4,
  },
  cert: {
    marginTop: 10,
    color: 'rgba(148, 163, 184, 0.88)',
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  tintSwatch: {
    marginTop: 22,
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
