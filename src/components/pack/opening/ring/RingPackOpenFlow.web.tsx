import React from 'react';
import { StyleSheet, View } from 'react-native';
import PackRingScene from './PackRingScene.web';
import type { RingPackOpenFlowProps } from './ringTypes';
import { tierToRingRarity } from './ringRarity';

/** Web / Expo web — runs the 3D ring scene in-process (React Three Fiber). */
export function RingPackOpenFlow({
  roll,
  revealCard,
  skipNonce,
  onRevealDone,
}: RingPackOpenFlowProps) {
  return (
    <View style={styles.fill}>
      <PackRingScene
        rollRarity={tierToRingRarity(roll.tier)}
        cardLabel={revealCard.name}
        skipNonce={skipNonce}
        embed
        onRevealDone={onRevealDone}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    backgroundColor: '#000',
  },
});
