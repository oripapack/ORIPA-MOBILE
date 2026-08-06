import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { sg } from '../../tokens/sg';

const FRAME_W = 248;
const FRAME_H = 154;
const TYPEWRITER_CHAR_MS = 38;
const TYPEWRITER_START_DELAY_MS = 360;

function SplashTypewriterLine({ text }: { text: string }) {
  const [visible, setVisible] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [cursorLit, setCursorLit] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!showCursor) return;
    const id = setInterval(() => setCursorLit((value) => !value), 400);
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
    let endCursorTimer: ReturnType<typeof setTimeout> | null = null;
    const startTimer = setTimeout(() => {
      let index = 0;
      intervalRef.current = setInterval(() => {
        index += 1;
        setVisible(text.slice(0, index));
        if (index >= text.length && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          endCursorTimer = setTimeout(() => setShowCursor(false), 340);
        }
      }, TYPEWRITER_CHAR_MS);
    }, TYPEWRITER_START_DELAY_MS);

    return () => {
      clearTimeout(startTimer);
      if (endCursorTimer) clearTimeout(endCursorTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  return (
    <View style={styles.typewriterRow} accessibilityRole="text" accessibilityLabel={text}>
      <Text style={styles.frameLine} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
        {visible}
      </Text>
      {showCursor ? (
        <Text style={[styles.cursor, { opacity: cursorLit ? 1 : 0.2 }]} accessibilityElementsHidden>
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
  neonBreath?: SharedValue<number>;
};

/** Flat Tokyo wayfinding ticket — the one moment surface allowed to use neon glow. */
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
  const glowStyle = useAnimatedStyle(() => ({ opacity: frameGlow.value * 0.2 }));
  const cornerStyle = useAnimatedStyle(() => ({ opacity: cornerOpacity.value }));
  const scanStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scanProgress.value, [0, 0.12, 0.72, 1], [0, 0.85, 0.45, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scanProgress.value, [0, 1], [0, FRAME_H - 2]) }],
  }));
  const routeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sweepProgress.value, [0, 0.16, 0.8, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
    transform: [{ scaleX: interpolate(sweepProgress.value, [0, 1], [0.08, 1], Extrapolation.CLAMP) }],
  }));
  const stationStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sweep2Progress.value, [0, 0.25, 1], [0, 1, 1], Extrapolation.CLAMP),
  }));
  const neonStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + (neonBreath?.value ?? 0) * 0.55,
  }));

  return (
    <View style={styles.halo}>
      <Animated.View style={[styles.heroGlow, glowStyle]} pointerEvents="none" />
      <Animated.View style={[styles.frame, frameStyle]}>
        <View style={styles.ticketHeader}>
          <Text style={styles.kicker}>TOKYO-BORN</Text>
          <Text style={styles.serial}>PH / 01</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.copyBlock}>
          <SplashTypewriterLine text={t('splash.frameLine')} />
          <Text style={styles.subline}>REAL CARDS / DIGITAL OPEN</Text>
        </View>

        <View style={styles.routeRow}>
          <Animated.View style={[styles.station, styles.stationStart, stationStyle]} />
          <View style={styles.routeTrack}>
            <Animated.View style={[styles.routeFill, routeStyle]} />
          </View>
          <Animated.View style={[styles.station, styles.stationLive, stationStyle, neonStyle]} />
          <Text style={styles.routeCode}>TYO 24/7</Text>
        </View>

        <Animated.View style={[styles.cornerTL, cornerStyle]} />
        <Animated.View style={[styles.cornerBR, cornerStyle]} />
        <Animated.View style={[styles.scanLine, scanStyle, neonStyle]} pointerEvents="none" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    width: FRAME_W + 56,
    height: FRAME_H + 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGlow: {
    position: 'absolute',
    width: FRAME_W + 28,
    height: FRAME_H + 28,
    borderRadius: sg.radius.panel,
    backgroundColor: sg.neon,
    ...sg.glowNeon,
  },
  frame: {
    width: FRAME_W,
    height: FRAME_H,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface,
    padding: sg.space.md,
    overflow: 'hidden',
    ...sg.shadowHero,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    fontFamily: sg.font.bodyBold,
    fontSize: 9,
    letterSpacing: 1.7,
    color: sg.muted,
  },
  serial: {
    fontFamily: sg.font.dataBold,
    fontSize: 9,
    color: sg.muted,
    fontVariant: [...sg.numeric],
  },
  divider: {
    height: 1,
    backgroundColor: sg.line,
    marginTop: sg.space.sm,
  },
  copyBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typewriterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  frameLine: {
    fontFamily: sg.font.display,
    fontSize: 24,
    color: sg.text,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  cursor: {
    fontFamily: sg.font.data,
    fontSize: 22,
    color: sg.neon,
    marginLeft: 2,
  },
  subline: {
    marginTop: 5,
    fontFamily: sg.font.data,
    fontSize: 8,
    letterSpacing: 1.25,
    color: sg.muted,
  },
  routeRow: {
    height: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeTrack: {
    flex: 1,
    height: 1,
    marginHorizontal: 5,
    backgroundColor: sg.line,
  },
  routeFill: {
    width: '100%',
    height: 1,
    backgroundColor: sg.text,
    transformOrigin: 'left',
  },
  station: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
  },
  stationStart: {
    borderColor: sg.text,
    backgroundColor: sg.surface,
  },
  stationLive: {
    borderColor: sg.neon,
    backgroundColor: sg.neon,
    ...sg.glowNeon,
  },
  routeCode: {
    width: 48,
    marginLeft: 7,
    fontFamily: sg.font.dataBold,
    fontSize: 8,
    color: sg.muted,
    textAlign: 'right',
    fontVariant: [...sg.numeric],
  },
  cornerTL: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 8,
    height: 8,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: sg.muted,
  },
  cornerBR: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 8,
    height: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: sg.muted,
  },
  scanLine: {
    position: 'absolute',
    left: 1,
    right: 1,
    top: 0,
    height: 1,
    backgroundColor: sg.neon,
    ...sg.glowNeon,
  },
});
