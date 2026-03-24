import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { CsgoReveal } from './CsgoReveal';
import { FifaReveal } from './FifaReveal';
import { HybridReveal } from './HybridReveal';
import { RevealResultCard } from './RevealResultCard';
import { REVEAL_RARITY_VISUAL } from './rarityTokens';
import type { PackOpeningStyle, PackRollResult, RevealCard, RevealRarity } from './types';

type Props = {
  style: PackOpeningStyle;
  roll: PackRollResult;
  revealCard: RevealCard;
  revealRarity: RevealRarity;
  packTint: string;
  sessionSalt: number;
  replayKey: number;
  skipNonce: number;
  onRevealDone: () => void;
};

/**
 * Orchestrates demo pack opening: CSGO strip, FIFA cinematic, or hybrid (intro + strip + finale).
 */
export function PackOpeningEngine({
  style,
  roll,
  revealCard,
  revealRarity,
  packTint,
  sessionSalt,
  replayKey,
  skipNonce,
  onRevealDone,
}: Props) {
  const [csgoShowResult, setCsgoShowResult] = useState(false);
  const didFireDone = useRef(false);
  const fadeCard = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    didFireDone.current = false;
    setCsgoShowResult(false);
    fadeCard.setValue(0);
  }, [replayKey, fadeCard, style]);

  const fireDone = useCallback(() => {
    if (didFireDone.current) return;
    didFireDone.current = true;
    onRevealDone();
  }, [onRevealDone]);

  const onCsgoStripDone = useCallback(() => {
    setCsgoShowResult(true);
    Animated.timing(fadeCard, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      fireDone();
    });
  }, [fadeCard, fireDone]);

  const tv = REVEAL_RARITY_VISUAL[revealRarity];

  return (
    <View style={styles.wrap}>
      {style === 'csgo' ? (
        <View style={[styles.csgoAccent, { shadowColor: tv.glow }]} />
      ) : null}

      {style === 'fifa' ? (
        <FifaReveal
          roll={roll}
          revealRarity={revealRarity}
          packTint={packTint}
          replayKey={replayKey}
          skipNonce={skipNonce}
          onComplete={fireDone}
        />
      ) : null}

      {style === 'hybrid' ? (
        <HybridReveal
          roll={roll}
          revealCard={revealCard}
          revealRarity={revealRarity}
          packTint={packTint}
          sessionSalt={sessionSalt}
          replayKey={replayKey}
          skipNonce={skipNonce}
          onComplete={fireDone}
        />
      ) : null}

      {style === 'csgo' ? (
        <View style={styles.csgoColumn}>
          <CsgoReveal
            winningCard={revealCard}
            sessionSalt={sessionSalt}
            replayKey={replayKey}
            skipNonce={skipNonce}
            audioTier={roll.tier}
            onComplete={onCsgoStripDone}
          />
          {csgoShowResult ? (
            <Animated.View style={[styles.resultSlot, { opacity: fadeCard }]}>
              <RevealResultCard creditsWon={roll.creditsWon} resultText={roll.result} revealRarity={revealRarity} />
            </Animated.View>
          ) : null}
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
  csgoColumn: {
    flex: 1,
    width: '100%',
    gap: 16,
  },
  csgoAccent: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: '24%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    opacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
  },
  resultSlot: {
    alignItems: 'center',
    paddingBottom: 8,
  },
});
