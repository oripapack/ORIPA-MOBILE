import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { PrimaryButton } from '../components/shared/PrimaryButton';
import { MyQrModal } from '../components/friends/MyQrModal';
import { AddFriendModal } from '../components/friends/AddFriendModal';
import { useAppStore } from '../store/useAppStore';
import { buildFriendQrPayload } from '../lib/friendQr';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { SocialFollowRow } from '../components/account/SocialFollowRow';

export function FriendsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { refreshControl } = usePullToRefresh();
  const user = useAppStore((s) => s.user);
  const friends = useAppStore((s) => s.friends);

  const [qrOpen, setQrOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const qrPayload = useMemo(() => buildFriendQrPayload(user.memberId), [user.memberId]);

  const copyMyId = async () => {
    await Clipboard.setStringAsync(user.memberId);
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert(t('friendsAlerts.copiedTitle'), t('friendsAlerts.copiedBody'));
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {/* Title row + actions */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>{t('friends.title')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setQrOpen(true)}
              style={styles.headerBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('friends.showQr')}
            >
              <Text style={styles.headerBtnText}>{t('friends.qrShort')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAddOpen(true)}
              style={[styles.headerBtn, styles.headerBtnPrimary]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('friends.add')}
            >
              <Text style={styles.headerBtnPrimaryText}>{t('friends.add')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Compact: your ID */}
        <View style={styles.idStrip}>
          <Text style={styles.idStripLabel}>{t('friends.yourFriendId')}</Text>
          <Text style={styles.idStripValue} numberOfLines={1}>
            {user.memberId}
          </Text>
          <TouchableOpacity onPress={copyMyId} style={styles.idStripPill} activeOpacity={0.7}>
            <Text style={styles.idStripPillText}>{t('myQr.copy')}</Text>
          </TouchableOpacity>
        </View>

        {/* Friends list or empty */}
        {friends.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>{t('friends.yourFriends', { count: friends.length })}</Text>
            <View style={styles.friendList}>
              {friends.map((item) => (
                <View key={item.memberId} style={styles.friendRow}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>
                      {item.displayName.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.friendMeta}>
                    <Text style={styles.friendName}>{item.displayName}</Text>
                    <Text style={styles.friendId}>{item.memberId}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🤝</Text>
            <Text style={styles.emptyTitle}>{t('friends.emptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('friends.emptyBody')}</Text>
            <PrimaryButton
              label={t('friends.emptyCta')}
              onPress={() => setAddOpen(true)}
              variant="red"
              style={styles.emptyCta}
            />
          </View>
        )}

        <Text style={styles.socialTitle}>{t('account.followUs')}</Text>
        <Text style={styles.socialSubtitle}>{t('account.followSub')}</Text>
        <SocialFollowRow />
      </ScrollView>

      <MyQrModal
        visible={qrOpen}
        onClose={() => setQrOpen(false)}
        qrValue={qrPayload}
        memberId={user.memberId}
        displayName={user.displayName}
        onCopied={() => Alert.alert(t('friendsAlerts.copiedTitle'), t('friendsAlerts.copiedBody'))}
      />

      <AddFriendModal visible={addOpen} onClose={() => setAddOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.base,
    paddingBottom: 120,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  pageTitle: {
    flex: 1,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  headerBtnPrimary: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  headerBtnPrimaryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  idStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  idStripLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  idStripValue: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  idStripPill: {
    backgroundColor: colors.nearBlack,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  idStripPillText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  friendList: {
    marginBottom: spacing.lg,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.chipNew,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.chipNewText,
  },
  friendMeta: {
    flex: 1,
  },
  friendName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  friendId: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
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
    marginBottom: spacing.lg,
  },
  emptyCta: {
    minWidth: 220,
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
});
