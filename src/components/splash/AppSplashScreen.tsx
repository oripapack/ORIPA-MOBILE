import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
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

/** Minimum time before exit can run — long enough to read `splash.frameLine` (~2 words). */
const INTRO_MS = 1650;
const EXIT_MS = 400;

/**
 * Branded boot overlay — layered spotlight, dual sweeps, corner brackets, scan line, wordmark.
 */
export function AppSplashScreen({ exitTrigger, onExitComplete, onExitStart }: Props) {
  const overlayOpacity = useSharedValue(1);
  const frameOpacity = useSharedValue(0);
  const frameScale = useSharedValue(0.91);
  const frameGlow = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoLift = useSharedValue(10);
  const logoScale = useSharedValue(0.94);
  const sweepProgress = useSharedValue(0);
  const sweep2Progress = useSharedValue(0);
  const cornerOpacity = useSharedValue(0);
  const scanProgress = useSharedValue(0);
  const ambientPulse = useSharedValue(0);
  const bgShimmer = useSharedValue(0);

  const [introFinished, setIntroFinished] = useState(false);
  const exitStarted = useRef(false);

  useEffect(() => {
    ambientPulse.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
    bgShimmer.value = withDelay(140, withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }));

    frameOpacity.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) });
    frameScale.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.back(1.05)) });
    frameGlow.value = withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) });
    cornerOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));

    logoOpacity.value = withDelay(340, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    logoLift.value = withDelay(340, withTiming(0, { duration: 440, easing: Easing.out(Easing.cubic) }));
    logoScale.value = withDelay(340, withTiming(1, { duration: 460, easing: Easing.out(Easing.cubic) }));

    scanProgress.value = withDelay(380, withTiming(1, { duration: 720, easing: Easing.out(Easing.cubic) }));
    sweepProgress.value = withDelay(520, withTiming(1, { duration: 560, easing: Easing.inOut(Easing.cubic) }));
    sweep2Progress.value = withDelay(600, withTiming(1, { duration: 520, easing: Easing.inOut(Easing.cubic) }));

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
    opacity: 0.1 + ambientPulse.value * 0.22,
    transform: [{ scale: 0.88 + ambientPulse.value * 0.14 }],
  }));

  const shimmerBandStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bgShimmer.value, [0, 0.35, 0.7, 1], [0, 0.14, 0.1, 0]),
    transform: [{ translateX: interpolate(bgShimmer.value, [0, 1], [-SW * 0.35, SW * 0.35]) }],
  }));

  return (
    <Animated.View style={[styles.root, rootStyle]} pointerEvents="auto">
      <LinearGradient
        colors={['#030504', '#0A100C', '#0C1410']}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(34,197,94,0.07)', 'transparent', 'transparent']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 0.45 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.48)', 'transparent', 'rgba(0,0,0,0.4)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.spotlight, spotlightStyle]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(232,197,71,0.35)', 'rgba(34,197,94,0.08)', 'transparent']}
          start={{ x: 0.5, y: 0.4 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <Animated.View style={[styles.shimmerBand, shimmerBandStyle]} pointerEvents="none">
        <LinearGradient
          colors={['transparent', 'rgba(245,237,214,0.04)', 'rgba(232,197,71,0.06)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.shimmerGrad}
        />
      </Animated.View>

      <View style={styles.center}>
        <SplashCardFrame
          frameOpacity={frameOpacity}
          frameScale={frameScale}
          frameGlow={frameGlow}
          sweepProgress={sweepProgress}
          sweep2Progress={sweep2Progress}
          cornerOpacity={cornerOpacity}
          scanProgress={scanProgress}
        />
        <Animated.View style={[styles.logoBlock, logoAnimStyle]}>
          <SplashLogoReveal />
        </Animated.View>
      </View>

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
  spotlight: {
    position: 'absolute',
    width: SW * 0.92,
    height: SW * 1.05,
    borderRadius: SW * 0.5,
    overflow: 'hidden',
    top: '18%',
  },
  shimmerBand: {
    position: 'absolute',
    width: SW * 0.55,
    height: '100%',
    left: '22%',
    opacity: 0.9,
  },
  shimmerGrad: {
    flex: 1,
    width: '100%',
    height: '100%',
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
