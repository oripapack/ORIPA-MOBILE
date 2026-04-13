import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChipTagType } from '../../data/mockPacks';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

const chipStyle: Record<ChipTagType, { bg: string; text: string; border: string }> = {
  new: { bg: colors.chipNew, text: colors.chipNewText, border: colors.chipNewBorder },
  new_user: { bg: colors.chipNewUser, text: colors.chipNewUserText, border: colors.chipNewUserBorder },
  best_value: { bg: colors.chipBestValue, text: colors.chipBestValueText, border: colors.chipBestValueBorder },
  graded: { bg: colors.chipGraded, text: colors.chipGradedText, border: colors.chipGradedBorder },
  hot_drop: { bg: colors.chipHotDrop, text: colors.chipHotDropText, border: colors.chipHotDropBorder },
  bonus_pack: { bg: colors.chipBestValue, text: colors.chipBestValueText, border: colors.chipBestValueBorder },
  chase_boost: { bg: colors.chipHotDrop, text: colors.chipHotDropText, border: colors.chipHotDropBorder },
  first_time: { bg: 'rgba(22,163,74,0.15)', text: '#4ADE80', border: 'rgba(74,222,128,0.35)' },
  low_cost: { bg: 'rgba(245,158,11,0.15)', text: '#FCD34D', border: 'rgba(252,211,77,0.35)' },
  high_return: { bg: 'rgba(168,85,247,0.15)', text: '#C084FC', border: 'rgba(192,132,252,0.35)' },
  premium_pack: { bg: 'rgba(124,58,237,0.15)', text: '#A78BFA', border: 'rgba(167,139,250,0.35)' },
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
    fontFamily: brandFont.semibold,
    letterSpacing: 0.2,
  },
});
