import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { brandFont } from '../../../tokens/typography';
import { spacing } from '../../../tokens/spacing';
import { PROTOTYPE_RIP_GESTURE_GUARD_MS } from '../../../config/packOpeningAnimation';
import { HeroPackFace } from '../opening/HeroPackFace';
import { CAROUSEL_PACK_DIMS } from './PackSelectionCarousel';

const preserve3d = { transformStyle: 'preserve-3d' } as ViewStyle;

const BURST_AT = 0.7;
const SEAM_HIT_HALF = 22;
const BACKFACE_RAD_THRESHOLD = Math.PI * 0.72;
const SPRING_ROTATE = { mass: 1.15, damping: 19, stiffness: 118 } as const;
const SPRING_PEEL = { mass: 1.05, damping: 20, stiffness: 132 } as const;
const SPRING_BURST = { mass: 0.95, damping: 16, stiffness: 180 } as const;

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

type Props = {
  packTint: string;
  onRipComplete: () => void;
  /** Optional external progress (0..1) — driven by peel amount on the back. */
  openProgressSV?: SharedValue<number>;
  /** Optional external lock (1 = gestures ignored). */
  gestureLockSV?: SharedValue<number>;
  /** When false, burst / completion does not call `onRipComplete`. */
  completeOnFinish?: boolean;
};

/**
 * Back-peel open: pan to rotate the pack to its back, then pull the center seam
 * downward to peel the foil; at ~70% peel, a flare burst finishes the open.
 */
export function RipOpenInteraction({
  packTint,
  onRipComplete,
  openProgressSV,
  gestureLockSV,
  completeOnFinish = true,
}: Props) {
  const { w, h } = CAROUSEL_PACK_DIMS;
  const faceW = Math.round(w * 1.08);
  const faceH = Math.round(h * 1.08);
  const halfW = faceW / 2;
  const cornerR = Math.max(8, Math.min(18, Math.round((18 * faceW) / 210)));
  const stage = Math.ceil(Math.hypot(faceW, faceH) + 36);
  const stageMidX = stage / 2;

  const rotateY = useSharedValue(0);
  const opening = openProgressSV ?? useSharedValue(0);
  const bursting = useSharedValue(0);
  const burstArmed = useSharedValue(0);
  const flare = useSharedValue(0);
  const packPop = useSharedValue(1);
  const rootFade = useSharedValue(1);

  const rotateStart = useSharedValue(0);
  const peelStart = useSharedValue(0);
  /** 0 = rotate, 1 = peel */
  const activeMode = useSharedValue(0);

  const [gestureEnabled, setGestureEnabled] = useState(false);
  const finishedRef = useRef(false);
  const runBurstRef = useRef<() => void>(() => {});

  useEffect(() => {
    const guard = Math.max(0, PROTOTYPE_RIP_GESTURE_GUARD_MS);
    if (guard === 0) {
      setGestureEnabled(true);
      return;
    }
    const id = setTimeout(() => setGestureEnabled(true), guard);
    return () => clearTimeout(id);
  }, []);

  const completeOnce = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setGestureEnabled(false);
    hapticSuccess();
    if (completeOnFinish) {
      onRipComplete();
    }
  }, [completeOnFinish, onRipComplete]);

  const runBurst = useCallback(() => {
    if (finishedRef.current) return;
    bursting.value = 1;
    hapticMedium();
    opening.value = withSpring(1, SPRING_BURST);
    packPop.value = withSequence(
      withSpring(1.08, { mass: 0.85, damping: 14, stiffness: 220 }),
      withSpring(0.92, { mass: 0.9, damping: 18, stiffness: 160 }),
    );
    flare.value = withSequence(
      withSpring(1, { mass: 0.75, damping: 14, stiffness: 260 }),
      withDelay(
        120,
        withTiming(0, { duration: 380 }, (done) => {
          if (done) {
            rootFade.value = withTiming(0, { duration: 220 }, (f2) => {
              if (f2) {
                runOnJS(completeOnce)();
              }
            });
          }
        }),
      ),
    );
  }, [bursting, completeOnce, flare, opening, packPop, rootFade]);

  runBurstRef.current = runBurst;

  useAnimatedReaction(
    () => opening.value,
    (o, prev) => {
      if (bursting.value === 1) return;
      if (burstArmed.value === 1) return;
      if (o < BURST_AT) return;
      if (prev !== null && prev >= BURST_AT) return;
      burstArmed.value = 1;
      runOnJS(() => {
        runBurstRef.current();
      })();
    },
  );

  const mainPan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(gestureEnabled)
        .onStart((e) => {
          if (bursting.value === 1) return;
          if (gestureLockSV?.value === 1) return;
          const nearBack = rotateY.value > BACKFACE_RAD_THRESHOLD;
          const inSeam = Math.abs(e.x - stageMidX) < SEAM_HIT_HALF;
          activeMode.value = nearBack && inSeam ? 1 : 0;
          rotateStart.value = rotateY.value;
          peelStart.value = opening.value;
        })
        .onUpdate((e) => {
          if (bursting.value === 1) return;
          if (gestureLockSV?.value === 1) return;
          if (activeMode.value === 1) {
            const add = Math.max(0, e.translationY) / Math.max(180, faceH * 0.95);
            const next = Math.min(1, peelStart.value + add);
            opening.value = next;
            return;
          }
          const sens = Math.PI / Math.max(faceW * 1.35, 200);
          const nextRot = rotateStart.value + e.translationX * sens;
          rotateY.value = Math.min(Math.PI, Math.max(0, nextRot));
        })
        .onEnd((e) => {
          if (bursting.value === 1) return;
          if (gestureLockSV?.value === 1) return;
          if (activeMode.value === 1) {
            const o = opening.value;
            if (o >= BURST_AT) {
              return;
            }
            const target = o > 0.38 ? Math.min(o, BURST_AT - 0.02) : 0;
            opening.value = withSpring(target, SPRING_PEEL);
            runOnJS(hapticLight)();
            return;
          }
          const v = e.velocityX;
          const y = rotateY.value;
          let target = y > Math.PI / 2 ? Math.PI : 0;
          if (Math.abs(v) > 680) {
            target = v > 0 ? Math.PI : 0;
          }
          rotateY.value = withSpring(target, SPRING_ROTATE);
          runOnJS(hapticLight)();
        }),
    [
      activeMode,
      bursting,
      faceH,
      faceW,
      gestureEnabled,
      gestureLockSV,
      opening,
      peelStart,
      rotateStart,
      rotateY,
      stageMidX,
    ],
  );

  const cubeStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${rotateY.value}rad` },
      { scale: packPop.value },
    ],
    opacity: rootFade.value,
  }));

  const frontFaceStyle = useAnimatedStyle(() => ({
    opacity: interpolate(rotateY.value, [0, Math.PI * 0.45], [1, 0], Extrapolate.CLAMP),
  }));

  const backFaceStyle = useAnimatedStyle(() => ({
    opacity: interpolate(rotateY.value, [Math.PI * 0.38, Math.PI * 0.55], [0, 1], Extrapolate.CLAMP),
  }));

  const foilPeelStyle = useAnimatedStyle(() => {
    const o = opening.value;
    return {
      transform: [
        { scaleX: 1 + 0.42 * o },
        { scaleY: 1 + 0.36 * o },
      ],
      opacity: interpolate(o, [0, 0.25, 1], [1, 0.92, 0.35]),
    };
  });

  const seamGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opening.value, [0, 0.2, 0.85], [0.45, 1, 0.75]),
    transform: [{ scaleY: interpolate(opening.value, [0, 1], [1, 1.08]) }],
  }));

  const flareStyle = useAnimatedStyle(() => ({
    opacity: flare.value * 0.92,
    transform: [{ scale: interpolate(flare.value, [0, 1], [0.65, 1.45]) }],
  }));

  return (
    <View style={styles.hit}>
      <Text style={styles.instruction}>Turn the pack, then pull the back seam down</Text>
      <GestureDetector gesture={mainPan}>
        <Animated.View style={[styles.stage, { width: stage, height: stage }]}>
          <View pointerEvents="none" style={styles.backdrop}>
            <ExpoLinearGradient
              colors={['rgba(2,6,23,0.0)', 'rgba(2,6,23,0.45)', 'rgba(0,0,0,0.78)']}
              locations={[0, 0.45, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>

          <View style={styles.stageCenter}>
            <Animated.View
              style={[{ width: faceW, height: faceH }, preserve3d, cubeStyle]}
            >
              {/* Front */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.faceAbs,
                  { borderRadius: cornerR, width: faceW, height: faceH },
                  frontFaceStyle,
                ]}
              >
                <View style={[styles.faceRow, { width: faceW, height: faceH, borderRadius: cornerR }]}>
                  <View
                    style={[
                      styles.half,
                      {
                        width: halfW,
                        height: faceH,
                        borderTopLeftRadius: cornerR,
                        borderBottomLeftRadius: cornerR,
                      },
                    ]}
                  >
                    <View style={styles.faceFill}>
                      <HeroPackFace side="left" packAccent={packTint} />
                    </View>
                  </View>
                  <View style={styles.frontSpine} />
                  <View
                    style={[
                      styles.half,
                      {
                        width: halfW,
                        height: faceH,
                        borderTopRightRadius: cornerR,
                        borderBottomRightRadius: cornerR,
                      },
                    ]}
                  >
                    <View style={styles.faceFill}>
                      <HeroPackFace side="right" packAccent={packTint} />
                    </View>
                  </View>
                </View>
              </Animated.View>

              {/* Back */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.faceAbs,
                  styles.backRot,
                  { borderRadius: cornerR, width: faceW, height: faceH },
                  backFaceStyle,
                ]}
              >
                <ExpoLinearGradient
                  colors={['#0a0f18', '#111827', '#0c1220']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.backPlate, { borderRadius: cornerR }]}
                >
                  <View style={styles.backFoilUnder} />
                  <Animated.View style={[styles.foilPeel, foilPeelStyle]} pointerEvents="none">
                    <ExpoLinearGradient
                      colors={[
                        'rgba(148,163,184,0.22)',
                        'rgba(226,232,240,0.38)',
                        'rgba(253,230,138,0.28)',
                        'rgba(148,163,184,0.2)',
                      ]}
                      locations={[0, 0.35, 0.62, 1]}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>
                  <Animated.View style={[styles.backSeam, seamGlowStyle]} />
                  <View style={styles.backGlyph} pointerEvents="none">
                    <View
                      style={[
                        styles.glyphLine,
                        { width: Math.round(faceW * 0.35), backgroundColor: packTint, opacity: 0.35 },
                      ]}
                    />
                    <View style={[styles.glyphDot, { borderColor: packTint }]} />
                  </View>
                </ExpoLinearGradient>
              </Animated.View>
            </Animated.View>
          </View>

          <Animated.View style={[styles.flare, flareStyle]} pointerEvents="none" />
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
    color: 'rgba(226,232,240,0.72)',
    fontSize: 12,
    fontFamily: brandFont.semibold,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  stage: {
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    borderRadius: 999,
  },
  stageCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  faceAbs: {
    position: 'absolute',
    left: 0,
    top: 0,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backRot: {
    transform: [{ rotateY: '180deg' }],
  },
  faceRow: {
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#06090c',
  },
  frontSpine: {
    width: 2,
    marginHorizontal: -1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignSelf: 'stretch',
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
  backPlate: {
    flex: 1,
    overflow: 'hidden',
  },
  backFoilUnder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  foilPeel: {
    ...StyleSheet.absoluteFillObject,
    transformOrigin: 'center',
  },
  backSeam: {
    position: 'absolute',
    left: '50%',
    marginLeft: -2,
    top: '6%',
    width: 4,
    height: '88%',
    borderRadius: 2,
    backgroundColor: 'rgba(254,249,195,0.95)',
    shadowColor: '#fde047',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
  },
  backGlyph: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  glyphLine: {
    height: 2,
    borderRadius: 1,
    marginBottom: 10,
  },
  glyphDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  flare: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 999,
  },
});
