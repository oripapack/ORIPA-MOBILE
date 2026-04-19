import React from 'react';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { ReelPackShell } from './ReelPackShell';
import type { ReelShell } from './reelStrip';

type Props = {
  reelX: SharedValue<number>;
  index: number;
  shell: ReelShell;
  slotW: number;
  packW: number;
  packH: number;
  screenCx: number;
  /** Large radius = gentler arc, more of the ring visible (zoomed-out feel). */
  ringRadius: number;
  lockEmphasis: boolean;
};

/** Vertical spread — keep moderate so scale/Y don’t exaggerate uneven gaps. */
const ELLIPSE_SAG = 36;

/**
 * One pack on the 3D cylinder: position + rotateY + scale from scroll (`reelX`).
 */
export function ReelRingSlot({
  reelX,
  index,
  shell,
  slotW,
  packW,
  packH,
  screenCx,
  ringRadius,
  lockEmphasis,
}: Props) {
  const style = useAnimatedStyle(() => {
    const lx = reelX.value + index * slotW + packW / 2;
    const d = lx - screenCx;
    const theta = d / ringRadius;
    /** Wrap θ to (-π, π] so rotateY never hits thousands of degrees (that collapses cards to “invisible”). */
    const thetaW = Math.atan2(Math.sin(theta), Math.cos(theta));
    const cosT = Math.cos(thetaW);
    /** Cap turn used for Y-rotation so edges never go paper-thin. */
    const thRot = Math.max(-1.12, Math.min(1.12, thetaW));
    const rot = (-thRot * 0.48 * 180) / Math.PI;
    const radial = Math.max(0.14, 0.5 * (1 + cosT));
    /** Tight scale band so side packs aren’t much narrower (main cause of “random” gaps). */
    const sc = 0.86 + 0.14 * radial;
    const op = 0.56 + 0.44 * radial;
    const z = Math.round(24 + 210 * radial);
    const arcTop = 4 + ELLIPSE_SAG * radial;

    return {
      position: 'absolute' as const,
      /** Linear d ⇒ even pixel gaps; ring depth comes from `ReelBackRim` + rotateY / arc. */
      left: screenCx + d - packW / 2,
      top: arcTop,
      width: packW,
      height: packH,
      zIndex: z,
      opacity: op,
      transform: [{ perspective: 1400 }, { rotateY: `${rot}deg` }, { scale: sc }],
    };
  });

  return (
    <Animated.View style={style} pointerEvents="none">
      <ReelPackShell
        width={packW}
        height={packH}
        tint={shell.tint}
        lockEmphasis={lockEmphasis ? 1 : 0}
      />
    </Animated.View>
  );
}
