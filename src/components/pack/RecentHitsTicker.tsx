// 実データ待ち。外部に見せないこと。
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View, ScrollView } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { sg } from '../../tokens/sg';

type HitRarity = 'Gold' | 'Rainbow' | 'PSA 10' | 'Legendary' | 'Secret Rare';

type RecentHit = {
  id: string;
  username: string;
  card: string;
  rarity: HitRarity;
  valueUsd: number;
};

const MOCK_HITS: RecentHit[] = [
  { id: 'h1', username: 'Alex', card: 'PSA 10 Charizard', rarity: 'PSA 10', valueUsd: 1200 },
  { id: 'h2', username: 'Ken', card: 'Gold Mewtwo', rarity: 'Gold', valueUsd: 850 },
  { id: 'h3', username: 'Mika', card: 'Rainbow Pikachu VMAX', rarity: 'Rainbow', valueUsd: 640 },
  { id: 'h4', username: 'Haru', card: 'Legendary Blue-Eyes', rarity: 'Legendary', valueUsd: 980 },
  { id: 'h5', username: 'Sora', card: 'Secret Rare Luffy', rarity: 'Secret Rare', valueUsd: 720 },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? '?';
  const b = parts.length > 1 ? parts[1]?.[0] ?? '' : '';
  return (a + b).toUpperCase();
}

function rarityColors(r: HitRarity) {
  switch (r) {
    case 'Gold':
      return {
        pill: { backgroundColor: sg.surface2, borderColor: sg.gold } as ViewStyle,
        text: sg.gold,
      };
    case 'PSA 10':
    case 'Rainbow':
    case 'Legendary':
    case 'Secret Rare':
      return {
        pill: { backgroundColor: sg.surface2, borderColor: sg.line } as ViewStyle,
        text: sg.muted,
      };
    default:
      return {
        pill: { backgroundColor: sg.surface2, borderColor: sg.line } as ViewStyle,
        text: sg.muted,
      };
  }
}

function formatPoints(n: number) {
  return `${n.toLocaleString()} Points`;
}

export function RecentHitsTicker() {
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);

  const [viewW, setViewW] = useState(0);
  const [contentW, setContentW] = useState(0);

  const hits = useMemo(() => [...MOCK_HITS, ...MOCK_HITS], []);

  const onLayout = (e: LayoutChangeEvent) => setViewW(e.nativeEvent.layout.width);

  useEffect(() => {
    if (!viewW || !contentW) return;
    if (contentW <= viewW + 8) return;

    const half = contentW / 2;
    const speedPxPerSec = 34; // subtle, not distracting

    const tick = (t: number) => {
      if (pausedRef.current) {
        lastTRef.current = t;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const last = lastTRef.current ?? t;
      const dt = Math.min(48, t - last);
      lastTRef.current = t;

      offsetRef.current += (speedPxPerSec * dt) / 1000;
      if (offsetRef.current >= half) {
        offsetRef.current -= half;
      }

      scrollRef.current?.scrollTo({ x: offsetRef.current, y: 0, animated: false });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTRef.current = null;
    };
  }, [viewW, contentW]);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <View style={styles.labelRow} pointerEvents="none">
        <Text style={styles.label}>{t('recentHits.title')}</Text>
        <View style={styles.dot} />
        <Text style={styles.subLabel}>{t('recentHits.live')}</Text>
      </View>

      <ScrollView
        ref={(r) => {
          scrollRef.current = r;
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={(w) => setContentW(w)}
        contentContainerStyle={styles.scrollContent}
        onScrollBeginDrag={() => {
          pausedRef.current = true;
        }}
        onScrollEndDrag={() => {
          pausedRef.current = false;
        }}
        onMomentumScrollBegin={() => {
          pausedRef.current = true;
        }}
        onMomentumScrollEnd={() => {
          pausedRef.current = false;
        }}
        scrollEventThrottle={16}
      >
        {hits.map((h, idx) => (
          <View key={`${h.id}_${idx}`} style={styles.item}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(h.username)}</Text>
            </View>
            <Ionicons name="flash" size={13} color={sg.gold} />
            <Text style={styles.text} numberOfLines={1}>
              <Text style={styles.user}>{h.username}</Text>
              <Text style={styles.text}> {t('recentHits.pulled')} </Text>
              <Text style={styles.card}>{h.card}</Text>
            </Text>
            {(() => {
              const c = rarityColors(h.rarity);
              return (
                <View style={[styles.rarityPill, c.pill]}>
                  <Text style={[styles.rarityText, { color: c.text }]} numberOfLines={1}>
                    {h.rarity}
                  </Text>
                </View>
              );
            })()}
            <Text style={styles.value}>{formatPoints(h.valueUsd)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: sg.space.sm,
    marginHorizontal: sg.space.md,
    marginBottom: sg.space.sm,
    borderRadius: sg.radius.panel,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(212,175,55,0.25)',
    overflow: 'hidden',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: sg.space.md,
    paddingTop: 10,
    paddingBottom: 6,
  },
  label: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  subLabel: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: sg.error,
    opacity: 0.85,
  },
  scrollContent: {
    paddingHorizontal: sg.space.md,
    paddingBottom: 10,
    gap: sg.space.sm,
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: sg.space.sm + 2,
    paddingVertical: 8,
    borderRadius: sg.radius.btn,
    backgroundColor: 'rgba(10, 16, 12, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  text: {
    fontSize: sg.type.xs,
    color: sg.muted,
    maxWidth: 210,
  },
  user: {
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  card: {
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  rarityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: sg.radius.tag,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityText: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 11,
    fontFamily: sg.font.dataBold,
    color: sg.gold,
    fontVariant: [...sg.numeric],
  },
});
