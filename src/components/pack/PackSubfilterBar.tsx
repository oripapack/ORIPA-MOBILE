import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HOME_SUBFILTER_KEYS } from '../../data/mockPacks';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

export function PackSubfilterBar() {
  const { t } = useTranslation();
  const packSubfilter = useAppStore((s) => s.packSubfilter);
  const setPackSubfilter = useAppStore((s) => s.setPackSubfilter);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {HOME_SUBFILTER_KEYS.map((key) => {
          const active = packSubfilter === key;
          const label =
            key === 'all'
              ? t('home.subfilterAll')
              : t(`chips.${key}`, { defaultValue: key.replace(/_/g, ' ') });
          return (
            <TouchableOpacity
              key={key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setPackSubfilter(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  scroll: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipActive: {
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentSoft,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.semibold,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.accentDark,
  },
});
