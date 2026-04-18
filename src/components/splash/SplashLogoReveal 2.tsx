import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';

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
    fontFamily: brandFont.black,
    color: colors.accent,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(62, 92, 118, 0.12)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  hub: {
    fontSize: fontSize.xxl,
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    opacity: 0.94,
    textShadowColor: 'rgba(28, 36, 48, 0.06)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
