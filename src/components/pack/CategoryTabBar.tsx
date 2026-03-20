import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { categories, PackCategory } from '../../data/mockPacks';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

export function CategoryTabBar() {
  const selected = useAppStore((s) => s.selectedCategory);
  const setCategory = useAppStore((s) => s.setCategory);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {categories.map((cat) => {
          const active = selected === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setCategory(cat.key as PackCategory | 'all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
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
    backgroundColor: colors.background,
  },
  tabActive: {
    backgroundColor: colors.nearBlack,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.white,
  },
});
