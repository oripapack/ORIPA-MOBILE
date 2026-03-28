'use client';

import { animate, useMotionValue } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateReelStrip } from './mockCards';
import { RARITY_PROFILE } from './rarityConfig';
import type { PackOpeningPhase, PackOpeningSpeed, RevealCard } from './types';

const BASE_MS = {
  intro: 780,
  spin: 1250,
  slow: 620,
  suspenseBase: 140,
  flash: 130,
  flip: 520,
  valueIn: 420,
};

function speedFactor(s: PackOpeningSpeed): number {
  switch (s) {
    case 'slow':
      return 1.18;
    case 'fast':
      return 0.78;
    default:
      return 1;
  }
}

function emitSound(key: string | undefined, onSound?: (k: string) => void) {
  if (key && onSound) onSound(key);
}

export interface UsePackOpeningArgs {
  winningCard: RevealCard;
  sessionSalt: number;
  containerWidth: number;
  slotWidth: number;
  cardWidth: number;
  speed: PackOpeningSpeed;
  replayKey: number;
  onSound?: (k: string) => void;
}

export function usePackOpening({
  winningCard,
  sessionSalt,
  containerWidth,
  slotWidth,
  cardWidth,
  speed,
  replayKey,
  onSound,
}: UsePackOpeningArgs) {
  const [phase, setPhase] = useState<PackOpeningPhase>('idle');

  const translateX = useMotionValue(0);
  const introPackScale = useMotionValue(0.86);
  const introGlow = useMotionValue(0);
  const introFlash = useMotionValue(0);
  const introOpacity = useMotionValue(1);
  const reelOpacity = useMotionValue(0);
  const dimOpacity = useMotionValue(0);
  const revealFlash = useMotionValue(0);
  const flipRotateX = useMotionValue(75);
  const cardFloatY = useMotionValue(10);
  const valueOpacity = useMotionValue(0);
  const badgeScale = useMotionValue(0.5);

  const profile = RARITY_PROFILE[winningCard.rarity];
  const durMul = profile.durationMultiplier * speedFactor(speed);

  const { cards, winningIndex } = useMemo(
    () => generateReelStrip(winningCard, sessionSalt),
    [winningCard, sessionSalt],
  );

  const endX = useMemo(() => {
    if (containerWidth <= 0) return 0;
    const center = containerWidth / 2;
    return center - cardWidth / 2 - winningIndex * slotWidth;
  }, [containerWidth, cardWidth, winningIndex, slotWidth]);

  const startX = useMemo(() => endX + 1550, [endX]);

  const cancelledRef = useRef(false);
  const skipRef = useRef(false);

  const resetValues = useCallback(() => {
    translateX.set(startX);
    introPackScale.set(0.86);
    introGlow.set(0);
    introFlash.set(0);
    introOpacity.set(1);
    reelOpacity.set(0);
    dimOpacity.set(0);
    revealFlash.set(0);
    flipRotateX.set(75);
    cardFloatY.set(10);
    valueOpacity.set(0);
    badgeScale.set(0.5);
    skipRef.current = false;
  }, [
    translateX,
    introPackScale,
    introGlow,
    introFlash,
    introOpacity,
    reelOpacity,
    dimOpacity,
    revealFlash,
    flipRotateX,
    cardFloatY,
    valueOpacity,
    badgeScale,
    startX,
  ]);

  const skip = useCallback(() => {
    skipRef.current = true;
    translateX.set(endX);
    reelOpacity.set(1);
    introOpacity.set(0);
    introFlash.set(0);
    introPackScale.set(1);
    introGlow.set(1);
    dimOpacity.set(0.45);
    revealFlash.set(profile.flashBrightness * 0.85);
    flipRotateX.set(0);
    cardFloatY.set(0);
    badgeScale.set(1);
    valueOpacity.set(1);
    setPhase('result');
    emitSound(profile.sound.onResult, onSound);
  }, [
    translateX,
    endX,
    reelOpacity,
    introFlash,
    introOpacity,
    introPackScale,
    introGlow,
    dimOpacity,
    revealFlash,
    flipRotateX,
    cardFloatY,
    badgeScale,
    valueOpacity,
    profile.flashBrightness,
    profile.sound.onResult,
    onSound,
  ]);

  useEffect(() => {
    cancelledRef.current = false;
    if (containerWidth <= 0) return;

    resetValues();
    setPhase('intro');

    const introMs = BASE_MS.intro * durMul;
    const spinMs = BASE_MS.spin * durMul;
    const slowMs = BASE_MS.slow * durMul;
    const suspenseMs = profile.suspenseMs + BASE_MS.suspenseBase * durMul;
    const midX = endX + 420;

    const run = async () => {
      try {
        await Promise.all([
          animate(introPackScale, [0.86, 1.04, 1], {
            duration: introMs / 1000,
            times: [0, 0.65, 1],
            ease: ['easeOut', 'easeInOut'],
          }),
          animate(introGlow, [0, 1], { duration: introMs / 1000, ease: 'easeOut' }),
        ]);
        if (cancelledRef.current || skipRef.current) return;

        await animate(introFlash, [0, 1, 0], {
          duration: 0.32,
          times: [0, 0.45, 1],
          ease: 'easeInOut',
        });
        if (cancelledRef.current || skipRef.current) return;

        await Promise.all([
          animate(reelOpacity, 1, { duration: 0.2 }),
          animate(introOpacity, 0, { duration: 0.22 }),
          animate(introPackScale, 1.02, { duration: 0.15 }),
        ]);
        if (cancelledRef.current || skipRef.current) return;

        setPhase('spinning');
        await animate(translateX, midX, {
          duration: spinMs / 1000,
          ease: 'linear',
        });
        if (cancelledRef.current || skipRef.current) return;

        setPhase('slowing');
        await animate(translateX, endX + 14, {
          duration: slowMs / 1000,
          ease: [0.22, 1, 0.36, 1],
        });
        if (cancelledRef.current || skipRef.current) return;

        setPhase('landing');
        await animate(translateX, endX, {
          type: 'spring',
          stiffness: 320,
          damping: 24,
          mass: 0.85,
        });
        if (cancelledRef.current || skipRef.current) return;

        await new Promise((r) => setTimeout(r, suspenseMs));
        if (cancelledRef.current || skipRef.current) return;

        setPhase('reveal');
        await Promise.all([
          animate(dimOpacity, 0.45, { duration: 0.2 }),
          animate(revealFlash, [0, profile.flashBrightness, 0], {
            duration: (BASE_MS.flash * 2.2) / 1000,
            times: [0, 0.35, 1],
            ease: 'easeOut',
          }),
        ]);
        if (cancelledRef.current || skipRef.current) return;

        await Promise.all([
          animate(flipRotateX, 0, {
            duration: BASE_MS.flip / 1000,
            ease: [0.16, 1, 0.3, 1],
          }),
          animate(cardFloatY, [10, 0, -4, 0], {
            duration: BASE_MS.flip / 1000,
            times: [0, 0.45, 0.78, 1],
            ease: 'easeOut',
          }),
          animate(badgeScale, 1, { duration: 0.38, delay: 0.25, ease: [0.34, 1.56, 0.64, 1] }),
        ]);
        if (cancelledRef.current || skipRef.current) return;

        await animate(valueOpacity, 1, { duration: BASE_MS.valueIn / 1000, ease: 'easeOut' });
        if (cancelledRef.current || skipRef.current) return;

        emitSound(profile.sound.onResult, onSound);
        setPhase('result');
      } catch {
        /* animation stopped */
      }
    };

    void run();

    return () => {
      cancelledRef.current = true;
    };
  }, [
    replayKey,
    containerWidth,
    resetValues,
    introPackScale,
    introGlow,
    introFlash,
    introOpacity,
    reelOpacity,
    translateX,
    dimOpacity,
    revealFlash,
    flipRotateX,
    cardFloatY,
    valueOpacity,
    badgeScale,
    endX,
    durMul,
    profile.flashBrightness,
    profile.suspenseMs,
    profile.sound.onResult,
    onSound,
  ]);

  return {
    phase,
    cards,
    winningIndex,
    translateX,
    introPackScale,
    introGlow,
    introFlash,
    introOpacity,
    reelOpacity,
    dimOpacity,
    revealFlash,
    flipRotateX,
    cardFloatY,
    valueOpacity,
    badgeScale,
    skip,
    profile,
  };
}
