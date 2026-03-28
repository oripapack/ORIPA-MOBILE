import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { Pack } from '../../data/mockPacks';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { mockPackTopHits } from '../../data/mockTopHits';
import { navigationRef } from '../../navigation/navigationRef';

export function PackCardMini({ pack }: { pack: Pack }) {
  const { t } = useTranslation();
  const loc = getLocalizedPackFields(pack, t);
  const topHit = mockPackTopHits[String(pack.id)];
  const accent = pack.imageColor ?? colors.nearBlack;

  const meta = useMemo(() => {
    const tag = pack.tags?.[0];
    return tag ? t(`packCard.shortBadge.${tag}`) : '';
  }, [pack.tags, t]);

  return (
    <Pressable
      onPress={() => {
        if (navigationRef.isReady()) navigationRef.navigate('PackDetails', { packId: String(pack.id) });
      }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.thumb, { backgroundColor: accent }]}>
        {topHit?.imageUrl ? (
          <Image source={{ uri: topHit.imageUrl }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
        ) : null}
        <View style={styles.thumbOverlay} />
        <Text style={styles.thumbEmoji}>🎴</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {loc.title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {pack.creditPrice.toLocaleString()} {t('packCard.credits')}
          {meta ? ` · ${meta}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  thumb: {
    height: 108,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  thumbEmoji: {
    fontSize: 28,
    color: '#fff',
  },
  body: {
    padding: spacing.sm,
    gap: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  sub: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
});

