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
    color: colors.textPrimary,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(192, 132, 252, 0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  hub: {
    fontSize: fontSize.xxl,
    fontFamily: brandFont.black,
    color: colors.gold,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(232, 197, 71, 0.28)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
