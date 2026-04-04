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
                {t(`categories.${key}`)}
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
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: 'rgba(22, 32, 24, 0.95)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.nearBlack,
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 6,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.gold,
  },
});
