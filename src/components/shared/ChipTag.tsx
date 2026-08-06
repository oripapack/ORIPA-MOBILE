import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChipTagType } from '../../data/mockPacks';
import { sg } from '../../tokens/sg';

/** Tokyo Arcade Vault chips — acrylic chassis with semantic transit-signal accents. */
const chipStyle: Record<ChipTagType, { bg: string; text: string; border: string }> = {
  new: { bg: sg.surface2, text: sg.gold, border: sg.line },
  new_user: { bg: sg.surface2, text: sg.goldHi, border: sg.line },
  best_value: { bg: sg.surface2, text: sg.gold, border: sg.line },
  graded: { bg: sg.surface2, text: sg.muted, border: sg.line },
  hot_drop: { bg: sg.signalWash, text: sg.neon, border: sg.signalLine },
  bonus_pack: { bg: sg.surface2, text: sg.gold, border: sg.line },
  chase_boost: { bg: sg.signalWash, text: sg.neon, border: sg.signalLine },
  first_time: { bg: sg.successWash, text: sg.success, border: sg.successLine },
  low_cost: { bg: sg.surface2, text: sg.warning, border: sg.line },
  high_return: { bg: sg.surface2, text: sg.goldHi, border: sg.line },
  premium_pack: { bg: sg.surface2, text: sg.gold, border: sg.line },
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
    paddingHorizontal: sg.space.sm,
    paddingVertical: 3,
    borderRadius: sg.radius.tag,
    borderWidth: 1,
    marginRight: sg.space.xs,
  },
  label: {
    fontSize: 11,
    fontFamily: sg.font.bodyMedium,
    letterSpacing: 0.2,
  },
});
