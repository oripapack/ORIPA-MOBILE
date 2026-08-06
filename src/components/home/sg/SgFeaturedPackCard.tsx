import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Pack } from '../../../data/mockPacks';
import { PackVisual } from '../../ph/PackVisual';
import { SgButton, SgData } from '../../ui';
import { sg } from '../../../tokens/sg';
import { usePackOdds } from '../../../hooks/usePackOdds';
import { getLocalizedPackFields } from '../../../i18n/packCopy';
import { navigationRef } from '../../../navigation/navigationRef';

/**
 * Shelf-first featured pack card — the ONE hero element on Home, so it is
 * the screen's single `shadowHero` carrier (§3). The pack itself is the
 * existing PackVisual asset. Scarcity rules: real numbers always visible;
 * stock counts use `success` semantics when low (§4). No red, no blinking,
 * no fake timers.
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
  const { odds } = usePackOdds(pack);
  const topOddsRow = odds.rows[0];
  const fraction = pack.remainingFraction ?? pack.remainingInventory / Math.max(pack.totalInventory, 1);
  const lowStock = fraction < 0.1;
  const priceUsd = (pack.creditPrice / 100).toFixed(0);

  // The featured card always shows the localized trade-in pitch (2026-07-29
  // copy rule: 100% never appears without its "listed value" basis). The full
  // per-pack guarantee text lives on the pack page.
  const guaranteeLine = pack.packVersionId
    ? t('home.guaranteeTradeInLive')
    : t('home.guaranteeTradeIn');

  const goVerify = () => {
    // Fairness record lives on the pack page — VERIFY deep-links there.
    if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: pack.id });
  };

  return (
    <View style={styles.card}>
      <View style={styles.visualZone}>
        <PackVisual
          name={pack.title}
          category={pack.tcgCategory ?? 'TCG'}
          rarityTier={pack.rarityTier ?? 'epic'}
          size="md"
        />
      </View>

      <Text style={styles.title}>{loc.title}</Text>

      <View style={styles.metaRow}>
        <SgData value={`$${priceUsd}`} size="lg" tone="gold" />
        <SgData
          value={`${pack.remainingInventory.toLocaleString()} / ${pack.totalInventory.toLocaleString()}`}
          unit="left"
          size="sm"
          tone={lowStock ? 'success' : 'default'}
        />
      </View>
      <View style={styles.slotsBar}>
        <View style={[styles.slotsFill, { width: `${Math.max(0, Math.min(1, fraction)) * 100}%` }]} />
      </View>

      {topOddsRow ? (
        <Text style={styles.oddsLine}>
          {topOddsRow.tier.toUpperCase()} odds <Text style={styles.oddsValue}>{topOddsRow.chance}</Text> — full table on pack page
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
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
    paddingHorizontal: sg.space.md,
    paddingBottom: sg.space.md,
    alignItems: 'center',
    // The single hero shadow on this screen (§3)
    ...sg.shadowHero,
  },
  visualZone: { alignItems: 'center', justifyContent: 'center', marginTop: sg.space.sm },
  title: {
    fontFamily: sg.font.display,
    fontSize: 22,
    lineHeight: 27,
    color: sg.text,
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
    backgroundColor: sg.line,
    marginTop: sg.space.sm,
  },
  slotsFill: { height: 2, borderRadius: 1, backgroundColor: sg.muted },
  oddsLine: {
    fontFamily: sg.font.body,
    fontSize: 11,
    color: sg.muted,
    marginTop: sg.space.sm,
  },
  oddsValue: {
    fontFamily: sg.font.dataBold,
    fontSize: 12,
    color: sg.text,
    fontVariant: [...sg.numeric],
  },
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
    color: sg.muted,
  },
  verify: {
    fontFamily: sg.font.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: sg.text,
  },
});
