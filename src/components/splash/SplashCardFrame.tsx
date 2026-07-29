import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';

const FRAME_W = 236;
const FRAME_H = 132;
const OUTER = FRAME_W + 28;
const OUTER_H = FRAME_H + 28;

const TYPEWRITER_CHAR_MS = 38;
const TYPEWRITER_START_DELAY_MS = 360;

/**
 * Tagline types out with a soft blinking cursor; cursor hides after the line completes.
 */
function SplashTypewriterLine({ text }: { text: string }) {
  const [visible, setVisible] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [cursorLit, setCursorLit] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!showCursor) return;
    const id = setInterval(() => setCursorLit((v) => !v), 400);
    return () => clearInterval(id);
  }, [showCursor]);

  useEffect(() => {
    if (!text.length) {
      setVisible('');
      setShowCursor(false);
      return;
    }
    setVisible('');
    setShowCursor(true);
    let startTimer: ReturnType<typeof setTimeout> | null = null;
    let endCursorTimer: ReturnType<typeof setTimeout> | null = null;

    startTimer = setTimeout(() => {
      let i = 0;
      intervalRef.current = setInterval(() => {
        i += 1;
        setVisible(text.slice(0, i));
        if (i >= text.length) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          endCursorTimer = setTimeout(() => setShowCursor(false), 340);
        }
      }, TYPEWRITER_CHAR_MS);
    }, TYPEWRITER_START_DELAY_MS);

    return () => {
      if (startTimer) clearTimeout(startTimer);
      if (endCursorTimer) clearTimeout(endCursorTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text]);

  return (
    <View
      style={styles.typewriterRow}
      accessibilityRole="text"
      accessibilityLabel={text}
    >
      <Text style={styles.frameLine} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
        {visible}
      </Text>
      {showCursor ? (
        <Text style={[styles.typewriterCursor, { opacity: cursorLit ? 1 : 0.22 }]} accessibilityElementsHidden>
          |
        </Text>
      ) : null}
    </View>
  );
}

type Props = {
  frameOpacity: SharedValue<number>;
  frameScale: SharedValue<number>;
  frameGlow: SharedValue<number>;
  sweepProgress: SharedValue<number>;
  sweep2Progress: SharedValue<number>;
  cornerOpacity: SharedValue<number>;
  scanProgress: SharedValue<number>;
  /** Optional: looped intensity for inner neon tube behind the frame */
  neonBreath?: SharedValue<number>;
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
  neonBreath,
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

  const neonTubeStyle = useAnimatedStyle(() => {
    const b = neonBreath?.value ?? 0;
    return {
      opacity: 0.22 + b * 0.72,
    };
  });

  const corner = (pos: 'tl' | 'tr' | 'bl' | 'br') => {
    const base = { position: 'absolute' as const, width: 20, height: 20, borderColor: sg.line };
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
        {neonBreath ? (
          <Animated.View style={[styles.neonTube, neonTubeStyle]} pointerEvents="none">
            <LinearGradient
              colors={[
                'rgba(56,189,248,0.22)',
                'rgba(192,132,252,0.2)',
                'rgba(232,197,71,0.16)',
                'rgba(45,212,191,0.14)',
              ]}
              locations={[0, 0.35, 0.65, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        ) : null}
        {neonBreath ? (
          <Animated.View style={[styles.neonRim, neonTubeStyle]} pointerEvents="none" />
        ) : null}
        <Animated.View style={[corner('tl'), cornerStyle]} />
        <Animated.View style={[corner('tr'), cornerStyle]} />
        <Animated.View style={[corner('bl'), cornerStyle]} />
        <Animated.View style={[corner('br'), cornerStyle]} />

        <Animated.View style={[styles.sweepClip, sweepStyle]} pointerEvents="none">
          <LinearGradient
            colors={[
              'transparent',
              'rgba(255,255,255,0.12)',
              'rgba(192,132,252,0.12)',
              'rgba(232,197,71,0.06)',
              'transparent',
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.sweepGrad}
          />
        </Animated.View>

        <Animated.View style={[styles.sweep2Clip, sweep2Style]} pointerEvents="none">
          <LinearGradient
            colors={['transparent', 'rgba(56,189,248,0.1)', 'rgba(255,255,255,0.08)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.sweep2Grad}
          />
        </Animated.View>

        <Animated.View style={[styles.frameOuter, frameStyle]}>
          <View style={styles.frameInner}>
            <LinearGradient
              colors={['rgba(40,32,68,0.92)', 'rgba(22,18,42,0.97)', 'rgba(30,26,54,0.94)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
          {/* One scannable line — keep short (read time vs INTRO_MS in AppSplashScreen). Easter egg / secret word: future hook. */}
          <View style={styles.frameCopy} pointerEvents="none">
            <SplashTypewriterLine text={t('splash.frameLine')} />
          </View>
          <View style={styles.frameEdge} />
          <Animated.View style={[styles.scanLine, scanStyle]} pointerEvents="none">
            <LinearGradient
              colors={['transparent', 'rgba(192,132,252,0.25)', 'rgba(255,255,255,0.12)', 'transparent']}
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
  neonTube: {
    position: 'absolute',
    width: FRAME_W + 16,
    height: FRAME_H + 16,
    borderRadius: 18,
    left: (OUTER - (FRAME_W + 16)) / 2,
    top: (OUTER_H - (FRAME_H + 16)) / 2,
    zIndex: 1,
    overflow: 'hidden',
  },
  neonRim: {
    position: 'absolute',
    width: FRAME_W + 18,
    height: FRAME_H + 18,
    borderRadius: 18,
    left: (OUTER - (FRAME_W + 18)) / 2,
    top: (OUTER_H - (FRAME_H + 18)) / 2,
    zIndex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(62, 92, 118, 0.22)',
    backgroundColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.72,
    shadowRadius: 14,
    elevation: 8,
  },
  glowBlob: {
    position: 'absolute',
    width: FRAME_W + 92,
    height: FRAME_H + 76,
    borderRadius: 30,
    backgroundColor: 'rgba(62,92,118,0.06)',
  },
  frameOuter: {
    width: FRAME_W,
    height: FRAME_H,
    borderRadius: 14,
    padding: 1.5,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.72,
    shadowRadius: 18,
    elevation: 10,
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
    borderColor: sg.line,
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
  typewriterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  typewriterCursor: {
    fontSize: fontSize.xxl,
    fontFamily: sg.font.display,
    color: sg.gold,
    marginLeft: 1,
    marginTop: -2,
    textShadowColor: 'rgba(62, 92, 118, 0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  frameLine: {
    fontSize: fontSize.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
    letterSpacing: -0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(192,132,252,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
