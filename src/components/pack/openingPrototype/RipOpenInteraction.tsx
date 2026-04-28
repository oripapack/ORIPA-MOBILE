import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Animated, {
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

const SPRING_FLIP = { mass: 1.1, damping: 19, stiffness: 124 } as const;
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
  /** Optional external progress (0..1) — tracks flip until burst. */
  openProgressSV?: SharedValue<number>;
  gestureLockSV?: SharedValue<number>;
  completeOnFinish?: boolean;
};

/**
 * Flip-only open: horizontal pan drives `flip` 0 = front → 1 = back.
 * Visual is a real Y-axis 3D rotation (perspective + back faces); settling on the back triggers burst.
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

  const flip = useSharedValue(0);
  const internalOpening = useSharedValue(0);
  const opening = openProgressSV ?? internalOpening;
  const bursting = useSharedValue(0);
  const flare = useSharedValue(0);
  const packPop = useSharedValue(1);
  const rootFade = useSharedValue(1);

  const flipStart = useSharedValue(0);

  const [gestureEnabled, setGestureEnabled] = useState(false);
  const finishedRef = useRef(false);
  const burstRanRef = useRef(false);
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

  const scheduleBurstIfBack = useCallback(() => {
    if (finishedRef.current || burstRanRef.current) return;
    burstRanRef.current = true;
    runBurstRef.current();
  }, []);

  /** Keep `opening` identical to `flip` so we never run two competing springs (avoids jitter). */
  useAnimatedReaction(
    () => flip.value,
    (v) => {
      if (bursting.value === 1) return;
      opening.value = v;
    },
  );

  const mainPan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(gestureEnabled)
        .onStart(() => {
          if (bursting.value === 1) return;
          if (gestureLockSV?.value === 1) return;
          flipStart.value = flip.value;
        })
        .onUpdate((e) => {
          if (bursting.value === 1) return;
          if (gestureLockSV?.value === 1) return;
          const sens = 1 / Math.max(faceW * 0.52, 160);
          const next = flipStart.value + e.translationX * sens;
          flip.value = Math.min(1, Math.max(0, next));
        })
        .onEnd((e) => {
          if (bursting.value === 1) return;
          if (gestureLockSV?.value === 1) return;
          const v = e.velocityX;
          let target = flip.value > 0.5 ? 1 : 0;
          if (Math.abs(v) > 520) {
            target = v > 0 ? 1 : 0;
          }
          flip.value = withSpring(target, SPRING_FLIP, (finished) => {
            if (!finished) return;
            if (target === 1 && bursting.value === 0) {
              runOnJS(scheduleBurstIfBack)();
            }
          });
          runOnJS(hapticLight)();
        }),
    [
      bursting,
      faceW,
      flip,
      flipStart,
      gestureEnabled,
      gestureLockSV,
      scheduleBurstIfBack,
    ],
  );

  const packMotionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: packPop.value }],
    opacity: rootFade.value,
  }));

  const flip3dStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1400 },
      { rotateY: `${flip.value * Math.PI}rad` },
    ],
  }));

  const flareStyle = useAnimatedStyle(() => ({
    opacity: flare.value * 0.92,
    transform: [{ scale: flare.value * 0.45 + 0.65 }],
  }));

  return (
    <View style={styles.hit}>
      <Text style={styles.instruction}>
        Swipe left or right to flip the pack. When it settles on the back, it opens.
      </Text>
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
            <Animated.View style={[styles.cardStack, { width: faceW, height: faceH }, packMotionStyle]}>
              <Animated.View
                collapsable={false}
                style={[
                  styles.flipRoot,
                  { width: faceW, height: faceH, borderRadius: cornerR },
                  preserve3d,
                  flip3dStyle,
                ]}
              >
                {/* Back: pre-rotated 180° so it faces camera when flip === 1 */}
                <View
                  pointerEvents="none"
                  style={[
                    styles.faceSide,
                    styles.backSide,
                    { borderRadius: cornerR, width: faceW, height: faceH },
                  ]}
                >
                  <ExpoLinearGradient
                    colors={['#1a2440', '#243352', '#1a2744']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.backPlate, { borderRadius: cornerR }]}
                  >
                    <View style={styles.backFoilUnder} />
                    <View style={styles.backCenterGlow} pointerEvents="none" />
                    <View style={styles.backSeam} />
                    <View style={styles.backGlyph} pointerEvents="none">
                      <View
                        style={[
                          styles.glyphLine,
                          {
                            width: Math.round(faceW * 0.35),
                            backgroundColor: packTint,
                            opacity: 0.45,
                          },
                        ]}
                      />
                      <View style={[styles.glyphDot, { borderColor: packTint }]} />
                    </View>
                  </ExpoLinearGradient>
                </View>

                {/* Front */}
                <View
                  pointerEvents="none"
                  style={[styles.faceSide, { borderRadius: cornerR, width: faceW, height: faceH }]}
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
                </View>
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
    overflow: 'visible',
  },
  cardStack: {
    position: 'relative',
    overflow: 'visible',
  },
  flipRoot: {
    overflow: 'visible',
  },
  faceSide: {
    position: 'absolute',
    left: 0,
    top: 0,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: '#06090c',
  },
  backSide: {
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
    backgroundColor: 'rgba(51,65,85,0.4)',
  },
  backCenterGlow: {
    position: 'absolute',
    left: '14%',
    right: '14%',
    top: '10%',
    bottom: '10%',
    borderRadius: 16,
    backgroundColor: 'rgba(248,250,252,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backSeam: {
    position: 'absolute',
    left: '50%',
    marginLeft: -3,
    top: '5%',
    width: 6,
    height: '90%',
    borderRadius: 3,
    backgroundColor: 'rgba(254,249,195,0.98)',
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
