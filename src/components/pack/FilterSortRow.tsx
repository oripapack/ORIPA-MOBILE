import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { useAppStore } from '../../store/useAppStore';
import { transparentModalIOSProps } from '../../constants/modalPresentation';

type SortKey =
  | 'recommended'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'best_value'
  | 'popular';

const SORT_KEYS: SortKey[] = [
  'recommended',
  'price_asc',
  'price_desc',
  'newest',
  'best_value',
  'popular',
];

const SORT_I18N: Record<SortKey, string> = {
  recommended: 'sort.recommended',
  price_asc: 'sort.priceAsc',
  price_desc: 'sort.priceDesc',
  newest: 'sort.newest',
  best_value: 'sort.bestValue',
  popular: 'sort.popular',
};

export function FilterSortRow() {
  const { t } = useTranslation();
  const sortOrder = useAppStore((s) => s.sortOrder);
  const setSortOrder = useAppStore((s) => s.setSortOrder);
  const [showSort, setShowSort] = useState(false);

  const sortOptions = useMemo(
    () => SORT_KEYS.map((key) => ({ key, label: t(SORT_I18N[key]) })),
    [t],
  );

  const currentLabel =
    sortOptions.find((o) => o.key === sortOrder)?.label ?? t('sort.recommended');

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)} activeOpacity={0.7}>
        <Text style={styles.sortLabel}>{t('filterRow.sortPrefix')}</Text>
        <Text style={styles.sortValue}>{currentLabel}</Text>
        <Text style={styles.sortChevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={showSort} transparent animationType="fade" {...transparentModalIOSProps}>
        <Pressable style={styles.overlay} onPress={() => setShowSort(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>{t('filterRow.sortBy')}</Text>
            {sortOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.dropdownItem, sortOrder === opt.key && styles.dropdownItemActive]}
                onPress={() => {
                  setSortOrder(opt.key);
                  setShowSort(false);
                }}
              >
                <Text style={[styles.dropdownText, sortOrder === opt.key && styles.dropdownTextActive]}>
                  {opt.label}
                </Text>
                {sortOrder === opt.key && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(14, 22, 14, 0.75)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.headerHairline,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sortLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  sortValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  sortChevron: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  dropdown: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  dropdownTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownItemActive: {},
  dropdownText: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  dropdownTextActive: {
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  checkmark: {
    color: colors.gold,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
});
