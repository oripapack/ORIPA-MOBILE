import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import type { PrototypePackFlowPhase, PrototypePackOpenFlowProps } from './flowTypes';
import { PackSelectionCarousel, lineupPackTintAt } from './PackSelectionCarousel';
import { SelectedPackStage } from './SelectedPackStage';
import { RipOpenInteraction } from './RipOpenInteraction';
import { RevealTransition } from './RevealTransition';

/**
 * Lineup → focus → manual rip → reveal placeholder.
 * Toggle via `USE_PROTOTYPE_LINEUP_PACK_OPEN` in `config/packOpeningAnimation.ts`.
 */
export function PrototypePackOpenFlow({
  roll,
  revealCard,
  revealRarity,
  packTint,
  sessionSalt,
  skipNonce,
  onRevealDone,
  onStoreInVault,
  onSharePull,
}: PrototypePackOpenFlowProps) {
  const [phase, setPhase] = useState<PrototypePackFlowPhase>('carousel');
  const [skipped, setSkipped] = useState(false);
  const [selectedLineupIndex, setSelectedLineupIndex] = useState<number | null>(null);
  const prevSkipRef = useRef(0);
  const selectingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const carouselDim = useRef(new Animated.Value(1)).current;

  const goCentered = useCallback(() => {
    selectingTimer.current = null;
    setPhase('centered');
  }, []);

  const onSelectIndex = useCallback(
    (index: number) => {
      if (phase !== 'carousel') return;
      setSelectedLineupIndex(index);
      setPhase('selecting');
      /**
       * Short “commit” beat: long waits read as gating/latency.
       * The carousel itself auto-centers the chosen pack during this step.
       */
      selectingTimer.current = setTimeout(goCentered, 80);
    },
    [phase, goCentered],
  );

  const onCenterSettled = useCallback(() => {
    setPhase('ripping');
  }, []);

  const onRipComplete = useCallback(() => {
    setPhase('reveal');
  }, []);

  const revealCommittedRef = useRef(false);
  const onRevealDoneRef = useRef(onRevealDone);
  onRevealDoneRef.current = onRevealDone;
  useEffect(() => {
    if (phase !== 'reveal' || revealCommittedRef.current) return;
    revealCommittedRef.current = true;
    /** Lets `PackOpeningModal` show Open another / Manage winnings (same as hero flow finishing). */
    onRevealDoneRef.current();
  }, [phase]);

  useEffect(() => {
    return () => {
      if (selectingTimer.current) clearTimeout(selectingTimer.current);
    };
  }, []);

  useEffect(() => {
    if (skipNonce === 0) {
      prevSkipRef.current = 0;
      return;
    }
    if (prevSkipRef.current === skipNonce) return;
    prevSkipRef.current = skipNonce;
    if (selectingTimer.current) {
      clearTimeout(selectingTimer.current);
      selectingTimer.current = null;
    }
    setSkipped(true);
    setPhase('reveal');
  }, [skipNonce]);

  /** Hide lineup once user commits (or skips) — leftover opacity caused “ghost” packs under the header / reveal. */
  useEffect(() => {
    if (phase === 'carousel' || phase === 'selecting') return;
    const ease = Easing.bezier(0.33, 0.86, 0.2, 1);
    Animated.timing(carouselDim, {
      toValue: 0,
      duration: phase === 'centered' ? 520 : 320,
      easing: ease,
      useNativeDriver: true,
    }).start();
  }, [phase, carouselDim]);

  const carouselInteractive = phase === 'carousel';
  /** Lineup only mounts for these phases so it never steals flex height from reveal / rip (was causing the huge black gap). */
  const showCarouselLayer = phase === 'carousel' || phase === 'selecting' || phase === 'centered';

  const shellTint = useMemo(
    () =>
      selectedLineupIndex != null ? lineupPackTintAt(selectedLineupIndex, packTint, sessionSalt) : packTint,
    [selectedLineupIndex, packTint, sessionSalt],
  );

  return (
    <View style={[styles.wrap, styles.wrapStage]}>
      <View style={styles.stage}>
        {showCarouselLayer ? (
          <Animated.View
            style={[styles.carouselOverlay, { opacity: carouselDim }]}
            pointerEvents={carouselInteractive ? 'auto' : 'none'}
          >
            <PackSelectionCarousel
              packTint={packTint}
              sessionSalt={sessionSalt}
              onSelectIndex={onSelectIndex}
              interactionEnabled={carouselInteractive}
              selectedIndex={selectedLineupIndex}
              selectionLocked={phase === 'selecting'}
            />
          </Animated.View>
        ) : null}

        {phase === 'centered' ? (
          <View style={styles.layerAbs} pointerEvents="none">
            <SelectedPackStage packTint={shellTint} visible onSettled={onCenterSettled} />
          </View>
        ) : null}

        {phase === 'ripping' ? (
          <View style={styles.ripLayer}>
            {/* Lighter than the old 0.72 layer — matches the settled focus step so it does not
                read like a cut to a different “mode” when the centered stage unmounts. */}
            <View style={styles.ripDim} pointerEvents="none" />
            <RipOpenInteraction packTint={shellTint} onRipComplete={onRipComplete} />
          </View>
        ) : null}

        {phase === 'reveal' ? (
          <View style={styles.phaseFill}>
            <RevealTransition
              roll={roll}
              revealCard={revealCard}
              revealRarity={revealRarity}
              skipped={skipped}
              onStoreInVault={onStoreInVault}
              onSharePull={onSharePull}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    minHeight: 0,
  },
  /** Default + lineup + rip + reveal: fill all vertical space handed down from the modal `body`. */
  wrapStage: {
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  stage: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    position: 'relative',
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 1,
  },
  phaseFill: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
  },
  layerAbs: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    zIndex: 2,
  },
  ripLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingTop: 40,
    zIndex: 3,
  },
  ripDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.44)',
  },
});
