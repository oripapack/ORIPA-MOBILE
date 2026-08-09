import React from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { sg } from '../../../tokens/sg';

const PRODUCT_EXHIBIT_IMAGE = require('../../../../assets/home/tokyo-exhibit-product-clear-v2-wide.jpg');
const PRODUCT_EXHIBIT_PORTRAIT_IMAGE = require('../../../../assets/home/tokyo-exhibit-product-clear-v2-portrait.jpg');

const JOURNEY = [
  { code: '01', label: 'Select' },
  { code: '02', label: 'Reveal' },
  { code: '03', label: 'Vault' },
] as const;

/**
 * Signature exhibit window for the Tokyo Night Terminal skin.
 * The supplied acrylic chamber is confined to this single focal banner; the
 * rest of the interface inherits its light and frame language in code.
 */
export function SgBannerCarousel() {
  const isReleasePreview = !__DEV__;
  const { width } = useWindowDimensions();
  const isWide = width >= 760;

  return (
    <View style={[styles.board, isWide && styles.boardWide]} accessibilityRole="summary">
      <View style={[styles.productPane, isWide && styles.productPaneWide]}>
        <Image
          source={isWide ? PRODUCT_EXHIBIT_IMAGE : PRODUCT_EXHIBIT_PORTRAIT_IMAGE}
          style={styles.productPhoto}
          resizeMode="cover"
          accessible={false}
        />
      </View>

      <View style={[styles.copyPanel, isWide && styles.copyPanelWide]}>
        <View style={styles.topRow}>
          <Text style={styles.route}>Tokyo · Showcase 01</Text>
          <View style={styles.status}>
            <View style={[styles.statusDot, isReleasePreview && styles.statusDotPending]} />
            <Text style={[styles.statusText, isReleasePreview && styles.statusTextPending]}>
              {isReleasePreview ? 'Catalog preview' : 'Preview'}
            </Text>
          </View>
        </View>

        <View style={styles.message}>
          <Text style={styles.kicker}>東京発 · Tokyo-born collection</Text>
          <Text style={styles.title}>Packs in light.{`\n`}Cards in hand.</Text>
          <Text style={styles.subtitle}>Digital reveal · Physical collection</Text>
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

      <View style={styles.exhibitPlate} pointerEvents="none">
        <Text style={styles.exhibitPlateText}>Case 01</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    height: 220,
    marginHorizontal: sg.space.md,
    marginTop: sg.space.md,
    backgroundColor: sg.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    borderRadius: sg.radius.panel,
    overflow: 'hidden',
  },
  boardWide: { height: 300 },
  productPane: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '36%',
    overflow: 'hidden',
    borderTopLeftRadius: sg.radius.btn,
    borderBottomLeftRadius: sg.radius.btn,
  },
  productPaneWide: {
    width: '48%',
  },
  productPhoto: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  copyPanel: {
    width: '64%',
    height: '100%',
    zIndex: 2,
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.md,
    paddingBottom: 12,
    justifyContent: 'space-between',
    backgroundColor: sg.bg,
    borderRightWidth: 0,
  },
  copyPanelWide: {
    width: '52%',
    paddingHorizontal: sg.space.lg,
    paddingTop: sg.space.lg,
    paddingBottom: sg.space.md,
    borderRightWidth: 0,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: sg.space.sm },
  route: { flexShrink: 1, fontFamily: sg.font.bodyMedium, fontSize: 11, color: sg.muted },
  status: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 5, height: 5, backgroundColor: sg.success, borderRadius: sg.radius.pill },
  statusDotPending: { backgroundColor: sg.warning },
  statusText: { fontFamily: sg.font.bodyMedium, fontSize: 10, color: sg.success },
  statusTextPending: { color: sg.warning },
  message: { paddingVertical: sg.space.sm },
  kicker: { fontFamily: sg.font.japaneseBold, fontSize: 10, color: sg.goldHi, letterSpacing: 0.15 },
  title: {
    marginTop: 6,
    fontFamily: sg.font.display,
    fontSize: 27,
    lineHeight: 29,
    letterSpacing: -0.45,
    color: sg.text,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: sg.font.body,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0,
    color: sg.muted,
  },
  journeyRow: { flexDirection: 'row', gap: sg.space.sm },
  journeyCell: { flex: 1, paddingTop: 9 },
  journeyCode: { fontFamily: sg.font.dataBold, fontSize: 8, color: sg.goldHi, fontVariant: [...sg.numeric] },
  journeyLabel: { marginTop: 2, fontFamily: sg.font.bodyMedium, fontSize: 9, color: sg.muted },
  exhibitPlate: {
    position: 'absolute',
    right: sg.space.sm,
    bottom: sg.space.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: sg.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sg.line,
    borderRadius: sg.radius.tag,
  },
  exhibitPlateText: { fontFamily: sg.font.bodyMedium, fontSize: 9, color: sg.text },
});
