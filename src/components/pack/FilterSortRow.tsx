import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { useAppStore } from '../../store/useAppStore';

const sortOptions = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'newest', label: 'Newest' },
  { key: 'best_value', label: 'Best Value' },
  { key: 'popular', label: 'Most Popular' },
] as const;

export function FilterSortRow() {
  const sortOrder = useAppStore((s) => s.sortOrder);
  const setSortOrder = useAppStore((s) => s.setSortOrder);
  const [showSort, setShowSort] = useState(false);

  const currentLabel = sortOptions.find((o) => o.key === sortOrder)?.label ?? 'Recommended';

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
        <Text style={styles.filterIcon}>⚙</Text>
        <Text style={styles.filterText}>Filter</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)} activeOpacity={0.7}>
        <Text style={styles.sortLabel}>Sort: </Text>
        <Text style={styles.sortValue}>{currentLabel}</Text>
        <Text style={styles.sortChevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={showSort} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowSort(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Sort By</Text>
            {sortOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.dropdownItem, sortOrder === opt.key && styles.dropdownItemActive]}
                onPress={() => { setSortOrder(opt.key); setShowSort(false); }}
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterIcon: { fontSize: 14 },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
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
    backgroundColor: colors.white,
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
    color: colors.nearBlack,
  },
  checkmark: {
    color: colors.red,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
});
