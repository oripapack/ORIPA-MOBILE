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
import { SgHomeHero } from '../components/home/sg/SgHomeHero';
import { SgHomePackCard } from '../components/home/sg/SgHomePackCard';
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
          <SgHomeHero
            pack={featuredPack}
            onOpen={onOpenFeatured}
            onBrowse={() => setHomeViewMode('browse')}
          />
          <SgTrustStrip />
          <SgRecentPulls />
          <View style={styles.sectionHeader}>
            <SgSectionHeader title="All Packs" />
            <Text style={styles.sectionSub}>Tap any pack to open or view details</Text>
          </View>
          <View style={styles.stack}>
            {gridPacks.map((pack) => (
              <SgHomePackCard key={pack.id} pack={pack} />
            ))}
          </View>
        </>
      ) : (
        <>
          <View style={styles.browseIntro}>
            <SgSectionHeader title="All Packs" />
            <Text style={styles.sectionSub}>{filteredPacks.length} packs available</Text>
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
          {homeNiche === 'all' && featuredPack ? <SgFeaturedRow pack={featuredPack} /> : null}
        </>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <SgShowroomBackground />
      <AppHeader onSearch={() => setSearchOpen(true)} />
      {homeViewMode === 'browse' ? (
        <FlatList<Pack>
          key="home-browse-list"
          data={filteredPacks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SgHomePackCard pack={item} />}
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
          key="home-discover"
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

/** Featured banner (browse mode) — same navigation behavior as the old PhFeaturedBanner. */
function SgFeaturedRow({ pack }: { pack: Pack }) {
  const goDetail = () => {
    if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: pack.id });
  };
  return (
    <Pressable onPress={goDetail} style={({ pressed }) => [styles.featuredRow, pressed && styles.featuredRowPressed]}>
      <View style={styles.featuredSatinTop} pointerEvents="none" />
      <View style={styles.featuredBody}>
        <Text style={styles.featuredEyebrow}>FEATURED</Text>
        <Text style={styles.featuredTitle} numberOfLines={1}>{pack.title}</Text>
      </View>
      <Text style={styles.featuredCta}>VIEW ›</Text>
    </Pressable>
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
  container: { flex: 1, backgroundColor: sg.showroom.bg },
  list: { paddingBottom: 100, paddingTop: 4, flexGrow: 1 },
  // Segmented mode switch — control role (radius 8), satin surface
  modeSwitchWrap: { paddingHorizontal: sg.space.md, paddingTop: sg.space.md },
  modeSwitch: {
    flexDirection: 'row',
    borderRadius: sg.radius.control + 2,
    padding: 3,
    backgroundColor: sg.showroom.surface,
  },
  modeBtn: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: sg.radius.control },
  modeBtnActive: { backgroundColor: sg.showroom.raised },
  modeBtnText: { fontFamily: sg.font.bodyMedium, fontSize: 13, color: sg.showroom.textMuted },
  modeBtnTextActive: { color: sg.showroom.text, fontFamily: sg.font.bodyBold },
  sectionHeader: { paddingHorizontal: sg.space.md, marginTop: sg.space.lg, marginBottom: sg.space.md },
  sectionSub: { fontFamily: sg.font.body, fontSize: 12, color: sg.showroom.textMuted, marginTop: 4 },
  stack: { paddingHorizontal: sg.space.md, paddingTop: 4, gap: 4 },
  browseIntro: { paddingHorizontal: sg.space.md, paddingTop: sg.space.md, paddingBottom: sg.space.sm },
  chipRow: { paddingHorizontal: sg.space.md, paddingVertical: sg.space.sm, gap: 8 },
  // Filter chips — control role (these are filters, not status chips → no pill)
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: sg.radius.control,
    backgroundColor: sg.showroom.surface,
  },
  chipActive: { backgroundColor: sg.showroom.raised },
  chipText: { fontFamily: sg.font.bodyMedium, fontSize: 13, color: sg.showroom.textMuted },
  chipTextActive: { color: sg.showroom.text, fontFamily: sg.font.bodyBold },
  featuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: sg.space.md,
    marginTop: sg.space.sm,
    marginBottom: sg.space.md,
    padding: sg.space.md,
    borderRadius: sg.radius.card,
    backgroundColor: sg.showroom.surface,
    overflow: 'hidden',
  },
  featuredRowPressed: { opacity: 0.92 },
  featuredSatinTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: sg.satinTopHighlight,
  },
  featuredBody: { flex: 1 },
  featuredEyebrow: { fontFamily: sg.font.bodyMedium, fontSize: 9, letterSpacing: 1.2, color: sg.brass },
  featuredTitle: { fontFamily: sg.font.bodyBold, fontSize: 14, color: sg.showroom.text, marginTop: 3 },
  featuredCta: { fontFamily: sg.font.bodyMedium, fontSize: 11, letterSpacing: 1, color: sg.showroom.textMuted },
  empty: { padding: sg.space.xl, alignItems: 'center' },
  emptyText: { fontFamily: sg.font.body, fontSize: 13, color: sg.showroom.textMuted },
});
