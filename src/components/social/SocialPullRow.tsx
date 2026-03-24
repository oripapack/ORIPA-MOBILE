import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import type { SocialPullEvent } from '../../data/socialMock';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { formatRelativeTime, formatUsd } from '../../lib/socialFormat';
import { rarityColor, rarityLabel } from './rarityStyles';

interface Props {
  pull: SocialPullEvent;
}

export function SocialPullRow({ pull }: Props) {
  const rc = rarityColor(pull.rarity);
  return (
    <View style={styles.row}>
      <View style={[styles.art, { borderColor: rc }]}>
        {pull.imageUrl ? (
          <Image source={{ uri: pull.imageUrl }} style={styles.artImg} resizeMode="cover" />
        ) : (
          <Text style={styles.artEmoji}>🃏</Text>
        )}
      </View>
      <View style={styles.meta}>
        <View style={styles.titleRow}>
          <Text style={styles.cardName} numberOfLines={2}>
            {pull.cardName}
          </Text>
          {pull.badge ? (
            <View style={[styles.badge, pull.badge === 'chase' ? styles.badgeChase : styles.badgeHit]}>
              <Text style={styles.badgeText}>{pull.badge === 'chase' ? 'Chase' : 'Hit'}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.pack} numberOfLines={1}>
          {pull.packTitle}
        </Text>
        <View style={styles.bottom}>
          <View style={[styles.rarityPill, { backgroundColor: `${rc}18` }]}>
            <Text style={[styles.rarityText, { color: rc }]}>{rarityLabel(pull.rarity)}</Text>
          </View>
          <Text style={styles.value}>{formatUsd(pull.estimatedValue)}</Text>
          <Text style={styles.time}>{formatRelativeTime(pull.timestamp)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
    marginBottom: spacing.sm,
  },
  art: {
    width: 56,
    height: 78,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  artImg: { width: '100%', height: '100%' },
  artEmoji: { fontSize: 28 },
  meta: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: 4,
  },
  cardName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeChase: { backgroundColor: 'rgba(225,29,46,0.12)' },
  badgeHit: { backgroundColor: 'rgba(245,158,11,0.15)' },
  badgeText: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.red,
    letterSpacing: 0.5,
  },
  pack: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rarityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  value: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginLeft: 'auto',
  },
});
