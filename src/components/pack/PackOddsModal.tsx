import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { PackOdds } from '../../data/mockPackOdds';
import { SgTierTag } from '../ui';
import { sg } from '../../tokens/sg';

type Props = {
  visible: boolean;
  onClose: () => void;
  packTitle: string;
  odds: PackOdds;
};

export function PackOddsModal({ visible, onClose, packTitle, odds }: Props) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} {...transparentModalIOSProps}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.kicker}>{t('packOdds.kicker')}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {packTitle}
          </Text>

          <View style={styles.table}>
            {odds.rows.map((row) => (
              <View key={row.tier} style={styles.row}>
                {/* §6: odds rows ARE tiers — disclosure context: all steps equally readable */}
                <SgTierTag tier={row.tier} context="disclosure" />
                <Text style={styles.chance}>{row.chance}</Text>
                <Text style={styles.examples} numberOfLines={2}>
                  {row.examples.join(' / ')}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.note}>{odds.note}</Text>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>{t('common.close')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.56)',
    justifyContent: 'center',
    paddingHorizontal: sg.space.md,
  },
  sheet: {
    backgroundColor: sg.surface,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    padding: sg.space.lg,
  },
  kicker: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 4,
    fontSize: sg.type.lg,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    marginBottom: sg.space.md,
  },
  table: {
    gap: sg.space.sm,
  },
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    borderRadius: sg.radius.btn,
    padding: sg.space.sm,
    gap: 6,
    backgroundColor: sg.surface2,
  },
  chance: {
    fontSize: sg.type.base,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  examples: {
    fontSize: sg.type.xs,
    color: sg.muted,
    lineHeight: 17,
  },
  note: {
    marginTop: sg.space.md,
    fontSize: 11,
    color: sg.muted,
    lineHeight: 16,
  },
  closeBtn: {
    marginTop: sg.space.md,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: sg.radius.btn,
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.xs + 2,
    backgroundColor: sg.surface2,
  },
  closeText: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
  },
});
