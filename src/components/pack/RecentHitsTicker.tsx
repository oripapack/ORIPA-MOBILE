import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View, ScrollView } from 'react-native';
import type { ViewStyle } from 'react-native';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';

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
        pill: { backgroundColor: 'rgba(232, 197, 71, 0.16)', borderColor: 'rgba(232, 197, 71, 0.5)' } as ViewStyle,
        text: colors.gold,
      };
    case 'PSA 10':
      return {
        pill: { backgroundColor: 'rgba(59, 130, 246, 0.14)', borderColor: 'rgba(96, 165, 250, 0.35)' } as ViewStyle,
        text: '#93C5FD',
      };
    case 'Rainbow':
      return {
        pill: { backgroundColor: 'rgba(168, 85, 247, 0.14)', borderColor: 'rgba(192, 132, 252, 0.32)' } as ViewStyle,
        text: '#D8B4FE',
      };
    case 'Legendary':
      return {
        pill: { backgroundColor: 'rgba(196, 30, 58, 0.12)', borderColor: 'rgba(196, 30, 58, 0.4)' } as ViewStyle,
        text: colors.red,
      };
    case 'Secret Rare':
      return {
        pill: { backgroundColor: 'rgba(34, 197, 94, 0.12)', borderColor: 'rgba(74, 222, 128, 0.3)' } as ViewStyle,
        text: '#86EFAC',
      };
    default:
      return {
        pill: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.14)' } as ViewStyle,
        text: colors.textSecondary,
      };
  }
}

function formatUsd(n: number) {
  return `$${n.toLocaleString()}`;
}

export function RecentHitsTicker() {
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
        <Text style={styles.label}>Recent Hits</Text>
        <View style={styles.dot} />
        <Text style={styles.subLabel}>live</Text>
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
            <Text style={styles.fire}>🔥</Text>
            <Text style={styles.text} numberOfLines={1}>
              <Text style={styles.user}>{h.username}</Text>
              <Text style={styles.text}> pulled </Text>
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
            <Text style={styles.value}>{formatUsd(h.valueUsd)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 197, 71, 0.22)',
    overflow: 'hidden',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.base,
    paddingTop: 10,
    paddingBottom: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.gold,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  subLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.red,
    opacity: 0.85,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: 10,
    gap: spacing.sm,
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: 'rgba(10, 16, 12, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(232, 197, 71, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(232, 197, 71, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  fire: {
    fontSize: 12,
  },
  text: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    maxWidth: 210,
  },
  user: {
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  card: {
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  rarityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityText: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 11,
    fontWeight: fontWeight.black,
    color: colors.gold,
  },
});

