import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HOME_NICHE_CATEGORIES } from '../../data/mockPacks';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

export function CategoryTabBar() {
  const { t } = useTranslation();
  const selected = useAppStore((s) => s.homeNiche);
  const setHomeNiche = useAppStore((s) => s.setHomeNiche);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {HOME_NICHE_CATEGORIES.map((key) => {
          const active = selected === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setHomeNiche(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, active && styles.labelActive]}>
                {t(`categories.${key}`, { defaultValue: key })}
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
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentBorder,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.accentDark,
  },
});
