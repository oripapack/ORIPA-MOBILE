import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { Pack } from '../../data/mockPacks';
import { LobbyPackTile, LOBBY_TILE_SCROLL_GAP, type LobbyRailVariant } from './LobbyPackTile';

type Props = {
  titleKey: string;
  subtitleKey: string;
  packs: Pack[];
  railVariant: LobbyRailVariant;
};

export function LobbyPackRail({ titleKey, subtitleKey, packs, railVariant }: Props) {
  const { t } = useTranslation();
  if (packs.length === 0) return null;

  return (
    <View style={[styles.section, railVariant === 'new' && styles.sectionNew]}>
      {railVariant === 'new' ? (
        <View style={styles.headNew}>
          <Text style={styles.titleNew}>{t(titleKey)}</Text>
          <Text style={styles.subNew}>{t(subtitleKey)}</Text>
        </View>
      ) : railVariant === 'hot' ? (
        <View style={styles.headHot}>
          <View style={styles.hotAccentRule} />
          <View style={styles.headHotRow}>
            <Text style={styles.titleHot}>{t(titleKey)}</Text>
            <View style={styles.hotChip}>
              <Text style={styles.hotChipText}>
                {t('home.lobby.hotFloorChip', { defaultValue: 'Hot' })}
              </Text>
            </View>
          </View>
          <Text style={styles.subHot}>{t(subtitleKey)}</Text>
        </View>
      ) : (
        <View style={styles.headGraded}>
          <View style={styles.gradedRule} />
          <Text style={styles.titleGraded}>{t(titleKey)}</Text>
          <Text style={styles.subGraded}>{t(subtitleKey)}</Text>
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={styles.scroll}
      >
        {packs.map((p) => (
          <LobbyPackTile key={String(p.id)} pack={p} railVariant={railVariant} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingTop: spacing.xxxl - 4,
    paddingBottom: spacing.md,
  },
  sectionNew: {
    marginTop: spacing.md,
    paddingTop: spacing.xxxl + spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  headNew: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
    gap: 6,
  },
  titleNew: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.medium,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subNew: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.regular,
    color: colors.textMuted,
    lineHeight: 17,
    maxWidth: '96%',
  },
  headHot: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  hotAccentRule: {
    width: 40,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(185, 90, 75, 0.35)',
    marginBottom: 4,
  },
  headHotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingRight: 4,
  },
  titleHot: {
    flex: 1,
    fontSize: fontSize.lg,
    fontFamily: brandFont.medium,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  hotChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(185, 90, 75, 0.28)',
  },
  hotChipText: {
    fontSize: 9,
    fontFamily: brandFont.medium,
    letterSpacing: 1.1,
    color: colors.redDark,
    textTransform: 'uppercase',
  },
  subHot: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.regular,
    color: colors.textMuted,
    lineHeight: 17,
    maxWidth: '96%',
  },
  headGraded: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
    gap: 6,
  },
  gradedRule: {
    width: 40,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(107, 80, 150, 0.28)',
    marginBottom: 4,
  },
  titleGraded: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.medium,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subGraded: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 17,
    maxWidth: '96%',
  },
  scroll: {
    paddingHorizontal: spacing.base,
    gap: LOBBY_TILE_SCROLL_GAP,
    paddingBottom: spacing.sm,
  },
});
