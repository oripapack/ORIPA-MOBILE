import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { navigationRef } from '../navigation/navigationRef';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useAppStore } from '../store/useAppStore';
import { mockPacks, type Pack } from '../data/mockPacks';
import { getLocalizedPackFields } from '../i18n/packCopy';
import { demoPackHeroImage } from '../data/demoMedia';
import { PackOddsModal } from '../components/pack/PackOddsModal';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';
import { getMockPackOdds } from '../data/mockPackOdds';
import { getMockPackTopHit } from '../data/mockTopHits';

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
  const [oddsOpen, setOddsOpen] = useState(false);

  const pack = useMemo<Pack | undefined>(
    () => mockPacks.find((p) => String(p.id) === String(route.params.packId)),
    [route.params.packId],
  );

  const loc = pack ? getLocalizedPackFields(pack, t) : null;

  if (!pack || !loc) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigationRef.goBack()} activeOpacity={0.85}>
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

  const disabled = isPackOpening || awaitingFulfillment || pack.remainingInventory <= 0;
  const odds = useMemo(() => getMockPackOdds(pack), [pack]);
  const topHit = useMemo(() => getMockPackTopHit(pack), [pack]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigationRef.goBack()} activeOpacity={0.85}>
        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        <Text style={styles.backText}>{t('packDetails.back')}</Text>
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image source={{ uri: demoPackHeroImage(String(pack.id)) }} style={styles.heroImg} contentFit="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{loc.title}</Text>
            <Text style={styles.heroValue}>{loc.valueDescription}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <VaultFramedCard contentStyle={styles.cardInner}>
            <Text style={styles.sectionTitle}>{t('packDetails.guaranteeTitle')}</Text>
            <Text style={styles.sectionBody}>{loc.guaranteeText}</Text>
          </VaultFramedCard>

          <VaultFramedCard contentStyle={styles.cardInner}>
            <Text style={styles.sectionTitle}>Pack details</Text>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Price</Text>
              <Text style={styles.specValue}>
                {pack.creditPrice.toLocaleString()} {t('packCard.credits')}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Remaining</Text>
              <Text style={styles.specValue}>
                {pack.remainingInventory.toLocaleString()} / {pack.totalInventory.toLocaleString()}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Tags</Text>
              <Text style={styles.specValue} numberOfLines={1}>
                {(pack.tags ?? []).slice(0, 3).join(' · ') || '—'}
              </Text>
            </View>

            <TouchableOpacity style={styles.oddsBtn} onPress={() => setOddsOpen(true)} activeOpacity={0.86}>
              <Text style={styles.oddsBtnText}>View odds</Text>
              <Text style={styles.oddsBtnChevron}>›</Text>
            </TouchableOpacity>
          </VaultFramedCard>

          {topHit ? (
            <VaultFramedCard contentStyle={styles.cardInner}>
              <Text style={styles.sectionTitle}>Top hit preview</Text>
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
              <Text style={styles.finePrint}>Preview only. Demo media and values may change before launch.</Text>
            </VaultFramedCard>
          ) : null}

          <VaultFramedCard contentStyle={styles.cardInner}>
            <Text style={styles.sectionTitle}>What you can pull</Text>
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
        <View style={styles.footerGlass} pointerEvents="none" />
        <TouchableOpacity
          style={[styles.cta, disabled && styles.ctaDisabled]}
          activeOpacity={0.9}
          disabled={disabled}
          onPress={() =>
            requireAuth(() => {
              openPack(pack);
            })
          }
        >
          <View style={styles.ctaInner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaText}>{disabled ? t('packDetails.ctaDisabled') : t('packCard.openPack')}</Text>
              <Text style={styles.ctaSub}>
                {pack.creditPrice.toLocaleString()} {t('packCard.credits')} · {pack.remainingInventory.toLocaleString()} left
              </Text>
            </View>
            <Text style={styles.ctaArrow}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      <PackOddsModal visible={oddsOpen} onClose={() => setOddsOpen(false)} packTitle={loc.title} odds={odds} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
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
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  missing: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
  },
  missingTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
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
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  heroImg: {
    width: '100%',
    height: 220,
    backgroundColor: colors.border,
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  heroText: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    bottom: spacing.base,
  },
  heroTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.white,
    marginBottom: 6,
  },
  heroValue: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 20,
  },
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
    fontWeight: fontWeight.bold,
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
    fontWeight: fontWeight.bold,
    color: colors.gold,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.0)',
  },
  footerGlass: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: -18,
    backgroundColor: 'rgba(2,6,23,0.72)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  cta: {
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.black,
    color: colors.nearBlack,
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
    fontWeight: fontWeight.bold,
    color: 'rgba(2,6,23,0.72)',
    letterSpacing: 0.2,
  },
  ctaArrow: {
    fontSize: 26,
    fontWeight: fontWeight.black,
    color: colors.nearBlack,
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
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  specValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  oddsBtn: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(2,6,23,0.26)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  oddsBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  oddsBtnChevron: {
    fontSize: 22,
    fontWeight: fontWeight.black,
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
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  topHitMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: fontWeight.bold,
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
    backgroundColor: 'rgba(2,6,23,0.22)',
    padding: spacing.sm,
    gap: 4,
  },
  pullsTier: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 1.4,
  },
  pullsChance: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  pullsExamples: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

