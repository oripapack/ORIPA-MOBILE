import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Defs, LinearGradient, Polyline, Stop } from 'react-native-svg';
import Animated, {
  clamp,
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { brandFont } from '../../../tokens/typography';
import { spacing } from '../../../tokens/spacing';
import {
  PROTOTYPE_PACK_RIP_GESTURE,
  PROTOTYPE_RIP_GESTURE_GUARD_MS,
} from '../../../config/packOpeningAnimation';
import { HeroPackFace } from '../opening/HeroPackFace';
import { CAROUSEL_PACK_DIMS } from './PackSelectionCarousel';

const USE_TAP_TO_OPEN = PROTOTYPE_PACK_RIP_GESTURE === 'tap';

const MIN_SLICE_PX = 40;
const BASE_SHIFT = 36;
const TRAIL_THROTTLE_MS = 10;
const TRAIL_MAX_POINTS = 110;
const DRAG_HAPTIC_STEP_PX = 72;

function hapticLight() {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

function hapticMedium() {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

function hapticSuccess() {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

type SparkGeom = { phi: number; reach: number; cx: number; cy: number };

const SPARK_LOCAL = [
  { u: -0.5, n: -0.35, s: 1 },
  { u: -0.28, n: 0.42, s: 0.95 },
  { u: 0, n: -0.5, s: 1 },
  { u: 0.08, n: 0.38, s: 0.88 },
  { u: 0.32, n: -0.22, s: 0.92 },
  { u: 0.48, n: 0.28, s: 0.85 },
  { u: -0.12, n: 0.55, s: 0.78 },
  { u: 0.22, n: -0.48, s: 0.9 },
  { u: -0.42, n: 0.12, s: 0.72 },
  { u: 0.38, n: 0.45, s: 0.8 },
];

type Props = {
  packTint: string;
  onRipComplete: () => void;
};

/**
 * Open the pack: either tap (peel matches vertical seam) or slash (decorative trail;
 * split is still the modeled left/right seam — true arbitrary cuts need a different renderer).
 */
export function RipOpenInteraction({ packTint, onRipComplete }: Props) {
  const { w, h } = CAROUSEL_PACK_DIMS;
  const faceW = Math.round(w * 1.08);
  const faceH = Math.round(h * 1.08);
  const halfW = faceW / 2;
  const cornerR = Math.max(8, Math.min(18, Math.round((18 * faceW) / 210)));
  const stage = Math.ceil(Math.hypot(faceW, faceH) + 36);
  const lineCx = stage / 2;
  const lineCy = stage / 2;

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const tilt = useSharedValue(0);
  const open = useSharedValue(0);
  const separation = useSharedValue(BASE_SHIFT);
  const lastHaptic = useSharedValue(0);
  const done = useSharedValue(0);
  const cutFlash = useSharedValue(0);
  const sparkAlpha = useSharedValue(0);

  const [gestureEnabled, setGestureEnabled] = useState(false);
  const [trailPoints, setTrailPoints] = useState('');
  const [trailVisible, setTrailVisible] = useState(true);
  const [trailHead, setTrailHead] = useState<{ x: number; y: number } | null>(null);
  const [sparkGeom, setSparkGeom] = useState<SparkGeom | null>(null);
  const trailThrottle = useRef(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    finishedRef.current = false;
    const guard = Math.max(0, PROTOTYPE_RIP_GESTURE_GUARD_MS);
    if (guard === 0) {
      setGestureEnabled(true);
      return;
    }
    const id = setTimeout(() => setGestureEnabled(true), guard);
    return () => {
      clearTimeout(id);
    };
  }, []);

  const clearTrail = useCallback(() => {
    setTrailPoints('');
    setTrailVisible(true);
    setTrailHead(null);
    setSparkGeom(null);
    trailThrottle.current = 0;
  }, []);

  const appendTrailPoint = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - trailThrottle.current < TRAIL_THROTTLE_MS) return;
    trailThrottle.current = now;
    const pt = `${x.toFixed(1)},${y.toFixed(1)}`;
    setTrailHead({ x, y });
    setTrailPoints((prev) => {
      const next = prev ? `${prev} ${pt}` : pt;
      const parts = next.split(' ');
      if (parts.length > TRAIL_MAX_POINTS) return parts.slice(-TRAIL_MAX_POINTS).join(' ');
      return next;
    });
  }, []);

  const fadeTrailOut = useCallback(() => {
    setTrailVisible(false);
    setTimeout(() => {
      setTrailPoints('');
      setTrailHead(null);
      setSparkGeom(null);
    }, 260);
  }, []);

  const resetDone = useCallback(() => {
    finishedRef.current = false;
  }, []);

  const completeOnce = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setGestureEnabled(false);
    hapticSuccess();
    onRipComplete();
  }, [onRipComplete]);

  const fireSlashVfx = useCallback((phi: number, reach: number) => {
    setSparkGeom({ phi, reach, cx: lineCx, cy: lineCy });
    sparkAlpha.value = 0;
    sparkAlpha.value = withSequence(
      withTiming(1, { duration: 70, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 340, easing: Easing.in(Easing.cubic) }),
    );
    cutFlash.value = 0;
    cutFlash.value = withSequence(
      withTiming(1, { duration: 42 }),
      withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) }),
    );
    hapticMedium();
  }, [cutFlash, lineCx, lineCy, sparkAlpha]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(gestureEnabled && !USE_TAP_TO_OPEN)
        .onStart(() => {
          if (done.value === 1) return;
          runOnJS(clearTrail)();
        })
        .onUpdate((e) => {
          if (done.value === 1) return;
          tx.value = e.translationX;
          ty.value = e.translationY;
          runOnJS(appendTrailPoint)(e.x, e.y);
          const len = Math.sqrt(e.translationX * e.translationX + e.translationY * e.translationY);
          const step = Math.floor(clamp(len / DRAG_HAPTIC_STEP_PX, 0, 4));
          if (step > lastHaptic.value) {
            lastHaptic.value = step;
            runOnJS(hapticLight)();
          }
        })
        .onEnd((e) => {
          if (done.value === 1) return;
          const dx = e.translationX;
          const dy = e.translationY;
          const len = Math.sqrt(dx * dx + dy * dy);
          const vel = Math.hypot(e.velocityX, e.velocityY);
          const okLen = len >= MIN_SLICE_PX;
          const okFlick = len >= MIN_SLICE_PX * 0.5 && vel > 640;
          if (!okLen && !okFlick) {
            lastHaptic.value = 0;
            tx.value = withSpring(0, { damping: 20, stiffness: 180 });
            ty.value = withSpring(0, { damping: 20, stiffness: 180 });
            runOnJS(clearTrail)();
            runOnJS(resetDone)();
            return;
          }
          let phi = Math.atan2(dy, dx);
          if (Math.abs(dx) > Math.abs(dy) * 1.25) {
            phi = dx >= 0 ? 0 : Math.PI;
          }
          const reach = Math.min(Math.max(len * 0.85, 48), Math.hypot(faceW, faceH) * 0.58);
          const targetTilt = phi - Math.PI / 2;
          const sep = BASE_SHIFT * (1 + Math.min(vel / 1400, 0.62));
          done.value = 1;
          separation.value = sep;
          tilt.value = withSpring(targetTilt, { damping: 19, stiffness: 132, mass: 0.92 });
          runOnJS(fireSlashVfx)(phi, reach);
          open.value = withDelay(
            52,
            withSequence(
              withTiming(0.08, { duration: 55, easing: Easing.out(Easing.quad) }),
              withTiming(1, { duration: 440, easing: Easing.out(Easing.cubic) }, (finished) => {
                if (finished) {
                  runOnJS(fadeTrailOut)();
                  runOnJS(completeOnce)();
                }
              }),
            ),
          );
        }),
    [
      appendTrailPoint,
      clearTrail,
      completeOnce,
      fadeTrailOut,
      faceH,
      faceW,
      fireSlashVfx,
      gestureEnabled,
      lastHaptic,
      open,
      resetDone,
      separation,
      tilt,
      tx,
      ty,
    ],
  );

  const tapOpen = useMemo(
    () =>
      Gesture.Tap()
        .enabled(gestureEnabled && USE_TAP_TO_OPEN)
        .maxDuration(650)
        .onEnd(() => {
          if (done.value === 1) return;
          const phi = 0;
          const reach = Math.hypot(faceW, faceH) * 0.44;
          const vel = 880;
          const sep = BASE_SHIFT * (1 + Math.min(vel / 1400, 0.62));
          done.value = 1;
          separation.value = sep;
          tilt.value = withSpring(0, { damping: 19, stiffness: 132, mass: 0.92 });
          runOnJS(fireSlashVfx)(phi, reach);
          open.value = withDelay(
            52,
            withSequence(
              withTiming(0.08, { duration: 55, easing: Easing.out(Easing.quad) }),
              withTiming(1, { duration: 440, easing: Easing.out(Easing.cubic) }, (finished) => {
                if (finished) {
                  runOnJS(fadeTrailOut)();
                  runOnJS(completeOnce)();
                }
              }),
            ),
          );
        }),
    [completeOnce, fadeTrailOut, faceH, faceW, fireSlashVfx, gestureEnabled, open, separation, tilt],
  );

  const activeGesture = USE_TAP_TO_OPEN ? tapOpen : pan;

  const stageStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${(tilt.value * 180) / Math.PI}deg` }],
  }));

  const leftStyle = useAnimatedStyle(() => {
    const o = open.value;
    const wO = o * o * (3 - 2 * o);
    return {
      transform: [
        { translateX: -wO * separation.value * 1.08 },
        { translateY: interpolate(o, [0, 0.35, 1], [0, -16, -11]) },
        { rotateZ: `${interpolate(o, [0, 1], [0, -8])}deg` },
      ],
      opacity: 1 - o * 0.14,
    };
  });

  const rightStyle = useAnimatedStyle(() => {
    const o = open.value;
    const wO = o * o * (3 - 2 * o);
    return {
      transform: [
        { translateX: wO * separation.value * 1.02 },
        { translateY: interpolate(o, [0, 0.35, 1], [0, 14, 10]) },
        { rotateZ: `${interpolate(o, [0, 1], [0, 8])}deg` },
      ],
      opacity: 1 - o * 0.14,
    };
  });

  const seamStyle = useAnimatedStyle(() => {
    const o = open.value;
    return {
      opacity: interpolate(o, [0, 0.15, 1], [0.35, 1, 0.88]),
      transform: [{ scaleX: interpolate(o, [0, 0.12, 0.45, 1], [1, 2.4, 1.85, 1.5]) }],
    };
  });

  const cutFlashStyle = useAnimatedStyle(() => ({
    opacity: cutFlash.value * 0.22,
  }));

  const sparkGroupStyle = useAnimatedStyle(() => ({
    opacity: sparkAlpha.value,
  }));

  const sliceLineStyle = useAnimatedStyle(() => {
    if (USE_TAP_TO_OPEN) {
      return { opacity: 0 };
    }
    if (done.value === 1) {
      return { opacity: 0 };
    }
    const L = Math.sqrt(tx.value * tx.value + ty.value * ty.value);
    if (L < 6) {
      return { opacity: 0 };
    }
    const ux = tx.value / L;
    const uy = ty.value / L;
    const reach = Math.min(Math.max(L * 0.82, 28), Math.hypot(faceW, faceH) * 0.55);
    const ang = Math.atan2(uy, ux);
    const deg = (ang * 180) / Math.PI;
    return {
      position: 'absolute',
      left: lineCx - reach / 2,
      top: lineCy - 2,
      width: reach,
      height: 5,
      borderRadius: 3,
      backgroundColor: 'rgba(165,243,252,0.55)',
      opacity: 0.45 + clamp(L / 100, 0, 0.45),
      transform: [{ rotateZ: `${deg}deg` }],
    };
  });

  const sparks = useMemo(() => {
    if (!sparkGeom) return null;
    const { phi, reach, cx, cy } = sparkGeom;
    const cos = Math.cos(phi);
    const sin = Math.sin(phi);
    const nx = -sin;
    const ny = cos;
    return SPARK_LOCAL.map((p, i) => {
      const px = cx + cos * p.u * reach + nx * p.n * 26;
      const py = cy + sin * p.u * reach + ny * p.n * 26;
      const size = 3 + (i % 3);
      return (
        <View
          key={i}
          style={[
            styles.sparkDot,
            {
              left: px - size / 2,
              top: py - size / 2,
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: p.s,
            },
          ]}
        />
      );
    });
  }, [sparkGeom]);

  return (
    <View style={styles.hit}>
      <Text style={styles.instruction}>
        {USE_TAP_TO_OPEN ? 'Tap the pack to tear it open' : 'Slash through the pack — a firm swipe cuts it open'}
      </Text>
      <GestureDetector gesture={activeGesture}>
        <Animated.View style={[styles.stage, { width: stage, height: stage }]}>
          <Animated.View style={[styles.cutFlash, cutFlashStyle]} pointerEvents="none" />

          {trailPoints.length > 0 && trailVisible ? (
            <Svg
              width={stage}
              height={stage}
              style={styles.trailSvg}
              pointerEvents="none"
            >
              <Defs>
                <LinearGradient id="trailOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                  <Stop offset="45%" stopColor="#fde047" stopOpacity={0.65} />
                  <Stop offset="100%" stopColor="#e0f2fe" stopOpacity={0.35} />
                </LinearGradient>
                <LinearGradient id="trailCore" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
                  <Stop offset="100%" stopColor="#a5f3fc" stopOpacity={0.85} />
                </LinearGradient>
              </Defs>
              <Polyline
                points={trailPoints}
                fill="none"
                stroke="url(#trailOuter)"
                strokeWidth={18}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Polyline
                points={trailPoints}
                fill="none"
                stroke="rgba(8,12,20,0.35)"
                strokeWidth={20}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Polyline
                points={trailPoints}
                fill="none"
                stroke="url(#trailCore)"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {trailHead ? (
                <>
                  <Circle
                    cx={trailHead.x}
                    cy={trailHead.y}
                    r={10}
                    fill="rgba(34,211,238,0.28)"
                  />
                  <Circle cx={trailHead.x} cy={trailHead.y} r={4.5} fill="rgba(255,255,255,0.95)" />
                </>
              ) : null}
            </Svg>
          ) : null}

          {sparkGeom ? (
            <Animated.View style={[styles.sparkLayer, sparkGroupStyle]} pointerEvents="none">
              {sparks}
            </Animated.View>
          ) : null}

          <View style={styles.stageCenter}>
            <Animated.View style={stageStyle}>
              <View style={[styles.faceRow, { width: faceW, height: faceH, borderRadius: cornerR }]}>
                <Animated.View
                  style={[
                    styles.half,
                    {
                      width: halfW,
                      height: faceH,
                      borderTopLeftRadius: cornerR,
                      borderBottomLeftRadius: cornerR,
                    },
                    leftStyle,
                  ]}
                >
                  <View style={styles.faceFill}>
                    <HeroPackFace side="left" packAccent={packTint} />
                  </View>
                </Animated.View>
                <Animated.View style={[styles.seam, seamStyle]} />
                <Animated.View
                  style={[
                    styles.half,
                    {
                      width: halfW,
                      height: faceH,
                      borderTopRightRadius: cornerR,
                      borderBottomRightRadius: cornerR,
                    },
                    rightStyle,
                  ]}
                >
                  <View style={styles.faceFill}>
                    <HeroPackFace side="right" packAccent={packTint} />
                  </View>
                </Animated.View>
              </View>
            </Animated.View>
          </View>
          <Animated.View style={[styles.lineOverlay, sliceLineStyle]} pointerEvents="none" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  hit: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  instruction: {
    color: 'rgba(148,163,184,0.9)',
    fontSize: 12,
    fontFamily: brandFont.medium,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    textAlign: 'center',
  },
  stage: {
    position: 'relative',
  },
  cutFlash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
    backgroundColor: '#ecfeff',
  },
  trailSvg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
  },
  sparkLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  sparkDot: {
    position: 'absolute',
    backgroundColor: '#fef9c3',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  stageCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  lineOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 6,
  },
  faceRow: {
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#06090c',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  half: {
    overflow: 'hidden',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  faceFill: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  seam: {
    width: 3,
    marginHorizontal: -1,
    backgroundColor: 'rgba(254,249,195,0.98)',
    alignSelf: 'stretch',
  },
});
