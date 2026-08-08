import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { sg } from '../../tokens/sg';
import { fontSize } from '../../tokens/typography';
import type { Pack } from '../../data/mockPacks';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { getMockPackTopHit } from '../../data/mockTopHits';
import { navigationRef } from '../../navigation/navigationRef';
import Ionicons from '@expo/vector-icons/Ionicons';

export function PackCardMini({ pack }: { pack: Pack }) {
  const { t } = useTranslation();
  const loc = getLocalizedPackFields(pack, t);
  const topHit = getMockPackTopHit(pack);
  const accent = pack.imageColor ?? sg.bg;

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
        <Ionicons name="albums-outline" size={27} color={sg.text} />
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
    borderRadius: sg.radius.panel,
    overflow: 'hidden',
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  thumb: {
    height: 108,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: sg.exhibitScrim,
  },
  thumbEmoji: {
    fontSize: 28,
  },
  body: {
    padding: sg.space.sm,
    gap: 4,
  },
  title: {
    fontSize: 12,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    lineHeight: 16,
  },
  sub: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    fontVariant: [...sg.numeric],
  },
});
