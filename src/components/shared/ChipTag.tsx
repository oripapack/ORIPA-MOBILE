import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChipTagType } from '../../data/mockPacks';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

const chipStyle: Record<ChipTagType, { bg: string; text: string; border: string }> = {
  new: { bg: colors.chipNew, text: colors.chipNewText, border: colors.chipNewBorder },
  new_user: { bg: colors.chipNewUser, text: colors.chipNewUserText, border: colors.chipNewUserBorder },
  best_value: { bg: colors.chipBestValue, text: colors.chipBestValueText, border: colors.chipBestValueBorder },
  graded: { bg: colors.chipGraded, text: colors.chipGradedText, border: colors.chipGradedBorder },
  hot_drop: { bg: colors.chipHotDrop, text: colors.chipHotDropText, border: colors.chipHotDropBorder },
  bonus_pack: { bg: colors.chipBestValue, text: colors.chipBestValueText, border: colors.chipBestValueBorder },
  chase_boost: { bg: colors.chipHotDrop, text: colors.chipHotDropText, border: colors.chipHotDropBorder },
};

interface Props {
  type: ChipTagType;
}

export function ChipTag({ type }: Props) {
  const { t } = useTranslation();
  const config = chipStyle[type];
  return (
    <View style={[styles.chip, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[styles.label, { color: config.text }]}>{t(`chips.${type}`)}</Text>
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
