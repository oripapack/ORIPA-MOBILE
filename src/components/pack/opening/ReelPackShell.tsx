import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HeroPackFace } from './HeroPackFace';

type Props = {
  width: number;
  height: number;
  tint: string;
  /** 0 = normal, 1 = locked-in emphasis on winning slot */
  lockEmphasis?: number;
};

/**
 * Reel slot uses the same sealed-pack art as `HeroRevealEngine` (dual `HeroPackFace`),
 * scaled to the reel cell — not the flat placeholder shell.
 */
export function ReelPackShell({ width, height, tint, lockEmphasis = 0 }: Props) {
  const halfW = width / 2;
  const cornerR = Math.max(7, Math.min(16, Math.round((18 * width) / 210)));

  return (
    <View
      style={[
        styles.wrap,
        {
          width,
          height,
          borderRadius: cornerR,
          shadowOpacity: 0.12 + lockEmphasis * 0.38,
          shadowRadius: 6 + lockEmphasis * 10,
          elevation: 3 + lockEmphasis * 6,
        },
      ]}
    >
      <View
        style={[
          styles.halfLeft,
          {
            width: halfW,
            height,
            borderTopLeftRadius: cornerR,
            borderBottomLeftRadius: cornerR,
          },
        ]}
      >
        <HeroPackFace side="left" packAccent={tint} />
      </View>
      <View
        style={[
          styles.halfRight,
          {
            width: halfW,
            height,
            borderTopRightRadius: cornerR,
            borderBottomRightRadius: cornerR,
          },
        ]}
      >
        <HeroPackFace side="right" packAccent={tint} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
    backgroundColor: '#06090c',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
  },
  halfLeft: {
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRightWidth: 0,
    backgroundColor: '#06090c',
  },
  halfRight: {
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
    borderLeftWidth: 0,
    backgroundColor: '#06090c',
  },
});
