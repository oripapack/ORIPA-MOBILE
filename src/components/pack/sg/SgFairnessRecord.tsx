import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { sg } from '../../../tokens/sg';
import { SgCard, SgData, SgSectionHeader } from '../../ui';

/**
 * Fairness record block (docs/design-system-n2.md — odds ledger / audit
 * exposure is part of the trust chassis, §10/§12):
 * Server commitment (hash prefix) / Client seed / Opening # / Verify →,
 * plus the draw-method statement. Hashes are data-face numerals (§4).
 *
 * Values are MOCK placeholders until the provably-fair backend lands
 * (shared/api commit–reveal flow) — the UI frame ships first so the trust
 * architecture is visible and the wiring point is obvious.
 */
export function SgFairnessRecord({ onVerify }: { onVerify?: () => void }) {
  return (
    <SgCard>
      <SgSectionHeader title="Fairness record" />
      <Text style={styles.method}>
        Draw method: provably-fair commit–reveal. The server commits to a hash
        before you open; verify any pull afterwards.
      </Text>
      <Row label="Server commitment" value="a41f8c…9c2e" />
      <Row label="Client seed" value="7b03aa…d114" />
      <Row label="Opening #" value="287" />
      <TouchableOpacity onPress={onVerify} style={styles.verify} accessibilityRole="button">
        <Text style={styles.verifyText}>VERIFY →</Text>
      </TouchableOpacity>
    </SgCard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <SgData value={value} size="sm" />
    </View>
  );
}

const styles = StyleSheet.create({
  method: {
    fontFamily: sg.font.body,
    fontSize: 12,
    lineHeight: 17,
    color: sg.muted,
    marginTop: sg.space.sm,
    marginBottom: sg.space.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: sg.space.sm + 2,
  },
  label: { fontFamily: sg.font.body, fontSize: 13, color: sg.muted },
  verify: { alignSelf: 'flex-end', marginTop: sg.space.md, padding: 4 },
  verifyText: {
    fontFamily: sg.font.bodyBold,
    fontSize: 12,
    letterSpacing: 1,
    color: sg.text,
  },
});
