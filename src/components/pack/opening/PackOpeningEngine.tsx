import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HeroRevealEngine } from './HeroRevealEngine';
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
  style: _style,
  roll,
  revealCard,
  revealRarity,
  packTint,
  replayKey,
  skipNonce,
  onRevealDone,
}: Props) {
  return (
    <View style={styles.wrap}>
      <HeroRevealEngine
        roll={roll}
        revealCard={revealCard}
        revealRarity={revealRarity}
        packTint={packTint}
        replayKey={replayKey}
        skipNonce={skipNonce}
        onRevealDone={onRevealDone}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
  },
});
