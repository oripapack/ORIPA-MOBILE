import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { sgVault } from '../../tokens/sgVault';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import type { Pull } from '../../data/mockUser';
import Ionicons from '@expo/vector-icons/Ionicons';

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

    return { count, totalPoints, listedUsd, listedCount: listedItems.length, topCard };
  }, [pulls]);

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
          <Text style={styles.totalValue}>{stats.totalPoints.toLocaleString()} Points</Text>
          <Text style={styles.totalLabel}>
            Total Trade in value · {stats.count} {stats.count === 1 ? 'Card' : 'Cards'}
          </Text>
        </View>
        <View style={styles.trophyWrap}>
          <Ionicons name="trophy-outline" size={20} color={sgVault.warning} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <StatBlock
          label="Top pull"
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
});
