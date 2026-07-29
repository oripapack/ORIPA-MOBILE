import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HOME_NICHE_CATEGORIES } from '../../data/mockPacks';
import { useAppStore } from '../../store/useAppStore';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
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
    backgroundColor: sg.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: sg.line,
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
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
  },
  tabActive: {
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderColor: 'rgba(212,175,55,0.30)',
    shadowColor: sg.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
  labelActive: {
    color: sg.gold,
    fontFamily: sg.font.bodyBold,
  },
});
