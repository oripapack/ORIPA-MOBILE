import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fontWeight } from '../../../tokens/typography';
import type { PackOpeningPhase } from './types';

/**
 * In-engine controls are optional; PackOpeningModal currently owns the visible controls.
 */
export function ControlsLayer({
  phase,
  show,
  onSkip,
  onReplay,
}: {
  phase: PackOpeningPhase;
  show: boolean;
  onSkip: () => void;
  onReplay: () => void;
}) {
  if (!show) return null;
  const canSkip = phase !== 'idle' && phase !== 'result';
  return (
    <View style={styles.row} pointerEvents="box-none">
      <TouchableOpacity onPress={onSkip} disabled={!canSkip} style={[styles.btn, !canSkip && styles.disabled]}>
        <Text style={styles.txt}>Skip</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onReplay} style={styles.btn}>
        <Text style={styles.txt}>Replay</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 8,
    zIndex: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(2,6,23,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  disabled: { opacity: 0.35 },
  txt: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
