import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RareConfetti } from './RarityEffects';
import type { RarityTier } from '../../../audio/packOpeningFeedback';
import type { PackOpeningPhase, RevealRarity } from './types';

export function RarityEffectsLayer({
  phase,
  tier,
  revealRarity,
}: {
  phase: PackOpeningPhase;
  tier: RarityTier;
  revealRarity: RevealRarity;
}) {
  const active = phase === 'reveal' || phase === 'result';
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <RareConfetti active={active && revealRarity === 'chase'} tier={tier} revealRarity={revealRarity} />
    </View>
  );
}
