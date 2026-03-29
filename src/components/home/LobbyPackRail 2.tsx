import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { spacing } from '../../tokens/spacing';
import type { Pack } from '../../data/mockPacks';
import { LobbyPackTile, type LobbyRailVariant } from './LobbyPackTile';

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
    <View style={styles.section}>
      <View style={styles.head}>
        <View style={styles.headTop}>
          <Text style={styles.title}>{t(titleKey)}</Text>
          <View style={styles.rule} />
        </View>
        <Text style={styles.sub}>{t(subtitleKey)}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
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
    paddingTop: spacing.xl,
  },
  head: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
    gap: 6,
  },
  headTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(212,175,55,0.22)',
    marginTop: 4,
    maxWidth: 120,
  },
  sub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
    letterSpacing: 0.15,
    maxWidth: '92%',
  },
  scroll: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
});
