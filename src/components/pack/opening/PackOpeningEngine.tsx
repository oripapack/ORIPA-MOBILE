import React, { useCallback, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { HeroRevealEngine } from './HeroRevealEngine';
import { PackReelPhase } from './PackReelPhase';
import type { PackOpeningStyle, PackRollResult, RevealCard, RevealRarity } from './types';

const HERO_INTRO_AFTER_HANDOFF_MS = 560;
const HERO_FADE_MS = 820;

type Props = {
  style: PackOpeningStyle;
  roll: PackRollResult;
  revealCard: RevealCard;
  revealRarity: RevealRarity;
  packTint: string;
  /** Short line on the sealed pack face (localized pack title). */
  packFaceTitle?: string;
  sessionSalt: number;
  replayKey: number;
  skipNonce: number;
  onRevealDone: () => void;
};

/**
 * Pack open flow: suspense reel → gallery handoff animation → rip / reveal hero.
 */
export function PackOpeningEngine({
  style: _style,
  roll,
  revealCard,
  revealRarity,
  packTint,
  packFaceTitle,
  sessionSalt,
  replayKey,
  skipNonce,
  onRevealDone,
}: Props) {
  const [reelVisible, setReelVisible] = useState(true);
  const [heroMounted, setHeroMounted] = useState(false);
  const [heroIntroDelayMs, setHeroIntroDelayMs] = useState(HERO_INTRO_AFTER_HANDOFF_MS);
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const handoffStartedRef = useRef(false);

  const onHandoffStart = useCallback(() => {
    if (handoffStartedRef.current) return;
    handoffStartedRef.current = true;
    setHeroIntroDelayMs(HERO_INTRO_AFTER_HANDOFF_MS);
    setHeroMounted(true);
    heroOpacity.setValue(0);
    Animated.timing(heroOpacity, {
      toValue: 1,
      duration: HERO_FADE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [heroOpacity]);

  const onReelFinished = useCallback(
    (detail?: { skipped?: boolean }) => {
      if (detail?.skipped) {
        setHeroIntroDelayMs(0);
        setHeroMounted(true);
        heroOpacity.setValue(1);
        handoffStartedRef.current = true;
      }
      setReelVisible(false);
    },
    [heroOpacity],
  );

  return (
    <View style={styles.wrap}>
      {heroMounted ? (
        <Animated.View
          pointerEvents={reelVisible ? 'none' : 'auto'}
          style={[StyleSheet.absoluteFillObject, styles.heroLayer, { opacity: heroOpacity }]}
        >
          <HeroRevealEngine
            roll={roll}
            revealCard={revealCard}
            revealRarity={revealRarity}
            packTint={packTint}
            packFaceTitle={packFaceTitle}
            replayKey={replayKey}
            skipNonce={skipNonce}
            suppressInitialEnterHaptic
            introDelayMs={heroIntroDelayMs}
            onRevealDone={onRevealDone}
          />
        </Animated.View>
      ) : null}
      {reelVisible ? (
        <View style={styles.reelLayer} pointerEvents="box-none">
          <PackReelPhase
            sessionSalt={sessionSalt}
            winTint={packTint}
            skipNonce={skipNonce}
            onHandoffStart={onHandoffStart}
            onFinished={onReelFinished}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
  },
  heroLayer: {
    zIndex: 40,
  },
  reelLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
});
