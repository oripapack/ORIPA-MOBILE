import React, { useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../components/shared/AppHeader';
import { HomeBackground } from '../components/shared/HomeBackground';
import { HeroBanner } from '../components/pack/HeroBanner';
import { DropLobbyHero } from '../components/home/DropLobbyHero';
import { LobbyPackRail } from '../components/home/LobbyPackRail';
import { RecentHitsStrip } from '../components/home/RecentHitsStrip';
import { CategoryTabBar } from '../components/pack/CategoryTabBar';
import { FilterSortRow } from '../components/pack/FilterSortRow';
import { PackSubfilterBar } from '../components/pack/PackSubfilterBar';
import { PackCard } from '../components/pack/PackCard';
import { GlobalSearchModal } from '../components/search/GlobalSearchModal';
import { colors } from '../tokens/colors';
import { mockPacks, packBelongsToHomeNiche, packMatchesSubfilter } from '../data/mockPacks';
import { useWelcomeBannerDismissed } from '../hooks/useWelcomeBannerDismissed';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useAppStore } from '../store/useAppStore';
import { fontSize, fontWeight } from '../tokens/typography';
import { spacing } from '../tokens/spacing';

/**
 * Home = pack store: line tabs (Pokémon, Yu-Gi-Oh!, etc.), sub-filters within each line, sort, and list.
 */
export function HomeScreen() {
  const { t } = useTranslation();
  const { loading: welcomeLoading, isDismissed: welcomeDismissed, dismiss: dismissWelcome } =
    useWelcomeBannerDismissed();
  const { refreshControl } = usePullToRefresh();
  const homeNiche = useAppStore((s) => s.homeNiche);
  const homeViewMode = useAppStore((s) => s.homeViewMode);
  const setHomeViewMode = useAppStore((s) => s.setHomeViewMode);
  const packSubfilter = useAppStore((s) => s.packSubfilter);
  const sortOrder = useAppStore((s) => s.sortOrder);
  const [searchOpen, setSearchOpen] = useState(false);

  const nicheAll = useMemo(() => mockPacks.filter((p) => packBelongsToHomeNiche(p, homeNiche)), [homeNiche]);

  const featured = useMemo(() => {
    const hot = nicheAll.find((p) => p.tags.includes('hot_drop') || p.tags.includes('chase_boost'));
    return hot ?? nicheAll[0] ?? null;
  }, [nicheAll]);

  const railNew = useMemo(() => nicheAll.filter((p) => p.tags.includes('new') || p.tags.includes('new_user')).slice(0, 10), [nicheAll]);
  const railHot = useMemo(() => nicheAll.filter((p) => p.tags.includes('hot_drop') || p.tags.includes('chase_boost')).slice(0, 10), [nicheAll]);
  const railGraded = useMemo(() => nicheAll.filter((p) => p.tags.includes('graded')).slice(0, 10), [nicheAll]);
  const filtered = mockPacks.filter(
    (p) => packBelongsToHomeNiche(p, homeNiche) && packMatchesSubfilter(p, packSubfilter)
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
    setHomeViewMode('browse');
    void dismissWelcome();
  };

  return (
    <View style={styles.container}>
      <HomeBackground />
      <AppHeader onSearch={() => setSearchOpen(true)} />
      <FlatList
        data={homeViewMode === 'browse' ? sorted : []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.modeSwitchWrap}>
              <View style={styles.modeSwitch}>
                <TouchableOpacity
                  style={[styles.modeBtn, homeViewMode === 'discover' && styles.modeBtnActive]}
                  onPress={() => setHomeViewMode('discover')}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.modeBtnText, homeViewMode === 'discover' && styles.modeBtnTextActive]}>
                    {t('home.discover')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeBtn, homeViewMode === 'browse' && styles.modeBtnActive]}
                  onPress={() => setHomeViewMode('browse')}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.modeBtnText, homeViewMode === 'browse' && styles.modeBtnTextActive]}>
                    {t('home.browse')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {!welcomeLoading && !welcomeDismissed ? (
              <HeroBanner
                onBrowsePacks={handleBrowsePacks}
                onDismiss={() => void dismissWelcome()}
              />
            ) : null}

            {homeViewMode === 'discover' ? (
              <>
                {featured ? (
                  <DropLobbyHero
                    pack={featured}
                    onBrowseFloor={() => {
                      setHomeViewMode('browse');
                    }}
                  />
                ) : null}
                <RecentHitsStrip />
                <LobbyPackRail
                  titleKey="home.lobby.railNewTitle"
                  subtitleKey="home.lobby.railNewSub"
                  packs={railNew}
                  railVariant="new"
                />
                <LobbyPackRail
                  titleKey="home.lobby.railHotTitle"
                  subtitleKey="home.lobby.railHotSub"
                  packs={railHot}
                  railVariant="hot"
                />
                <LobbyPackRail
                  titleKey="home.lobby.railGradedTitle"
                  subtitleKey="home.lobby.railGradedSub"
                  packs={railGraded}
                  railVariant="graded"
                />
              </>
            ) : (
              <>
                <View style={styles.catalogIntro}>
                  <Text style={styles.browseTitle}>{t('packs.browseTitle')}</Text>
                  <Text style={styles.browseSub}>{t('packs.browseSub')}</Text>
                  <View style={styles.catalogRule} />
                </View>
                <CategoryTabBar />
                <PackSubfilterBar />
                <FilterSortRow />
              </>
            )}
          </>
        }
        ListEmptyComponent={homeViewMode === 'browse' ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('home.emptyCategory')}</Text>
          </View>
        ) : null}
        renderItem={({ item }) => <PackCard pack={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      />

      <GlobalSearchModal visible={searchOpen} onClose={() => setSearchOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.homeGradientBottom,
  },
  modeSwitchWrap: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  modeSwitch: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
    backgroundColor: 'rgba(12, 20, 10, 0.88)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.headerHairline,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(212,175,55,0.35)',
  },
  modeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 999,
  },
  modeBtnActive: {
    backgroundColor: 'rgba(232, 197, 71, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 71, 0.42)',
  },
  modeBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  modeBtnTextActive: {
    color: colors.gold,
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
