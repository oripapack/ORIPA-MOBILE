import React from 'react';
import { sg } from '../../tokens/sg';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SocialPullEvent } from '../../data/socialMock';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { formatRelativeTime, formatUsd } from '../../lib/socialFormat';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
  pull: SocialPullEvent;
}

export function SocialPullRow({ pull }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <View style={styles.art}>
        {pull.imageUrl ? (
          <Image source={{ uri: pull.imageUrl }} style={styles.artImg} resizeMode="cover" />
        ) : (
          <Ionicons name="albums-outline" size={26} color={sg.muted} />
        )}
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
          <Text style={styles.valueLabel}>{t('social.estimatedValue')}</Text>
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
    borderColor: sg.line,
    marginBottom: spacing.sm,
  },
  art: {
    width: 56,
    height: 78,
    borderRadius: radius.md,
    backgroundColor: sg.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
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
    fontSize: fontSize.md,
    fontFamily: sg.font.display,
    color: sg.text,
    lineHeight: 20,
  },
  pack: {
    fontSize: fontSize.xs,
    color: sg.muted,
    marginBottom: spacing.sm,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  valueLabel: {
    fontSize: 10,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.display,
    color: sg.text,
  },
  time: {
    fontSize: fontSize.xs,
    color: sg.muted,
    marginLeft: 'auto',
  },
});
