'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ControlsLayer } from './ControlsLayer';
import { IntroLayer } from './IntroLayer';
import { REEL_DEFAULT_LAYOUT, ReelLayer } from './ReelLayer';
import { ResultLayer } from './ResultLayer';
import { RevealLayer } from './RevealLayer';
import { RarityEffects } from './RarityEffects';
import { StopLayer } from './StopLayer';
import { usePackOpening } from './usePackOpening';
import type { PackOpeningEngineProps, PackOpeningSpeed } from './types';

export function PackOpeningEngine({
  winningCard,
  sessionSalt = 1,
  showDevControls = true,
  onComplete,
}: PackOpeningEngineProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [speed, setSpeed] = useState<PackOpeningSpeed>('normal');
  const [replayKey, setReplayKey] = useState(0);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setW(el.clientWidth);
    });
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const slotWidth = REEL_DEFAULT_LAYOUT.slotWidth;
  const cardWidth = REEL_DEFAULT_LAYOUT.cardWidth;

  const onSound = useCallback(
    (key: string) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pack-opening:sfx', { detail: { key } }));
      }
    },
    [],
  );

  const packTint = useMemo(() => winningCard.color, [winningCard.color]);

  const engine = usePackOpening({
    winningCard,
    sessionSalt,
    containerWidth: w,
    slotWidth,
    cardWidth,
    speed,
    replayKey,
    onSound,
  });

  const { phase } = engine;

  const onReplay = useCallback(() => {
    setReplayKey((k) => k + 1);
  }, []);

  const showReveal = phase === 'reveal' || phase === 'result';
  const showResultFooter = phase === 'reveal' || phase === 'result';

  const lastPhase = useRef(phase);
  useEffect(() => {
    if (phase === 'result' && lastPhase.current !== 'result') {
      onComplete?.();
    }
    lastPhase.current = phase;
  }, [phase, onComplete]);

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto aspect-[9/16] w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f14] shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-[#0b0f14]" />

      <RarityEffects rarity={winningCard.rarity} phase={phase} />

      <ReelLayer
        cards={engine.cards}
        translateX={engine.translateX}
        opacity={engine.reelOpacity}
        slotWidth={slotWidth}
        cardWidth={cardWidth}
      />

      <StopLayer
        active={phase === 'spinning' || phase === 'slowing' || phase === 'landing'}
        phase={phase}
      />

      <IntroLayer
        packTint={packTint}
        scale={engine.introPackScale}
        glow={engine.introGlow}
        flash={engine.introFlash}
        opacity={engine.introOpacity}
      />

      {showReveal ? (
        <RevealLayer
          card={winningCard}
          dim={engine.dimOpacity}
          flash={engine.revealFlash}
          flipRotateX={engine.flipRotateX}
          floatY={engine.cardFloatY}
          badgeScale={engine.badgeScale}
        />
      ) : null}

      {showResultFooter ? (
        <ResultLayer card={winningCard} valueOpacity={engine.valueOpacity} visible />
      ) : null}

      <ControlsLayer
        onSkip={engine.skip}
        onReplay={onReplay}
        speed={speed}
        onSpeedChange={setSpeed}
        showDevControls={showDevControls}
        canSkip={w > 0 && phase !== 'idle' && phase !== 'result'}
      />
    </div>
  );
}
