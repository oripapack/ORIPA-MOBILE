import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { Pack } from '../../data/mockPacks';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { mockPackTopHits } from '../../data/mockTopHits';
import { getMockPackOdds } from '../../data/mockPackOdds';
import { PackOddsModal } from '../pack/PackOddsModal';
import { navigationRef } from '../../navigation/navigationRef';

const W = Dimensions.get('window').width - spacing.base * 2;

type Props = {
  pack: Pack;
  onBrowseFloor?: () => void;
};

/** Featured drop — vault showcase framing, spotlight, asymmetry (not a generic SaaS card). */
export function DropLobbyHero({ pack, onBrowseFloor }: Props) {
  const { t } = useTranslation();
  const loc = getLocalizedPackFields(pack, t);
  const topHit = mockPackTopHits[String(pack.id)];
  const odds = useMemo(() => getMockPackOdds(String(pack.id)), [pack.id]);
  const [oddsOpen, setOddsOpen] = useState(false);

  return (
    <View style={styles.section}>
      <View style={styles.kickerRow}>
        <View style={styles.kickerLine} />
        <Text style={styles.kicker}>{t('home.lobby.featuredKicker')}</Text>
      </View>

      <Pressable
        onPress={() => navigationRef.isReady() && navigationRef.navigate('PackDetails', { packId: String(pack.id) })}
        style={({ pressed }) => [styles.frame, pressed && styles.pressed]}
      >
        <View style={styles.bracketTL} />
        <View style={styles.bracketTR} />
        <View style={styles.bracketBL} />
        <View style={styles.bracketBR} />
        <View style={styles.rail} />

        <View style={[styles.hero, { backgroundColor: pack.imageColor ?? colors.nearBlack }]}>
          {pack.imageUrl ? (
            <Image source={{ uri: pack.imageUrl }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          ) : null}
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.55)', 'rgba(5,8,6,0.92)']}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(212,175,55,0.22)', 'transparent', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.55 }}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>{t('home.lobby.featuredEyebrow')}</Text>
            <Text style={styles.title} numberOfLines={2}>
              {loc.title}
            </Text>
            <Text style={styles.sub} numberOfLines={2}>
              {topHit ? `${topHit.name} · ${topHit.estValue}` : loc.valueDescription}
            </Text>
          </View>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>{t('home.lobby.price')}</Text>
              <Text style={styles.metaValue}>
                {pack.creditPrice.toLocaleString()} {t('packCard.credits')}
              </Text>
            </View>
            <View style={[styles.metaCol, styles.metaColRight]}>
              <Text style={styles.metaLabel}>{t('home.lobby.remaining')}</Text>
              <Text style={styles.metaValue}>
                {pack.remainingInventory.toLocaleString()} / {pack.totalInventory.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={() => setOddsOpen(true)} style={styles.oddsBtn}>
              <Text style={styles.oddsText}>{t('home.lobby.viewOdds')}</Text>
            </Pressable>
            {onBrowseFloor ? (
              <Pressable onPress={onBrowseFloor} style={styles.floorBtn}>
                <Text style={styles.floorText}>{t('home.lobby.enterFloor')}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Pressable>

      <PackOddsModal visible={oddsOpen} onClose={() => setOddsOpen(false)} packTitle={loc.title} odds={odds} />
    </View>
  );
}

const BR = 14;
const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kickerLine: {
    width: 28,
    height: 2,
    backgroundColor: colors.gold,
    opacity: 0.85,
  },
  kicker: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  frame: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(8,12,10,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.28)',
    shadowColor: 'rgba(212,175,55,0.35)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 14,
  },
  pressed: { opacity: 0.97 },
  rail: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    backgroundColor: colors.gold,
    opacity: 0.55,
    zIndex: 4,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  bracketTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: BR,
    height: BR,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(232,197,71,0.55)',
    zIndex: 5,
  },
  bracketTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: BR,
    height: BR,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(232,197,71,0.55)',
    zIndex: 5,
  },
  bracketBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: BR,
    height: BR,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(232,197,71,0.4)',
    zIndex: 5,
  },
  bracketBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: BR,
    height: BR,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(232,197,71,0.4)',
    zIndex: 5,
  },
  hero: {
    height: Math.min(200, W * 0.48),
    justifyContent: 'flex-end',
    paddingLeft: spacing.md + 4,
    paddingRight: spacing.base,
  },
  heroCopy: {
    paddingBottom: spacing.base,
    paddingTop: spacing.sm,
    maxWidth: '88%',
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
    color: 'rgba(245,237,214,0.65)',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.white,
    letterSpacing: -0.8,
    lineHeight: 30,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  sub: {
    marginTop: 6,
    fontSize: fontSize.sm,
    color: 'rgba(245,237,214,0.82)',
    lineHeight: 20,
  },
  meta: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(5,8,6,0.75)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(212,175,55,0.2)',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metaCol: { flex: 1 },
  metaColRight: { alignItems: 'flex-end' },
  metaLabel: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.6,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  oddsBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  oddsText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  floorBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: 'rgba(232,197,71,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.45)',
  },
  floorText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.gold,
    letterSpacing: 0.4,
  },
});
