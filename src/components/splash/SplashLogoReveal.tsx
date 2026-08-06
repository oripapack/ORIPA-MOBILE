import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { sg } from '../../tokens/sg';
import { getLogoWordmarkParts, APP_DISPLAY_NAME } from '../../config/app';

/** PullHub wordmark — editorial split weight for the splash only. */
export function SplashLogoReveal() {
  const wordmark = getLogoWordmarkParts();
  return (
    <View style={styles.block} accessibilityRole="text">
      <View style={styles.row}>
        {wordmark ? (
          <>
            <Text style={styles.pull}>{wordmark.lead}</Text>
            <Text style={styles.hub}> {wordmark.accent}</Text>
          </>
        ) : (
          <Text style={styles.pull}>{APP_DISPLAY_NAME}</Text>
        )}
      </View>
      <Text style={styles.origin}>TOKYO / UNITED STATES</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  pull: {
    fontSize: sg.type.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
    letterSpacing: -0.5,
  },
  hub: {
    fontSize: sg.type.xxl,
    fontFamily: sg.font.display,
    color: sg.gold,
    letterSpacing: -0.3,
  },
  origin: {
    marginTop: 6,
    fontSize: 8,
    fontFamily: sg.font.data,
    color: sg.muted,
    letterSpacing: 1.8,
  },
});
