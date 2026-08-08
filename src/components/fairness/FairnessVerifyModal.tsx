import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { spacing } from '../../tokens/spacing';
import { SgButton } from '../ui';
import type { PullFairnessRecord } from '../../../shared/api/types';
import { showUserMessage } from '../../utils/showUserMessage';

type Props = {
  visible: boolean;
  onClose: () => void;
  record: PullFairnessRecord | null;
};

function shorten(value: string, head = 8, tail = 6): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/**
 * Full commit–reveal details for the latest (or selected) live pull.
 */
export function FairnessVerifyModal({ visible, onClose, record }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const rows = useMemo(() => {
    if (!record) return [];
    return [
      { label: t('fairness.verify.rows.pullId'), value: record.pullId, copy: record.pullId },
      {
        label: t('fairness.verify.rows.algorithm'),
        value: record.algo ?? 'hmac_sha256_rejection_uint32_v1',
      },
      {
        label: t('fairness.verify.rows.serverHash'),
        value: record.hashedServerSeed || '—',
        copy: record.hashedServerSeed || undefined,
        full: record.hashedServerSeed,
      },
      {
        label: t('fairness.verify.rows.revealedSeed'),
        value: record.revealedServerSeed || '—',
        copy: record.revealedServerSeed || undefined,
        full: record.revealedServerSeed,
      },
      {
        label: t('fairness.verify.rows.clientSeed'),
        value: record.clientSeed || '—',
        copy: record.clientSeed || undefined,
        full: record.clientSeed,
      },
      {
        label: t('fairness.verify.rows.digest'),
        value: record.digestHex ? shorten(record.digestHex) : '—',
        copy: record.digestHex,
        full: record.digestHex,
      },
      {
        label: t('fairness.verify.rows.opening'),
        value: record.openingNumber || '—',
      },
    ];
  }, [record, t]);

  const copyValue = async (value?: string) => {
    if (!value) return;
    try {
      await Clipboard.setStringAsync(value);
      showUserMessage(t('common.copied'), t('common.copiedBody'));
    } catch {
      showUserMessage(t('common.copyFailedTitle'), t('common.copyFailedBody'));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityLabel={t('fairness.verify.closeA11y')}
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.grabber} />
          <Text style={styles.title}>{t('fairness.verify.title')}</Text>
          <Text style={styles.body}>{t('fairness.verify.body')}</Text>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {!record ? (
              <Text style={styles.empty}>{t('fairness.verify.empty')}</Text>
            ) : (
              rows.map((row) => (
                <View key={row.label} style={styles.row}>
                  <Text style={styles.label}>{row.label}</Text>
                  <TouchableOpacity
                    disabled={!row.copy}
                    onPress={() => void copyValue(row.copy)}
                    accessibilityRole={row.copy ? 'button' : undefined}
                  >
                    <Text style={styles.value} selectable>
                      {row.full && row.full.length > 40 ? shorten(row.full, 12, 10) : row.value}
                    </Text>
                    {row.copy ? <Text style={styles.copyHint}>{t('fairness.verify.tapToCopy')}</Text> : null}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          <SgButton label={t('common.close')} variant="line" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: sg.surface,
    borderTopLeftRadius: sg.radius.panel,
    borderTopRightRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '88%',
    gap: spacing.sm,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: sg.line,
    marginBottom: 4,
  },
  title: {
    fontFamily: sg.font.display,
    fontSize: 22,
    color: sg.text,
  },
  body: {
    fontFamily: sg.font.body,
    fontSize: 13,
    lineHeight: 18,
    color: sg.muted,
  },
  scroll: { maxHeight: 360 },
  scrollContent: { paddingBottom: spacing.md, gap: spacing.md },
  empty: {
    fontFamily: sg.font.body,
    fontSize: 13,
    lineHeight: 18,
    color: sg.muted,
    paddingVertical: spacing.md,
  },
  row: { gap: 4 },
  label: { fontFamily: sg.font.body, fontSize: 12, color: sg.muted },
  value: {
    fontFamily: sg.font.data,
    fontSize: 13,
    color: sg.text,
    fontVariant: [...sg.numeric],
  },
  copyHint: {
    fontFamily: sg.font.body,
    fontSize: 10,
    color: sg.gold,
    marginTop: 2,
  },
});
