import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { sg } from '../../tokens/sg';

export function PhProgressBar({ fraction }: { fraction: number }) {
  const pct = Math.round(fraction * 100);
  const isLow = fraction < 0.35;
  return (
    <View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.max(2, pct)}%` },
          ]}
        />
      </View>
      <Text style={[styles.label, isLow && styles.labelLow]}>
        {isLow ? `Low stock — ${pct}% left` : `${pct}% remaining`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 2,
    backgroundColor: sg.line,
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 1, backgroundColor: sg.success },
  label: { marginTop: 4, fontSize: 10, fontFamily: sg.font.data, color: sg.muted },
  labelLow: { color: sg.success, fontFamily: sg.font.dataBold },
});
