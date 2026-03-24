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
import { HomeBackground } from '../components/shared/HomeBackground';
import { MyQrModal } from '../components/friends/MyQrModal';
import { AddFriendModal } from '../components/friends/AddFriendModal';
import { useAppStore } from '../store/useAppStore';
import { buildFriendQrPayload } from '../lib/friendQr';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { SocialFollowRow } from '../components/account/SocialFollowRow';
import { useRequireAuth } from '../hooks/useRequireAuth';

const RING_PALETTE = ['#E11D2E', colors.casinoGold, '#2563EB', '#7C3AED', '#059669', '#EA580C'];

function accentForId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h += id.charCodeAt(i);
  return RING_PALETTE[h % RING_PALETTE.length];
}

export function FriendsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { refreshControl } = usePullToRefresh();
  const { requireAuth } = useRequireAuth();
  const user = useAppStore((s) => s.user);
  const friends = useAppStore((s) => s.friends);

  const [qrOpen, setQrOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const qrPayload = useMemo(() => buildFriendQrPayload(user.memberId), [user.memberId]);

  const copyMyId = () => {
    requireAuth(() => {
      void (async () => {
        await Clipboard.setStringAsync(user.memberId);
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert(t('friendsAlerts.copiedTitle'), t('friendsAlerts.copiedBody'));
      })();
    });
  };

  return (
    <View style={styles.root}>
      <HomeBackground />
      <View style={[styles.safeTop, { paddingTop: insets.top + spacing.md }]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          <View style={styles.hero}>
            <Text style={styles.heroEyebrow}>{t('friends.heroEyebrow')}</Text>
            <View style={styles.heroTop}>
              <View style={styles.titleBlock}>
                <Text style={styles.pageTitle}>{t('friends.title')}</Text>
                <Text style={styles.lead}>{t('friends.lead')}</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => requireAuth(() => setQrOpen(true))}
                  style={styles.headerBtnGhost}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t('friends.showQr')}
                >
                  <Text style={styles.headerBtnGhostText}>{t('friends.qrShort')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => requireAuth(() => setAddOpen(true))}
                  style={styles.headerBtnSolid}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t('friends.add')}
                >
                  <Text style={styles.headerBtnSolidText}>{t('friends.add')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.tagCard}>
            <View style={styles.tagCardLeft} />
            <View style={styles.tagCardBody}>
              <Text style={styles.tagLabel}>{t('friends.yourFriendId')}</Text>
              <Text style={styles.tagValue} numberOfLines={1} selectable>
                {user.memberId}
              </Text>
              <Text style={styles.tagHint}>{t('friends.memberHint')}</Text>
            </View>
            <TouchableOpacity onPress={copyMyId} style={styles.tagCopy} activeOpacity={0.85}>
              <Text style={styles.tagCopyText}>{t('myQr.copy')}</Text>
            </TouchableOpacity>
          </View>

          {friends.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>{t('friends.yourFriends', { count: friends.length })}</Text>
              <View style={styles.friendList}>
                {friends.map((item) => {
                  const ring = accentForId(item.memberId);
                  return (
                    <View key={item.memberId} style={[styles.friendRow, { borderLeftColor: ring }]}>
                      <View style={[styles.friendAvatar, { borderColor: ring }]}>
                        <Text style={[styles.friendAvatarText, { color: ring }]}>
                          {item.displayName.slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.friendMeta}>
                        <Text style={styles.friendName}>{item.displayName}</Text>
                        <Text style={styles.friendId} numberOfLines={1}>
                          {item.memberId}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🎲</Text>
              <Text style={styles.emptyTitle}>{t('friends.emptyTitle')}</Text>
              <Text style={styles.emptyBody}>{t('friends.emptyBody')}</Text>
              <PrimaryButton
                label={t('friends.emptyCta')}
                onPress={() => requireAuth(() => setAddOpen(true))}
                variant="red"
                style={styles.emptyCta}
              />
            </View>
          )}

          <View style={styles.socialCard}>
            <Text style={styles.socialTitle}>{t('account.followUs')}</Text>
            <Text style={styles.socialSubtitle}>{t('account.followSub')}</Text>
            <SocialFollowRow />
          </View>
        </ScrollView>
      </View>

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
    backgroundColor: colors.homeGradientBottom,
  },
  safeTop: {
    flex: 1,
    zIndex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.base,
    paddingBottom: 120,
  },
  hero: {
    backgroundColor: colors.casinoFelt,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.casinoFeltBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.casinoGold,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.xs,
  },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  lead: {
    fontSize: fontSize.sm,
    color: 'rgba(248,250,252,0.65)',
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerBtnGhost: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(240,193,76,0.5)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerBtnGhostText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.casinoGold,
    letterSpacing: 0.5,
  },
  headerBtnSolid: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.red,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  headerBtnSolidText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.white,
    letterSpacing: 0.3,
  },
  tagCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15,23,42,0.08)',
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  tagCardLeft: {
    width: 5,
    backgroundColor: colors.casinoGold,
    opacity: 0.95,
  },
  tagCardBody: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    justifyContent: 'center',
  },
  tagLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tagValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  tagHint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
  tagCopy: {
    alignSelf: 'center',
    marginRight: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.nearBlack,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tagCopyText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    paddingLeft: 2,
  },
  friendList: {
    marginBottom: spacing.xl,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15,23,42,0.06)',
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  friendAvatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
  },
  friendMeta: {
    flex: 1,
    minWidth: 0,
  },
  friendName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  friendId: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.casinoFelt,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.casinoFeltBorder,
    marginBottom: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: fontSize.sm,
    color: 'rgba(248,250,252,0.65)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  emptyCta: {
    minWidth: 240,
  },
  socialCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  socialTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  socialSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
});
