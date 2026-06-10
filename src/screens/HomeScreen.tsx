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
import { PhHomeHero } from '../components/ph/PhHomeHero';
import { PhRecentPulls } from '../components/ph/PhRecentPulls';
import { PhPackCard } from '../components/ph/PhPackCard';
import { PhFeaturedBanner } from '../components/ph/PhFeaturedBanner';
import { ph } from '../tokens/phTheme';
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
import { fontSize, brandFont } from '../tokens/typography';
import { spacing } from '../tokens/spacing';

type SortKey = 'featured' | 'price_asc' | 'price_desc' | 'low_stock';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
  { key: 'low_stock', label: 'Low Stock' },
];

const NICHE_LABELS: Record<HomeNicheCategory, string> = {
  all: 'All Packs',
  pokemon: 'Pokémon',
  one_piece: 'One Piece',
  yugioh: 'Yu-Gi-Oh!',
  sports: 'Sports',
  multi: 'Multi TCG',
};

export function HomeScreen() {
  const { t } = useTranslation();
  const { refreshControl } = usePullToRefresh();
  const { requireAuth } = useRequireAuth();
  const homeViewMode = useAppStore((s) => s.homeViewMode);
  const setHomeViewMode = useAppStore((s) => s.setHomeViewMode);
  const homeNiche = useAppStore((s) => s.homeNiche);
  const setHomeNiche = useAppStore((s) => s.setHomeNiche);
  const openPack = useAppStore((s) => s.openPack);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('featured');

  const featuredPack = useMemo(
    () => mockPacks.find((p) => p.isFeatured && p.id === 'platinum-legacy') ?? mockPacks.find((p) => p.isFeatured) ?? mockPacks[0]!,
    [],
  );

  const filteredPacks = useMemo(() => {
    let arr = mockPacks.filter((p) => packBelongsToHomeNiche(p, homeNiche));
    switch (sortKey) {
      case 'price_asc': arr = [...arr].sort((a, b) => a.creditPrice - b.creditPrice); break;
      case 'price_desc': arr = [...arr].sort((a, b) => b.creditPrice - a.creditPrice); break;
      case 'low_stock': arr = [...arr].sort((a, b) => (a.remainingFraction ?? 1) - (b.remainingFraction ?? 1)); break;
      default: arr = [...arr].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)); break;
    }
    return arr;
  }, [homeNiche, sortKey]);

  const gridPacks = useMemo(() => mockPacks.slice(0, 6), []);

  const onOpenFeatured = () => {
    if (!featuredPack) return;
    requireAuth(() => { void openPack(featuredPack); });
  };

  const ListHeader = (
    <>
      <ModeSwitchBar
        mode={homeViewMode}
        onDiscover={() => setHomeViewMode('discover')}
        onBrowse={() => setHomeViewMode('browse')}
      />

      {homeViewMode === 'discover' ? (
        <>
          <PhHomeHero
            pack={featuredPack}
            onOpen={onOpenFeatured}
            onBrowse={() => setHomeViewMode('browse')}
          />
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Open packs</Text>
            <Text style={styles.sectionSub}>Tap any pack to open or view details</Text>
          </View>
          <View style={styles.grid}>
            {gridPacks.map((pack) => (
              <PhPackCard key={pack.id} pack={pack} />
            ))}
          </View>
          <PhRecentPulls />
        </>
      ) : (
        <>
          <View style={styles.browseIntro}>
            <Text style={styles.browseTitle}>All packs</Text>
            <Text style={styles.browseSub}>{filteredPacks.length} packs available</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {HOME_NICHE_CATEGORIES.map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.chip, homeNiche === key && styles.chipActive]}
                onPress={() => setHomeNiche(key)}
              >
                <Text style={[styles.chipText, homeNiche === key && styles.chipTextActive]}>
                  {NICHE_LABELS[key]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.chip, sortKey === opt.key && styles.chipActive]}
                onPress={() => setSortKey(opt.key)}
              >
                <Text style={[styles.chipText, sortKey === opt.key && styles.chipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {homeNiche === 'all' && featuredPack ? <PhFeaturedBanner pack={featuredPack} /> : null}
        </>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <AppHeader onSearch={() => setSearchOpen(true)} />
      {homeViewMode === 'browse' ? (
        <FlatList<Pack>
          data={filteredPacks}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => <PhPackCard pack={item} />}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('home.emptyCategory')}</Text>
            </View>
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        />
      ) : (
        <FlatList<Pack>
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        />
      )}
      <GlobalSearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
      <HomeCoach />
    </View>
  );
}

function ModeSwitchBar({
  mode,
  onDiscover,
  onBrowse,
}: {
  mode: 'discover' | 'browse';
  onDiscover: () => void;
  onBrowse: () => void;
}) {
  return (
    <View style={styles.modeSwitchWrap}>
      <View style={styles.modeSwitch}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'discover' && styles.modeBtnActive]}
          onPress={onDiscover}
          activeOpacity={0.85}
        >
          <Text style={[styles.modeBtnText, mode === 'discover' && styles.modeBtnTextActive]}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'browse' && styles.modeBtnActive]}
          onPress={onBrowse}
          activeOpacity={0.85}
        >
          <Text style={[styles.modeBtnText, mode === 'browse' && styles.modeBtnTextActive]}>Browse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ph.bg },
  list: { paddingBottom: 100, flexGrow: 1 },
  modeSwitchWrap: { paddingHorizontal: spacing.base, paddingTop: spacing.base },
  modeSwitch: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 3,
    backgroundColor: ph.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ph.border,
  },
  modeBtn: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 999 },
  modeBtnActive: { backgroundColor: ph.surfaceHigh, borderWidth: StyleSheet.hairlineWidth, borderColor: ph.borderMd },
  modeBtnText: { fontSize: fontSize.sm, fontFamily: brandFont.semibold, color: ph.textMuted },
  modeBtnTextActive: { color: ph.text },
  sectionHeader: { paddingHorizontal: spacing.base, marginTop: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.xl, fontFamily: brandFont.black, color: ph.text },
  sectionSub: { fontSize: fontSize.sm, color: ph.textSec, marginTop: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.base,
    justifyContent: 'space-between',
  },
  gridRow: { paddingHorizontal: spacing.base, justifyContent: 'space-between' },
  browseIntro: { paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.sm },
  browseTitle: { fontSize: fontSize.xl, fontFamily: brandFont.black, color: ph.text },
  browseSub: { fontSize: fontSize.sm, color: ph.textSec, marginTop: 2 },
  chipRow: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: ph.surface,
    borderWidth: 1,
    borderColor: ph.border,
  },
  chipActive: { backgroundColor: ph.greenSoft, borderColor: ph.greenBorder },
  chipText: { fontSize: fontSize.sm, fontFamily: brandFont.semibold, color: ph.textSec },
  chipTextActive: { color: ph.green },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: fontSize.sm, color: ph.textMuted },
});
