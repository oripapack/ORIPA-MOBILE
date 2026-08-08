import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { TcgCategory } from '../../../shared/types/pack';
import { sg } from '../../tokens/sg';

const EMPTY_EXHIBIT_WIDE = require('../../../assets/home/tokyo-exhibit-empty-clear-v3-wide.png');
const EMPTY_EXHIBIT_PORTRAIT = require('../../../assets/home/tokyo-exhibit-empty-clear-v3-portrait.png');

type ExhibitLayout = 'wide' | 'portrait';
type ExhibitFocus = 'scene' | 'product';

type ArtDirection = {
  categoryCode: string;
};

const ART_BY_CATEGORY: Partial<Record<TcgCategory, ArtDirection>> = {
  'Multi TCG': { categoryCode: 'MULTI' },
  'Pokémon TCG': { categoryCode: 'POKEMON' },
  'One Piece TCG': { categoryCode: 'ONE PIECE' },
  'Yu-Gi-Oh!': { categoryCode: 'DUEL' },
  'Sports Cards': { categoryCode: 'SPORT' },
};

const DEFAULT_ART: ArtDirection = {
  categoryCode: 'CARDS',
};

export function packDisplayCode(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase() || 'PH';
}

function variantFor(value: string): number {
  return Array.from(value).reduce((sum, character) => sum + character.charCodeAt(0), 0) % 3;
}

export function PackProductExhibit({
  name,
  category,
  packId,
  layout = 'wide',
  focus = 'scene',
}: {
  name: string;
  category?: TcgCategory | string;
  packId?: string;
  layout?: ExhibitLayout;
  focus?: ExhibitFocus;
}) {
  const art = ART_BY_CATEGORY[category as TcgCategory] ?? DEFAULT_ART;
  const productCode = packDisplayCode(packId ?? name);
  const variant = variantFor(packId ?? name);
  const portrait = layout === 'portrait';
  const productFocus = focus === 'product';

  return (
    <View
      style={styles.exhibit}
      accessibilityRole="image"
      accessibilityLabel={`${name} product pack in a clear display case`}
    >
      <View
        style={[
          styles.canvas,
          portrait ? styles.canvasPortrait : styles.canvasWide,
          productFocus && styles.canvasProduct,
        ]}
      >
        <Image
          source={portrait ? EMPTY_EXHIBIT_PORTRAIT : EMPTY_EXHIBIT_WIDE}
          style={styles.exhibitPhoto}
          resizeMode="stretch"
          accessible={false}
        />

        <View
          style={[
            styles.pack,
            portrait ? styles.packPortrait : styles.packWide,
            portrait ? styles.packShadowPortrait : styles.packShadowWide,
          ]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={[sg.surfaceRaised, sg.bg, sg.surface, sg.bg]}
            locations={[0, 0.18, 0.64, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.foilHighlight} />
          <View style={styles.foilEdgeLeft} />
          <View style={styles.foilEdgeRight} />
          <View style={[styles.seal, styles.sealTop]}>
            <View style={styles.sealLine} />
            <View style={styles.sealLine} />
          </View>

          <View style={styles.packTopline}>
            <Text
              maxFontSizeMultiplier={1}
              style={[styles.packBrand, portrait ? styles.packBrandPortrait : styles.packBrandWide]}
            >
              PULL HUB
            </Text>
            <View style={styles.seriesBox}>
              <Text
                maxFontSizeMultiplier={1}
                style={[styles.seriesText, portrait ? styles.seriesTextPortrait : styles.seriesTextWide]}
              >
                {productCode}
              </Text>
            </View>
          </View>

          <View style={[styles.titlePanel, variant === 1 && styles.titlePanelOffsetOne, variant === 2 && styles.titlePanelOffsetTwo]}>
            <Text
              maxFontSizeMultiplier={1}
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.56}
              style={[styles.packTitle, portrait ? styles.packTitlePortrait : styles.packTitleWide]}
            >
              {name.toUpperCase()}
            </Text>
            <View style={styles.categoryBand}>
              <Text
                maxFontSizeMultiplier={1}
                numberOfLines={1}
                style={[
                  styles.categoryText,
                  portrait ? styles.categoryTextPortrait : styles.categoryTextWide,
                ]}
              >
                東京発 / {art.categoryCode}
              </Text>
              <View style={styles.slashRow}>
                {[0, 1, 2, 3].map((key) => (
                  <View key={key} style={styles.slash} />
                ))}
              </View>
            </View>
          </View>

          <View
            style={[
              styles.accentBlock,
              variant === 1 && styles.accentBlockOne,
              variant === 2 && styles.accentBlockTwo,
            ]}
          >
            <View style={styles.accentStripe} />
            <View style={styles.accentStripe} />
            <View style={styles.accentStripe} />
          </View>

          <View style={styles.serialRow}>
            <View style={styles.serialBars}>
              {[2, 1, 3, 1, 2, 3, 1].map((weight, index) => (
                <View key={`${weight}-${index}`} style={[styles.serialBar, { width: weight }]} />
              ))}
            </View>
            <View style={styles.originMark}>
              <View style={styles.originMarkCore} />
            </View>
          </View>

          <View style={[styles.seal, styles.sealBottom]}>
            <View style={styles.sealLine} />
            <View style={styles.sealLine} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  exhibit: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: sg.bg,
  },
  canvas: {
    height: '100%',
    position: 'relative',
    flexShrink: 0,
  },
  canvasWide: { aspectRatio: 1672 / 941 },
  canvasPortrait: { aspectRatio: 1082 / 1454 },
  canvasProduct: { height: '138%' },
  exhibitPhoto: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  pack: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: sg.bg,
    borderWidth: 0.5,
    borderColor: sg.cardShine,
    borderRadius: sg.radius.tag,
  },
  packWide: { left: '60.7%', top: '29.3%', width: '16.1%', height: '50.3%' },
  packPortrait: { left: '32.3%', top: '34.1%', width: '35.3%', height: '46.4%' },
  packShadowWide: {
    shadowColor: sg.bg,
    shadowOpacity: 0.78,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
  },
  packShadowPortrait: {
    shadowColor: sg.bg,
    shadowOpacity: 0.82,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  foilHighlight: {
    position: 'absolute',
    top: '3%',
    bottom: '3%',
    left: '8%',
    width: '12%',
    backgroundColor: sg.cardShine,
    transform: [{ skewX: '-7deg' }],
  },
  foilEdgeLeft: { position: 'absolute', left: 1, top: 0, bottom: 0, width: 1, backgroundColor: sg.ivoryLightSoft },
  foilEdgeRight: { position: 'absolute', right: 1, top: 0, bottom: 0, width: 1, backgroundColor: sg.lineStrong },
  seal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '5.5%',
    paddingVertical: 1,
    justifyContent: 'space-evenly',
    backgroundColor: sg.bg,
    borderColor: sg.cardShine,
  },
  sealTop: { top: 0, borderBottomWidth: 0.5 },
  sealBottom: { bottom: 0, borderTopWidth: 0.5 },
  sealLine: { height: 0.5, backgroundColor: sg.cardShine },
  packTopline: {
    position: 'absolute',
    top: '9%',
    left: '9%',
    right: '8%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  packBrand: { flexShrink: 1, fontFamily: sg.font.display, color: sg.text, letterSpacing: -0.5 },
  packBrandWide: { fontSize: 4.2, lineHeight: 4.5 },
  packBrandPortrait: { fontSize: 8.5, lineHeight: 9 },
  seriesBox: { borderWidth: 0.7, borderColor: sg.goldHi, borderRadius: sg.radius.tag, paddingHorizontal: 2, paddingVertical: 1 },
  seriesText: { fontFamily: sg.font.dataBold, color: sg.text, letterSpacing: 0.25 },
  seriesTextWide: { fontSize: 2.8, lineHeight: 3.2 },
  seriesTextPortrait: { fontSize: 5.3, lineHeight: 6 },
  titlePanel: {
    position: 'absolute',
    left: '7%',
    right: '7%',
    top: '25%',
    height: '36%',
    backgroundColor: sg.ticket,
    borderRadius: sg.radius.tag,
    overflow: 'hidden',
    paddingTop: '6%',
  },
  titlePanelOffsetOne: { top: '27%', left: '10%', right: '4%' },
  titlePanelOffsetTwo: { top: '23%', left: '5%', right: '9%' },
  packTitle: { flex: 1, paddingHorizontal: '6%', fontFamily: sg.font.display, color: sg.ticketInk, letterSpacing: -0.45 },
  packTitleWide: { fontSize: 5.5, lineHeight: 5.7 },
  packTitlePortrait: { fontSize: 11.5, lineHeight: 11.5 },
  categoryBand: {
    minHeight: '28%',
    marginTop: 2,
    paddingHorizontal: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: sg.goldHi,
  },
  categoryText: { flexShrink: 1, fontFamily: sg.font.dataBold, color: sg.onGold, letterSpacing: 0.15 },
  categoryTextWide: { fontSize: 2.2, lineHeight: 2.8 },
  categoryTextPortrait: { fontSize: 4.3, lineHeight: 5 },
  slashRow: { flexDirection: 'row', gap: 1 },
  slash: { width: 2, height: 7, backgroundColor: sg.text, transform: [{ skewX: '-18deg' }] },
  accentBlock: {
    position: 'absolute',
    right: 0,
    top: '49%',
    width: '34%',
    height: '16%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderTopLeftRadius: sg.radius.tag,
    borderBottomLeftRadius: sg.radius.tag,
    backgroundColor: sg.chrome,
  },
  accentBlockOne: { top: '62%', width: '42%' },
  accentBlockTwo: { top: '64%', width: '24%', height: '11%' },
  accentStripe: { width: 2, height: '55%', backgroundColor: sg.functionalScrim, transform: [{ skewX: '-18deg' }] },
  serialRow: {
    position: 'absolute',
    left: '9%',
    right: '9%',
    bottom: '10%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  serialBars: {
    height: 10,
    minWidth: 25,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 1,
    backgroundColor: sg.ticket,
  },
  serialBar: { backgroundColor: sg.ticketInk },
  originMark: {
    width: 12,
    height: 12,
    borderRadius: sg.radius.pill,
    borderWidth: 1,
    borderColor: sg.goldHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  originMarkCore: { width: 3, height: 3, borderRadius: sg.radius.pill, backgroundColor: sg.goldHi },
});
