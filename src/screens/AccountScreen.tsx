import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { ListRow } from '../components/shared/ListRow';
import { useAppStore } from '../store/useAppStore';

const shortcuts = [
  { id: 'notif', icon: '🔔', label: 'Notifications' },
  { id: 'hot', icon: '🔥', label: 'Hot Drops' },
  { id: 'history', icon: '📋', label: 'Pull History' },
  { id: 'promos', icon: '🎟️', label: 'Promos' },
];

const accountRows = [
  { label: 'Shipping Address', icon: '📦' },
  { label: 'Payout Method', icon: '🏦' },
  { label: 'Identity Verification', icon: '🪪' },
  { label: 'Linked Accounts', icon: '🔗' },
];

const supportRows = [
  { label: 'Help Center', icon: '❓' },
  { label: 'Contact Support', icon: '💬' },
  { label: 'FAQ', icon: '📖' },
];

const legalRows = [
  { label: 'Terms of Service', icon: '📄' },
  { label: 'Privacy Policy', icon: '🔒' },
  { label: 'Promotional Rules', icon: '📣' },
  { label: 'Payment Disclosures', icon: '💳' },
];

const socialLinks = [
  { id: 'ig', icon: '📸', label: 'Instagram' },
  { id: 'x', icon: '𝕏', label: 'X' },
  { id: 'yt', icon: '▶️', label: 'YouTube' },
  { id: 'dc', icon: '🎮', label: 'Discord' },
];

export function AccountScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Account</Text>

      {/* Tier / Rewards Card */}
      <View style={styles.tierCard}>
        <View style={styles.tierCardTop}>
          <View>
            <Text style={styles.tierEyebrow}>TIER</Text>
            <Text style={styles.tierName}>{user.tier.toUpperCase()}</Text>
            <Text style={styles.tierXp}>{user.xp.toLocaleString()} / {user.xpToNextTier.toLocaleString()} XP</Text>
          </View>
          <View style={styles.memberBlock}>
            <Text style={styles.memberLabel}>Member ID</Text>
            <Text style={styles.memberId}>{user.memberId}</Text>
            {!user.isVerified && (
              <TouchableOpacity style={styles.verifyBtn}>
                <Text style={styles.verifyBtnText}>Verify Identity</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${Math.min(100, (user.xp / user.xpToNextTier) * 100)}%` as any }]} />
        </View>
        <TouchableOpacity>
          <Text style={styles.viewBenefits}>View Tier Benefits →</Text>
        </TouchableOpacity>
      </View>

      {/* Shortcut grid */}
      <View style={styles.shortcutGrid}>
        {shortcuts.map((s) => (
          <TouchableOpacity key={s.id} style={styles.shortcutItem} activeOpacity={0.7}>
            <Text style={styles.shortcutIcon}>{s.icon}</Text>
            <Text style={styles.shortcutLabel}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Account section */}
      <Text style={styles.sectionHeader}>Account</Text>
      <View style={styles.listGroup}>
        {accountRows.map((row) => (
          <ListRow key={row.label} label={row.label} icon={<Text>{row.icon}</Text>} />
        ))}
      </View>

      {/* Support section */}
      <Text style={styles.sectionHeader}>Support</Text>
      <View style={styles.listGroup}>
        {supportRows.map((row) => (
          <ListRow key={row.label} label={row.label} icon={<Text>{row.icon}</Text>} />
        ))}
      </View>

      {/* Legal section */}
      <Text style={styles.sectionHeader}>Legal</Text>
      <View style={styles.listGroup}>
        {legalRows.map((row) => (
          <ListRow key={row.label} label={row.label} icon={<Text>{row.icon}</Text>} />
        ))}
        <ListRow
          label="Logout"
          icon={<Text>🚪</Text>}
          destructive
          showChevron={false}
          onPress={() => {}}
        />
      </View>

      {/* Social */}
      <Text style={styles.socialTitle}>Follow Us</Text>
      <Text style={styles.socialSubtitle}>Follow our official channels for promos, drops, and updates.</Text>
      <View style={styles.socialRow}>
        {socialLinks.map((link) => (
          <TouchableOpacity key={link.id} style={styles.socialBtn} activeOpacity={0.7}>
            <Text style={styles.socialIcon}>{link.icon}</Text>
            <Text style={styles.socialLabel}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Language & Region */}
      <View style={styles.listGroup}>
        <ListRow label="Language & Region" icon={<Text>🌐</Text>} />
      </View>

      <Text style={styles.version}>VaultPacks v1.0.0</Text>
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
    paddingBottom: 120,
  },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  tierCard: {
    backgroundColor: colors.nearBlack,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.base,
  },
  tierCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  tierEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  tierName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.white,
    letterSpacing: 1,
    marginBottom: 4,
  },
  tierXp: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.55)',
  },
  memberBlock: {
    alignItems: 'flex-end',
  },
  memberLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  memberId: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.sm,
  },
  verifyBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  verifyBtnText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.nearBlack,
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: radius.full,
  },
  viewBenefits: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.gold,
  },
  shortcutGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  shortcutItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: spacing.base,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutIcon: {
    fontSize: 22,
  },
  shortcutLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  listGroup: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  socialSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  socialBtn: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialIcon: {
    fontSize: 20,
  },
  socialLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  version: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
});
