import React, { useMemo, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
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
import { SgSectionHeader } from '../components/ui';
import { sg } from '../tokens/sg';
import { navigationRef } from '../navigation/navigationRef';
import {
  mockPacks,
  packBelongsToHomeNiche,
  HOME_NICHE_CATEGORIES,
  type Pack,
  type HomeNicheCategory,
} from '../data/mockPacks';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useAppStore } from '../store/useAppStore';
import { useRequireAuth } from '../hooks/useRequireAuth';

/**
 * Shelf-first home: banner → filter chips → featured pack (fully visible
 * without scrolling at 440×956) → 2-column shelf → Just Pulled → trust strip.
 * The old Discover/Browse mode switch and niche/sort chips are removed;
 * "All" covers full-catalog browsing (niche chips return with real category
 * growth). Scarcity rules: real numbers only, low stock reads as `success`
 * stock semantics, no red / blinking / countdowns.
 */

type FilterKey = 'featured' | 'new' | 'low' | 'all';

const FILTER_KEYS: FilterKey[] = ['featured', 'new', 'low', 'all'];

function filterLabelKey(key: FilterKey): string {
  switch (key) {
    case 'featured':
      return 'home.filter.featured';
    case 'new':
      return 'home.filter.new';
    case 'low':
      return 'home.filter.lowStock';
    default:
      return 'home.filter.all';
  }
}

/** Filter threshold — broader than the 10% stock promotion so the chip is useful. */
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
    if (!featuredPack) return;
    requireAuth(() => { void openPack(featuredPack); }, { allowUnauthenticatedPackOpen: true });
  };

  const ListHeader = (
    <>
      <SgBannerCarousel />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {FILTER_KEYS.map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.chip, filter === key && styles.chipActive]}
            onPress={() => setFilter(key)}
          >
            <Text style={[styles.chipText, filter === key && styles.chipTextActive]}>
              {t(filterLabelKey(key))}
            </Text>
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

/** Featured banner (browse filters) — same navigation behavior as before. */
function SgFeaturedRow({ pack }: { pack: Pack }) {
  const { t } = useTranslation();
  const goDetail = () => {
    if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: pack.id });
  };
  return (
    <Pressable onPress={goDetail} style={({ pressed }) => [styles.featuredRow, pressed && styles.featuredRowPressed]}>
      <View style={styles.featuredBody}>
        <Text style={styles.featuredEyebrow}>{t('home.featured.eyebrow')}</Text>
        <Text style={styles.featuredTitle} numberOfLines={1}>{pack.title}</Text>
      </View>
      <Text style={styles.featuredCta}>{t('home.featured.cta')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: sg.bg },
  list: { paddingBottom: 100, flexGrow: 1 },
  chipRow: { paddingHorizontal: sg.space.md, paddingVertical: sg.space.sm, gap: 8 },
  // Filter chips — btn radius (these are controls, not status tags)
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: sg.radius.btn,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  chipActive: { backgroundColor: sg.surface2 },
  chipText: { fontFamily: sg.font.bodyMedium, fontSize: 13, color: sg.muted },
  chipTextActive: { color: sg.text, fontFamily: sg.font.bodyBold },
  shelfSpacer: { height: sg.space.md },
  shelfRow: { paddingHorizontal: sg.space.md, gap: sg.space.sm, marginBottom: sg.space.sm },
  featuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: sg.space.md,
    marginTop: sg.space.sm,
    marginBottom: sg.space.md,
    padding: sg.space.md,
    borderRadius: sg.radius.panel,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
    overflow: 'hidden',
  },
  featuredRowPressed: { opacity: 0.92 },
  featuredBody: { flex: 1 },
  featuredEyebrow: { fontFamily: sg.font.bodyMedium, fontSize: 9, letterSpacing: 1.2, color: sg.muted },
  featuredTitle: { fontFamily: sg.font.bodyBold, fontSize: 14, color: sg.text, marginTop: 3 },
  featuredCta: { fontFamily: sg.font.bodyMedium, fontSize: 11, letterSpacing: 1, color: sg.muted },
  empty: { padding: sg.space.xl, alignItems: 'center' },
  emptyText: { fontFamily: sg.font.body, fontSize: 13, color: sg.muted },
});
