import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { AppHeader } from '../components/shared/AppHeader';
import { HeroBanner } from '../components/pack/HeroBanner';
import { CategoryTabBar } from '../components/pack/CategoryTabBar';
import { FilterSortRow } from '../components/pack/FilterSortRow';
import { PackCard } from '../components/pack/PackCard';
import { PackOpeningModal } from '../components/pack/PackOpeningModal';
import { WonPrizesModal } from '../components/pack/WonPrizesModal';
import { InsufficientCreditsModal } from '../components/shared/InsufficientCreditsModal';
import { BuyCreditsModal } from './BuyCreditsModal';
import { colors } from '../tokens/colors';
import { mockPacks } from '../data/mockPacks';
import { useAppStore } from '../store/useAppStore';

export function HomeScreen() {
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const sortOrder = useAppStore((s) => s.sortOrder);

  const filtered = mockPacks.filter(
    (p) => selectedCategory === 'all' || p.category === selectedCategory
  );

  const sorted = [...filtered].sort((a, b) => {
    switch (sortOrder) {
      case 'price_asc': return a.creditPrice - b.creditPrice;
      case 'price_desc': return b.creditPrice - a.creditPrice;
      case 'best_value': return b.remainingInventory / b.totalInventory - a.remainingInventory / a.totalInventory;
      default: return 0;
    }
  });

  return (
    <View style={styles.container}>
      <AppHeader />
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <HeroBanner />
            <CategoryTabBar />
            <FilterSortRow />
          </>
        }
        renderItem={({ item }) => <PackCard pack={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      <InsufficientCreditsModal />
      <BuyCreditsModal />
      <PackOpeningModal />
      <WonPrizesModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingTop: 0,
    paddingBottom: 100,
  },
});
