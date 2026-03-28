import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { FriendActivityFeedItem, SocialRarity } from '../../data/socialMock';
import { formatUsd, formatRelativeTime } from '../../lib/socialFormat';

const RARITY_COLORS: Record<SocialRarity, string> = {
  common: '#94a3b8',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
  mythic: '#ef4444',
};

function isJustPulled(d: Date): boolean {
  const s = (Date.now() - d.getTime()) / 1000;
  return s >= 0 && s < 180;
}

function RarityPill({ rarity }: { rarity: SocialRarity }) {
  const c = RARITY_COLORS[rarity];
  return (
    <View style={[styles.rarityPill, { borderColor: `${c}88` }]}>
      <Text style={[styles.rarityPillText, { color: c }]}>{rarity.toUpperCase()}</Text>
    </View>
  );
}

function AnimatedRarityBar({ color }: { color: string }) {
  const o = useSharedValue(0.45);
  useEffect(() => {
    o.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [o]);
  const barAnim = useAnimatedStyle(() => ({
    opacity: o.value,
  }));
  return <Animated.View style={[styles.rarityBar, { backgroundColor: color }, barAnim]} />;
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

  const shadowWrap = Platform.select({
    ios: {
      shadowColor: rarityColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.26,
      shadowRadius: 14,
    },
    android: { elevation: 0 },
  });

  return (
    <View style={[styles.cardWrap, { width: cardWidth }, shadowWrap]}>
      <TouchableOpacity
        style={[
          styles.cardTouchable,
          Platform.OS === 'android'
            ? { borderWidth: 1, borderColor: `${rarityColor}44`, elevation: 8 }
            : null,
        ]}
        onPress={() => onOpenProfile(item.username)}
        activeOpacity={0.92}
      >
      <AnimatedRarityBar color={rarityColor} />
      <View style={[styles.cardInner, { borderColor: `${rarityColor}28` }]}>
        <View style={styles.top}>
          <Text style={styles.emoji}>{item.avatarEmoji}</Text>
          <View style={styles.topText}>
            <Text style={styles.user} numberOfLines={1}>
              @{item.username}
            </Text>
            <View style={styles.metaRow}>
              {just ? (
                <View style={[styles.justPulled, { borderColor: `${rarityColor}55` }]}>
                  <Text style={[styles.justPulledText, { color: rarityColor }]}>{t('friends.justPulled')}</Text>
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
    backgroundColor: 'rgba(12,18,14,0.94)',
    borderWidth: 1,
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
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  time: {
    fontSize: 10,
    color: colors.textMuted,
  },
  justPulled: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  justPulledText: {
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  rarityPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  rarityPillText: {
    fontSize: 8,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
  cardName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
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
    fontWeight: fontWeight.black,
    color: colors.casinoGold,
  },
  pack: {
    flex: 1,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'right',
  },
});
