import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, PanResponder } from 'react-native';
import type { GestureResponderHandlers } from 'react-native';
import { hapticPackReveal, hapticPackResult } from '../../../../audio/packOpeningFeedback';
import type { N2Tier } from '../../../../lib/n2Rarity';
import type { RevealRarity } from '../types';

export type PokePokePhase = 'float' | 'tearing' | 'burst' | 'reveal' | 'result';

/** px of upward drag needed to commit the tear */
const TEAR_COMMIT_PX = 80;

export interface PokePokeAnimValues {
  packScale: Animated.Value;
  floatY: Animated.Value;
  topHalfY: Animated.Value;
  bottomHalfY: Animated.Value;
  energyOpacity: Animated.Value;
  burstOpacity: Animated.Value;
  cardOpacity: Animated.Value;
  cardScale: Animated.Value;
  cardY: Animated.Value;
  shimmerX: Animated.Value;
  auraOpacity: Animated.Value;
  hintOpacity: Animated.Value;
  particleTrigger: Animated.Value;
}

interface Options {
  rarity: RevealRarity;
  skipNonce: number;
  onBurst: () => void;
  onRevealSettled: () => void;
}

export function usePokePokeGesture({ rarity, skipNonce, onBurst, onRevealSettled }: Options) {
  const [phase, setPhase] = useState<PokePokePhase>('float');
  const phaseRef = useRef<PokePokePhase>('float');

  // -- Animated values (stable refs) ------------------------------------
  const packScale    = useRef(new Animated.Value(0.82)).current;
  const floatY       = useRef(new Animated.Value(0)).current;
  const topHalfY     = useRef(new Animated.Value(0)).current;
  const bottomHalfY  = useRef(new Animated.Value(0)).current;
  const energyOpacity = useRef(new Animated.Value(0)).current;
  const burstOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity  = useRef(new Animated.Value(0)).current;
  const cardScale    = useRef(new Animated.Value(0.84)).current;
  const cardY        = useRef(new Animated.Value(60)).current;
  const shimmerX     = useRef(new Animated.Value(-220)).current;
  const auraOpacity  = useRef(new Animated.Value(0)).current;
  const hintOpacity  = useRef(new Animated.Value(0)).current;
  const particleTrigger = useRef(new Animated.Value(0)).current;

  // -- Mutable refs (safe inside PanResponder) --------------------------
  const floatLoopRef   = useRef<Animated.CompositeAnimation | null>(null);
  const shimmerLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const skippedRef     = useRef(false);
  const prevSkipRef    = useRef(skipNonce);
  const onBurstRef     = useRef(onBurst);
  const onRevealRef    = useRef(onRevealSettled);
  onBurstRef.current   = onBurst;
  onRevealRef.current  = onRevealSettled;

  // -- Helpers ----------------------------------------------------------
  const setPhaseR = (p: PokePokePhase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const startFloatLoop = useCallback(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -10, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatY, { toValue:  10, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    floatLoopRef.current = loop;
    loop.start();
  }, [floatY]);

  // ref so panResponder can call the latest version
  const startFloatLoopRef = useRef(startFloatLoop);
  startFloatLoopRef.current = startFloatLoop;

  // -- Reveal sequence --------------------------------------------------
  const doReveal = useCallback(() => {
    setPhaseR('reveal');
    const dur = rarity === 'chase' ? 650 : rarity === 'ultra_rare' ? 540 : rarity === 'rare' ? 430 : 360;

    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, friction: 6, tension: 72, useNativeDriver: true }),
      Animated.timing(cardY,     { toValue: 0, duration: dur, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: dur * 0.75, useNativeDriver: true }),
      Animated.timing(auraOpacity, { toValue: 1, duration: dur * 0.85, useNativeDriver: true }),
    ]).start(() => {
      // shimmer sweep
      if (rarity === 'chase') {
        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(shimmerX, { toValue: 360, duration: 800, easing: Easing.linear, useNativeDriver: true }),
            Animated.timing(shimmerX, { toValue: -220, duration: 0, useNativeDriver: true }),
            Animated.delay(350),
          ]),
        );
        shimmerLoopRef.current = loop;
        loop.start();
      } else if (rarity !== 'common') {
        const passes = rarity === 'ultra_rare' ? 2 : 1;
        const seq: Animated.CompositeAnimation[] = [];
        for (let i = 0; i < passes; i++) {
          seq.push(
            Animated.timing(shimmerX, { toValue: 360, duration: 640, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(shimmerX, { toValue: -220, duration: 0, useNativeDriver: true }),
            Animated.delay(120),
          );
        }
        Animated.sequence(seq).start();
      }

      const tier: N2Tier =
        rarity === 'chase' ? 'mythic' :
        rarity === 'ultra_rare' ? 'legendary' :
        rarity === 'rare' ? 'epic' :
        'base';
      hapticPackResult(tier);

      const settleDelay = rarity === 'chase' ? 1300 : rarity === 'ultra_rare' ? 1000 : 700;
      setTimeout(() => {
        setPhaseR('result');
        onRevealRef.current();
      }, settleDelay);
    });
  }, [rarity, cardScale, cardY, cardOpacity, auraOpacity, shimmerX]);

  const doRevealRef = useRef(doReveal);
  doRevealRef.current = doReveal;

  // -- Burst sequence ---------------------------------------------------
  const triggerBurst = useCallback(() => {
    if (phaseRef.current !== 'float' && phaseRef.current !== 'tearing') return;
    floatLoopRef.current?.stop();
    setPhaseR('burst');
    hapticPackReveal();

    // trigger particle burst
    particleTrigger.setValue(0);
    Animated.timing(particleTrigger, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

    Animated.parallel([
      Animated.timing(topHalfY,     { toValue: -340, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(bottomHalfY,  { toValue:  250, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(burstOpacity, { toValue: 1, duration: 65, useNativeDriver: true }),
        Animated.timing(burstOpacity, { toValue: 0, duration: 270, useNativeDriver: true }),
      ]),
      Animated.timing(energyOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      onBurstRef.current();
      doRevealRef.current();
    });
  }, [topHalfY, bottomHalfY, burstOpacity, energyOpacity, particleTrigger]);

  const triggerBurstRef = useRef(triggerBurst);
  triggerBurstRef.current = triggerBurst;

  // -- Skip -------------------------------------------------------------
  const skip = useCallback(() => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    floatLoopRef.current?.stop();
    shimmerLoopRef.current?.stop();
    topHalfY.setValue(-340);
    bottomHalfY.setValue(250);
    energyOpacity.setValue(0);
    burstOpacity.setValue(0);
    cardOpacity.setValue(1);
    cardScale.setValue(1);
    cardY.setValue(0);
    auraOpacity.setValue(1);
    hintOpacity.setValue(0);
    packScale.setValue(1);
    setPhaseR('result');
    onBurstRef.current();
    onRevealRef.current();
  }, [topHalfY, bottomHalfY, energyOpacity, burstOpacity, cardOpacity, cardScale, cardY, auraOpacity, hintOpacity, packScale]);

  // watch skipNonce
  useEffect(() => {
    if (skipNonce !== prevSkipRef.current) {
      prevSkipRef.current = skipNonce;
      skip();
    }
  }, [skipNonce, skip]);

  // -- Entrance ---------------------------------------------------------
  useEffect(() => {
    Animated.spring(packScale, { toValue: 1, friction: 5, tension: 65, useNativeDriver: true }).start(() => {
      startFloatLoopRef.current();
    });

    const hintTimer = setTimeout(() => {
      if (skippedRef.current) return;
      Animated.sequence([
        Animated.timing(hintOpacity, { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(hintOpacity, { toValue: 0, duration: 360, useNativeDriver: true }),
      ]).start();
    }, 900);

    return () => {
      clearTimeout(hintTimer);
      floatLoopRef.current?.stop();
      shimmerLoopRef.current?.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -- PanResponder (created once; uses stable refs internally) ----------
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => phaseRef.current === 'float' && gs.dy < -8,
      onPanResponderGrant: () => {
        floatLoopRef.current?.stop();
        floatY.stopAnimation();
        hintOpacity.setValue(0);
        phaseRef.current = 'tearing';
        setPhase('tearing');
      },
      onPanResponderMove: (_, gs) => {
        const p = Math.max(0, Math.min(1, -gs.dy / 140));
        topHalfY.setValue(p * -200);
        bottomHalfY.setValue(p * 150);
        energyOpacity.setValue(Math.min(1, p * 1.4));
      },
      onPanResponderRelease: (_, gs) => {
        if (-gs.dy >= TEAR_COMMIT_PX) {
          triggerBurstRef.current();
        } else {
          phaseRef.current = 'float';
          setPhase('float');
          Animated.parallel([
            Animated.spring(topHalfY,    { toValue: 0, friction: 5, tension: 120, useNativeDriver: true }),
            Animated.spring(bottomHalfY, { toValue: 0, friction: 5, tension: 120, useNativeDriver: true }),
            Animated.timing(energyOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
          ]).start(() => startFloatLoopRef.current());
        }
      },
      onPanResponderTerminate: () => {
        if (phaseRef.current === 'tearing') {
          phaseRef.current = 'float';
          setPhase('float');
          startFloatLoopRef.current();
        }
      },
    }),
  ).current;

  return {
    phase,
    panHandlers: panResponder.panHandlers as GestureResponderHandlers,
    animValues: {
      packScale, floatY, topHalfY, bottomHalfY, energyOpacity,
      burstOpacity, cardOpacity, cardScale, cardY, shimmerX,
      auraOpacity, hintOpacity, particleTrigger,
    } satisfies PokePokeAnimValues,
    skip,
    triggerBurst,
  };
}
