import React from 'react';
import { sg } from '../../tokens/sg';
import { View, Text, StyleSheet, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { SocialPullEvent } from '../../data/socialMock';
import { radius, spacing } from '../../tokens/spacing';
import { formatRelativeTime, formatUsd } from '../../lib/socialFormat';

interface Props {
  pull: SocialPullEvent;
}

export function SocialPullRow({ pull }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.art}>
        {pull.imageUrl ? (
          <Image source={{ uri: pull.imageUrl }} style={styles.artImg} resizeMode="cover" />
        ) : (
          <Ionicons name="albums-outline" size={27} color={sg.muted} />
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
    backgroundColor: sg.surface2,
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
    backgroundColor: sg.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: sg.line,
    overflow: 'hidden',
  },
  artImg: { width: '100%', height: '100%' },
  meta: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: 4,
  },
  cardName: {
    flex: 1,
    fontSize: 17,
    fontFamily: sg.font.display,
    color: sg.text,
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
    fontFamily: sg.font.display,
    color: sg.error,
    letterSpacing: 0.5,
  },
  pack: {
    fontSize: 11,
    color: sg.muted,
    marginBottom: spacing.sm,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  value: {
    fontSize: 13,
    fontFamily: sg.font.dataBold,
    color: sg.text,
    fontVariant: [...sg.numeric],
  },
  time: {
    fontSize: 11,
    color: sg.muted,
    marginLeft: 'auto',
  },
});
