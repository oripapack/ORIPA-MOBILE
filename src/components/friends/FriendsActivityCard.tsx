import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { FriendActivityFeedItem } from '../../data/socialMock';
import { formatUsd, formatRelativeTime } from '../../lib/socialFormat';

function isJustPulled(d: Date): boolean {
  const s = (Date.now() - d.getTime()) / 1000;
  return s >= 0 && s < 180;
}

type Props = {
  item: FriendActivityFeedItem;
  cardWidth: number;
  onOpenProfile: (u: string) => void;
};

export function FriendsActivityCard({ item, cardWidth, onOpenProfile }: Props) {
  const { t } = useTranslation();
  const just = isJustPulled(item.timestamp);

  return (
    <View style={[styles.cardWrap, { width: cardWidth }]}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => onOpenProfile(item.username)}
        activeOpacity={0.92}
      >
      <View style={styles.cardInner}>
        <View style={styles.top}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.displayName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.topText}>
            <Text style={styles.user} numberOfLines={1}>
              @{item.username}
            </Text>
            <View style={styles.metaRow}>
              {just ? (
                <View style={styles.justPulled}>
                  <Text style={styles.justPulledText}>{t('friends.justPulled')}</Text>
                </View>
              ) : (
                <Text style={styles.time}>{formatRelativeTime(item.timestamp)}</Text>
              )}
            </View>
          </View>
        </View>
        <Text style={styles.cardName} numberOfLines={2}>
          {item.cardName}
        </Text>
        <View style={styles.bottom}>
          <View>
            <Text style={styles.value}>{formatUsd(item.estimatedValue)}</Text>
            <Text style={styles.valueBasis}>{t('friends.listedValue')}</Text>
          </View>
          <Text style={styles.pack} numberOfLines={1}>
            {item.packTitle}
          </Text>
        </View>
      </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    marginVertical: 4,
    marginRight: spacing.sm,
  },
  cardTouchable: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardInner: {
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
    minHeight: 148,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface2,
  },
  avatarText: {
    fontSize: 11,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
  },
  topText: {
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    marginTop: 4,
    minHeight: 16,
    justifyContent: 'center',
  },
  user: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  time: {
    fontSize: 10,
    color: sg.muted,
  },
  justPulled: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: sg.radius.tag,
    borderWidth: 1,
    borderColor: 'rgba(255,74,56,0.42)',
    backgroundColor: sg.surface2,
  },
  justPulledText: {
    fontSize: 9,
    fontFamily: sg.font.bodyBold,
    color: sg.neon,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardName: {
    fontSize: fontSize.md,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  value: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.dataBold,
    color: sg.gold,
    fontVariant: [...sg.numeric],
  },
  valueBasis: {
    marginTop: 2,
    fontSize: 9,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pack: {
    flex: 1,
    fontSize: 10,
    color: sg.muted,
    textAlign: 'right',
  },
});
