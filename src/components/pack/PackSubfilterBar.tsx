import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HOME_SUBFILTER_KEYS } from '../../data/mockPacks';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
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
          const label = key === 'all' ? t('home.subfilterAll') : t(`chips.${key}`);
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
    backgroundColor: 'rgba(12, 20, 10, 0.88)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.headerHairline,
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
    backgroundColor: 'rgba(22, 32, 24, 0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(34, 44, 32, 0.95)',
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.gold,
  },
});
