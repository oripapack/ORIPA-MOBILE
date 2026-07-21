import React, { useMemo, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../components/shared/AppHeader';
import { GlobalSearchModal } from '../components/search/GlobalSearchModal';
import { HomeCoach } from '../components/coach/HomeCoach';
import { SgShowroomBackground } from '../components/home/sg/SgShowroomBackground';
import { SgBannerCarousel } from '../components/home/sg/SgBannerCarousel';
import { SgFeaturedPackCard } from '../components/home/sg/SgFeaturedPackCard';
import { SgShelfPackTile } from '../components/home/sg/SgShelfPackTile';
import { SgRecentPulls } from '../components/home/sg/SgRecentPulls';
import { SgTrustStrip } from '../components/home/sg/SgTrustStrip';
import { sg } from '../tokens/sg';
import { mockPacks, type Pack } from '../data/mockPacks';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useAppStore } from '../store/useAppStore';
import { useRequireAuth } from '../hooks/useRequireAuth';

/**
 * Shelf-first home: banner → filter chips → featured pack (fully visible
 * without scrolling at 440×956) → 2-column shelf → Just Pulled → trust strip.
 * The old Discover/Browse mode switch and niche/sort chips are removed;
 * "All" covers full-catalog browsing (niche chips return with real category
 * growth). Scarcity rules: real numbers only, brass promotion below 10%,
 * no red / blinking / countdowns.
 */

type FilterKey = 'featured' | 'new' | 'low' | 'all';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'new', label: 'New' },
  { key: 'low', label: 'Low stock' },
  { key: 'all', label: 'All' },
];

/** Filter threshold — broader than the 10% brass promotion so the chip is useful. */
const LOW_STOCK_FILTER_FRACTION = 0.25;

function packFraction(p: Pack): number {
  return p.remainingFraction ?? p.remainingInventory / Math.max(p.totalInventory, 1);
}

export function HomeScreen() {
  const { t } = useTranslation();
  const { refreshControl } = usePullToRefresh();
  const { requireAuth } = useRequireAuth();
  const openPack = useAppStore((s) => s.openPack);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');

  const featuredPack = useMemo(
    () => mockPacks.find((p) => p.isFeatured && p.id === 'platinum-legacy') ?? mockPacks.find((p) => p.isFeatured) ?? mockPacks[0]!,
    [],
  );

  const shelfPacks = useMemo(() => {
    const pool = mockPacks.filter((p) => p.id !== featuredPack.id);
    switch (filter) {
      case 'featured': return pool.filter((p) => p.isFeatured);
      case 'new': return pool.filter((p) => p.isNew);
      case 'low': return pool.filter((p) => packFraction(p) < LOW_STOCK_FILTER_FRACTION);
      default: return pool;
    }
  }, [filter, featuredPack.id]);

  const onOpenFeatured = () => {
    requireAuth(() => { void openPack(featuredPack); });
  };

  const ListHeader = (
    <>
      <SgBannerCarousel />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <SgFeaturedPackCard pack={featuredPack} onOpen={onOpenFeatured} />
      <View style={styles.shelfSpacer} />
    </>
  );

  const ListFooter = (
    <>
      <SgRecentPulls />
      <SgTrustStrip />
    </>
  );

  return (
    <View style={styles.container}>
      <SgShowroomBackground />
      <AppHeader onSearch={() => setSearchOpen(true)} />
      <FlatList<Pack>
        key="home-shelf"
        data={shelfPacks}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SgShelfPackTile pack={item} />}
        columnWrapperStyle={styles.shelfRow}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('home.emptyCategory')}</Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      />
      <GlobalSearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
      <HomeCoach />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: sg.showroom.bg },
  list: { paddingBottom: 100, flexGrow: 1 },
  chipRow: { paddingHorizontal: sg.space.md, paddingVertical: sg.space.sm, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: sg.radius.control,
    backgroundColor: sg.showroom.surface,
  },
  chipActive: { backgroundColor: sg.showroom.raised },
  chipText: { fontFamily: sg.font.bodyMedium, fontSize: 13, color: sg.showroom.textMuted },
  chipTextActive: { color: sg.showroom.text, fontFamily: sg.font.bodyBold },
  shelfSpacer: { height: sg.space.md },
  shelfRow: { paddingHorizontal: sg.space.md, gap: sg.space.sm, marginBottom: sg.space.sm },
  empty: { padding: sg.space.xl, alignItems: 'center' },
  emptyText: { fontFamily: sg.font.body, fontSize: 13, color: sg.showroom.textMuted },
});
