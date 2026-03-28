import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';

const FRAME_W = 236;
const FRAME_H = 132;
const OUTER = FRAME_W + 28;
const OUTER_H = FRAME_H + 28;

type Props = {
  frameOpacity: SharedValue<number>;
  frameScale: SharedValue<number>;
  frameGlow: SharedValue<number>;
  sweepProgress: SharedValue<number>;
  sweep2Progress: SharedValue<number>;
  cornerOpacity: SharedValue<number>;
  scanProgress: SharedValue<number>;
};

/** Collectible frame + dual sweeps + corner ornaments + inner scan line. */
export function SplashCardFrame({
  frameOpacity,
  frameScale,
  frameGlow,
  sweepProgress,
  sweep2Progress,
  cornerOpacity,
  scanProgress,
}: Props) {
  const { t } = useTranslation();

  const frameStyle = useAnimatedStyle(() => ({
    opacity: frameOpacity.value,
    transform: [{ scale: frameScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: frameGlow.value * 0.92,
  }));

  const cornerStyle = useAnimatedStyle(() => ({
    opacity: cornerOpacity.value * 0.88,
  }));

  const sweepStyle = useAnimatedStyle(() => {
    const t = sweepProgress.value;
    return {
      opacity: interpolate(t, [0, 0.1, 0.45, 0.82, 1], [0, 0.42, 0.48, 0.38, 0], Extrapolation.CLAMP),
      transform: [{ translateX: interpolate(t, [0, 1], [-175, 175]) }, { rotate: '-14deg' }],
    };
  });

  const sweep2Style = useAnimatedStyle(() => {
    const t = sweep2Progress.value;
    return {
      opacity: interpolate(t, [0, 0.15, 0.5, 0.85, 1], [0, 0.22, 0.28, 0.18, 0], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(t, [0, 1], [130, -130]) }, { rotate: '11deg' }],
    };
  });

  const scanStyle = useAnimatedStyle(() => {
    const t = scanProgress.value;
    return {
      opacity: interpolate(t, [0, 0.08, 0.45, 0.92, 1], [0, 0.38, 0.48, 0.28, 0], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(t, [0, 1], [-6, FRAME_H + 4]) }],
    };
  });

  const corner = (pos: 'tl' | 'tr' | 'bl' | 'br') => {
    const base = { position: 'absolute' as const, width: 20, height: 20, borderColor: 'rgba(232,197,71,0.55)' };
    switch (pos) {
      case 'tl':
        return { ...base, left: 0, top: 0, borderTopWidth: 2, borderLeftWidth: 2 };
      case 'tr':
        return { ...base, right: 0, top: 0, borderTopWidth: 2, borderRightWidth: 2 };
      case 'bl':
        return { ...base, left: 0, bottom: 0, borderBottomWidth: 2, borderLeftWidth: 2 };
      case 'br':
        return { ...base, right: 0, bottom: 0, borderBottomWidth: 2, borderRightWidth: 2 };
    }
  };

  return (
    <View style={styles.halo}>
      <Animated.View style={[styles.glowBlob, glowStyle]} pointerEvents="none" />

      <View style={styles.decorWrap}>
        <Animated.View style={[corner('tl'), cornerStyle]} />
        <Animated.View style={[corner('tr'), cornerStyle]} />
        <Animated.View style={[corner('bl'), cornerStyle]} />
        <Animated.View style={[corner('br'), cornerStyle]} />

        <Animated.View style={[styles.sweepClip, sweepStyle]} pointerEvents="none">
          <LinearGradient
            colors={[
              'transparent',
              'rgba(245,237,214,0.06)',
              'rgba(232,197,71,0.12)',
              'rgba(245,237,214,0.05)',
              'transparent',
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.sweepGrad}
          />
        </Animated.View>

        <Animated.View style={[styles.sweep2Clip, sweep2Style]} pointerEvents="none">
          <LinearGradient
            colors={['transparent', 'rgba(34,197,94,0.09)', 'rgba(245,237,214,0.07)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.sweep2Grad}
          />
        </Animated.View>

        <Animated.View style={[styles.frameOuter, frameStyle]}>
          <View style={styles.frameInner}>
            <LinearGradient
              colors={['rgba(232,197,71,0.42)', 'rgba(34,197,94,0.1)', 'rgba(232,197,71,0.32)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
          {/* One scannable line — keep short (read time vs INTRO_MS in AppSplashScreen). Easter egg / secret word: future hook. */}
          <View style={styles.frameCopy} pointerEvents="none">
            <Text style={styles.frameLine} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
              {t('splash.frameLine')}
            </Text>
          </View>
          <View style={styles.frameEdge} />
          <Animated.View style={[styles.scanLine, scanStyle]} pointerEvents="none">
            <LinearGradient
              colors={['transparent', 'rgba(232,197,71,0.38)', 'rgba(245,237,214,0.22)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    width: OUTER + 40,
    minHeight: OUTER_H + 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorWrap: {
    width: OUTER,
    height: OUTER_H,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBlob: {
    position: 'absolute',
    width: FRAME_W + 92,
    height: FRAME_H + 76,
    borderRadius: 30,
    backgroundColor: 'rgba(232,197,71,0.13)',
  },
  frameOuter: {
    width: FRAME_W,
    height: FRAME_H,
    borderRadius: 14,
    padding: 1.5,
    overflow: 'hidden',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 16,
    zIndex: 2,
  },
  frameInner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    overflow: 'hidden',
    opacity: 0.26,
  },
  frameEdge: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.52)',
  },
  frameCopy: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 2,
  },
  frameLine: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 3,
    top: 0,
    borderRadius: 2,
    overflow: 'hidden',
    zIndex: 3,
  },
  sweepClip: {
    position: 'absolute',
    width: 130,
    height: 240,
    left: OUTER / 2 - 65,
    top: OUTER_H / 2 - 120,
    zIndex: 4,
  },
  sweepGrad: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  sweep2Clip: {
    position: 'absolute',
    width: 300,
    height: 110,
    left: OUTER / 2 - 150,
    top: OUTER_H / 2 - 55,
    zIndex: 3,
  },
  sweep2Grad: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
