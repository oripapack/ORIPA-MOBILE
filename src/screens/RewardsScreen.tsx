import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { useAppStore } from '../store/useAppStore';

export function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const pct = Math.min(100, Math.round((user.xp / user.xpToNextTier) * 100));

  const tierColors: Record<string, string> = {
    Starter: '#6B7280',
    Bronze: '#92400E',
    Silver: '#6B7280',
    Gold: '#B45309',
  };
  const tierColor = tierColors[user.tier] ?? colors.textSecondary;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Rewards</Text>

      {/* Tier card */}
      <View style={styles.tierCard}>
        <View style={styles.tierTop}>
          <View>
            <Text style={styles.tierEyebrow}>TIER</Text>
            <Text style={[styles.tierName, { color: tierColor }]}>{user.tier.toUpperCase()}</Text>
          </View>
          <View style={styles.tierBadge}>
            <Text style={styles.tierBadgeText}>🏆</Text>
          </View>
        </View>

        <View style={styles.xpRow}>
          <Text style={styles.xpText}>{user.xp.toLocaleString()} / {user.xpToNextTier.toLocaleString()} XP</Text>
          <Text style={styles.xpPct}>{pct}%</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: tierColor }]} />
        </View>

        <TouchableOpacity style={styles.viewBenefits}>
          <Text style={styles.viewBenefitsText}>View Tier Benefits →</Text>
        </TouchableOpacity>
      </View>

      {/* Pull History */}
      <Text style={styles.sectionTitle}>Pull History</Text>
      {user.pullHistory.map((pull) => (
        <View key={pull.id} style={styles.pullCard}>
          <View style={styles.pullLeft}>
            <Text style={styles.pullEmoji}>✨</Text>
            <View>
              <Text style={styles.pullResult}>{pull.result}</Text>
              <Text style={styles.pullPack}>{pull.packTitle}</Text>
            </View>
          </View>
          <View style={styles.pullRight}>
            <Text style={styles.pullCredits}>+{pull.creditsWon.toLocaleString()}</Text>
            <Text style={styles.pullDate}>
              {pull.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>
      ))}

      {user.pullHistory.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No pulls yet</Text>
          <Text style={styles.emptyBody}>Open your first pack to see your pull history here.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  tierCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  tierTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  tierEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  tierName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  tierBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierBadgeText: {
    fontSize: 24,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  xpText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  xpPct: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    marginBottom: spacing.base,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  viewBenefits: {
    alignSelf: 'flex-start',
  },
  viewBenefitsText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.red,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  pullCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pullLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  pullEmoji: {
    fontSize: 24,
  },
  pullResult: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  pullPack: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pullRight: {
    alignItems: 'flex-end',
  },
  pullCredits: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.green,
  },
  pullDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.base,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
