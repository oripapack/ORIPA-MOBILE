import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { sg } from '../../tokens/sg';
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
        <Ionicons name="chevron-down" size={14} color={sg.muted} />
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
                {sortOrder === opt.key ? <Ionicons name="checkmark" size={20} color={sg.gold} /> : null}
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
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.md,
    backgroundColor: sg.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: sg.line,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sortLabel: {
    fontSize: sg.type.sm,
    color: sg.muted,
  },
  sortValue: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  dropdown: {
    backgroundColor: sg.surface,
    borderTopLeftRadius: sg.radius.panel,
    borderTopRightRadius: sg.radius.panel,
    padding: sg.space.xl,
    paddingBottom: sg.space.xxxl,
  },
  dropdownTitle: {
    fontSize: sg.type.lg,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    marginBottom: sg.space.md,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: sg.space.md,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  dropdownItemActive: {},
  dropdownText: {
    fontSize: sg.type.base,
    color: sg.text,
  },
  dropdownTextActive: {
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
});
