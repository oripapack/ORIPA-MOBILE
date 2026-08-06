import React from 'react';
import { sg } from '../../tokens/sg';
import { View, Text, StyleSheet } from 'react-native';
import type { SocialPullEvent } from '../../data/socialMock';
import { formatRelativeTime, formatPoints } from '../../lib/socialFormat';
import { AssetBlockedCard } from '../shared/AssetBlockedCard';

interface Props {
  pull: SocialPullEvent;
}

export function SocialPullRow({ pull }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.art}>
        <AssetBlockedCard compact label="MEDIA PENDING" />
      </View>
      <View style={styles.meta}>
        <View style={styles.titleRow}>
          <Text style={styles.cardName} numberOfLines={2}>
            {pull.cardName}
          </Text>
        </View>
        <Text style={styles.pack} numberOfLines={1}>
          {pull.packTitle}
        </Text>
        <View style={styles.bottom}>
          <Text style={styles.value}>{formatPoints(pull.estimatedValue)}</Text>
          <Text style={styles.time}>{formatRelativeTime(pull.timestamp)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: sg.space.md,
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.panel,
    padding: sg.space.md,
    borderWidth: 1,
    borderColor: sg.line,
    marginBottom: sg.space.sm,
  },
  art: {
    width: 56,
    height: 78,
    borderRadius: sg.radius.btn,
    backgroundColor: sg.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: sg.line,
    overflow: 'hidden',
  },
  meta: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sg.space.sm,
    marginBottom: 4,
  },
  cardName: {
    flex: 1,
    fontSize: 17,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    lineHeight: 20,
  },
  pack: {
    fontSize: 11,
    color: sg.muted,
    marginBottom: sg.space.sm,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: sg.space.sm,
  },
  value: {
    fontSize: 13,
    fontFamily: sg.font.dataBold,
    color: sg.gold,
    fontVariant: [...sg.numeric],
  },
  time: {
    fontSize: 11,
    color: sg.muted,
    marginLeft: 'auto',
  },
});
