import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChipTagType } from '../../data/mockPacks';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

const chipConfig: Record<ChipTagType, { label: string; bg: string; text: string; border: string }> = {
  new: { label: 'New', bg: colors.chipNew, text: colors.chipNewText, border: colors.chipNewBorder },
  new_user: { label: 'New User', bg: colors.chipNewUser, text: colors.chipNewUserText, border: colors.chipNewUserBorder },
  best_value: { label: 'Best Value', bg: colors.chipBestValue, text: colors.chipBestValueText, border: colors.chipBestValueBorder },
  graded: { label: 'Graded', bg: colors.chipGraded, text: colors.chipGradedText, border: colors.chipGradedBorder },
  hot_drop: { label: 'Hot Drop', bg: colors.chipHotDrop, text: colors.chipHotDropText, border: colors.chipHotDropBorder },
  bonus_pack: { label: 'Bonus Pack', bg: colors.chipBestValue, text: colors.chipBestValueText, border: colors.chipBestValueBorder },
  chase_boost: { label: 'Chase Boost', bg: colors.chipHotDrop, text: colors.chipHotDropText, border: colors.chipHotDropBorder },
};

interface Props {
  type: ChipTagType;
}

export function ChipTag({ type }: Props) {
  const config = chipConfig[type];
  return (
    <View style={[styles.chip, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
});
