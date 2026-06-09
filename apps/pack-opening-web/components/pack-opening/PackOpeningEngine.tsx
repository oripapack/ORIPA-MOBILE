'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ControlsLayer } from './ControlsLayer';
import { IntroLayer } from './IntroLayer';
import { REEL_DEFAULT_LAYOUT, ReelLayer } from './ReelLayer';
import { ResultLayer } from './ResultLayer';
import { RevealLayer } from './RevealLayer';
import { CardBackLayer } from './CardBackLayer';
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
  const [w, setW]           = useState(0);
  const [speed, setSpeed]   = useState<PackOpeningSpeed>('normal');
  const [replayKey, setReplayKey] = useState(0);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const slotWidth = REEL_DEFAULT_LAYOUT.slotWidth;
  const cardWidth = REEL_DEFAULT_LAYOUT.cardWidth;

  const onSound = useCallback((key: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pack-opening:sfx', { detail: { key } }));
    }
  }, []);

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

  const onReplay = useCallback(() => setReplayKey((k) => k + 1), []);

  const showReveal = phase === 'metadata' || phase === 'reveal' || phase === 'result';
  const showResult = phase === 'result';

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
      className="relative mx-auto aspect-[9/16] w-full max-w-md overflow-hidden rounded-3xl border border-ph-border bg-ph-bg shadow-ph-sheet"
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-ph-surface-high/40 to-ph-bg" />

      {/* Rarity ambient effects (reveal + result phases) */}
      <RarityEffects rarity={winningCard.rarity} phase={phase} />

      {/* Reel strip */}
      <ReelLayer
        cards={engine.cards}
        translateX={engine.translateX}
        opacity={engine.reelOpacity}
        slotWidth={slotWidth}
        cardWidth={cardWidth}
      />

      {/* Stop marker overlay */}
      <StopLayer
        active={phase === 'spinning' || phase === 'slowing' || phase === 'landing'}
        phase={phase}
      />

      {/* Intro pack scale-in */}
      <IntroLayer
        packTint={packTint}
        scale={engine.introPackScale}
        glow={engine.introGlow}
        flash={engine.introFlash}
        opacity={engine.introOpacity}
      />

      {/* Stage 3: card back (hidden) + stage 4: metadata */}
      <CardBackLayer
        rarity={winningCard.rarity}
        phase={phase}
        onTap={engine.triggerReveal}
      />

      {/* Stage 4: metadata → stage 4: 3D flip reveal */}
      {showReveal ? (
        <RevealLayer
          card={winningCard}
          phase={phase}
          dim={engine.dimOpacity}
          flash={engine.revealFlash}
          flipRotateX={engine.flipRotateX}
          floatY={engine.cardFloatY}
          badgeScale={engine.badgeScale}
        />
      ) : null}

      {/* Stage 5: result + CTAs */}
      {showResult ? (
        <ResultLayer
          card={winningCard}
          valueOpacity={engine.valueOpacity}
          visible
          onVault={() => {
            /* In production: vault the card via store action */
          }}
          onConvert={() => {
            /* In production: convert to credits via store action */
          }}
        />
      ) : null}

      {/* Controls (skip / replay / dev speed) */}
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
