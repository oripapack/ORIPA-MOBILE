import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { PackOdds } from '../../data/mockPackOdds';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

type Props = {
  visible: boolean;
  onClose: () => void;
  packTitle: string;
  odds: PackOdds;
};

function tierPillColor(tier: string) {
  switch (tier) {
    case 'Top hit':
      return { bg: 'rgba(234,179,8,0.14)', border: 'rgba(234,179,8,0.34)', text: '#FDE68A' };
    case 'Ultra':
      return { bg: 'rgba(147,51,234,0.14)', border: 'rgba(147,51,234,0.32)', text: '#E9D5FF' };
    case 'Rare':
      return { bg: 'rgba(59,130,246,0.14)', border: 'rgba(59,130,246,0.30)', text: '#BFDBFE' };
    default:
      return { bg: 'rgba(148,163,184,0.14)', border: 'rgba(148,163,184,0.30)', text: '#CBD5E1' };
  }
}

export function PackOddsModal({ visible, onClose, packTitle, odds }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} {...transparentModalIOSProps}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.kicker}>Pack Odds</Text>
          <Text style={styles.title} numberOfLines={2}>
            {packTitle}
          </Text>

          <View style={styles.table}>
            {odds.rows.map((row) => {
              const c = tierPillColor(row.tier);
              return (
                <View key={row.tier} style={styles.row}>
                  <View style={[styles.tierPill, { backgroundColor: c.bg, borderColor: c.border }]}>
                    <Text style={[styles.tierText, { color: c.text }]}>{row.tier}</Text>
                  </View>
                  <Text style={styles.chance}>{row.chance}</Text>
                  <Text style={styles.examples} numberOfLines={2}>
                    {row.examples.join(' / ')}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.note}>{odds.note}</Text>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
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
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 4,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
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
  tierPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tierText: {
    fontSize: 11,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  chance: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.black,
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
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
});

