import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { sg } from '../../tokens/sg';
import { SplashCardFrame } from './SplashCardFrame';
import { SplashLogoReveal } from './SplashLogoReveal';

const { width: SW } = Dimensions.get('window');

type Props = {
  /** When true, splash exits after intro completes (smooth handoff to app). */
  exitTrigger: boolean;
  onExitComplete: () => void;
  /** Fires once when exit begins — run app-shell entrance (zoom / scale) in parallel with fade. */
  onExitStart?: () => void;
};

/** Minimum time before exit can run — matches “rise + accent” choreography. */
const INTRO_MS = 2350;
const EXIT_MS = 520;

/** Smooth luxury ease — less bouncy than the previous back-ease card pop. */
const easeLuxury = Easing.bezier(0.22, 1, 0.36, 1);

/**
 * Branded boot overlay — variant: vertical drift + hero “rises into frame” (vs prior horizontal shimmer + back-scale).
 */
export function AppSplashScreen({ exitTrigger, onExitComplete, onExitStart }: Props) {
  const overlayOpacity = useSharedValue(1);
  const frameOpacity = useSharedValue(0);
  const frameScale = useSharedValue(0.87);
  const frameGlow = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoLift = useSharedValue(14);
  const logoScale = useSharedValue(0.96);
  const sweepProgress = useSharedValue(0);
  const sweep2Progress = useSharedValue(0);
  const cornerOpacity = useSharedValue(0);
  const scanProgress = useSharedValue(0);
  const ambientPulse = useSharedValue(0);
  const bgShimmer = useSharedValue(0);
  /** Whole card + logo column: cinematic rise + micro rotation into place */
  const heroRise = useSharedValue(0);
  const heroRotate = useSharedValue(-1.4);
  /** Looped cyan / gold “neon tube” pulse behind the hero card */
  const neonBreath = useSharedValue(0);

  const [introFinished, setIntroFinished] = useState(false);
  const exitStarted = useRef(false);

  useEffect(() => {
    ambientPulse.value = withTiming(1, { duration: 1650, easing: Easing.inOut(Easing.cubic) });
    bgShimmer.value = withDelay(120, withTiming(1, { duration: 1750, easing: Easing.inOut(Easing.quad) }));

    heroRise.value = withTiming(1, { duration: 920, easing: easeLuxury });
    heroRotate.value = withTiming(0, { duration: 980, easing: easeLuxury });

    frameOpacity.value = withTiming(1, { duration: 520, easing: easeLuxury });
    frameScale.value = withTiming(1, { duration: 780, easing: easeLuxury });
    frameGlow.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    cornerOpacity.value = withDelay(240, withTiming(1, { duration: 560, easing: easeLuxury }));

    logoOpacity.value = withDelay(420, withTiming(1, { duration: 480, easing: easeLuxury }));
    logoLift.value = withDelay(420, withTiming(0, { duration: 520, easing: easeLuxury }));
    logoScale.value = withDelay(420, withTiming(1, { duration: 540, easing: easeLuxury }));

    scanProgress.value = withDelay(440, withTiming(1, { duration: 780, easing: Easing.out(Easing.cubic) }));
    sweepProgress.value = withDelay(640, withTiming(1, { duration: 620, easing: Easing.inOut(Easing.cubic) }));
    sweep2Progress.value = withDelay(740, withTiming(1, { duration: 580, easing: Easing.inOut(Easing.cubic) }));

    neonBreath.value = withDelay(
      320,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1350, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.18, { duration: 1550, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );

    const t = setTimeout(() => setIntroFinished(true), INTRO_MS);
    return () => clearTimeout(t);
  }, []);

  const runExit = useCallback(() => {
    onExitStart?.();
    overlayOpacity.value = withTiming(0, { duration: EXIT_MS, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(onExitComplete)();
    });
  }, [onExitComplete, onExitStart, overlayOpacity]);

  useEffect(() => {
    if (!introFinished || !exitTrigger || exitStarted.current) return;
    exitStarted.current = true;
    runExit();
  }, [exitTrigger, introFinished, runExit]);

  const rootStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoLift.value }, { scale: logoScale.value }],
  }));

  const spotlightStyle = useAnimatedStyle(() => ({
    opacity: 0.08 + ambientPulse.value * 0.2,
    transform: [{ scale: 0.9 + ambientPulse.value * 0.1 }],
  }));

  const shimmerBandStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bgShimmer.value, [0, 0.35, 0.7, 1], [0, 0.12, 0.09, 0]),
    transform: [{ translateY: interpolate(bgShimmer.value, [0, 1], [-SW * 0.42, SW * 0.42]) }],
  }));

  const heroGroupStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(heroRise.value, [0, 1], [34, 0]),
      },
      {
        rotateZ: `${heroRotate.value}deg`,
      },
      { scale: interpolate(heroRise.value, [0, 1], [0.94, 1]) },
    ],
  }));

  // neonBreath is passed into `SplashCardFrame` for a tighter edge-lit look
  // (no large background glows in this variant).

  return (
    <Animated.View style={[styles.root, rootStyle]} pointerEvents="auto">
      <View style={styles.artLayer} pointerEvents="none" />

      <Animated.View style={[styles.spotlight, spotlightStyle]} pointerEvents="none" />

      <Animated.View style={[styles.shimmerBand, shimmerBandStyle]} pointerEvents="none" />

      <Animated.View style={[styles.center, heroGroupStyle]}>
        <SplashCardFrame
          frameOpacity={frameOpacity}
          frameScale={frameScale}
          frameGlow={frameGlow}
          sweepProgress={sweepProgress}
          sweep2Progress={sweep2Progress}
          cornerOpacity={cornerOpacity}
          scanProgress={scanProgress}
          neonBreath={neonBreath}
        />
        <Animated.View style={[styles.logoBlock, logoAnimStyle]}>
          <SplashLogoReveal />
        </Animated.View>
      </Animated.View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    elevation: 2000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: sg.bg,
  },
  spotlight: {
    position: 'absolute',
    width: SW * 0.92,
    height: SW * 1.05,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface,
    top: '18%',
  },
  shimmerBand: {
    position: 'absolute',
    width: 1,
    height: '100%',
    left: '50%',
    opacity: 0.9,
    backgroundColor: sg.muted,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  logoBlock: {
    marginTop: 24,
  },
});
