import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { sg } from '../tokens/sg';
import { SgCard, SgData, SgSectionHeader, SgTierTag } from '../components/ui';
import { SgFairnessRecord } from '../components/pack/sg/SgFairnessRecord';
import { TerminalBackdrop, TerminalPackBay, TerminalStatusRail } from '../components/terminal';
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
import { usePackOdds } from '../hooks/usePackOdds';
import { getMockPackTopHit } from '../data/mockTopHits';
import { tierFromIsChase } from '../lib/n2Rarity';
import { showUserMessage } from '../utils/showUserMessage';
import { ChipTag } from '../components/shared/ChipTag';

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

  const pack = useMemo<Pack | undefined>(
    () => mockPacks.find((p) => String(p.id) === String(route.params.packId)),
    [route.params.packId],
  );

  const loc = pack ? getLocalizedPackFields(pack, t) : null;

  const soldOut = !!(pack && pack.remainingInventory <= 0);
  const requiredTier = pack?.requiredMembershipTier;
  const tierGate = !!(requiredTier && pack && !membershipMeetsRequired(simulatedTier, requiredTier));

  const { odds, loading: oddsLoading } = usePackOdds(pack);
  const liveOpeningBlocked = !__DEV__ && !odds.isLive;
  /** Membership cannot supersede the live-data gate in a release build. */
  const membershipLocked = !!(pack && tierGate && !soldOut && !liveOpeningBlocked);
  const openBlocked = isPackOpening || awaitingFulfillment || soldOut || liveOpeningBlocked;
  const bulkBusy = isPackOpening || awaitingFulfillment || liveOpeningBlocked;
  const canBulk10 = !!(
    pack && !membershipLocked && !soldOut && !liveOpeningBlocked && pack.remainingInventory >= 10
  );
  const topHit = useMemo(() => (__DEV__ && pack ? getMockPackTopHit(pack) : null), [pack]);
  const fraction = pack
    ? pack.remainingFraction ?? pack.remainingInventory / Math.max(pack.totalInventory, 1)
    : 0;
  const topOddsRow = odds.rows[0];

  useEffect(() => {
    setOpenQuantity(1);
  }, [route.params.packId]);

  useEffect(() => {
    if (!pack) return;
    if (openQuantity === 10 && !canBulk10) setOpenQuantity(1);
  }, [pack, openQuantity, canBulk10]);

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
          accessibilityRole="button"
          accessibilityLabel={t('packDetails.back')}
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
    commitOpen(openQuantity);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <TerminalBackdrop />
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          if (!navigationRef.isReady()) return;
          if (navigationRef.canGoBack()) navigationRef.goBack();
        }}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t('packDetails.back')}
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
          <View style={styles.terminalLabelRow}>
            <Text style={styles.terminalLabel}>PACK DETAIL / BAY A</Text>
            <Text style={styles.terminalCode}>TOKYO 01</Text>
          </View>
          <View style={styles.heroVisualWrap}>
            <View style={styles.heroBay}>
              <TerminalPackBay
                name={pack.title}
                category={pack.tcgCategory ?? 'TCG'}
                rarityTier={pack.rarityTier ?? 'epic'}
                size="hero"
              />
            </View>
            <TerminalStatusRail compact />
          </View>
          <View style={styles.heroBadges}>
            {__DEV__ && pack.isFeatured ? (
              <View style={styles.featuredChip}>
                <Text style={styles.featuredChipText}>FEATURED</Text>
              </View>
            ) : null}
            {/* Trade-in is structurally 100% of listed value (coin economy) —
                there is no per-pack rate, so this is fixed copy, not data. */}
            <SgData value="100%" unit="of listed value, in Points" size="sm" tone="gold" />
          </View>
          <Text style={styles.heroTitle}>{loc.title}</Text>
          <Text style={styles.heroSet}>
            {__DEV__ ? pack.tagline ?? loc.valueDescription : pack.tcgCategory ?? loc.valueDescription}
          </Text>
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
              {odds.isLive || __DEV__ ? (
                <SgData value={pack.creditPrice.toLocaleString()} unit="Points" size="lg" tone="gold" />
              ) : (
                <SgData value="—" unit={t('packDetails.liveUnavailableShort')} size="sm" />
              )}
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>{t('packDetails.specRemainingLabel')}</Text>
              {odds.isLive || __DEV__ ? (
                <SgData
                  value={`${pack.remainingInventory.toLocaleString()} / ${pack.totalInventory.toLocaleString()}`}
                  unit="left"
                  size="sm"
                />
              ) : (
                <SgData
                  value={oddsLoading ? t('packDetails.liveChecking') : '—'}
                  unit={t('packDetails.liveUnavailableShort')}
                  size="sm"
                />
              )}
            </View>
            {/* Slots hairline — neutral (no red, no blinking) */}
            {odds.isLive || __DEV__ ? (
              <>
                <View style={styles.slotsBar}>
                  <View style={[styles.slotsFill, { width: `${Math.max(0, Math.min(1, fraction)) * 100}%` }]} />
                </View>
                <View style={styles.tagsRow}>
                  <Text style={styles.specLabel}>{t('packDetails.specTagsLabel')}</Text>
                  <View style={styles.tagsWrap}>
                    {(pack.tags ?? []).slice(0, 3).map((tag) => (
                      <ChipTag key={tag} type={tag} />
                    ))}
                  </View>
                </View>
              </>
            ) : null}

            {/* Odds summary line — ALWAYS visible; detail table stays in the modal */}
            {topOddsRow ? (
              <View style={styles.oddsSummary}>
                <Text style={styles.oddsSummaryLabel}>
                  {topOddsRow.tier.toUpperCase()} odds{' '}
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
                  {/* Printed card rarity — a separate field from tier (§6): never merged into the tier slot */}
                  <SgData value={topHit.rarity.toUpperCase()} size="sm" />
                  {/* isChase (boolean) is the only card→tier link: true → MYTHIC, false → UNKNOWN (tag renders nothing) */}
                  <SgTierTag tier={tierFromIsChase(topHit.isChase)} context="badge" />
                </View>
              </View>
              <Text style={styles.finePrint}>{t('packDetails.topHitPreviewFinePrint')}</Text>
            </SgCard>
          ) : null}

          {/* ── 6. What you can pull (odds tiers) ── */}
          {odds.rows.length > 0 ? (
            <SgCard>
              <SgSectionHeader title={t('packDetails.whatYouCanPullTitle')} />
              <View style={styles.pullsGrid}>
                {odds.rows.map((r) => (
                  <View key={r.tier} style={styles.pullsCell}>
                    <SgTierTag tier={r.tier} context="disclosure" />
                    <SgData value={r.chance} size="md" />
                    <Text style={styles.pullsExamples} numberOfLines={2}>
                      {r.examples.join(' / ')}
                    </Text>
                  </View>
                ))}
              </View>
              {odds.isLive ? (
                <Text style={styles.finePrint}>{t('packDetails.oddsLiveDisclaimer')}</Text>
              ) : null}
            </SgCard>
          ) : (
            <SgCard>
              <SgSectionHeader title={t('packDetails.whatYouCanPullTitle')} />
              <View style={styles.liveUnavailableRow}>
                <View style={styles.liveUnavailableDot} />
                <Text style={styles.liveUnavailableTitle}>{t('packDetails.liveUnavailableTitle')}</Text>
              </View>
              <Text style={styles.sectionBody}>{t('packDetails.liveUnavailableBody')}</Text>
            </SgCard>
          )}

          {/* ── 7. Trade-in policy ── */}
          <SgCard>
            <SgSectionHeader title={t('packDetails.guaranteeTitle')} />
            <Text style={styles.sectionBody}>{loc.guaranteeText}</Text>
          </SgCard>

          {/* ── 8. Ships from Tokyo ── */}
          <SgCard>
            <View style={styles.shipRow}>
              <View style={styles.shipBody}>
                <Text style={styles.shipTitle}>Shipping workflow</Text>
                <Text style={styles.sectionBody}>
                  {liveOpeningBlocked
                    ? 'Shipping becomes available only after a completed live opening and verified fulfillment data.'
                    : 'Shipping options are shown after opening. Track fulfillment status from your Vault.'}
                </Text>
              </View>
            </View>
          </SgCard>

          {/* ── 9. Fairness record — empty until a live opening supplies identifiers ── */}
          <SgFairnessRecord />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
        <View style={styles.footerStack}>
          {!membershipLocked && !liveOpeningBlocked ? (
            <>
              <PackOpenQuantitySelector
                value={openQuantity}
                onChange={setOpenQuantity}
                disabled={bulkBusy || soldOut}
                disabled10={!canBulk10}
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
            accessibilityRole="button"
            accessibilityLabel={
              liveOpeningBlocked
                ? t('packDetails.liveUnavailableTitle')
                : membershipLocked
                  ? t('packDetails.ctaUnlockMembership', { tier: t(`membership.tierName_${requiredTier}`) })
                  : t('packDetails.multiOpen.ctaOpenPack')
            }
            accessibilityState={{ disabled: membershipLocked ? isPackOpening || awaitingFulfillment : openBlocked }}
          >
            <View style={styles.ctaInner}>
              <View style={styles.ctaTextWrap}>
                <Text style={styles.ctaText}>
                  {liveOpeningBlocked
                    ? t('packDetails.liveUnavailableTitle')
                    : membershipLocked
                    ? t('packDetails.ctaUnlockMembership', {
                        tier: t(`membership.tierName_${requiredTier}`),
                      })
                    : openBlocked
                      ? t('packDetails.ctaDisabled')
                      : openQuantity === 1
                        ? t('packDetails.multiOpen.ctaOpenPack')
                        : t('packDetails.multiOpen.ctaFastOpen')}
                </Text>
                <Text style={styles.ctaSub}>
                  {liveOpeningBlocked ? (
                    t('packDetails.liveUnavailableShort')
                  ) : membershipLocked ? (
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
  scrollContent: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
    paddingBottom: sg.space.xl,
  },
  hero: { alignItems: 'center', paddingTop: sg.space.sm, paddingHorizontal: sg.space.md },
  terminalLabelRow: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 8 },
  terminalLabel: { fontFamily: sg.font.label, fontSize: 8, color: sg.muted, letterSpacing: 0.9 },
  terminalCode: { fontFamily: sg.font.dataBold, fontSize: 8, color: sg.goldHi },
  heroVisualWrap: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'stretch', gap: 7 },
  heroBay: { flex: 1 },
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
    fontFamily: sg.font.label,
    fontSize: 9,
    letterSpacing: 1.2,
    color: sg.text,
  },
  heroTitle: {
    fontFamily: sg.font.display,
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -0.9,
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
  liveUnavailableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
    marginTop: sg.space.md,
  },
  liveUnavailableDot: {
    width: 7,
    height: 7,
    borderRadius: sg.radius.pill,
    backgroundColor: sg.warning,
  },
  liveUnavailableTitle: {
    flex: 1,
    fontFamily: sg.font.label,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: sg.warning,
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
  tagsRow: {
    marginTop: sg.space.md,
    gap: sg.space.sm,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sg.space.xs,
  },
  slotsBar: {
    height: 2,
    borderRadius: 1,
    backgroundColor: sg.line,
    marginTop: sg.space.sm,
  },
  slotsFill: { height: 2, borderRadius: 1, backgroundColor: sg.success },
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
  footerStack: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
    gap: sg.space.sm,
  },
  cta: {
    borderRadius: sg.radius.btn,
    backgroundColor: sg.gold,
    borderWidth: 1,
    borderColor: sg.goldHi,
    overflow: 'hidden',
    ...sg.glowCobalt,
  },
  ctaDisabled: { opacity: 0.4 },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sg.space.lg,
    paddingVertical: sg.space.md - 2,
  },
  ctaTextWrap: { flex: 1 },
  ctaText: { fontFamily: sg.font.label, fontSize: 14, color: sg.onGold, letterSpacing: 0.9, textTransform: 'uppercase' },
  ctaSub: { fontFamily: sg.font.body, fontSize: 11, color: 'rgba(244,239,227,0.78)', marginTop: 2 },
  ctaSubNum: {
    fontFamily: sg.font.dataBold,
    fontSize: 11,
    color: 'rgba(244,239,227,0.78)',
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
