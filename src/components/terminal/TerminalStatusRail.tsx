import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { sg } from '../../tokens/sg';

const STEPS = [
  { code: '01', label: 'ODDS', sub: 'AVAILABLE', tone: 'blue' },
  { code: '02', label: 'PULL', sub: 'VERIFIABLE', tone: 'mint' },
  { code: '03', label: 'SHIP', sub: 'TRACKED', tone: 'red' },
] as const;

export function TerminalStatusRail({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.rail, compact && styles.railCompact]} accessibilityLabel="Pack service status">
      {STEPS.map((step) => (
        <View key={step.code} style={[styles.segment, compact && styles.segmentCompact]}>
          <View
            style={[
              styles.signal,
              step.tone === 'mint' ? styles.signalMint : step.tone === 'red' ? styles.signalRed : null,
            ]}
          />
          <Text style={styles.code}>{step.code}</Text>
          <Text style={styles.label}>{step.label}</Text>
          {!compact ? <Text style={styles.sub}>{step.sub}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 64,
    borderWidth: 1,
    borderColor: sg.lineStrong,
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.tag,
    overflow: 'hidden',
  },
  railCompact: { width: 48 },
  segment: {
    minHeight: 66,
    paddingHorizontal: 7,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  segmentCompact: { minHeight: 46, paddingHorizontal: 5, paddingVertical: 6 },
  signal: { width: 16, height: 3, backgroundColor: sg.gold, marginBottom: 6 },
  signalMint: { backgroundColor: sg.success },
  signalRed: { backgroundColor: sg.neon },
  code: { fontFamily: sg.font.data, fontSize: 8, color: sg.muted, letterSpacing: 0.8 },
  label: { fontFamily: sg.font.label, fontSize: 8, color: sg.text, letterSpacing: 0.4, marginTop: 2 },
  sub: { fontFamily: sg.font.data, fontSize: 6.5, color: sg.muted, letterSpacing: 0.25, marginTop: 1 },
});
