import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing } from '../../../tokens/spacing';
import { ReelPackShell } from '../opening/ReelPackShell';
import { CAROUSEL_PACK_DIMS } from './PackSelectionCarousel';

const easeOut = Easing.bezier(0.33, 0.86, 0.2, 1);
const easeSoft = Easing.bezier(0.25, 0.46, 0.45, 0.94);

type Props = {
  packTint: string;
  visible: boolean;
  onSettled: () => void;
};

/**
 * Focused center stage: dim eases in, then pack drifts up into place with a soft settle.
 */
export function SelectedPackStage({ packTint, visible, onSettled }: Props) {
  const dim = useRef(new Animated.Value(0)).current;
  const packS = useRef(new Animated.Value(0.88)).current;
  const packO = useRef(new Animated.Value(0)).current;
  const packY = useRef(new Animated.Value(22)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const settledRef = useRef(false);
  const breatheRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    settledRef.current = false;
    if (!visible) {
      dim.setValue(0);
      packS.setValue(0.88);
      packO.setValue(0);
      packY.setValue(22);
      glow.setValue(0);
      breatheRef.current?.stop();
      breatheRef.current = null;
      return;
    }

    const anim = Animated.sequence([
      Animated.parallel([
        Animated.timing(dim, {
          toValue: 1,
          duration: 420,
          easing: easeOut,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(60),
          Animated.parallel([
            Animated.timing(packO, {
              toValue: 1,
              duration: 320,
              easing: easeSoft,
              useNativeDriver: true,
            }),
            Animated.spring(packY, {
              toValue: 0,
              friction: 11,
              tension: 70,
              useNativeDriver: true,
            }),
          ]),
          Animated.spring(packS, {
            toValue: 1,
            friction: 10,
            tension: 62,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(glow, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
      ]),
      // No extra hold here — show the tap-to-open step immediately after the pack settles.
    ]);

    anim.start(({ finished }) => {
      if (!finished || settledRef.current) return;
      settledRef.current = true;
      // Gentle breathing so the pack reads like a “hero object” in a chamber.
      breatheRef.current?.stop();
      const breathe = Animated.loop(
        Animated.sequence([
          Animated.timing(packS, { toValue: 1.012, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(packS, { toValue: 1.0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      );
      breatheRef.current = breathe;
      breathe.start();
      onSettled();
    });

    return () => {
      anim.stop();
      breatheRef.current?.stop();
      breatheRef.current = null;
    };
  }, [visible, dim, glow, onSettled, packO, packS, packY]);

  const { w, h } = CAROUSEL_PACK_DIMS;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.dim,
          {
            opacity: dim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.52],
            }),
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.spot,
          {
            opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.82] }),
            transform: [
              {
                scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1.08, 0.98] }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(248,250,252,0.12)', 'transparent', 'transparent']}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View style={styles.center}>
        <Animated.View
          style={{
            opacity: packO,
            transform: [{ translateY: packY }, { scale: packS }],
          }}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.halo,
              {
                opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }),
              },
            ]}
          />
          <ReelPackShell width={Math.round(w * 1.08)} height={Math.round(h * 1.08)} tint={packTint} lockEmphasis={0} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020617',
  },
  spot: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '14%',
    height: 360,
    borderRadius: 999,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xl * 2,
  },
  halo: {
    position: 'absolute',
    left: -26,
    right: -26,
    top: -22,
    bottom: -22,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.06)',
    shadowColor: 'rgba(255,255,255,0.55)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 26,
    elevation: 18,
  },
});
