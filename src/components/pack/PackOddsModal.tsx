import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { PackOdds } from '../../data/mockPackOdds';
import { SgTierTag } from '../ui';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

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
                {/* §6: odds rows ARE tiers — the tag carries the 3-color / 6-form treatment */}
                <SgTierTag tier={row.tier} />
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
    paddingHorizontal: spacing.base,
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  kicker: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 4,
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  table: {
    gap: spacing.sm,
  },
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 6,
    backgroundColor: 'rgba(2,6,23,0.28)',
  },
  chance: {
    fontSize: fontSize.base,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
  },
  examples: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  note: {
    marginTop: spacing.md,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
  closeBtn: {
    marginTop: spacing.md,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: 'rgba(2,6,23,0.34)',
  },
  closeText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.textPrimary,
  },
});

