import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export function StopLayer({ glow }: { glow: Animated.Value }) {
  return (
    <View style={styles.centerMarker} pointerEvents="none">
      <Animated.View
        style={[
          styles.markerLine,
          {
            opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centerMarker: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 4,
    marginLeft: -2,
    alignItems: 'center',
    zIndex: 10,
  },
  markerLine: {
    position: 'absolute',
    top: 12,
    bottom: 12,
    width: 2,
    borderRadius: 999,
    backgroundColor: '#fde68a',
    shadowColor: '#fde68a',
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
});
