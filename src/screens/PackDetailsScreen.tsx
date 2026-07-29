import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../tokens/colors';
import { ph } from '../tokens/phTheme';
import { PackVisual } from '../components/ph/PackVisual';
import { BuybackBadge, StatusBadge } from '../components/ph/PhBadge';
import { PhProgressBar } from '../components/ph/PhProgressBar';
import { fontSize, brandFont } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { screenRoot, screenScroll, screenFooter } from '../tokens/layout';
import { navigationRef } from '../navigation/navigationRef';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useAppStore, type PackOpenQuantity } from '../store/useAppStore';
import { useMembershipSimulationStore } from '../store/membershipSimulationStore';
import { membershipMeetsRequired } from '../data/membershipPlans';
import { mockPacks, type Pack } from '../data/mockPacks';
import { getLocalizedPackFields } from '../i18n/packCopy';
import { PackOddsModal } from '../components/pack/PackOddsModal';
import { PackOpenQuantitySelector } from '../components/pack/PackOpenQuantitySelector';
import { PackMultiOpenSummary } from '../components/pack/PackMultiOpenSummary';
import { PackRushConfirmModal } from '../components/pack/PackRushConfirmModal';
import { packOpenTotalCredits } from '../lib/packMultiOpen';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';
import { EMPTY_PACK_ODDS, getMockPackOdds } from '../data/mockPackOdds';
import { getMockPackTopHit } from '../data/mockTopHits';
import { showUserMessage } from '../utils/showUserMessage';

type Props = {
  route: { params: { packId: string } };
};

export function PackDetailsScreen({ route }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { requireAuth } = useRequireAuth();
  const openPack = useAppStore((s) => s.openPack);
  const isPackOpening = useAppStore((s) => s.modals.packOpening);
  const awaitingFulfillment = useAppStore((s) => s.pendingFulfillmentPullIds.length > 0);
  const simulatedTier = useMembershipSimulationStore((s) => s.simulatedTier);
  const [oddsOpen, setOddsOpen] = useState(false);
  const [openQuantity, setOpenQuantity] = useState<PackOpenQuantity>(1);
  const [rushConfirmOpen, setRushConfirmOpen] = useState(false);

  const pack = useMemo<Pack | undefined>(
    () => mockPacks.find((p) => String(p.id) === String(route.params.packId)),
    [route.params.packId],
  );

  const loc = pack ? getLocalizedPackFields(pack, t) : null;

  const soldOut = !!(pack && pack.remainingInventory <= 0);
  const requiredTier = pack?.requiredMembershipTier;
  const tierGate = !!(requiredTier && pack && !membershipMeetsRequired(simulatedTier, requiredTier));
  /** Member-only packs show unlock CTA unless inventory is gone. */
  const membershipLocked = !!(pack && tierGate && !soldOut);
  const openBlocked = isPackOpening || awaitingFulfillment || soldOut;
  const bulkBusy = isPackOpening || awaitingFulfillment;
  const canBulk10 = !!(pack && !membershipLocked && !soldOut && pack.remainingInventory >= 10);
  const canBulk100 = !!(pack && !membershipLocked && !soldOut && pack.remainingInventory >= 100);

  const odds = useMemo(() => (pack ? getMockPackOdds(pack) : EMPTY_PACK_ODDS), [pack]);
  const topHit = useMemo(() => (pack ? getMockPackTopHit(pack) : null), [pack]);

  useEffect(() => {
    setOpenQuantity(1);
    setRushConfirmOpen(false);
  }, [route.params.packId]);

  useEffect(() => {
    if (!pack) return;
    if (openQuantity === 10 && !canBulk10) setOpenQuantity(1);
    else if (openQuantity === 100 && !canBulk100) setOpenQuantity(canBulk10 ? 10 : 1);
  }, [pack, openQuantity, canBulk10, canBulk100]);

  if (!pack || !loc) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (!navigationRef.isReady()) return;
            if (navigationRef.canGoBack()) navigationRef.goBack();
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          <Text style={styles.backText}>{t('packDetails.back')}</Text>
        </TouchableOpacity>
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>{t('packDetails.missingTitle')}</Text>
          <Text style={styles.missingBody}>{t('packDetails.missingBody')}</Text>
        </View>
      </View>
    );
  }

  const commitOpen = (qty: PackOpenQuantity) => {
    if (qty > 1 && pack.remainingInventory < qty) {
      showUserMessage(t('packDetails.bulkStockTitle'), t('packDetails.bulkStockBody', { count: qty }));
      return;
    }
    requireAuth(() => {
      void openPack(pack, { quantity: qty });
    }, { allowUnauthenticatedPackOpen: true });
  };

  const onPressPrimaryCta = () => {
    if (membershipLocked) {
      if (navigationRef.isReady()) navigationRef.navigate('Membership');
      return;
    }
    if (openBlocked) return;
    if (openQuantity > 1 && pack.remainingInventory < openQuantity) {
      showUserMessage(t('packDetails.bulkStockTitle'), t('packDetails.bulkStockBody', { count: openQuantity }));
      return;
    }
    if (openQuantity === 100) {
      setRushConfirmOpen(true);
      return;
    }
    commitOpen(openQuantity);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          if (!navigationRef.isReady()) return;
          if (navigationRef.canGoBack()) navigationRef.goBack();
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        <Text style={styles.backText}>{t('packDetails.back')}</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <View style={styles.heroVisualWrap}>
            <PackVisual
              name={pack.title}
              category={pack.tcgCategory ?? 'TCG'}
              rarityTier={pack.rarityTier ?? 'epic'}
              size="hero"
            />
          </View>
          <View style={styles.heroBadges}>
            {pack.isFeatured ? <StatusBadge variant="featured">Featured</StatusBadge> : null}
            {pack.buybackRate != null ? <BuybackBadge rate={pack.buybackRate} /> : null}
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{loc.title}</Text>
            <Text style={styles.heroValue}>{pack.tagline ?? loc.valueDescription}</Text>
            {pack.remainingFraction != null ? (
              <View style={styles.heroProgress}>
                <PhProgressBar fraction={pack.remainingFraction} />
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.body}>
          {tierGate && requiredTier ? (
            <VaultFramedCard contentStyle={styles.cardInner}>
              <Text style={styles.sectionTitle}>{t('packDetails.memberGateTitle')}</Text>
              <Text style={styles.sectionBody}>
                {t('packDetails.memberGateBody', {
                  tier: t(`membership.tierName_${requiredTier}`),
                })}
              </Text>
            </VaultFramedCard>
          ) : null}

          <VaultFramedCard contentStyle={styles.cardInner}>
            <Text style={styles.sectionTitle}>{t('packDetails.guaranteeTitle')}</Text>
            <Text style={styles.sectionBody}>{loc.guaranteeText}</Text>
          </VaultFramedCard>

          <VaultFramedCard contentStyle={styles.cardInner}>
            <Text style={styles.sectionTitle}>{t('packDetails.specTitle')}</Text>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>{t('packDetails.priceTitle')}</Text>
              <Text style={styles.specValue}>
                {pack.creditPrice.toLocaleString()} {t('packCard.credits')}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>{t('packDetails.specRemainingLabel')}</Text>
              <Text style={styles.specValue}>
                {t('packDetails.remaining', {
                  left: pack.remainingInventory.toLocaleString(),
                  total: pack.totalInventory.toLocaleString(),
                })}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>{t('packDetails.specTagsLabel')}</Text>
              <Text style={styles.specValue} numberOfLines={1}>
                {(pack.tags ?? []).slice(0, 3).join(' · ') || '—'}
              </Text>
            </View>

            <TouchableOpacity style={styles.oddsBtn} onPress={() => setOddsOpen(true)} activeOpacity={0.86}>
              <Text style={styles.oddsBtnText}>{t('packDetails.viewOdds')}</Text>
              <Text style={styles.oddsBtnChevron}>›</Text>
            </TouchableOpacity>
          </VaultFramedCard>

          {topHit ? (
            <VaultFramedCard contentStyle={styles.cardInner}>
              <Text style={styles.sectionTitle}>{t('packDetails.topHitPreviewTitle')}</Text>
              <View style={styles.topHitRow}>
                <Image source={{ uri: topHit.imageUrl }} style={styles.topHitImg} contentFit="cover" />
                <View style={styles.topHitBody}>
                  <Text style={styles.topHitName} numberOfLines={2}>
                    {topHit.name}
                  </Text>
                  <Text style={styles.topHitMeta} numberOfLines={1}>
                    {topHit.rarity} · {topHit.estValue}
                  </Text>
                </View>
              </View>
              <Text style={styles.finePrint}>{t('packDetails.topHitPreviewFinePrint')}</Text>
            </VaultFramedCard>
          ) : null}

          <VaultFramedCard contentStyle={styles.cardInner}>
            <Text style={styles.sectionTitle}>{t('packDetails.whatYouCanPullTitle')}</Text>
            <View style={styles.pullsGrid}>
              {odds.rows.slice(0, 4).map((r) => (
                <View key={r.tier} style={styles.pullsCell}>
                  <Text style={styles.pullsTier}>{r.tier.toUpperCase()}</Text>
                  <Text style={styles.pullsChance}>{r.chance}</Text>
                  <Text style={styles.pullsExamples} numberOfLines={2}>
                    {r.examples.join(' / ')}
                  </Text>
                </View>
              ))}
            </View>
          </VaultFramedCard>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
        <View style={styles.footerStack}>
          {!membershipLocked ? (
            <>
              <PackOpenQuantitySelector
                value={openQuantity}
                onChange={setOpenQuantity}
                disabled={bulkBusy || soldOut}
                disabled10={!canBulk10}
                disabled100={!canBulk100}
              />
              <PackMultiOpenSummary quantity={openQuantity} creditPrice={pack.creditPrice} />
            </>
          ) : null}

          <TouchableOpacity
            style={[styles.cta, openBlocked && !membershipLocked ? styles.ctaDisabled : null]}
            activeOpacity={0.9}
            disabled={membershipLocked ? isPackOpening || awaitingFulfillment : openBlocked}
            onPress={onPressPrimaryCta}
          >
            <View style={styles.ctaInner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ctaText}>
                  {membershipLocked
                    ? t('packDetails.ctaUnlockMembership', {
                        tier: t(`membership.tierName_${requiredTier}`),
                      })
                    : openBlocked
                      ? t('packDetails.ctaDisabled')
                      : openQuantity === 1
                        ? t('packDetails.multiOpen.ctaOpenPack')
                        : openQuantity === 10
                          ? t('packDetails.multiOpen.ctaFastOpen')
                          : t('packDetails.multiOpen.ctaRush')}
                </Text>
                <Text style={styles.ctaSub}>
                  {membershipLocked
                    ? t('packDetails.ctaUnlockMembershipSub')
                    : openBlocked
                      ? t('packDetails.ctaDisabled')
                      : t('packDetails.multiOpen.ctaSubInventory', {
                          left: pack.remainingInventory.toLocaleString(),
                        })}
                </Text>
              </View>
              <Text style={styles.ctaArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <PackRushConfirmModal
        visible={rushConfirmOpen}
        packCount={100}
        totalCredits={packOpenTotalCredits(pack.creditPrice, 100)}
        onCancel={() => setRushConfirmOpen(false)}
        onConfirm={() => {
          setRushConfirmOpen(false);
          commitOpen(100);
        }}
      />

      <PackOddsModal visible={oddsOpen} onClose={() => setOddsOpen(false)} packTitle={loc.title} odds={odds} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...screenRoot,
    backgroundColor: ph.bg,
  },
  scroll: screenScroll,
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    gap: 6,
  },
  backText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: colors.textPrimary,
  },
  missing: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
  },
  missingTitle: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  missingBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  hero: {
    marginHorizontal: spacing.base,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ph.border,
    backgroundColor: ph.surface,
    padding: spacing.lg,
    alignItems: 'center',
  },
  heroVisualWrap: { marginBottom: spacing.md },
  heroBadges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: spacing.sm },
  heroText: { width: '100%' },
  heroTitle: {
    fontSize: fontSize.xl,
    fontFamily: brandFont.black,
    color: ph.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  heroValue: {
    fontSize: fontSize.sm,
    color: ph.textSec,
    lineHeight: 20,
    textAlign: 'center',
  },
  heroProgress: { marginTop: spacing.md },
  body: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  cardInner: {
    padding: spacing.base,
    paddingLeft: spacing.base + 6,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  metaPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.nearBlack,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaText: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: colors.gold,
  },
  footer: {
    ...screenFooter,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    backgroundColor: 'rgba(7,5,15,0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.headerHairline,
  },
  footerStack: {
    gap: spacing.md,
  },
  cta: {
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ph.green,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaText: {
    fontSize: fontSize.base,
    fontFamily: brandFont.black,
    color: colors.ink,
  },
  ctaInner: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ctaSub: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  ctaArrow: {
    fontSize: 26,
    fontFamily: brandFont.black,
    color: colors.ink,
    marginTop: -2,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  specLabel: {
    fontSize: 12,
    fontFamily: brandFont.bold,
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  specValue: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: colors.textPrimary,
  },
  oddsBtn: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  oddsBtnText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  oddsBtnChevron: {
    fontSize: 22,
    fontFamily: brandFont.black,
    color: colors.textMuted,
    marginTop: -2,
  },
  topHitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  topHitImg: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },
  topHitBody: { flex: 1, minWidth: 0 },
  topHitName: {
    fontSize: fontSize.base,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  topHitMeta: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: brandFont.bold,
    color: colors.textSecondary,
  },
  finePrint: {
    marginTop: spacing.sm,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
  pullsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  pullsCell: {
    width: '47%',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    gap: 4,
  },
  pullsTier: {
    fontSize: 10,
    fontFamily: brandFont.black,
    color: colors.textMuted,
    letterSpacing: 1.4,
  },
  pullsChance: {
    fontSize: fontSize.base,
    fontFamily: brandFont.black,
    color: colors.textPrimary,
  },
  pullsExamples: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

