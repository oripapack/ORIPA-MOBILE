import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Ellipse, G, Path, RadialGradient, Stop } from 'react-native-svg';
import { HERO_PACK } from './heroVisualTokens';

type Side = 'left' | 'right';

type Props = {
  side: Side;
  packAccent: string;
  /** Reserved for future copy on the face — unused in liquid-only shell. */
  packLine?: string;
  /**
   * Brand tint wash on the face (0–0.35). Default is subtle for motion; lineup / reel uses higher
   * so each product reads distinct.
   */
  accentWash?: number;
  /** Foil strip + micro “print” bars — reads like sealed retail, not a flat gradient card. */
  showProductChrome?: boolean;
};

const VB_W = 105;
const VB_H = 270;

function hexWithAlpha(hex: string, aa: string): string {
  if (typeof hex === 'string' && /^#[0-9A-Fa-f]{6}$/.test(hex)) return `${hex}${aa}`;
  return 'rgba(56,189,248,0.15)';
}

function LiquidGlassArt({ side, strength = 1 }: { side: Side; strength?: number }) {
  const uid = `hpf-${side}`;
  const mirror = side === 'right';
  const o = (v: number) => Math.min(1, v * strength);

  const blobs = (
    <>
      <Ellipse cx={26} cy={68} rx={46} ry={62} fill={`url(#${uid}-b1)`} opacity={o(0.95)} />
      <Ellipse cx={58} cy={168} rx={40} ry={54} fill={`url(#${uid}-b2)`} opacity={o(0.9)} />
      <Ellipse cx={44} cy={128} rx={58} ry={36} fill={`url(#${uid}-b3)`} opacity={o(0.75)} />
      <Ellipse cx={72} cy={228} rx={52} ry={44} fill={`url(#${uid}-b4)`} opacity={o(0.55)} />
    </>
  );

  const flows = (
    <>
      <Path
        d="M -18 52 C 38 38, 72 72, 122 48"
        stroke={HERO_PACK.liquidFlow}
        strokeWidth={1.35}
        fill="none"
        opacity={o(0.88)}
        strokeLinecap="round"
      />
      <Path
        d="M -22 112 C 42 92, 88 132, 128 102"
        stroke={HERO_PACK.liquidFlowAlt}
        strokeWidth={1.1}
        fill="none"
        opacity={o(0.72)}
        strokeLinecap="round"
      />
      <Path
        d="M -14 176 C 48 158, 78 198, 124 168"
        stroke={HERO_PACK.liquidFlow}
        strokeWidth={1.05}
        fill="none"
        opacity={o(0.55)}
        strokeLinecap="round"
      />
      <Path
        d="M 8 118 Q 52 108, 96 120"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={0.85}
        fill="none"
        opacity={o(0.65)}
        strokeLinecap="round"
      />
    </>
  );

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      style={StyleSheet.absoluteFill}
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient id={`${uid}-b1`} cx="35%" cy="35%" r="68%" fx="35%" fy="35%" gradientUnits="objectBoundingBox">
          <Stop offset="0%" stopColor={HERO_PACK.liquidBlobA} stopOpacity={0.85} />
          <Stop offset="55%" stopColor={HERO_PACK.liquidBlobA} stopOpacity={0.2} />
          <Stop offset="100%" stopColor={HERO_PACK.liquidBlobA} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`${uid}-b2`} cx="42%" cy="38%" r="72%" fx="45%" fy="35%" gradientUnits="objectBoundingBox">
          <Stop offset="0%" stopColor={HERO_PACK.liquidBlobB} stopOpacity={0.75} />
          <Stop offset="60%" stopColor={HERO_PACK.liquidBlobB} stopOpacity={0.15} />
          <Stop offset="100%" stopColor={HERO_PACK.liquidBlobB} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`${uid}-b3`} cx="50%" cy="50%" r="78%" gradientUnits="objectBoundingBox">
          <Stop offset="0%" stopColor={HERO_PACK.liquidBlobC} stopOpacity={0.65} />
          <Stop offset="70%" stopColor={HERO_PACK.liquidBlobC} stopOpacity={0.08} />
          <Stop offset="100%" stopColor={HERO_PACK.liquidBlobC} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`${uid}-b4`} cx="50%" cy="55%" r="62%" gradientUnits="objectBoundingBox">
          <Stop offset="0%" stopColor={HERO_PACK.glassVeil} stopOpacity={0.9} />
          <Stop offset="100%" stopColor={HERO_PACK.glassVeil} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {mirror ? (
        <G transform={`translate(${VB_W}, 0) scale(-1, 1)`}>
          {blobs}
          {flows}
        </G>
      ) : (
        <G>
          {blobs}
          {flows}
        </G>
      )}
    </Svg>
  );
}

/**
 * Sealed-pack face (one half of the tear): liquid-glass + optional retail chrome.
 */
export function HeroPackFace({
  side,
  packAccent,
  packLine: _packLine,
  accentWash = 0.08,
  showProductChrome = false,
}: Props) {
  const wash = Math.min(0.32, Math.max(0, accentWash));
  const spineGrad =
    side === 'left'
      ? {
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          colors: [HERO_PACK.glassRim, 'rgba(15, 23, 42, 0.92)', 'rgba(0,0,0,0.55)'] as const,
          locations: [0, 0.45, 1] as const,
        }
      : {
          start: { x: 1, y: 0 },
          end: { x: 0, y: 0 },
          colors: [HERO_PACK.glassRim, 'rgba(15, 23, 42, 0.92)', 'rgba(0,0,0,0.55)'] as const,
          locations: [0, 0.45, 1] as const,
        };

  const causticStart = side === 'left' ? { x: 0.15, y: 0.1 } : { x: 0.2, y: 0 };
  const causticEnd = side === 'left' ? { x: 0.9, y: 0.95 } : { x: 0.85, y: 1 };
  const foilStart = side === 'left' ? { x: 0, y: 0.15 } : { x: 1, y: 0 };
  const foilEnd = side === 'left' ? { x: 1, y: 0.9 } : { x: 0, y: 1 };
  const spineStyle = side === 'left' ? [styles.spine, styles.spineLeft] : [styles.spine, styles.spineRight];

  return (
    <View style={styles.clip}>
      <LinearGradient
        colors={[HERO_PACK.faceGradientTop, HERO_PACK.faceGradientMid, HERO_PACK.faceGradientBottom]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <LiquidGlassArt side={side} strength={showProductChrome ? 1.06 : 1} />
      <LinearGradient
        colors={[...HERO_PACK.causticSheen]}
        start={causticStart}
        end={causticEnd}
        style={[styles.causticLayer, showProductChrome && styles.causticLayerRetail]}
        pointerEvents="none"
      />
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: packAccent, opacity: wash }]}
        pointerEvents="none"
      />
      {showProductChrome ? (
        <LinearGradient
          pointerEvents="none"
          colors={[
            hexWithAlpha(packAccent, '00'),
            hexWithAlpha(packAccent, '22'),
            'rgba(255,255,255,0.14)',
            hexWithAlpha(packAccent, '1a'),
            hexWithAlpha(packAccent, '00'),
          ]}
          locations={[0, 0.28, 0.5, 0.72, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.holoStrip}
        />
      ) : null}
      {showProductChrome ? (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(0,0,0,0.14)', 'transparent', 'transparent', 'rgba(0,0,0,0.2)']}
          locations={[0, 0.28, 0.72, 1]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <LinearGradient
        colors={[...HERO_PACK.foilGloss]}
        start={foilStart}
        end={foilEnd}
        style={[styles.foilSheen, showProductChrome && styles.foilSheenRetail]}
        pointerEvents="none"
      />
      <LinearGradient {...spineGrad} style={spineStyle} />
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.35)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.edgeTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.edgeBottom}
        pointerEvents="none"
      />
      {showProductChrome ? (
        <View pointerEvents="none" style={styles.microRow}>
          {[3, 5, 2, 7, 4, 2, 6, 3, 4].map((h, i) => (
            <View key={i} style={[styles.microBar, { height: h * 1.35 }]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    flex: 1,
    overflow: 'hidden',
    borderColor: HERO_PACK.edgeHighlight,
  },
  causticLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  causticLayerRetail: {
    opacity: 0.95,
  },
  holoStrip: {
    position: 'absolute',
    left: '7%',
    right: '7%',
    top: '30%',
    height: '11%',
    borderRadius: 4,
    overflow: 'hidden',
    opacity: 0.92,
  },
  foilSheen: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.88,
  },
  foilSheenRetail: {
    opacity: 0.98,
  },
  microRow: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    bottom: '6%',
    height: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  microBar: {
    width: 2,
    marginHorizontal: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(226, 232, 240, 0.16)',
  },
  spine: {
    position: 'absolute',
    top: '7%',
    bottom: '7%',
    width: 4,
    opacity: 0.92,
  },
  spineRight: { right: 0 },
  spineLeft: { left: 0 },
  edgeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 14,
  },
  edgeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 22,
  },
});
