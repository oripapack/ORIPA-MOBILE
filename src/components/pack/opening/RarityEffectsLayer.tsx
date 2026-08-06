import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RareConfetti } from './RarityEffects';
import type { N2Tier } from '../../../lib/n2Rarity';
import type { PackOpeningPhase, RevealRarity } from './types';

export function RarityEffectsLayer({
  phase,
  tier,
  revealRarity,
}: {
  phase: PackOpeningPhase;
  tier: N2Tier;
  revealRarity: RevealRarity;
}) {
  const active = phase === 'reveal' || phase === 'result';
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <RareConfetti active={active && revealRarity === 'chase'} tier={tier} revealRarity={revealRarity} />
    </View>
  );
}
