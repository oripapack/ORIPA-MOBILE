import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUser } from '@clerk/clerk-expo';
import { sg } from '../../tokens/sg';
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
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: sg.space.lg,
    marginBottom: sg.space.xs,
    paddingLeft: sg.space.xs,
  },
  wrap: {
    marginBottom: sg.space.xs,
  },
  inner: {
    padding: sg.space.lg,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
    marginBottom: sg.space.md,
  },
  balanceLabel: {
    flex: 1,
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
  },
  balanceValue: {
    fontSize: sg.type.md,
    fontFamily: sg.font.dataBold,
    fontVariant: [...sg.numeric],
    color: sg.text,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sg.space.sm,
    backgroundColor: sg.gold,
    borderRadius: sg.radius.panel,
    paddingVertical: sg.space.md,
    minHeight: 48,
    marginBottom: sg.space.sm,
  },
  primaryActionText: {
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sg.space.sm,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface,
    paddingVertical: sg.space.md,
    minHeight: 48,
  },
  secondaryActionText: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
  },
  note: {
    marginTop: sg.space.md,
    fontSize: sg.type.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 16,
  },
});
