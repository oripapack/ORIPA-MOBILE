import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
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
  const settledRef = useRef(false);

  useEffect(() => {
    settledRef.current = false;
    if (!visible) {
      dim.setValue(0);
      packS.setValue(0.88);
      packO.setValue(0);
      packY.setValue(22);
      return;
    }

    const anim = Animated.sequence([
      Animated.parallel([
        Animated.timing(dim, {
          toValue: 1,
          duration: 560,
          easing: easeOut,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(110),
          Animated.parallel([
            Animated.timing(packO, {
              toValue: 1,
              duration: 420,
              easing: easeSoft,
              useNativeDriver: true,
            }),
            Animated.spring(packY, {
              toValue: 0,
              friction: 11,
              tension: 64,
              useNativeDriver: true,
            }),
          ]),
          Animated.spring(packS, {
            toValue: 1,
            friction: 10,
            tension: 58,
            useNativeDriver: true,
          }),
        ]),
      ]),
      /** Short beat before the tear step (instruction only shows there). */
      Animated.delay(260),
    ]);

    anim.start(({ finished }) => {
      if (!finished || settledRef.current) return;
      settledRef.current = true;
      onSettled();
    });

    return () => {
      anim.stop();
    };
  }, [visible, dim, onSettled, packO, packS, packY]);

  if (!visible) return null;

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
      <View style={styles.center}>
        <Animated.View
          style={{
            opacity: packO,
            transform: [{ translateY: packY }, { scale: packS }],
          }}
        >
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
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xl * 2,
  },
});
