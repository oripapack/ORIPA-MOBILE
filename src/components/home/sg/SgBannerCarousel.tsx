import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { sg } from '../../../tokens/sg';

const EXHIBIT_IMAGE = require('../../../../assets/home/tokyo-exhibit-chamber.jpg');
const PACK_IMAGE = require('../../../../assets/home/tokyo-pack-01.png');

const JOURNEY = [
  { code: '01', label: 'SELECT' },
  { code: '02', label: 'REVEAL' },
  { code: '03', label: 'VAULT' },
] as const;

/**
 * Signature exhibit window for the Tokyo Night Terminal skin.
 * The supplied acrylic chamber is confined to this single focal banner; the
 * rest of the interface inherits its light and frame language in code.
 */
export function SgBannerCarousel() {
  const isReleasePreview = !__DEV__;

  return (
    <View style={styles.board} accessibilityRole="summary">
      <View style={styles.exhibit} pointerEvents="none">
        <Image source={EXHIBIT_IMAGE} style={styles.exhibitImage} resizeMode="contain" accessible={false} />
        <View style={styles.exhibitDim} />
        <View style={styles.exhibitHalo} />
        <Image source={PACK_IMAGE} style={styles.exhibitPack} resizeMode="contain" accessible={false} />
        <View style={styles.exhibitPlate}>
          <Text style={styles.exhibitPlateText}>CASE / 01</Text>
        </View>
      </View>

      <View style={styles.copyPanel}>
        <View style={styles.topRow}>
          <Text style={styles.route}>JST / SHOWCASE 01</Text>
          <View style={styles.status}>
            <View style={[styles.statusDot, isReleasePreview && styles.statusDotPending]} />
            <Text style={[styles.statusText, isReleasePreview && styles.statusTextPending]}>
              {isReleasePreview ? 'CATALOG SYNC' : 'PREVIEW'}
            </Text>
          </View>
        </View>

        <View style={styles.message}>
          <Text style={styles.kicker}>東京発 / NIGHT DISPLAY</Text>
          <Text style={styles.title}>PACKS IN LIGHT.{`\n`}CARDS IN HAND.</Text>
          <Text style={styles.subtitle}>DIGITAL REVEAL / PHYSICAL COLLECTION</Text>
        </View>

        <View style={styles.journeyRow}>
          {JOURNEY.map((step) => (
            <View key={step.code} style={styles.journeyCell}>
              <Text style={styles.journeyCode}>{step.code}</Text>
              <Text style={styles.journeyLabel}>{step.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.innerFrame} pointerEvents="none" />
      <View style={styles.chromeTop} pointerEvents="none" />
      <View style={styles.chromeBottom} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    minHeight: 220,
    marginHorizontal: sg.space.md,
    marginTop: sg.space.md,
    backgroundColor: sg.bayShell,
    borderWidth: 1,
    borderColor: sg.ivoryLightSoft,
    borderRadius: sg.radius.panel,
    overflow: 'hidden',
  },
  copyPanel: {
    width: '69%',
    minHeight: 218,
    zIndex: 2,
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.md,
    paddingBottom: 12,
    justifyContent: 'space-between',
    backgroundColor: sg.functionalScrim,
    borderRightWidth: 1,
    borderRightColor: sg.cobaltBorder,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: sg.space.sm },
  route: { flexShrink: 1, fontFamily: sg.font.label, fontSize: 7.5, color: sg.chrome, letterSpacing: 0.95 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 5, height: 5, backgroundColor: sg.success, borderRadius: sg.radius.pill },
  statusDotPending: { backgroundColor: sg.warning },
  statusText: { fontFamily: sg.font.dataBold, fontSize: 7, color: sg.success, letterSpacing: 0.55 },
  statusTextPending: { color: sg.warning },
  message: { paddingVertical: sg.space.sm },
  kicker: { fontFamily: sg.font.label, fontSize: 8, color: sg.goldHi, letterSpacing: 1.15 },
  title: {
    marginTop: 6,
    fontFamily: sg.font.display,
    fontSize: 25,
    lineHeight: 25,
    letterSpacing: -0.8,
    color: sg.text,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: sg.font.label,
    fontSize: 6.8,
    lineHeight: 10,
    letterSpacing: 0.72,
    color: sg.muted,
  },
  journeyRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: sg.line },
  journeyCell: { flex: 1, paddingTop: 9 },
  journeyCode: { fontFamily: sg.font.dataBold, fontSize: 8, color: sg.goldHi, fontVariant: [...sg.numeric] },
  journeyLabel: { marginTop: 2, fontFamily: sg.font.label, fontSize: 6.4, color: sg.muted, letterSpacing: 0.45 },
  exhibit: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '38%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.surface2,
  },
  exhibitImage: { position: 'absolute', top: -4, bottom: -4, width: 110, height: 232 },
  exhibitDim: { ...StyleSheet.absoluteFillObject, backgroundColor: sg.exhibitScrim },
  exhibitHalo: {
    position: 'absolute',
    top: 26,
    width: 84,
    height: 16,
    borderRadius: sg.radius.pill,
    borderWidth: 2,
    borderColor: sg.ivoryLight,
    shadowColor: sg.text,
    shadowOpacity: 0.48,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 0 },
  },
  exhibitPack: {
    position: 'absolute',
    top: 63,
    width: 53,
    height: 90,
    shadowColor: sg.bg,
    shadowOpacity: 0.86,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
  },
  exhibitPlate: {
    position: 'absolute',
    right: sg.space.sm,
    bottom: sg.space.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.ivoryLightSoft,
    borderRadius: sg.radius.tag,
  },
  exhibitPlateText: { fontFamily: sg.font.dataBold, fontSize: 6.5, color: sg.text, letterSpacing: 0.55 },
  innerFrame: {
    position: 'absolute',
    top: 4,
    right: 4,
    bottom: 4,
    left: 4,
    borderWidth: 1,
    borderColor: sg.cobaltBorder,
    borderRadius: sg.radius.tag,
  },
  chromeTop: { position: 'absolute', top: 0, left: 18, right: 18, height: 1, backgroundColor: sg.ivoryLight },
  chromeBottom: { position: 'absolute', bottom: 0, left: 24, right: 24, height: 1, backgroundColor: sg.cobaltLightStrong },
});
