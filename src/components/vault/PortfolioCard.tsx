import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { sgVault } from '../../tokens/sgVault';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { Pull, PullRarityTier } from '../../data/mockUser';
import Ionicons from '@expo/vector-icons/Ionicons';

const COINS_PER_USD = 100;

function coinsToUsd(coins: number): number {
  return coins / COINS_PER_USD;
}

function formatUsd(usd: number): string {
  if (usd >= 1000) {
    return `$${(usd / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.max(0, usd));
}

const TIER_BAR_COLOR: Record<PullRarityTier, string> = {
  base: sgVault.muted,
  epic: sgVault.goldHi,
  legendary: sgVault.warning,
  mythic: sgVault.neon,
};

interface Props {
  pulls: Pull[];
}

export function PortfolioCard({ pulls }: Props) {
  const stats = useMemo(() => {
    const count = pulls.length;
    const totalUsd = pulls.reduce((acc, p) => acc + coinsToUsd(p.creditsWon), 0);
    const listedItems = pulls.filter((p) => (p.vaultExchangeListUsd ?? 0) >= 1);
    const listedUsd = listedItems.reduce((acc, p) => acc + (p.vaultExchangeListUsd ?? 0), 0);
    const topCard = pulls.reduce<Pull | null>(
      (best, p) => (!best || p.creditsWon > best.creditsWon ? p : best),
      null,
    );

    const dist = { sub10: 0, ten50: 0, fifty100: 0, over100: 0 };
    pulls.forEach((p) => {
      const usd = coinsToUsd(p.creditsWon);
      if (usd >= 100) dist.over100++;
      else if (usd >= 50) dist.fifty100++;
      else if (usd >= 10) dist.ten50++;
      else dist.sub10++;
    });

    return { count, totalUsd, listedUsd, listedCount: listedItems.length, topCard, dist };
  }, [pulls]);

  const maxBucket = Math.max(
    stats.dist.sub10,
    stats.dist.ten50,
    stats.dist.fifty100,
    stats.dist.over100,
    1,
  );
  const hasCards = stats.count > 0;

  return (
    <LinearGradient
      colors={[sgVault.surface2, sgVault.surface, sgVault.bg]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Gold border rim */}
      <View style={styles.goldRim} />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>PORTFOLIO</Text>
          <Text style={styles.totalValue}>{formatUsd(stats.totalUsd)}</Text>
          <Text style={styles.totalLabel}>
            Total Value · {stats.count} {stats.count === 1 ? 'Card' : 'Cards'}
          </Text>
        </View>
        <View style={styles.trophyWrap}>
          <Ionicons name="trophy-outline" size={20} color={sgVault.warning} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <StatBlock
          label="Top Card"
          value={stats.topCard ? stats.topCard.result : '—'}
          truncate
        />
        <View style={styles.statSep} />
        <StatBlock
          label="Listed"
          value={stats.listedCount > 0 ? formatUsd(stats.listedUsd) : '—'}
          accent={stats.listedCount > 0}
        />
      </View>

      {hasCards ? (
        <>
          <View style={styles.distHeader}>
            <Text style={styles.distLabel}>VALUE DISTRIBUTION</Text>
          </View>
          <View style={styles.distBars}>
            <DistBar
              label="<$10"
              count={stats.dist.sub10}
              max={maxBucket}
              color={TIER_BAR_COLOR.base}
            />
            <DistBar
              label="$10–50"
              count={stats.dist.ten50}
              max={maxBucket}
              color={TIER_BAR_COLOR.epic}
            />
            <DistBar
              label="$50–100"
              count={stats.dist.fifty100}
              max={maxBucket}
              color={TIER_BAR_COLOR.epic}
            />
            <DistBar
              label="$100+"
              count={stats.dist.over100}
              max={maxBucket}
              color={TIER_BAR_COLOR.legendary}
            />
          </View>
        </>
      ) : null}
    </LinearGradient>
  );
}

function StatBlock({
  label,
  value,
  truncate,
  accent,
}: {
  label: string;
  value: string;
  truncate?: boolean;
  accent?: boolean;
}) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text
        style={[styles.statValue, accent && styles.statValueAccent]}
        numberOfLines={truncate ? 1 : undefined}
      >
        {value}
      </Text>
    </View>
  );
}

function DistBar({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? count / max : 0;
  return (
    <View style={styles.distBarItem}>
      <Text style={styles.distBarLabel}>{label}</Text>
      <View style={styles.distBarTrack}>
        <View
          style={[
            styles.distBarFill,
            {
              width: `${Math.max(count > 0 ? 8 : 0, pct * 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <Text style={styles.distBarCount}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: sgVault.cobaltBorder,
    overflow: 'hidden',
    shadowColor: sgVault.gold,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  goldRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: sgVault.gold,
    opacity: 0.5,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: sgVault.gold,
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 36,
    fontFamily: brandFont.black,
    color: sgVault.text,
    letterSpacing: -1,
    lineHeight: 40,
  },
  totalLabel: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.medium,
    color: sgVault.muted,
    marginTop: 2,
  },
  trophyWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: sgVault.cobaltWashSoft,
    borderWidth: 1,
    borderColor: sgVault.cobaltBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyEmoji: {
    fontSize: 22,
  },
  divider: {
    height: 1,
    backgroundColor: sgVault.cobaltWashStrong,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statBlock: {
    flex: 1,
  },
  statSep: {
    width: 1,
    backgroundColor: sgVault.line,
    marginHorizontal: spacing.md,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: sgVault.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.bold,
    color: sgVault.text,
    lineHeight: 20,
  },
  statValueAccent: {
    color: sgVault.up,
  },
  distHeader: {
    marginBottom: spacing.sm,
  },
  distLabel: {
    fontSize: 9,
    fontFamily: brandFont.bold,
    color: sgVault.muted,
    letterSpacing: 1.2,
  },
  distBars: {
    gap: 8,
  },
  distBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  distBarLabel: {
    fontSize: 10,
    fontFamily: brandFont.semibold,
    color: sgVault.muted,
    width: 44,
  },
  distBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: sgVault.surface2,
    overflow: 'hidden',
  },
  distBarFill: {
    height: '100%',
    borderRadius: radius.full,
    opacity: 0.85,
  },
  distBarCount: {
    fontSize: 10,
    fontFamily: brandFont.bold,
    color: sgVault.muted,
    width: 20,
    textAlign: 'right',
  },
});
