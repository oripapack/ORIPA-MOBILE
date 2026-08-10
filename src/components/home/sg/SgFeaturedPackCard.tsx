import React from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Pack } from '../../../data/mockPacks';
import { SgButton, SgData } from '../../ui';
import { sg } from '../../../tokens/sg';
import { usePackOdds } from '../../../hooks/usePackOdds';
import { getLocalizedPackFields } from '../../../i18n/packCopy';
import { navigationRef } from '../../../navigation/navigationRef';

const PRODUCT_EXHIBIT_IMAGE = require('../../../../assets/home/tokyo-exhibit-product-clear-v2-wide.jpg');

export function SgFeaturedPackCard({ pack, onOpen }: { pack: Pack; onOpen: () => void }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const loc = getLocalizedPackFields(pack, t);
  const { odds, loading } = usePackOdds(pack);
  const releaseBlocked = !__DEV__ && !odds.isLive;
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
          <Text style={styles.eyebrow}>Tokyo series · Drop 01</Text>
          <Text style={styles.title}>{loc.title}</Text>
        </View>
        <Text style={styles.bay}>Bay A</Text>
      </View>

      <View style={[styles.productBody, isWide && styles.productBodyWide]}>
        <View style={[styles.productStage, isWide && styles.productStageWide]}>
          <Image
            source={PRODUCT_EXHIBIT_IMAGE}
            style={styles.productPhoto}
            resizeMode="cover"
            accessible={false}
          />
          <View style={styles.photoCaption} pointerEvents="none">
            <Text style={styles.photoCaptionCode}>PH-01</Text>
            <Text style={styles.photoCaptionText}>Physical display · Tokyo case</Text>
          </View>
        </View>

        <View style={[styles.productDetails, isWide && styles.productDetailsWide]}>
          {releaseBlocked ? (
            <View style={styles.releaseStatus}>
              <View style={styles.releaseStatusDot} />
              <View style={styles.releaseStatusCopy}>
                <Text style={styles.releaseStatusTitle}>
                  {loading ? t('packDetails.liveChecking') : t('packDetails.liveUnavailableTitle')}
                </Text>
                <Text style={styles.releaseStatusBody}>{t('packDetails.liveUnavailableShort')}</Text>
              </View>
            </View>
          ) : (
            <>
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
            </>
          )}

          {topOddsRow ? (
            <View style={styles.oddsLine}>
              <Text style={styles.oddsLabel}>{topOddsRow.tier} tier odds</Text>
              <Text style={styles.oddsValue}>{topOddsRow.chance}</Text>
            </View>
          ) : null}

          <SgButton
            label={releaseBlocked ? 'View pack details' : t('packDetails.multiOpen.ctaOpenPack')}
            onPress={releaseBlocked ? goVerify : onOpen}
            variant={releaseBlocked ? 'line' : 'gold'}
            style={styles.cta}
          />

          {!releaseBlocked ? (
            <TouchableOpacity onPress={goVerify} style={styles.verifyRow} accessibilityRole="button">
              <Text style={styles.verifyLabel}>View odds and verification record</Text>
              <Text style={styles.verifyArrow}>›</Text>
            </TouchableOpacity>
          ) : null}
        </View>
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    padding: sg.space.md,
    ...sg.shadowHero,
  },
  ticketHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 2, paddingBottom: 12,
  },
  eyebrow: { fontFamily: sg.font.bodyMedium, fontSize: 11, color: sg.goldHi },
  title: { fontFamily: sg.font.display, fontSize: 22, lineHeight: 27, letterSpacing: -0.35, color: sg.text, marginTop: 3 },
  bay: { fontFamily: sg.font.bodyMedium, fontSize: 11, color: sg.muted, padding: 5 },
  productBody: { gap: 12 },
  productBodyWide: { flexDirection: 'row', alignItems: 'stretch' },
  productStage: {
    height: 216,
    backgroundColor: sg.bg,
    borderWidth: 0,
    borderRadius: sg.radius.btn,
    overflow: 'hidden',
  },
  productStageWide: { flex: 1.6, height: 310 },
  productPhoto: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  photoCaption: {
    position: 'absolute', left: 12, bottom: 12,
    paddingHorizontal: 8, paddingVertical: 6,
    backgroundColor: sg.functionalScrim,
    borderWidth: StyleSheet.hairlineWidth, borderColor: sg.line,
    borderRadius: sg.radius.btn,
  },
  photoCaptionCode: { fontFamily: sg.font.dataBold, fontSize: 8, color: sg.goldHi, fontVariant: [...sg.numeric] },
  photoCaptionText: { marginTop: 2, fontFamily: sg.font.bodyMedium, fontSize: 9, color: sg.text },
  productDetails: { gap: 0 },
  productDetailsWide: {
    flex: 1,
    justifyContent: 'center',
    padding: 12,
    backgroundColor: sg.surface2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    borderRadius: sg.radius.btn,
  },
  readout: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 4 },
  slotsBar: { height: 3, backgroundColor: sg.line, marginHorizontal: 4, marginTop: 8 },
  slotsFill: { height: 3, backgroundColor: sg.success },
  oddsLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 4 },
  oddsLabel: { fontFamily: sg.font.bodyMedium, fontSize: 11, color: sg.muted },
  oddsValue: { fontFamily: sg.font.dataBold, fontSize: 10, color: sg.text, fontVariant: [...sg.numeric] },
  releaseStatus: {
    minHeight: 52,
    marginTop: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: sg.warningWash,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.warningBorder,
    borderRadius: sg.radius.btn,
  },
  releaseStatusDot: {
    width: 7,
    height: 7,
    borderRadius: sg.radius.pill,
    backgroundColor: sg.warning,
  },
  releaseStatusCopy: { flex: 1 },
  releaseStatusTitle: {
    fontFamily: sg.font.bodyMedium,
    fontSize: 11,
    color: sg.warning,
  },
  releaseStatusBody: {
    marginTop: 3,
    fontFamily: sg.font.body,
    fontSize: 11,
    color: sg.muted,
  },
  cta: { alignSelf: 'stretch', marginTop: 12 },
  verifyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, paddingTop: 12, paddingBottom: 2 },
  verifyLabel: { fontFamily: sg.font.bodyMedium, fontSize: 11, color: sg.muted },
  verifyArrow: { fontFamily: sg.font.bodyBold, fontSize: 17, color: sg.goldHi },
});
