import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { sg } from '../tokens/sg';
import { SgCard, SgData, SgSectionHeader } from '../components/ui';
import { SgFairnessRecord } from '../components/pack/sg/SgFairnessRecord';
import { PackVisual } from '../components/ph/PackVisual';
import { spacing } from '../tokens/spacing';
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
import { EMPTY_PACK_ODDS, getMockPackOdds } from '../data/mockPackOdds';
import { getMockPackTopHit } from '../data/mockTopHits';
import { rankFromOddsTier } from '../lib/n2Rarity';
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
  const fraction = pack
    ? pack.remainingFraction ?? pack.remainingInventory / Math.max(pack.totalInventory, 1)
    : 0;
  const topOddsRow = odds.rows[0];

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
          <Ionicons name="chevron-back" size={20} color={sg.text} />
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
    });
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
        <Ionicons name="chevron-back" size={20} color={sg.text} />
        <Text style={styles.backText}>{t('packDetails.back')}</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── 1. Pack name / set ── */}
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
            {pack.isFeatured ? (
              <View style={styles.featuredChip}>
                <Text style={styles.featuredChipText}>FEATURED</Text>
              </View>
            ) : null}
            {pack.buybackRate != null ? (
              <SgData value={`${pack.buybackRate}%`} unit="trade-in" size="sm" tone="gold" />
            ) : null}
          </View>
          <Text style={styles.heroTitle}>{loc.title}</Text>
          <Text style={styles.heroSet}>{pack.tagline ?? loc.valueDescription}</Text>
        </View>

        <View style={styles.body}>
          {tierGate && requiredTier ? (
            <SgCard>
              <SgSectionHeader title={t('packDetails.memberGateTitle')} />
              <Text style={styles.sectionBody}>
                {t('packDetails.memberGateBody', {
                  tier: t(`membership.tierName_${requiredTier}`),
                })}
              </Text>
            </SgCard>
          ) : null}

          {/* ── 2. Price / 3. Slots / 4. Odds summary (always visible) ── */}
          <SgCard>
            <SgSectionHeader title={t('packDetails.specTitle')} />
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>{t('packDetails.priceTitle')}</Text>
              <SgData value={pack.creditPrice.toLocaleString()} unit={t('packCard.credits')} size="lg" tone="gold" />
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>{t('packDetails.specRemainingLabel')}</Text>
              <SgData
                value={`${pack.remainingInventory.toLocaleString()} / ${pack.totalInventory.toLocaleString()}`}
                unit="left"
                size="sm"
              />
            </View>
            {/* Slots hairline — neutral (no red, no blinking) */}
            <View style={styles.slotsBar}>
              <View style={[styles.slotsFill, { width: `${Math.max(0, Math.min(1, fraction)) * 100}%` }]} />
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>{t('packDetails.specTagsLabel')}</Text>
              <Text style={styles.specValue} numberOfLines={1}>
                {(pack.tags ?? []).slice(0, 3).join(' · ') || '—'}
              </Text>
            </View>

            {/* Odds summary line — ALWAYS visible; detail table stays in the modal */}
            {topOddsRow ? (
              <View style={styles.oddsSummary}>
                <Text style={styles.oddsSummaryLabel}>
                  Top hit odds{' '}
                  <Text style={styles.oddsSummaryValue}>{topOddsRow.chance}</Text>
                </Text>
                <TouchableOpacity onPress={() => setOddsOpen(true)} activeOpacity={0.86} style={styles.oddsBtn}>
                  <Text style={styles.oddsBtnText}>{t('packDetails.viewOdds')} ›</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </SgCard>

          {/* ── 5. Key card (existing topHit data — image + name + est value) ── */}
          {topHit ? (
            <SgCard>
              <SgSectionHeader title={t('packDetails.topHitPreviewTitle')} />
              <View style={styles.topHitRow}>
                <View style={styles.topHitImgFrame}>
                  <Image source={{ uri: topHit.imageUrl }} style={styles.topHitImg} contentFit="cover" />
                </View>
                <View style={styles.topHitBody}>
                  <Text style={styles.topHitName} numberOfLines={2}>
                    {topHit.name}
                  </Text>
                  <SgData value={topHit.estValue} unit="listed" size="sm" tone="gold" />
                  {/* isChase is the only card→odds-tier link (true → 'Top hit'). isChase:false leaves the tier UNDEFINED → UNKNOWN, no rank chrome (BASE would falsely claim "judged low") */}
                  <SgData value={topHit.rarity.toUpperCase()} size="sm" tone={topHit.isChase ? rankFromOddsTier('Top hit') : 'default'} />
                </View>
              </View>
              <Text style={styles.finePrint}>{t('packDetails.topHitPreviewFinePrint')}</Text>
            </SgCard>
          ) : null}

          {/* ── 6. What you can pull (odds tiers) ── */}
          <SgCard>
            <SgSectionHeader title={t('packDetails.whatYouCanPullTitle')} />
            <View style={styles.pullsGrid}>
              {odds.rows.slice(0, 4).map((r) => (
                <View key={r.tier} style={styles.pullsCell}>
                  <SgData value={r.tier.toUpperCase()} size="sm" tone={rankFromOddsTier(r.tier)} />
                  <SgData value={r.chance} size="md" />
                  <Text style={styles.pullsExamples} numberOfLines={2}>
                    {r.examples.join(' / ')}
                  </Text>
                </View>
              ))}
            </View>
          </SgCard>

          {/* ── 7. Trade-in policy ── */}
          <SgCard>
            <SgSectionHeader title={t('packDetails.guaranteeTitle')} />
            <Text style={styles.sectionBody}>{loc.guaranteeText}</Text>
          </SgCard>

          {/* ── 8. Ships from Tokyo ── */}
          <SgCard>
            <View style={styles.shipRow}>
              <View style={styles.shipBody}>
                <Text style={styles.shipTitle}>Ships from Tokyo</Text>
                <Text style={styles.sectionBody}>
                  Japanese exclusives, packed and shipped direct. Free shipping on orders{' '}
                  <Text style={styles.inlineNum}>$100+</Text>.
                </Text>
              </View>
            </View>
          </SgCard>

          {/* ── 9. Fairness record (mock values until provably-fair wiring) ── */}
          <SgFairnessRecord />
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

          {/* Primary CTA — the single gold CTA on this screen (§4: gold = value,
              black label; neon never fills a CTA) */}
          <TouchableOpacity
            style={[styles.cta, openBlocked && !membershipLocked ? styles.ctaDisabled : null]}
            activeOpacity={0.9}
            disabled={membershipLocked ? isPackOpening || awaitingFulfillment : openBlocked}
            onPress={onPressPrimaryCta}
          >
            <View style={styles.ctaInner}>
              <View style={styles.ctaTextWrap}>
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
                  {membershipLocked ? (
                    t('packDetails.ctaUnlockMembershipSub')
                  ) : openBlocked ? (
                    t('packDetails.ctaDisabled')
                  ) : (
                    /* §4: inline stock count renders as its own mono Text via
                       <num> markup in the locale string — copy unchanged */
                    <Trans
                      i18nKey="packDetails.multiOpen.ctaSubInventory"
                      values={{ left: pack.remainingInventory.toLocaleString() }}
                      components={{ num: <Text style={styles.ctaSubNum} /> }}
                    />
                  )}
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
    backgroundColor: sg.bg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.sm,
    alignSelf: 'flex-start',
  },
  backText: { fontFamily: sg.font.bodyMedium, fontSize: 14, color: sg.text },
  missing: { padding: sg.space.lg, alignItems: 'center', gap: sg.space.sm },
  missingTitle: { fontFamily: sg.font.bodyBold, fontSize: 16, color: sg.text },
  missingBody: {
    fontFamily: sg.font.body,
    fontSize: 13,
    color: sg.muted,
    textAlign: 'center',
    lineHeight: 19,
  },
  scroll: { ...screenScroll },
  scrollContent: { paddingBottom: sg.space.xl },
  hero: { alignItems: 'center', paddingTop: sg.space.sm, paddingHorizontal: sg.space.md },
  heroVisualWrap: { alignItems: 'center' },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.md,
    marginTop: sg.space.md,
  },
  featuredChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: sg.radius.tag,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  featuredChipText: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.2,
    color: sg.text,
  },
  heroTitle: {
    fontFamily: sg.font.display,
    fontSize: 28,
    lineHeight: 34,
    color: sg.text,
    textAlign: 'center',
    marginTop: sg.space.sm,
  },
  heroSet: {
    fontFamily: sg.font.body,
    fontSize: 12,
    color: sg.muted,
    textAlign: 'center',
    marginTop: 6,
  },
  body: { paddingHorizontal: sg.space.md, paddingTop: sg.space.lg, gap: sg.space.md },
  sectionBody: {
    fontFamily: sg.font.body,
    fontSize: 13,
    lineHeight: 19,
    color: sg.muted,
    marginTop: sg.space.sm,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: sg.space.md,
  },
  specLabel: { fontFamily: sg.font.body, fontSize: 13, color: sg.muted },
  specValue: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 13,
    color: sg.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  slotsBar: {
    height: 2,
    borderRadius: 1,
    backgroundColor: sg.line,
    marginTop: sg.space.sm,
  },
  slotsFill: { height: 2, borderRadius: 1, backgroundColor: sg.muted },
  oddsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: sg.space.md,
    paddingTop: sg.space.md,
    borderTopWidth: 1,
    borderTopColor: sg.line,
  },
  oddsSummaryLabel: { fontFamily: sg.font.body, fontSize: 13, color: sg.muted },
  oddsSummaryValue: {
    fontFamily: sg.font.dataBold,
    fontSize: 14,
    color: sg.text,
    fontVariant: [...sg.numeric],
  },
  oddsBtn: { padding: 4 },
  oddsBtnText: {
    fontFamily: sg.font.bodyBold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: sg.text,
  },
  topHitRow: { flexDirection: 'row', gap: sg.space.md, marginTop: sg.space.md },
  topHitImgFrame: {
    width: 84,
    height: 116,
    borderRadius: sg.radius.tag,
    overflow: 'hidden',
    backgroundColor: sg.surface2,
  },
  topHitImg: { width: '100%', height: '100%' },
  topHitBody: { flex: 1, gap: 6, justifyContent: 'center' },
  topHitName: { fontFamily: sg.font.bodyBold, fontSize: 14, lineHeight: 19, color: sg.text },
  finePrint: {
    fontFamily: sg.font.body,
    fontSize: 10,
    lineHeight: 15,
    color: sg.muted,
    marginTop: sg.space.md,
  },
  pullsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sg.space.md, marginTop: sg.space.md },
  pullsCell: { width: '46%', gap: 4 },
  pullsExamples: {
    fontFamily: sg.font.body,
    fontSize: 11,
    lineHeight: 15,
    color: sg.muted,
  },
  shipRow: { flexDirection: 'row', alignItems: 'center' },
  shipBody: { flex: 1 },
  shipTitle: { fontFamily: sg.font.bodyBold, fontSize: 15, color: sg.text },
  footer: {
    ...screenFooter,
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.sm,
    backgroundColor: sg.surface,
    borderTopWidth: 1,
    borderTopColor: sg.line,
  },
  footerStack: { gap: sg.space.sm },
  cta: {
    borderRadius: sg.radius.btn,
    backgroundColor: sg.gold,
    overflow: 'hidden',
  },
  ctaDisabled: { opacity: 0.4 },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sg.space.lg,
    paddingVertical: sg.space.md - 2,
  },
  ctaTextWrap: { flex: 1 },
  ctaText: { fontFamily: sg.font.bodyBold, fontSize: 16, color: sg.onGold, letterSpacing: 0.2 },
  ctaSub: { fontFamily: sg.font.body, fontSize: 11, color: 'rgba(0,0,0,0.7)', marginTop: 2 },
  ctaSubNum: {
    fontFamily: sg.font.dataBold,
    fontSize: 11,
    color: 'rgba(0,0,0,0.7)',
    fontVariant: ['tabular-nums'],
  },
  inlineNum: {
    fontFamily: sg.font.dataBold,
    fontSize: 13,
    color: sg.muted,
    fontVariant: ['tabular-nums'],
  },
  ctaArrow: { fontFamily: sg.font.bodyBold, fontSize: 20, color: sg.onGold, marginLeft: sg.space.sm },
});
