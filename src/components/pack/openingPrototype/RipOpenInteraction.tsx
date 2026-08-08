import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Animated, {
  runOnJS,
  useAnimatedReaction,
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
import { PROTOTYPE_RIP_GESTURE_GUARD_MS } from '../../../config/packOpeningAnimation';
import { runHapticIfEnabled } from '../../../audio/hapticsGate';
import { HeroPackFace } from '../opening/HeroPackFace';
import { CAROUSEL_PACK_DIMS } from './PackSelectionCarousel';

const preserve3d = { transformStyle: 'preserve-3d' } as ViewStyle;

const SPRING_FLIP = { mass: 1.05, damping: 20, stiffness: 150, overshootClamping: true } as const;
const SPRING_BURST = { mass: 0.95, damping: 16, stiffness: 180 } as const;
const BACK_HOLD_BEFORE_BURST_MS = 140;

function hapticLight() {
  runHapticIfEnabled(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

function hapticMedium() {
  runHapticIfEnabled(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

function hapticSuccess() {
  runHapticIfEnabled(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
}

type Props = {
  packTint: string;
  onRipComplete: () => void;
};

/**
 * Prototype open: flip the pack (real 3D rotateY), then burst into reveal.
 * Used by `PrototypePackOpenFlow` after lineup selection.
 */
export function RipOpenInteraction({ packTint, onRipComplete }: Props) {
  const { w, h } = CAROUSEL_PACK_DIMS;
  const faceW = Math.round(w * 1.08);
  const faceH = Math.round(h * 1.08);
  const halfW = faceW / 2;
  const cornerR = Math.max(8, Math.min(18, Math.round((18 * faceW) / 210)));
  const stage = Math.ceil(Math.hypot(faceW, faceH) + 36);

  const flip = useSharedValue(0); // 0..1
  const opening = useSharedValue(0); // mirrors flip until burst (kept for future orchestration)
  const bursting = useSharedValue(0);
  const flare = useSharedValue(0);
  const packPop = useSharedValue(1);
  const rootFade = useSharedValue(1);

  const flipStart = useSharedValue(0);

  const [gestureEnabled, setGestureEnabled] = useState(false);
  const finishedRef = useRef(false);
  const burstRanRef = useRef(false);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const guard = Math.max(0, PROTOTYPE_RIP_GESTURE_GUARD_MS);
    if (guard === 0) {
      setGestureEnabled(true);
      return;
    }
    const id = setTimeout(() => setGestureEnabled(true), guard);
    return () => {
      clearTimeout(id);
      if (burstTimerRef.current) {
        clearTimeout(burstTimerRef.current);
        burstTimerRef.current = null;
      }
    };
  }, []);

  const completeOnce = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setGestureEnabled(false);
    hapticSuccess();
    onRipComplete();
  }, [onRipComplete]);

  const runBurst = useCallback(() => {
    if (finishedRef.current) return;
    bursting.value = 1;
    hapticMedium();
    opening.value = withTiming(1, { duration: 260 });
    packPop.value = withSequence(
      withTiming(1.03, { duration: 140 }),
      withTiming(0.985, { duration: 210 }),
    );
    flare.value = withSequence(
      withTiming(1, { duration: 180 }),
      withDelay(
        80,
        withTiming(0, { duration: 420 }, (done) => {
          if (done) {
            rootFade.value = withTiming(0, { duration: 280 }, (f2) => {
              if (f2) runOnJS(completeOnce)();
            });
          }
        }),
      ),
    );
  }, [bursting, completeOnce, flare, opening, packPop, rootFade]);

  const runBurstRef = useRef(runBurst);
  runBurstRef.current = runBurst;

  const scheduleBurstIfBack = useCallback(() => {
    if (finishedRef.current || burstRanRef.current) return;
    burstRanRef.current = true;
    if (burstTimerRef.current) {
      clearTimeout(burstTimerRef.current);
    }
    burstTimerRef.current = setTimeout(() => {
      burstTimerRef.current = null;
      runBurstRef.current();
    }, BACK_HOLD_BEFORE_BURST_MS);
  }, []);

  useAnimatedReaction(
    () => flip.value,
    (v) => {
      if (bursting.value === 1) return;
      opening.value = v;
    },
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(gestureEnabled)
        .activeOffsetX([-8, 8])
        .failOffsetY([-26, 26])
        .onStart(() => {
          if (bursting.value === 1) return;
          flipStart.value = flip.value;
        })
        .onUpdate((e) => {
          if (bursting.value === 1) return;
          // Stable "either direction flips":
          // front side (start < 0.5): any horizontal swipe opens (0 -> 1)
          // back side  (start >= 0.5): any horizontal swipe closes (1 -> 0)
          const towardBack = flipStart.value < 0.5 ? 1 : -1;
          const signed = Math.abs(e.translationX) * towardBack;
          const sens = 1 / Math.max(faceW * 0.52, 160);
          const next = flipStart.value + signed * sens;
          flip.value = Math.min(1, Math.max(0, next));
        })
        .onEnd((e) => {
          if (bursting.value === 1) return;
          const v = e.velocityX;
          let target = flip.value > 0.5 ? 1 : 0;
          if (Math.abs(v) > 520) {
            // Same rule: “either direction flips”. Interpret velocity magnitude as intent:
            // if you're on the front, a fast swipe opens; if you're on the back, fast swipe closes.
            target = flipStart.value < 0.5 ? 1 : 0;
          }
          flip.value = withSpring(target, SPRING_FLIP, (finished) => {
            if (!finished) return;
            if (target === 1 && bursting.value === 0) {
              runOnJS(scheduleBurstIfBack)();
            }
          });
          runOnJS(hapticLight)();
        }),
    [bursting, faceW, flip, flipStart, gestureEnabled, scheduleBurstIfBack],
  );

  const packMotionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: packPop.value }],
    opacity: rootFade.value,
  }));

  const flip3dStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1400 }, { rotateY: `${flip.value * Math.PI}rad` }],
  }));

  const flareStyle = useAnimatedStyle(() => ({
    opacity: flare.value * 0.92,
    transform: [{ scale: flare.value * 0.45 + 0.65 }],
  }));

  return (
    <View style={styles.hit}>
      <Text style={styles.instruction}>
        Swipe left or right to spin the pack. When it settles on the back, it opens.
      </Text>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.stage, { width: stage, height: stage }]}>
          <View pointerEvents="none" style={styles.backdrop}>
            <ExpoLinearGradient
              colors={['rgba(2,6,23,0.0)', 'rgba(59,130,246,0.12)', 'rgba(0,0,0,0.82)']}
              locations={[0, 0.45, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.backdropSpot} />
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
                  />
                </View>

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
  backdropSpot: {
    ...StyleSheet.absoluteFillObject,
    left: '18%',
    right: '18%',
    top: '12%',
    bottom: '12%',
    borderRadius: 18,
    backgroundColor: 'rgba(253,230,138,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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
  backPlate: {
    flex: 1,
    overflow: 'hidden',
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
  flare: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 999,
  },
});
