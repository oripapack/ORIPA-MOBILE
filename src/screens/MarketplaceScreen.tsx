import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  Modal,
  Pressable,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../components/shared/AppHeader';
import { SgScreen } from '../components/ui';
import { ListingCard } from '../components/marketplace/ListingCard';
import { WhyChoosePullHub } from '../components/marketplace/WhyChoosePullHub';
import { CardMarketListingRow } from '../components/marketplace/CardMarketListingRow';
import { sg } from '../tokens/sg';
import { radius, spacing } from '../tokens/spacing';
import {
  marketplaceStores,
  marketplaceListings,
  sortMarketplaceListings,
  filterListingsByRegion,
  getStoreById,
  type ListingCategory,
  type MarketplaceListing,
  type MarketplaceRegionFilterId,
  type MarketplaceSortId,
} from '../data/marketplace';
import { demoMarketplacePromoImage } from '../data/demoMedia';
import { navigationRef } from '../navigation/navigationRef';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { ShopCoach } from '../components/coach/ShopCoach';
import { useAppStore } from '../store/useAppStore';
import { getAllCardMarketListings } from '../lib/friendVaultShop';

type MarketTab = 'packs' | 'cards';

// Screen-local migration adapter: active marketplace UI uses the N2 faces.
const fontSize = { xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24 } as const;
const brandFont = {
  medium: sg.font.bodyMedium,
  semibold: sg.font.bodyMedium,
  bold: sg.font.bodyBold,
  black: sg.font.bodyBold,
} as const;

const CARD_SORT_OPTIONS = [
  { key: 'price_low', label: 'Price ↑' },
  { key: 'price_high', label: 'Price ↓' },
] as const;
type CardSortKey = (typeof CARD_SORT_OPTIONS)[number]['key'];

const CATEGORY_KEYS: (ListingCategory | 'all')[] = [
  'all',
  'pokemon',
  'one_piece',
  'yugioh',
  'sports',
];

const SORT_IDS: MarketplaceSortId[] = [
  'recommended',
  'newest',
  'price_low',
  'price_high',
  'sale_first',
];

const REGION_FILTER_IDS: MarketplaceRegionFilterId[] = ['all', 'us', 'japan', 'europe'];

export function MarketplaceScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { requireAuth } = useRequireAuth();
  const searchRef = useRef<TextInput>(null);
  const [marketTab, setMarketTab] = useState<MarketTab>('packs');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ListingCategory | 'all'>('all');
  const [sort, setSort] = useState<MarketplaceSortId>('recommended');
  const [regionFilter, setRegionFilter] = useState<MarketplaceRegionFilterId>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [cardSort, setCardSort] = useState<CardSortKey>('price_low');
  const [cardQuery, setCardQuery] = useState('');

  // Card marketplace data
  const friendVaultShopByUser = useAppStore((s) => s.friendVaultShopByUser);
  const currentUsername = useAppStore((s) => s.user.username);

  const allCardListings = useMemo(
    () => getAllCardMarketListings(friendVaultShopByUser),
    [friendVaultShopByUser],
  );

  const filteredCardListings = useMemo(() => {
    const q = cardQuery.trim().toLowerCase();
    let list = q
      ? allCardListings.filter((l) =>
          `${l.result} ${l.packTitle} ${l.sellerUsername}`.toLowerCase().includes(q),
        )
      : allCardListings;

    if (cardSort === 'price_low') {
      list = [...list].sort((a, b) => a.listPriceUsd - b.listPriceUsd);
    } else if (cardSort === 'price_high') {
      list = [...list].sort((a, b) => b.listPriceUsd - a.listPriceUsd);
    }
    return list;
  }, [allCardListings, cardQuery, cardSort]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (sort !== 'recommended') n += 1;
    if (regionFilter !== 'all') n += 1;
    return n;
  }, [sort, regionFilter]);

  const storeNameById = useMemo(() => {
    const m = new Map<string, string>();
    marketplaceStores.forEach((s) => m.set(s.id, s.name));
    return m;
  }, []);

  const filteredListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return marketplaceListings.filter((l) => {
      if (category !== 'all' && l.category !== category) return false;
      if (!q) return true;
      const storeName = storeNameById.get(l.storeId) ?? '';
      const hay = `${l.title} ${l.subtitle} ${storeName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, category, storeNameById]);

  const regionFilteredListings = useMemo(
    () => filterListingsByRegion(filteredListings, regionFilter),
    [filteredListings, regionFilter],
  );

  const sortedListings = useMemo(
    () =>
      sortMarketplaceListings(regionFilteredListings, sort, {
        regionFilterAllWithLocalBoost: regionFilter === 'all' && sort === 'recommended',
      }),
    [regionFilteredListings, sort, regionFilter],
  );

  const saleListings = useMemo(
    () => sortedListings.filter((l) => l.badge === 'sale'),
    [sortedListings],
  );

  const storeSections = useMemo(() => {
    return marketplaceStores
      .map((store) => {
        const rows = sortedListings.filter((l) => {
          if (l.storeId !== store.id) return false;
          if (saleListings.length > 0 && l.badge === 'sale') return false;
          return true;
        });
        if (rows.length === 0) return null;
        const inv = sortedListings.filter((l) => l.storeId === store.id).length;
        return { store, rows, inv };
      })
      .filter((s): s is NonNullable<typeof s> => s != null);
  }, [sortedListings, saleListings]);

  const resetBrowse = () => {
    setQuery('');
    setCategory('all');
    setSort('recommended');
    setRegionFilter('all');
    setFiltersOpen(false);
    Keyboard.dismiss();
  };

  const hasResults = sortedListings.length > 0;

  const regionShortLabel = (storeId: string) => {
    const s = getStoreById(storeId);
    return s ? t(`marketplace.regionPill.${s.fulfillmentRegion}`) : undefined;
  };

  const shipsFromLineForStore = (store: (typeof marketplaceStores)[number]) =>
    t('marketplace.shipsFromLine', { place: t(`marketplace.shipsFromPlace.${store.fulfillmentRegion}`) });

  const onListingPress = (listing: MarketplaceListing) => {
    requireAuth(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('PaymentPortal', {
          initialTab: 'marketplace',
          listingTitle: listing.title,
          listingPrice: listing.price,
        });
      }
    });
  };

  return (
    <SgScreen>
      <AppHeader onSearch={() => searchRef.current?.focus()} />

      {/* Market tab switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, marketTab === 'packs' && styles.tabBtnActive]}
          onPress={() => setMarketTab('packs')}
          activeOpacity={0.85}
          accessibilityRole="tab"
          accessibilityState={{ selected: marketTab === 'packs' }}
        >
          <View style={styles.tabLabelRow}>
            <Ionicons
              name="cube-outline"
              size={16}
              color={marketTab === 'packs' ? sg.text : sg.muted}
            />
            <Text style={[styles.tabBtnText, marketTab === 'packs' && styles.tabBtnTextActive]}>
              Packs
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, marketTab === 'cards' && styles.tabBtnActive]}
          onPress={() => setMarketTab('cards')}
          activeOpacity={0.85}
          accessibilityRole="tab"
          accessibilityState={{ selected: marketTab === 'cards' }}
        >
          <View style={styles.tabLabelRow}>
            <Ionicons
              name="albums-outline"
              size={16}
              color={marketTab === 'cards' ? sg.text : sg.muted}
            />
            <Text style={[styles.tabBtnText, marketTab === 'cards' && styles.tabBtnTextActive]}>
              Cards
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Cards marketplace ─────────────────────────────────── */}
      {marketTab === 'cards' ? (
        <View style={styles.cardMarketRoot}>
          {/* Header */}
          <Text style={styles.cardMarketTitle}>Card Market</Text>
          <Text style={styles.cardMarketLead}>
            {filteredCardListings.length} listing{filteredCardListings.length !== 1 ? 's' : ''} · Peer-to-peer card trading
          </Text>

          {/* Search */}
          <View style={styles.searchShell}>
            <Ionicons name="search" size={18} color={sg.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cards, packs, sellers…"
              placeholderTextColor={sg.muted}
              value={cardQuery}
              onChangeText={setCardQuery}
              returnKeyType="search"
            />
            {cardQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setCardQuery('')} hitSlop={12}>
                <Ionicons name="close-circle" size={20} color={sg.muted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Sort chips */}
          <View style={styles.cardSortRow}>
            {CARD_SORT_OPTIONS.map((opt) => {
              const active = cardSort === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.sortPill, active && styles.sortPillActive]}
                  onPress={() => setCardSort(opt.key)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.sortPillText, active && styles.sortPillTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Listings */}
          <FlatList
            data={filteredCardListings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CardMarketListingRow
                listing={item}
                isOwnListing={item.sellerUsername === currentUsername}
              />
            )}
            contentContainerStyle={[
              styles.cardListContent,
              { paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.cardEmptyWrap}>
                <Ionicons name="albums-outline" size={42} color={sg.muted} style={styles.cardEmptyIcon} />
                <Text style={styles.cardEmptyTitle}>No cards found</Text>
                <Text style={styles.cardEmptyBody}>
                  List your vault cards for sale to get them here.
                </Text>
              </View>
            }
          />
        </View>
      ) : null}

      {/* ── Pack store ────────────────────────────────────────── */}
      {marketTab === 'packs' ? (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={[styles.pageTitle, { paddingTop: spacing.sm }]}>{t('marketplace.storeTitle')}</Text>
        <Text style={styles.lead}>{t('marketplace.storeLead')}</Text>

        <View style={styles.searchShell}>
          <Ionicons name="search" size={18} color={sg.muted} style={styles.searchIcon} />
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            placeholder={t('marketplace.searchPlaceholder')}
            placeholderTextColor={sg.muted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
            accessibilityLabel={t('marketplace.searchA11yLabel')}
          />
          {query.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                searchRef.current?.focus();
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('marketplace.clearSearchA11y')}
            >
              <Ionicons name="close-circle" size={20} color={sg.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.catRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.catScrollFlex}
            contentContainerStyle={styles.catScroll}
          >
            {CATEGORY_KEYS.map((key) => {
              const active = category === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.catChip, active && styles.catChipActive]}
                  onPress={() => setCategory(key)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                    {t(`marketplace.cat_${key}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            style={styles.filterFab}
            onPress={() => {
              Keyboard.dismiss();
              setFiltersOpen(true);
            }}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.openFiltersA11y')}
          >
            <Ionicons name="options-outline" size={22} color={sg.text} />
            {activeFilterCount > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {hasResults ? (
          <View accessibilityLiveRegion="polite">
            <Text style={styles.resultsMeta}>{t('marketplace.resultsCount', { count: sortedListings.length })}</Text>
          </View>
        ) : null}

        {/* Sale row */}
        {saleListings.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('marketplace.specialPrice')}</Text>
              <View style={styles.saleTag}>
                <Text style={styles.saleTagText}>{t('marketplace.saleOn')}</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hRow}
            >
              {saleListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  shipsFromShort={regionFilter === 'all' ? regionShortLabel(listing.storeId) : undefined}
                  onPress={() => onListingPress(listing)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {storeSections.length > 0 ? (
          <>
            <Text style={styles.sectionEyebrow}>{t('marketplace.sectionStores')}</Text>
            {storeSections.map(({ store, rows, inv }) => (
              <View key={store.id} style={styles.storeBlock}>
                <View style={styles.storeHeader}>
                  <View style={styles.storeTitleRow}>
                    <Text style={styles.storeName}>{store.name}</Text>
                    {store.verified ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={sg.gold}
                        accessibilityLabel={t('marketplace.verified')}
                        style={styles.verifiedIcon}
                      />
                    ) : null}
                  </View>

                  <Text style={styles.storeShipsFrom}>{shipsFromLineForStore(store)}</Text>
                  {store.crossBorderKey ? (
                    <Text style={styles.storeCrossBorder}>
                      {t(`marketplace.storeCrossBorder.${store.crossBorderKey}`)}
                    </Text>
                  ) : null}

                  <Text style={styles.storeMetaLine}>
                    {t('marketplace.inventoryCount', { count: inv })}{' '}
                    <Text style={styles.storeMetaDot}>·</Text>{' '}
                    {t(`marketplace.storeShipping.${store.shippingKey}`)}
                  </Text>

                  <Text style={styles.storeSpecialty}>{t(`marketplace.storeSpecialty.${store.specialtyKey}`)}</Text>
                  <Text style={styles.storeTagline}>{store.tagline}</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hRowStore}
                >
                  {rows.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      shipsFromShort={regionFilter === 'all' ? regionShortLabel(listing.storeId) : undefined}
                      onPress={() => onListingPress(listing)}
                    />
                  ))}
                </ScrollView>
              </View>
            ))}
          </>
        ) : null}

        {!hasResults ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>{t('marketplace.emptyTitle')}</Text>
            <Text style={styles.emptyHint}>{t('marketplace.emptyHint')}</Text>
            <TouchableOpacity style={styles.emptyCta} onPress={resetBrowse} activeOpacity={0.88}>
              <Text style={styles.emptyCtaText}>{t('marketplace.emptyClearCta')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {hasResults ? (
          <>
            <View style={styles.promoCompact}>
              <Image
                source={{ uri: demoMarketplacePromoImage }}
                style={styles.promoThumb}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
              <View style={styles.promoCopy}>
                <Text style={styles.promoEyebrow}>{t('marketplace.promoEyebrow')}</Text>
                <Text style={styles.promoTitle} numberOfLines={1}>
                  {t('marketplace.promoTitle')}
                </Text>
                <Text style={styles.promoBody} numberOfLines={2}>
                  {t('marketplace.promoBody')}
                </Text>
              </View>
            </View>

            <WhyChoosePullHub />

            <View style={styles.demoNote}>
              <Text style={styles.demoNoteText}>{t('marketplace.demoNote')}</Text>
            </View>
          </>
        ) : (
          <View style={[styles.demoNote, styles.demoNoteEmpty]}>
            <Text style={styles.demoNoteText}>{t('marketplace.demoNote')}</Text>
          </View>
        )}
      </ScrollView>
      ) : null}

      <Modal
        visible={filtersOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFiltersOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setFiltersOpen(false)} />
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.modalGrabber} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{t('marketplace.filtersModalTitle')}</Text>
              <TouchableOpacity
                onPress={() => setFiltersOpen(false)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('marketplace.filtersDone')}
              >
                <Ionicons name="close" size={26} color={sg.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionLabel}>{t('marketplace.sortRowLabel')}</Text>
            <View style={styles.modalChipWrap}>
              {SORT_IDS.map((id) => {
                const active = sort === id;
                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.sortChip, active && styles.sortChipActive]}
                    onPress={() => setSort(id)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
                      {t(`marketplace.sort_${id}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.modalSectionLabel, styles.modalSectionLabelSpaced]}>
              {t('marketplace.regionRowLabel')}
            </Text>
            <View style={styles.modalChipWrap}>
              {REGION_FILTER_IDS.map((id) => {
                const active = regionFilter === id;
                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.regionChip, active && styles.regionChipActive]}
                    onPress={() => setRegionFilter(id)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.regionChipText, active && styles.regionChipTextActive]}>
                      {t(`marketplace.region_${id}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={() => {
                  setSort('recommended');
                  setRegionFilter('all');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalResetText}>{t('marketplace.filtersReset')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDoneBtn} onPress={() => setFiltersOpen(false)} activeOpacity={0.88}>
                <Text style={styles.modalDoneText}>{t('marketplace.filtersDone')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ShopCoach />
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: sg.bg,
  },
  // ── Tab switcher ──
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: sg.surface2,
    borderRadius: radius.lg,
    padding: 3,
    borderWidth: 1,
    borderColor: sg.line,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.30)',
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
  },
  tabBtnText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: sg.muted,
  },
  tabBtnTextActive: {
    color: sg.text,
    fontFamily: brandFont.bold,
  },
  // ── Card marketplace ──
  cardMarketRoot: {
    flex: 1,
    paddingHorizontal: spacing.base,
  },
  cardMarketTitle: {
    fontSize: 26,
    fontFamily: sg.font.display,
    color: sg.text,
    letterSpacing: -0.3,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  cardMarketLead: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  cardSortRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sortPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
  },
  sortPillActive: {
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderColor: 'rgba(212,175,55,0.38)',
  },
  sortPillText: {
    fontSize: 12,
    fontFamily: brandFont.semibold,
    color: sg.muted,
  },
  sortPillTextActive: {
    color: sg.gold,
  },
  cardListContent: {
    paddingTop: spacing.xs,
  },
  cardEmptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  cardEmptyIcon: {
    marginBottom: spacing.md,
  },
  cardEmptyTitle: {
    fontSize: fontSize.md,
    fontFamily: brandFont.bold,
    color: sg.text,
    marginBottom: spacing.xs,
  },
  cardEmptyBody: {
    fontSize: fontSize.sm,
    color: sg.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  // ── Pack store (existing) ──
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 0,
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: sg.font.display,
    color: sg.text,
    paddingHorizontal: spacing.base,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  lead: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    minHeight: 44,
    borderRadius: radius.lg,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: sg.text,
    paddingVertical: spacing.sm,
    minWidth: 0,
  },
  resultsMeta: {
    fontSize: 11,
    fontFamily: brandFont.semibold,
    color: sg.muted,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingLeft: spacing.base,
    paddingRight: spacing.xs,
  },
  catScrollFlex: {
    flex: 1,
    minWidth: 0,
  },
  catScroll: {
    gap: 8,
    paddingRight: spacing.xs,
    paddingVertical: 2,
  },
  filterFab: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: sg.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: sg.bg,
  },
  filterBadgeText: {
    fontSize: 9,
    fontFamily: brandFont.black,
    color: sg.surface2,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.5)',
  },
  modalSheet: {
    backgroundColor: sg.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: sg.line,
  },
  modalGrabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: sg.line,
    marginBottom: spacing.md,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: sg.text,
    flex: 1,
    paddingRight: spacing.sm,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: sg.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  modalSectionLabelSpaced: {
    marginTop: spacing.md,
  },
  modalChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalResetBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  modalResetText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: sg.muted,
  },
  modalDoneBtn: {
    flex: 1,
    backgroundColor: sg.surface2,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalDoneText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: sg.text,
  },
  catChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
  },
  catChipActive: {
    backgroundColor: sg.surface2,
    borderWidth: 1.5,
    borderColor: sg.gold,
  },
  catChipText: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.semibold,
    color: sg.muted,
  },
  catChipTextActive: {
    color: sg.gold,
    fontFamily: brandFont.bold,
  },
  sortChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.md,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  sortChipActive: {
    borderColor: 'rgba(212,175,55,0.38)',
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  sortChipText: {
    fontSize: 11,
    fontFamily: brandFont.semibold,
    color: sg.muted,
  },
  sortChipTextActive: {
    color: sg.gold,
  },
  regionChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.md,
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
  },
  regionChipActive: {
    borderColor: sg.gold,
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  regionChipText: {
    fontSize: 11,
    fontFamily: brandFont.semibold,
    color: sg.muted,
  },
  regionChipTextActive: {
    color: sg.gold,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: sg.font.display,
    color: sg.text,
  },
  saleTag: {
    backgroundColor: sg.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  saleTagText: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: sg.text,
    letterSpacing: 0.5,
  },
  hRow: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xs,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontFamily: brandFont.bold,
    color: sg.muted,
    letterSpacing: 0.2,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  storeBlock: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  storeHeader: {
    marginBottom: spacing.sm,
  },
  hRowStore: {
    paddingBottom: spacing.xs,
    marginHorizontal: -2,
  },
  storeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  storeName: {
    fontSize: fontSize.md,
    fontFamily: brandFont.black,
    color: sg.text,
  },
  verifiedIcon: {
    marginTop: 1,
  },
  storeShipsFrom: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: sg.text,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  storeCrossBorder: {
    fontSize: 10,
    color: sg.muted,
    marginBottom: 4,
    lineHeight: 15,
  },
  storeMetaLine: {
    fontSize: 11,
    color: sg.muted,
    fontFamily: brandFont.medium,
    marginBottom: 2,
  },
  storeMetaDot: {
    color: sg.muted,
  },
  storeSpecialty: {
    fontSize: 11,
    color: sg.muted,
    marginBottom: 4,
    fontFamily: brandFont.semibold,
  },
  storeTagline: {
    fontSize: fontSize.xs,
    color: sg.muted,
    marginBottom: 2,
    lineHeight: 18,
  },
  emptyWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontFamily: brandFont.bold,
    color: sg.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: fontSize.xs,
    color: sg.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  emptyCta: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.38)',
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  emptyCtaText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: sg.gold,
  },
  promoCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
    gap: spacing.sm,
  },
  promoThumb: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: sg.line,
  },
  promoCopy: {
    flex: 1,
  },
  promoEyebrow: {
    fontSize: 9,
    fontFamily: brandFont.bold,
    color: sg.muted,
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  promoTitle: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: sg.gold,
    marginBottom: 2,
  },
  promoBody: {
    fontSize: 10,
    color: sg.muted,
    lineHeight: 15,
  },
  demoNoteEmpty: {
    marginTop: spacing.md,
  },
  demoNote: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(111,191,143,0.35)',
    backgroundColor: 'rgba(111,191,143,0.12)',
  },
  demoNoteText: {
    fontSize: 10,
    color: sg.success,
    lineHeight: 16,
    textAlign: 'center',
  },
});
