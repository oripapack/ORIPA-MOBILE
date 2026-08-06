import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { sgVault } from '../../tokens/sgVault';
import { radius, spacing } from '../../tokens/spacing';
import type { Pull } from '../../data/mockUser';

const fontSize = { xs: 11, sm: 13 } as const;
const vaultFont = {
  medium: sgVault.font.bodyMedium,
  semibold: sgVault.font.bodyMedium,
  bold: sgVault.font.bodyBold,
} as const;

function formatPoints(points: number): string {
  return `${Math.max(0, points).toLocaleString('en-US')} pts`;
}

interface Props {
  pulls: Pull[];
}

export function PortfolioCard({ pulls }: Props) {
  const stats = useMemo(() => {
    const count = pulls.length;
    const totalPoints = pulls.reduce((acc, p) => acc + p.creditsWon, 0);
    const listedItems = pulls.filter((p) => (p.vaultExchangeListUsd ?? 0) >= 1);
    const listedUsd = listedItems.reduce((acc, p) => acc + (p.vaultExchangeListUsd ?? 0), 0);
    const topCard = pulls.reduce<Pull | null>(
      (best, p) => (!best || p.creditsWon > best.creditsWon ? p : best),
      null,
    );

    const dist = { sub1k: 0, one5k: 0, five10k: 0, over10k: 0 };
    pulls.forEach((p) => {
      const points = p.creditsWon;
      if (points >= 10_000) dist.over10k++;
      else if (points >= 5_000) dist.five10k++;
      else if (points >= 1_000) dist.one5k++;
      else dist.sub1k++;
    });

    return { count, totalPoints, listedUsd, listedCount: listedItems.length, topCard, dist };
  }, [pulls]);

  const maxBucket = Math.max(
    stats.dist.sub1k,
    stats.dist.one5k,
    stats.dist.five10k,
    stats.dist.over10k,
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
          <Text style={styles.totalValue}>{formatPoints(stats.totalPoints)}</Text>
          <Text style={styles.totalLabel}>
            Total listed value · {stats.count} {stats.count === 1 ? 'Card' : 'Cards'}
          </Text>
        </View>
        <View style={styles.trophyWrap}>
          <Ionicons name="trophy-outline" size={22} color={sgVault.gold} />
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
          value={stats.listedCount > 0 ? `$${stats.listedUsd.toLocaleString('en-US')}` : '—'}
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
              label="<1K"
              count={stats.dist.sub1k}
              max={maxBucket}
              color={sgVault.muted}
            />
            <DistBar
              label="1–5K"
              count={stats.dist.one5k}
              max={maxBucket}
              color={sgVault.muted}
            />
            <DistBar
              label="5–10K"
              count={stats.dist.five10k}
              max={maxBucket}
              color={sgVault.muted}
            />
            <DistBar
              label="10K+"
              count={stats.dist.over10k}
              max={maxBucket}
              color={sgVault.gold}
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
    borderColor: 'rgba(212,175,55,0.38)',
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
    fontFamily: vaultFont.bold,
    color: sgVault.gold,
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 36,
    fontFamily: sgVault.font.dataBold,
    color: sgVault.text,
    letterSpacing: -1,
    lineHeight: 40,
    fontVariant: [...sgVault.numeric],
  },
  totalLabel: {
    fontSize: fontSize.xs,
    fontFamily: vaultFont.medium,
    color: sgVault.muted,
    marginTop: 2,
  },
  trophyWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: 'rgba(212,175,55,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(212,175,55,0.25)',
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
    fontFamily: vaultFont.bold,
    color: sgVault.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: fontSize.sm,
    fontFamily: vaultFont.bold,
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
    fontFamily: vaultFont.bold,
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
    fontFamily: vaultFont.semibold,
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
    fontFamily: sgVault.font.dataBold,
    color: sgVault.muted,
    width: 20,
    textAlign: 'right',
    fontVariant: [...sgVault.numeric],
  },
});
