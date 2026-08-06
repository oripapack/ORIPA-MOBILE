import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HOME_SUBFILTER_KEYS } from '../../data/mockPacks';
import { useAppStore } from '../../store/useAppStore';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';

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
    backgroundColor: sg.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: sg.line,
  },
  scroll: {
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.xs,
    gap: sg.space.xs,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: sg.space.sm + 2,
    paddingVertical: 6,
    borderRadius: sg.radius.tag,
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
  },
  chipActive: {
    borderColor: sg.gold,
    backgroundColor: sg.cobaltWash,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
  labelActive: {
    color: sg.gold,
  },
});
