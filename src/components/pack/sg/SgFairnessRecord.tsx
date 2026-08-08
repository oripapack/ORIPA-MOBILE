import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../../../tokens/sg';
import { SgCard, SgData, SgSectionHeader } from '../../ui';
import type { PullFairnessRecord } from '../../../../shared/api/types';

function shorten(value: string, head = 6, tail = 4): string {
  if (!value) return '—';
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/**
 * Fairness record block — commit–reveal trust chassis (§10/§12).
 * Pass `record` from the latest live open (`lastFairnessRecord`).
 */
export function SgFairnessRecord({
  onVerify,
  record,
}: {
  onVerify?: () => void;
  record?: PullFairnessRecord | null;
}) {
  const { t } = useTranslation();
  const hasLive = Boolean(record?.hashedServerSeed || record?.clientSeed);

  return (
    <SgCard>
      <SgSectionHeader title={t('fairness.record.title')} />
      <Text style={styles.method}>{t('fairness.record.method')}</Text>
      {hasLive && record ? (
        <>
          <Row label={t('fairness.record.serverCommitment')} value={shorten(record.hashedServerSeed)} />
          <Row label={t('fairness.record.clientSeed')} value={shorten(record.clientSeed)} />
          <Row
            label={t('fairness.record.openingNumber')}
            value={record.openingNumber || shorten(record.pullId, 4, 4)}
          />
        </>
      ) : (
        <Text style={styles.pending}>{t('fairness.record.pending')}</Text>
      )}
      <TouchableOpacity
        onPress={onVerify}
        style={styles.verify}
        accessibilityRole="button"
        disabled={!onVerify}
      >
        <Text style={[styles.verifyText, !onVerify ? styles.verifyDisabled : null]}>
          {t('fairness.record.verifyCta')}
        </Text>
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
  pending: {
    fontFamily: sg.font.body,
    fontSize: 12,
    lineHeight: 17,
    color: sg.muted,
    marginTop: sg.space.sm,
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
  verifyDisabled: { color: sg.muted },
});
