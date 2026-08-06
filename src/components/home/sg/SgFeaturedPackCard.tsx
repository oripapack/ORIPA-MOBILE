import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Pack } from '../../../data/mockPacks';
import { SgButton, SgData } from '../../ui';
import { TerminalPackBay, TerminalStatusRail } from '../../terminal';
import { sg } from '../../../tokens/sg';
import { usePackOdds } from '../../../hooks/usePackOdds';
import { getLocalizedPackFields } from '../../../i18n/packCopy';
import { navigationRef } from '../../../navigation/navigationRef';

export function SgFeaturedPackCard({ pack, onOpen }: { pack: Pack; onOpen: () => void }) {
  const { t } = useTranslation();
  const loc = getLocalizedPackFields(pack, t);
  const { odds } = usePackOdds(pack);
  const topOddsRow = odds.rows[0];
  const fraction = pack.remainingFraction ?? pack.remainingInventory / Math.max(pack.totalInventory, 1);
  const lowStock = fraction < 0.1;

  const goVerify = () => {
    if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: pack.id });
  };

  return (
    <View style={styles.card}>
      <View style={styles.ticketHead}>
        <View>
          <Text style={styles.eyebrow}>DROP / TOKYO SERIES 01</Text>
          <Text style={styles.title}>{loc.title}</Text>
        </View>
        <Text style={styles.bay}>BAY A</Text>
      </View>

      <View style={styles.machineRow}>
        <View style={styles.bayWrap}>
          <TerminalPackBay
            name={pack.title}
            category={pack.tcgCategory ?? 'TCG'}
            rarityTier={pack.rarityTier ?? 'epic'}
            size="md"
          />
        </View>
        <TerminalStatusRail compact />
      </View>

      <View style={styles.readout}>
        <SgData value={pack.creditPrice.toLocaleString()} unit="Points" size="lg" tone="gold" />
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
        <View style={styles.oddsLine}>
          <Text style={styles.oddsLabel}>{topOddsRow.tier.toUpperCase()} TIER ODDS</Text>
          <Text style={styles.oddsValue}>{topOddsRow.chance}</Text>
        </View>
      ) : null}

      <SgButton label={t('packDetails.multiOpen.ctaOpenPack')} onPress={onOpen} style={styles.cta} />

      <TouchableOpacity onPress={goVerify} style={styles.verifyRow} accessibilityRole="button">
        <Text style={styles.verifyLabel}>VIEW ODDS + VERIFICATION RECORD</Text>
        <Text style={styles.verifyArrow}>›</Text>
      </TouchableOpacity>
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
    borderColor: sg.lineStrong,
    padding: 10,
    ...sg.shadowHero,
  },
  ticketHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 4, paddingBottom: 10,
  },
  eyebrow: { fontFamily: sg.font.label, fontSize: 8, letterSpacing: 1, color: sg.goldHi },
  title: { fontFamily: sg.font.display, fontSize: 20, lineHeight: 22, letterSpacing: -0.6, color: sg.text, marginTop: 3 },
  bay: { fontFamily: sg.font.dataBold, fontSize: 9, color: sg.muted, borderWidth: 1, borderColor: sg.line, padding: 5 },
  machineRow: { flexDirection: 'row', gap: 7, alignItems: 'stretch' },
  bayWrap: { flex: 1 },
  readout: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 4 },
  slotsBar: { height: 3, backgroundColor: sg.line, marginHorizontal: 4, marginTop: 8 },
  slotsFill: { height: 3, backgroundColor: sg.success },
  oddsLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 4 },
  oddsLabel: { fontFamily: sg.font.label, fontSize: 8, color: sg.muted, letterSpacing: 0.75 },
  oddsValue: { fontFamily: sg.font.dataBold, fontSize: 10, color: sg.text, fontVariant: [...sg.numeric] },
  cta: { alignSelf: 'stretch', marginTop: 12 },
  verifyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, paddingTop: 12, paddingBottom: 2 },
  verifyLabel: { fontFamily: sg.font.label, fontSize: 8, color: sg.muted, letterSpacing: 0.75 },
  verifyArrow: { fontFamily: sg.font.bodyBold, fontSize: 17, color: sg.goldHi },
});
