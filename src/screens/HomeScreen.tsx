import React, { useMemo } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../components/shared/AppHeader';
import { HomeBackground } from '../components/shared/HomeBackground';
import { HeroBanner } from '../components/pack/HeroBanner';
import { CategoryTabBar } from '../components/pack/CategoryTabBar';
import { FilterSortRow } from '../components/pack/FilterSortRow';
import { PackCard } from '../components/pack/PackCard';
import { colors } from '../tokens/colors';
import { mockPacks } from '../data/mockPacks';
import { useWelcomeBannerDismissed } from '../hooks/useWelcomeBannerDismissed';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useAppStore } from '../store/useAppStore';
import { fontSize, fontWeight } from '../tokens/typography';
import { spacing } from '../tokens/spacing';

/**
 * Home = full pack store: optional welcome hero, category chips (Pokémon, Yu-Gi-Oh!, etc.),
 * sort/filter, and all openable packs in one scroll.
 */
export function HomeScreen() {
  const { t } = useTranslation();
  const { loading: welcomeLoading, isDismissed: welcomeDismissed, dismiss: dismissWelcome } =
    useWelcomeBannerDismissed();
  const { refreshControl } = usePullToRefresh();
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const sortOrder = useAppStore((s) => s.sortOrder);

  const filtered = mockPacks.filter(
    (p) => selectedCategory === 'all' || p.category === selectedCategory
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortOrder) {
      case 'price_asc':
        return arr.sort((a, b) => a.creditPrice - b.creditPrice);
      case 'price_desc':
        return arr.sort((a, b) => b.creditPrice - a.creditPrice);
      default:
        return arr;
    }
  }, [filtered, sortOrder]);

  const handleBrowsePacks = () => {
    void dismissWelcome();
  };

  return (
    <View style={styles.container}>
      <HomeBackground />
      <AppHeader />
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {!welcomeLoading && !welcomeDismissed ? (
              <HeroBanner
                onBrowsePacks={handleBrowsePacks}
                onDismiss={() => void dismissWelcome()}
              />
            ) : null}
            <View style={styles.catalogIntro}>
              <Text style={styles.browseTitle}>{t('packs.browseTitle')}</Text>
              <Text style={styles.browseSub}>{t('packs.browseSub')}</Text>
              <View style={styles.catalogRule} />
            </View>
            <CategoryTabBar />
            <FilterSortRow />
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('home.emptyCategory')}</Text>
          </View>
        }
        renderItem={({ item }) => <PackCard pack={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.homeGradientBottom,
  },
  catalogIntro: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  browseTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  browseSub: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 20,
  },
  catalogRule: {
    marginTop: spacing.md,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.headerHairline,
    alignSelf: 'stretch',
  },
  list: {
    paddingTop: 12,
    paddingBottom: 100,
    flexGrow: 1,
  },
  empty: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
