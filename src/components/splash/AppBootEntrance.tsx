import React from 'react';
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  /** 0 = pre-entrance (slightly “deeper”), 1 = settled. Driven by splash `onExitStart`. */
  entrance: SharedValue<number>;
};

/** Shared by `ClerkAuthGate` / `NonClerkBoot` — snappier spring = stronger “snap into place”. */
export const BOOT_ENTRANCE_SPRING = { damping: 13, stiffness: 280, mass: 0.55 } as const;

/**
 * One-shot boot handoff: as the splash overlay fades, the shell scales and snaps forward
 * (dolly-in + micro rotation) — not a lateral slide.
 */
export function AppBootEntrance({ children, entrance }: Props) {
  const style = useAnimatedStyle(() => {
    const t = entrance.value;
    return {
      flex: 1,
      opacity: interpolate(t, [0, 1], [0.82, 1]),
      transform: [
        { rotateZ: `${interpolate(t, [0, 1], [1.1, 0])}deg` },
        { translateY: interpolate(t, [0, 1], [36, 0]) },
        { scale: interpolate(t, [0, 1], [0.86, 1]) },
      ],
    };
  });

  return <Animated.View style={style}>{children}</Animated.View>;
}
