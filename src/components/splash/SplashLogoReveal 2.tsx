import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';

/** PullHub wordmark — editorial split weight for the splash only. */
export function SplashLogoReveal() {
  return (
    <View style={styles.row} accessibilityRole="text">
      <Text style={styles.pull}>Pull</Text>
      <Text style={styles.hub}>Hub</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  pull: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.gold,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(232,197,71,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  hub: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    opacity: 0.94,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
});
