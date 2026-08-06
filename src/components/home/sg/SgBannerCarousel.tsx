import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { sg } from '../../../tokens/sg';

const SIGNALS = [
  { code: 'JP', label: 'TOKYO DESIGN', color: sg.goldHi },
  { code: 'GM', label: 'GAME LOOP', color: sg.neon },
  { code: 'RC', label: 'REAL CARDS', color: sg.success },
] as const;

/** Code-native dispatch board. No licensed imagery or unsupported offer copy. */
export function SgBannerCarousel() {
  return (
    <View style={styles.board} accessibilityRole="summary">
      <View style={styles.topRow}>
        <Text style={styles.route}>JST / TERMINAL 01</Text>
        <View style={styles.status}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>ONLINE</Text>
        </View>
      </View>
      <Text style={styles.kicker}>東京発 / BUILT IN JAPAN</Text>
      <Text style={styles.title}>THE NIGHT SHIFT{`\n`}FOR COLLECTORS.</Text>
      <View style={styles.signalRow}>
        {SIGNALS.map((signal) => (
          <View key={signal.code} style={styles.signalCell}>
            <Text style={[styles.signalCode, { color: signal.color }]}>{signal.code}</Text>
            <Text style={styles.signalLabel}>{signal.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    marginHorizontal: sg.space.md,
    marginTop: sg.space.md,
    padding: sg.space.md,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.lineStrong,
    borderRadius: sg.radius.panel,
    overflow: 'hidden',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  route: { fontFamily: sg.font.label, fontSize: 8, color: sg.chrome, letterSpacing: 1.1 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, backgroundColor: sg.success, borderRadius: 3 },
  statusText: { fontFamily: sg.font.dataBold, fontSize: 8, color: sg.success, letterSpacing: 0.7 },
  kicker: { fontFamily: sg.font.label, fontSize: 9, color: sg.goldHi, letterSpacing: 1.35, marginTop: 20 },
  title: {
    fontFamily: sg.font.display,
    fontSize: 27,
    lineHeight: 27,
    letterSpacing: -0.9,
    color: sg.text,
    marginTop: 5,
  },
  signalRow: { flexDirection: 'row', marginTop: 18, borderTopWidth: 1, borderTopColor: sg.line },
  signalCell: { flex: 1, paddingTop: 10, paddingRight: 4 },
  signalCode: { fontFamily: sg.font.dataBold, fontSize: 10, letterSpacing: 0.6 },
  signalLabel: { fontFamily: sg.font.label, fontSize: 6.8, color: sg.muted, letterSpacing: 0.5, marginTop: 2 },
});
