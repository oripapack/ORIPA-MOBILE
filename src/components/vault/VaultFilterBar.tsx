import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { sgVault } from '../../tokens/sgVault';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import {
  VAULT_SORT_OPTIONS,
  VAULT_STATUS_FILTERS,
  type VaultSortOption,
  type VaultStatusFilter,
} from '../../lib/vaultPulls';

type Props = {
  filter: VaultStatusFilter;
  sort: VaultSortOption;
  onChangeFilter: (next: VaultStatusFilter) => void;
  onChangeSort: (next: VaultSortOption) => void;
};

export function VaultFilterBar({
  filter,
  sort,
  onChangeFilter,
  onChangeSort,
}: Props) {
  const { t } = useTranslation();
  const [sortOpen, setSortOpen] = React.useState(false);

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {VAULT_STATUS_FILTERS.map((key) => {
          const active = filter === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onChangeFilter(key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t(`vaultScreen.filter.${key}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.sortBtn}
        onPress={() => setSortOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('vaultScreen.sortLabel')}
      >
        <Text style={styles.sortBtnText}>
          {t('vaultScreen.sortLabel')}: {t(`vaultScreen.sort.${sort}`)}
        </Text>
      </TouchableOpacity>

      <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
        <Pressable style={styles.sortBackdrop} onPress={() => setSortOpen(false)}>
          <Pressable style={styles.sortSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sortTitle}>{t('vaultScreen.sortLabel')}</Text>
            {VAULT_SORT_OPTIONS.map((key) => {
              const active = sort === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.sortRow, active && styles.sortRowActive]}
                  onPress={() => {
                    onChangeSort(key);
                    setSortOpen(false);
                  }}
                >
                  <Text style={[styles.sortRowText, active && styles.sortRowTextActive]}>
                    {t(`vaultScreen.sort.${key}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tabs: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: sgVault.line,
    backgroundColor: sgVault.surface,
  },
  tabActive: {
    borderColor: sgVault.gold,
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  tabText: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.semibold,
    color: sgVault.muted,
  },
  tabTextActive: {
    color: sgVault.gold,
  },
  sortBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  sortBtnText: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.medium,
    color: sgVault.muted,
  },
  sortBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortSheet: {
    backgroundColor: sgVault.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderColor: sgVault.line,
  },
  sortTitle: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: sgVault.text,
    marginBottom: spacing.md,
  },
  sortRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: sgVault.line,
  },
  sortRowActive: {
    backgroundColor: 'rgba(212,175,55,0.08)',
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderBottomWidth: 0,
  },
  sortRowText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
    color: sgVault.muted,
  },
  sortRowTextActive: {
    color: sgVault.gold,
    fontFamily: brandFont.bold,
  },
});
