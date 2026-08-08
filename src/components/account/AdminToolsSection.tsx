import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUser } from '@clerk/clerk-expo';
import { sg } from '../../tokens/sg';
import { fontSize, brandFont } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { isClerkEnabled } from '../../config/clerk';
import { isAdminUser } from '../../config/admin';
import { useAppStore } from '../../store/useAppStore';
import { VaultFramedCard } from '../shared/VaultFramedCard';

/** Large grant used for the "infinite credits" admin power. */
const INFINITE_CREDITS = 100_000_000;

/**
 * Admin-only tools (grant / reset credits). Visible only to accounts flagged as admin
 * (Clerk `publicMetadata.role === 'admin'` or listed in `config/admin.ts`).
 * When Clerk is disabled, shows in dev builds only so the powers stay reachable.
 */
export function AdminToolsSection() {
  if (!isClerkEnabled) {
    return __DEV__ ? <AdminToolsCard /> : null;
  }
  return <AdminToolsGate />;
}

function AdminToolsGate() {
  const { user, isLoaded } = useUser();
  if (!isLoaded || !isAdminUser(user)) return null;
  return <AdminToolsCard />;
}

function AdminToolsCard() {
  const credits = useAppStore((s) => s.user.credits);
  const setCredits = useAppStore((s) => s.setCredits);

  return (
    <>
      <Text style={styles.sectionHeader}>Admin Tools</Text>
      <VaultFramedCard style={styles.wrap} contentStyle={styles.inner}>
        <View style={styles.balanceRow}>
          <Ionicons name="diamond-outline" size={18} color={sg.gold} />
          <Text style={styles.balanceLabel}>Current balance</Text>
          <Text style={styles.balanceValue}>{credits.toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryAction}
          onPress={() => setCredits(INFINITE_CREDITS)}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Grant infinite Points"
        >
          <Ionicons name="infinite-outline" size={20} color={sg.text} />
          <Text style={styles.primaryActionText}>Grant infinite Points</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryAction}
          onPress={() => setCredits(0)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Reset balance to zero"
        >
          <Ionicons name="refresh-outline" size={18} color={sg.muted} />
          <Text style={styles.secondaryActionText}>Reset balance to 0</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Local wallet only — affects this device for animation / UI testing.
        </Text>
      </VaultFramedCard>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: sg.accentText,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  wrap: {
    marginBottom: spacing.xs,
  },
  inner: {
    padding: spacing.lg,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  balanceLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
    color: sg.muted,
  },
  balanceValue: {
    fontSize: fontSize.md,
    fontFamily: brandFont.black,
    color: sg.text,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: sg.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
    marginBottom: spacing.sm,
  },
  primaryActionText: {
    fontSize: fontSize.md,
    fontFamily: brandFont.bold,
    color: sg.text,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  secondaryActionText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: sg.muted,
  },
  note: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    fontFamily: brandFont.regular,
    color: sg.muted,
    lineHeight: 16,
  },
});
