import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import type { Pack } from '../../../data/mockPacks';
import { PackVisual } from '../../ph/PackVisual';
import { SgButton, SgData } from '../../ui';
import { sg } from '../../../tokens/sg';
import { getMockPackOdds } from '../../../data/mockPackOdds';
import { getLocalizedPackFields } from '../../../i18n/packCopy';
import { navigationRef } from '../../../navigation/navigationRef';

/**
 * Shelf-first featured pack card — sized to be fully visible without
 * scrolling at 440×956. Product halo (商品後光方式) is the sanctioned
 * per-product warm glow; the pack itself is the existing PackVisual asset.
 * Scarcity rules: real numbers always visible; the count is promoted to
 * brass below 10% remaining. No red, no blinking, no fake timers.
 */
export function SgFeaturedPackCard({
  pack,
  onOpen,
}: {
  pack: Pack;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const loc = getLocalizedPackFields(pack, t);
  const odds = useMemo(() => getMockPackOdds(pack), [pack]);
  const topOddsRow = odds.rows[0];
  const fraction = pack.remainingFraction ?? pack.remainingInventory / Math.max(pack.totalInventory, 1);
  const lowStock = fraction < 0.1;
  const priceUsd = (pack.creditPrice / 100).toFixed(0);

  // Old buyback-% claims are superseded by the confirmed trade-in pitch;
  // pack-specific pull guarantees ("Rare slot or higher") pass through as-is.
  const guaranteeLine = /buyback/i.test(loc.guaranteeText)
    ? t('home.guaranteeTradeIn')
    : loc.guaranteeText;

  const goVerify = () => {
    // Fairness record lives on the pack page (Step 4) — VERIFY deep-links there.
    if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: pack.id });
  };

  return (
    <View style={styles.card}>
      <View style={styles.satinTop} pointerEvents="none" />
      <View style={styles.visualZone}>
        {/* 後光 — warm halo behind the product only */}
        <Svg width={300} height={240} style={styles.halo} pointerEvents="none">
          <Defs>
            <RadialGradient id="packHalo" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#FFFAEE" stopOpacity={0.12} />
              <Stop offset="70%" stopColor="#FFFAEE" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#packHalo)" />
        </Svg>
        <PackVisual
          name={pack.title}
          category={pack.tcgCategory ?? 'TCG'}
          rarityTier={pack.rarityTier ?? 'epic'}
          size="md"
        />
      </View>

      <Text style={styles.title}>{loc.title}</Text>

      <View style={styles.metaRow}>
        <SgData value={`$${priceUsd}`} size="lg" />
        <SgData
          value={`${pack.remainingInventory.toLocaleString()} / ${pack.totalInventory.toLocaleString()}`}
          unit="left"
          size="sm"
          tone={lowStock ? 'brass' : 'default'}
        />
      </View>
      <View style={styles.slotsBar}>
        <View style={[styles.slotsFill, { width: `${Math.max(0, Math.min(1, fraction)) * 100}%` }]} />
      </View>

      {topOddsRow ? (
        <Text style={styles.oddsLine}>
          Top hit odds <Text style={styles.oddsValue}>{topOddsRow.chance}</Text> — full table on pack page
        </Text>
      ) : null}

      <SgButton label={t('packDetails.multiOpen.ctaOpenPack')} onPress={onOpen} style={styles.cta} />

      <View style={styles.trustRow}>
        <Text style={styles.guarantee} numberOfLines={1}>
          {guaranteeLine}
        </Text>
        <TouchableOpacity onPress={goVerify} hitSlop={8} accessibilityRole="button">
          <Text style={styles.verify}>VERIFY →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: sg.space.md,
    marginTop: sg.space.md,
    borderRadius: sg.radius.panel,
    backgroundColor: sg.showroom.surface,
    paddingHorizontal: sg.space.md,
    paddingBottom: sg.space.md,
    overflow: 'hidden',
    alignItems: 'center',
  },
  satinTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: sg.satinTopHighlight,
    zIndex: 2,
  },
  visualZone: { alignItems: 'center', justifyContent: 'center', marginTop: sg.space.sm },
  halo: { position: 'absolute' },
  title: {
    fontFamily: sg.font.display,
    fontSize: 22,
    lineHeight: 27,
    color: sg.showroom.text,
    textAlign: 'center',
    marginTop: sg.space.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: sg.space.md,
    marginTop: sg.space.sm,
  },
  slotsBar: {
    alignSelf: 'stretch',
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(232,229,222,0.14)',
    marginTop: sg.space.sm,
  },
  slotsFill: { height: 2, borderRadius: 1, backgroundColor: 'rgba(232,229,222,0.55)' },
  oddsLine: {
    fontFamily: sg.font.body,
    fontSize: 11,
    color: sg.showroom.textMuted,
    marginTop: sg.space.sm,
  },
  oddsValue: { fontFamily: sg.font.dataBold, fontSize: 12, color: sg.showroom.text },
  cta: { alignSelf: 'stretch', marginTop: sg.space.sm + 2 },
  trustRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: sg.space.sm + 2,
    gap: sg.space.md,
  },
  guarantee: {
    flex: 1,
    fontFamily: sg.font.body,
    fontSize: 11,
    color: sg.showroom.textMuted,
  },
  verify: {
    fontFamily: sg.font.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: sg.showroom.text,
  },
});
