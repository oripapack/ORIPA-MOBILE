import React, { useMemo, useState } from 'react';
import { View, FlatList, SectionList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../components/shared/AppHeader';
import { HomeBackground } from '../components/shared/HomeBackground';
import { HeroBanner } from '../components/pack/HeroBanner';
import { DropLobbyHero } from '../components/home/DropLobbyHero';
import { LobbyPackRail } from '../components/home/LobbyPackRail';
import { LiveHitsStrip } from '../components/home/LiveHitsStrip';
import { CategoryTabBar } from '../components/pack/CategoryTabBar';
import { FilterSortRow } from '../components/pack/FilterSortRow';
import { PackSubfilterBar } from '../components/pack/PackSubfilterBar';
import { PackCard } from '../components/pack/PackCard';
import { GlobalSearchModal } from '../components/search/GlobalSearchModal';
import { HomeCoach } from '../components/coach/HomeCoach';
import { colors } from '../tokens/colors';
import {
  mockPacks,
  packBelongsToHomeNiche,
  packMatchesSubfilter,
  PACK_GROUPS,
  PACK_GROUP_META,
  type Pack,
  type PackGroup,
} from '../data/mockPacks';
import { useWelcomeBannerDismissed } from '../hooks/useWelcomeBannerDismissed';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useAppStore } from '../store/useAppStore';
import { fontSize, brandFont } from '../tokens/typography';
import { spacing, radius } from '../tokens/spacing';

// ---------------------------------------------------------------------------
// Section header for the "All" grouped view
// ---------------------------------------------------------------------------

function PackGroupHeader({ group }: { group: PackGroup }) {
  const { t } = useTranslation();
  const meta = PACK_GROUP_META[group];
  const label = t(meta.labelKey, { defaultValue: group });
  return (
    <View style={groupStyles.header}>
      <Text style={groupStyles.emoji}>{meta.emoji}</Text>
      <Text style={groupStyles.label}>{label}</Text>
    </View>
  );
}

const groupStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    fontSize: fontSize.base,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});

// ---------------------------------------------------------------------------
// HomeScreen
// ---------------------------------------------------------------------------

type SectionData = { group: PackGroup; data: Pack[] };

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

  // Discover rails always use all packs
  const discoverAll = mockPacks;

  const featured = useMemo(() => {
    const hot = discoverAll.find((p) => p.tags.includes('hot_drop') || p.tags.includes('chase_boost'));
    return hot ?? discoverAll[0] ?? null;
  }, []);

  const railNew = useMemo(
    () => discoverAll.filter((p) => p.tags.includes('new') || p.tags.includes('new_user') || p.tags.includes('first_time')).slice(0, 10),
    [],
  );
  const railHot = useMemo(
    () => discoverAll.filter((p) => p.tags.includes('hot_drop') || p.tags.includes('chase_boost') || p.tags.includes('low_cost')).slice(0, 10),
    [],
  );
  const railGraded = useMemo(
    () => discoverAll.filter((p) => p.tags.includes('graded') || p.tags.includes('premium_pack') || p.tags.includes('high_return')).slice(0, 10),
    [],
  );

  // Browse: filtered + sorted packs for specific-tab view
  const filteredSorted = useMemo(() => {
    const arr = mockPacks.filter(
      (p) => packBelongsToHomeNiche(p, homeNiche) && packMatchesSubfilter(p, packSubfilter),
    );
    switch (sortOrder) {
      case 'price_asc': return arr.sort((a, b) => a.creditPrice - b.creditPrice);
      case 'price_desc': return arr.sort((a, b) => b.creditPrice - a.creditPrice);
      default: return arr;
    }
  }, [homeNiche, packSubfilter, sortOrder]);

  // Browse "All" tab: packs grouped by PackGroup, empty groups omitted
  const groupedSections = useMemo<SectionData[]>(() => {
    if (homeNiche !== 'all') return [];
    return PACK_GROUPS.map((group) => ({
      group,
      data: mockPacks.filter((p) => p.packGroup === group),
    })).filter((s) => s.data.length > 0);
  }, [homeNiche]);

  const isAllTab = homeNiche === 'all';
  const handleBrowsePacks = () => {
    setHomeViewMode('browse');
    void dismissWelcome();
  };

  // Shared header rendered above both list variants
  const BrowseHeader = (
    <>
      <View style={styles.catalogIntro}>
        <Text style={styles.browseTitle}>{t('packs.browseTitle')}</Text>
        <Text style={styles.browseSub}>{t('packs.browseSub')}</Text>
        <View style={styles.catalogRule} />
      </View>
      <CategoryTabBar />
      {!isAllTab && <PackSubfilterBar />}
      {!isAllTab && <FilterSortRow />}
    </>
  );

  return (
    <View style={styles.container}>
      <HomeBackground />
      <AppHeader onSearch={() => setSearchOpen(true)} />

      {/* ------------------------------------------------------------------ */}
      {/* Mode-switch toggle + discover lobby — always in a FlatList header   */}
      {/* Browse "All" tab uses SectionList; specific tabs use FlatList       */}
      {/* ------------------------------------------------------------------ */}

      {homeViewMode === 'browse' && isAllTab ? (
        // ---- Grouped "All" SectionList ----
        <SectionList<Pack, SectionData>
          sections={groupedSections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PackCard pack={item} />}
          renderSectionHeader={({ section }) => <PackGroupHeader group={section.group} />}
          ListHeaderComponent={
            <>
              <ModeSwitchBar
                mode={homeViewMode}
                onDiscover={() => setHomeViewMode('discover')}
                onBrowse={() => setHomeViewMode('browse')}
                t={t}
              />
              {!welcomeLoading && !welcomeDismissed ? (
                <HeroBanner onBrowsePacks={handleBrowsePacks} onDismiss={() => void dismissWelcome()} />
              ) : null}
              {BrowseHeader}
            </>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('home.emptyCategory')}</Text>
            </View>
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={refreshControl}
        />
      ) : (
        // ---- Flat FlatList (discover or specific-tab browse) ----
        <FlatList<Pack>
          data={homeViewMode === 'browse' ? filteredSorted : []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PackCard pack={item} />}
          ListHeaderComponent={
            <>
              <ModeSwitchBar
                mode={homeViewMode}
                onDiscover={() => setHomeViewMode('discover')}
                onBrowse={() => setHomeViewMode('browse')}
                t={t}
              />
              {!welcomeLoading && !welcomeDismissed ? (
                <HeroBanner onBrowsePacks={handleBrowsePacks} onDismiss={() => void dismissWelcome()} />
              ) : null}
              {homeViewMode === 'discover' ? (
                <>
                  {featured ? (
                    <DropLobbyHero pack={featured} onBrowseFloor={() => setHomeViewMode('browse')} />
                  ) : null}
                  <LiveHitsStrip />
                  <LobbyPackRail titleKey="home.lobby.railNewTitle" subtitleKey="home.lobby.railNewSub" packs={railNew} railVariant="new" />
                  <LobbyPackRail titleKey="home.lobby.railHotTitle" subtitleKey="home.lobby.railHotSub" packs={railHot} railVariant="hot" />
                  <LobbyPackRail titleKey="home.lobby.railGradedTitle" subtitleKey="home.lobby.railGradedSub" packs={railGraded} railVariant="graded" />
                </>
              ) : (
                BrowseHeader
              )}
            </>
          }
          ListEmptyComponent={
            homeViewMode === 'browse' ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>{t('home.emptyCategory')}</Text>
              </View>
            ) : null
          }
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

// ---------------------------------------------------------------------------
// Mode switch toggle (extracted to avoid JSX duplication)
// ---------------------------------------------------------------------------

function ModeSwitchBar({
  mode,
  onDiscover,
  onBrowse,
  t,
}: {
  mode: 'discover' | 'browse';
  onDiscover: () => void;
  onBrowse: () => void;
  t: (key: string) => string;
}) {
  return (
    <View style={styles.modeSwitchWrap}>
      <View style={styles.modeSwitch}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'discover' && styles.modeBtnActive]}
          onPress={onDiscover}
          activeOpacity={0.85}
        >
          <Text style={[styles.modeBtnText, mode === 'discover' && styles.modeBtnTextActive]}>
            {t('home.discover')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'browse' && styles.modeBtnActive]}
          onPress={onBrowse}
          activeOpacity={0.85}
        >
          <Text style={[styles.modeBtnText, mode === 'browse' && styles.modeBtnTextActive]}>
            {t('home.browse')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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
    padding: 3,
    backgroundColor: colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  modeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 999,
  },
  modeBtnActive: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  modeBtnText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.textMuted,
  },
  modeBtnTextActive: {
    color: colors.textPrimary,
  },
  catalogIntro: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  browseTitle: {
    fontSize: fontSize.xl,
    fontFamily: brandFont.black,
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
