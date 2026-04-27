import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { PackRollResult, RevealCard, RevealRarity } from './types';
import { tierCelebrationFor } from './tierCelebration';
import { SlabRevealHero } from '../openingPrototype/SlabRevealHero';
import { RipOpenInteraction } from '../openingPrototype/RipOpenInteraction';

const SLAB_SPRING = { mass: 1, damping: 20, stiffness: 140 } as const;

export function HeroRevealEngine({
  roll,
  revealCard,
  revealRarity,
  packTint,
  packFaceTitle,
  replayKey,
  skipNonce,
  suppressInitialEnterHaptic,
  introDelayMs,
  onRevealDone,
}: {
  roll: PackRollResult;
  revealCard: RevealCard;
  revealRarity: RevealRarity;
  packTint: string;
  packFaceTitle?: string;
  replayKey: number;
  skipNonce: number;
  /** When true, skip the opening haptic (e.g. reel phase already primed the moment). */
  suppressInitialEnterHaptic?: boolean;
  /** ms before rip intro begins (reel handoff). */
  introDelayMs?: number;
  onRevealDone: () => void;
}) {
  void revealRarity;
  void packFaceTitle;
  void replayKey;
  void skipNonce;
  void suppressInitialEnterHaptic;
  void introDelayMs;

  const slabOpacity = useSharedValue(0);
  const slabScale = useSharedValue(0.94);
  const didCompleteRef = useRef(false);
  const [packPassThrough, setPackPassThrough] = useState(false);

  const fireRevealDone = useCallback(() => {
    if (didCompleteRef.current) return;
    didCompleteRef.current = true;
    onRevealDone();
  }, [onRevealDone]);

  const onRipComplete = useCallback(() => {
    setPackPassThrough(true);
    slabOpacity.value = withSpring(1, SLAB_SPRING);
    slabScale.value = withSpring(1, SLAB_SPRING, (finished) => {
      if (finished) {
        runOnJS(fireRevealDone)();
      }
    });
  }, [fireRevealDone, slabOpacity, slabScale]);

  const slabStyle = useAnimatedStyle(() => ({
    opacity: slabOpacity.value,
    transform: [{ scale: slabScale.value }],
  }));

  const tv = tierCelebrationFor(roll.tier);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.slabLayer, slabStyle]} pointerEvents="box-none">
        <View style={[styles.slabWrap, { borderColor: tv.border }]}>
          <SlabRevealHero
            revealCard={revealCard}
            slabW={276}
            slabH={392}
            borderColor={tv.border}
            accentColor={tv.accent}
          />
        </View>
      </Animated.View>

      <View style={styles.packLayer} pointerEvents={packPassThrough ? 'none' : 'box-none'}>
        <RipOpenInteraction packTint={packTint} onRipComplete={onRipComplete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 420,
    justifyContent: 'center',
  },
  packLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  slabLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  slabWrap: {
    width: 276,
    height: 392,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    backgroundColor: 'rgba(2,6,23,0.55)',
  },
});
