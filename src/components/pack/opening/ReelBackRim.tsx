import React from 'react';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { ReelPackShell } from './ReelPackShell';

/** Fewer, evenly spaced along one back arc — reads as one continuous rim, not scattered. */
const BACK_SEG = 8;
const PACK_W = 52;
const PACK_H = Math.round(PACK_W * 1.38);

const TINTS = [
  '#1e3a5f',
  '#2d1f3d',
  '#0f2f32',
  '#3d2a1f',
  '#1a2840',
  '#252045',
  '#0d2d28',
] as const;

type SlotProps = {
  reelX: SharedValue<number>;
  k: number;
  screenCx: number;
  ringRadius: number;
  sessionSalt: number;
};

function ReelBackRimSlot({ reelX, k, screenCx, ringRadius, sessionSalt }: SlotProps) {
  const tint = TINTS[(sessionSalt + k * 7) % TINTS.length];

  const style = useAnimatedStyle(() => {
    const scrollPhase = reelX.value / ringRadius;
    /** Center of the far arc (opposite the viewer); drifts with the main strip. */
    const arcCenter = Math.PI + scrollPhase * 0.4;
    /** ~100° of arc — one clean “back of the ring”. */
    const half = 0.55 * Math.PI;
    const u = BACK_SEG <= 1 ? 0.5 : k / (BACK_SEG - 1);
    const phi = arcCenter - half + u * (2 * half);

    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);
    const rx = ringRadius * 0.66;
    const left = screenCx + rx * sinP - PACK_W / 2;
    /** cosP = -1 at the back → smaller `top` → higher on screen (far rim). */
    const top = 12 + 44 * (0.5 + 0.5 * cosP);
    const radial = Math.max(0.14, 0.5 * (1 + cosP));
    const phiW = Math.atan2(Math.sin(phi), Math.cos(phi));
    const rot = ((-phiW * 180) / Math.PI) * 0.5;
    const sc = 0.36 + 0.22 * radial;
    const op = 0.2 + 0.3 * radial;

    return {
      position: 'absolute' as const,
      left,
      top,
      width: PACK_W,
      height: PACK_H,
      zIndex: 12,
      opacity: op,
      transform: [{ perspective: 1200 }, { rotateY: `${rot}deg` }, { scale: sc }],
    };
  });

  return (
    <Animated.View style={style} pointerEvents="none">
      <ReelPackShell width={PACK_W} height={PACK_H} tint={tint} />
    </Animated.View>
  );
}

type Props = {
  reelX: SharedValue<number>;
  screenCx: number;
  ringRadius: number;
  sessionSalt: number;
};

/**
 * Far-side arc only: even angular spacing on one contiguous segment of the ellipse.
 */
export function ReelBackRim({ reelX, screenCx, ringRadius, sessionSalt }: Props) {
  return (
    <>
      {Array.from({ length: BACK_SEG }, (_, k) => (
        <ReelBackRimSlot
          key={`reel-back-${k}`}
          k={k}
          reelX={reelX}
          screenCx={screenCx}
          ringRadius={ringRadius}
          sessionSalt={sessionSalt}
        />
      ))}
    </>
  );
}
