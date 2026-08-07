import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { sg } from '../../../tokens/sg';
import { SgCard, SgData, SgSectionHeader } from '../../ui';

export type FairnessRecordData = {
  serverCommitment: string;
  clientSeed: string;
  openingNumber: string;
};

/** Trust chassis with no fabricated identifiers. A record appears only when
 * the live opening response supplies all commit–reveal fields. */
export function SgFairnessRecord({
  record,
  onVerify,
}: {
  record?: FairnessRecordData;
  onVerify?: () => void;
}) {
  if (!record) {
    return (
      <SgCard>
        <SgSectionHeader title="Verification record" />
        <View style={styles.pendingHeader}>
          <View style={styles.pendingDot} />
          <Text style={styles.pendingLabel}>CREATED AFTER A LIVE OPENING</Text>
        </View>
        <Text style={styles.method}>
          The commitment, seed, and opening number will appear here with a completed live pull.
        </Text>
      </SgCard>
    );
  }

  return (
    <SgCard>
      <SgSectionHeader title="Fairness record" />
      <Text style={styles.method}>
        Draw method: provably-fair commit–reveal. The server commits to a hash
        before you open; verify any pull afterwards.
      </Text>
      <Row label="Server commitment" value={record.serverCommitment} />
      <Row label="Client seed" value={record.clientSeed} />
      <Row label="Opening #" value={record.openingNumber} />
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
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
    marginTop: sg.space.md,
  },
  pendingDot: {
    width: 7,
    height: 7,
    borderRadius: sg.radius.pill,
    backgroundColor: sg.warning,
  },
  pendingLabel: {
    flex: 1,
    fontFamily: sg.font.label,
    fontSize: 9,
    letterSpacing: 0.9,
    color: sg.warning,
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
