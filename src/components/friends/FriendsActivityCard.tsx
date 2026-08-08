import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { FriendActivityFeedItem, SocialRarity } from '../../data/socialMock';
import { formatUsd, formatRelativeTime } from '../../lib/socialFormat';

const RARITY_COLORS: Record<SocialRarity, string> = {
  common: sg.muted,
  uncommon: sg.muted,
  rare: sg.muted,
  epic: sg.value,
  legendary: sg.valueHi,
  mythic: sg.neon,
};

const TIER_LABELS: Record<SocialRarity, 'BASE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC'> = {
  common: 'BASE',
  uncommon: 'BASE',
  rare: 'BASE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
  mythic: 'MYTHIC',
};

function isJustPulled(d: Date): boolean {
  const s = (Date.now() - d.getTime()) / 1000;
  return s >= 0 && s < 180;
}

function RarityPill({ rarity }: { rarity: SocialRarity }) {
  const c = RARITY_COLORS[rarity];
  const tier = TIER_LABELS[rarity];
  if (tier === 'BASE') return null;
  return (
    <View style={[styles.rarityPill, { borderColor: c }]}>
      <Text style={[styles.rarityPillText, { color: c }]}>{tier}</Text>
    </View>
  );
}

function RarityBar({ color }: { color: string }) {
  return <View style={[styles.rarityBar, { backgroundColor: color }]} />;
}

type Props = {
  item: FriendActivityFeedItem;
  cardWidth: number;
  onOpenProfile: (u: string) => void;
};

export function FriendsActivityCard({ item, cardWidth, onOpenProfile }: Props) {
  const { t } = useTranslation();
  const rarityColor = RARITY_COLORS[item.rarity];
  const just = isJustPulled(item.timestamp);

  return (
    <View style={[styles.cardWrap, { width: cardWidth }]}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => onOpenProfile(item.username)}
        activeOpacity={0.92}
      >
        <RarityBar color={rarityColor} />
        <View style={styles.cardInner}>
          <View style={styles.top}>
            <Text style={styles.emoji}>{item.username.trim().slice(0, 2).toUpperCase()}</Text>
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
            <RarityPill rarity={item.rarity} />
          </View>
          <Text style={styles.cardName} numberOfLines={2}>
            {item.cardName}
          </Text>
          <View style={styles.bottom}>
            <Text style={styles.value}>{formatUsd(item.estimatedValue)}</Text>
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
  rarityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    zIndex: 2,
  },
  cardInner: {
    marginLeft: 3,
    borderRadius: radius.lg,
    padding: spacing.md,
    paddingLeft: spacing.md + 2,
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
  emoji: {
    fontSize: 22,
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
    fontFamily: brandFont.bold,
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
    borderRadius: 6,
    borderWidth: 1,
    borderColor: sg.cobaltBorder,
    backgroundColor: sg.surface2,
  },
  justPulledText: {
    fontSize: 9,
    fontFamily: brandFont.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: sg.accentText,
  },
  rarityPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: sg.surface2,
  },
  rarityPillText: {
    fontSize: 8,
    fontFamily: brandFont.black,
    letterSpacing: 0.5,
  },
  cardName: {
    fontSize: fontSize.md,
    fontFamily: brandFont.black,
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
    fontFamily: brandFont.black,
    color: sg.valueHi,
  },
  pack: {
    flex: 1,
    fontSize: 10,
    color: sg.muted,
    textAlign: 'right',
  },
});
