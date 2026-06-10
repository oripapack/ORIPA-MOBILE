import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ph } from '../../tokens/phTheme';
import { brandFont, fontSize } from '../../tokens/typography';

export function PhProgressBar({ fraction }: { fraction: number }) {
  const pct = Math.round(fraction * 100);
  const isLow = fraction < 0.35;
  return (
    <View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.max(2, pct)}%`, backgroundColor: isLow ? ph.red : ph.green },
          ]}
        />
      </View>
      <Text style={[styles.label, isLow && { color: ph.red, fontFamily: brandFont.bold }]}>
        {isLow ? `Low stock — ${pct}% left` : `${pct}% remaining`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 1 },
  label: { marginTop: 4, fontSize: 10, color: ph.textMuted },
});
