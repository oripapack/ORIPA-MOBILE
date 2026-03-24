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
import { useFriendInviteResolver } from '../hooks/useFriendInviteResolver';
import { QrScannerModal } from '../components/friends/QrScannerModal';
import { navigationRef } from '../navigation/navigationRef';

const RING_PALETTE = [colors.red, colors.casinoGold, '#2563EB', '#7C3AED', '#059669', '#EA580C'];

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
  const [friendScannerOpen, setFriendScannerOpen] = useState(false);

  const { resolveFromUsername } = useFriendInviteResolver({ onAdded: () => setAddOpen(false) });

  const qrPayload = useMemo(
    () => (user.username.trim() ? buildFriendQrPayload(user.username) : ''),
    [user.username],
  );

  const openQr = () => {
    requireAuth(() => {
      if (!user.username.trim()) {
        Alert.alert(t('friendsAlerts.noUsernameTitle'), t('friendsAlerts.noUsernameBody'));
        return;
      }
      setQrOpen(true);
    });
  };

  const openAdd = () => requireAuth(() => setAddOpen(true));

  const openLeaderboard = () =>
    requireAuth(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('FriendsLeaderboard');
      }
    });

  const openFriendProfile = (username: string) =>
    requireAuth(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('FriendProfile', { username });
      }
    });

  const copyMyUsername = () => {
    requireAuth(() => {
      void (async () => {
        const handle = user.username.trim();
        if (!handle) {
          Alert.alert(t('friendsAlerts.noUsernameTitle'), t('friendsAlerts.noUsernameBody'));
          return;
        }
        await Clipboard.setStringAsync(handle);
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
          <View style={styles.pageIntro}>
            <Text style={styles.introEyebrow}>{t('friends.heroEyebrow')}</Text>
            <Text style={styles.introTitle}>{t('friends.title')}</Text>
            <Text style={styles.introLead}>{t('friends.lead')}</Text>
          </View>

          <View style={styles.identityCard}>
            <Text style={styles.identityLabel}>{t('friends.yourUsername')}</Text>
            <View style={styles.handleRow}>
              <Text style={styles.handleText} numberOfLines={1} selectable>
                {user.username.trim() ? `@${user.username}` : '—'}
              </Text>
              <TouchableOpacity
                onPress={copyMyUsername}
                style={styles.copyPill}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('myQr.copy')}
              >
                <Text style={styles.copyPillText}>{t('myQr.copy')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.identityHint}>{t('friends.usernameHint')}</Text>

            <View style={styles.identityDivider} />

            <View style={styles.actionPair}>
              <TouchableOpacity
                style={[styles.actionTile, styles.actionTileQr]}
                onPress={openQr}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel={t('friends.showQr')}
              >
                <Text style={styles.actionTileTitle}>{t('friends.qrShort')}</Text>
                <Text style={styles.actionTileSub}>{t('friends.qrActionSub')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionTile, styles.actionTileAdd]}
                onPress={openAdd}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel={t('friends.addFriend')}
              >
                <Text style={[styles.actionTileTitle, styles.actionTileTitleOnRed]}>{t('friends.add')}</Text>
                <Text style={[styles.actionTileSub, styles.actionTileSubOnRed]}>{t('friends.addActionSub')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.leaderboardRow}
              onPress={openLeaderboard}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel={t('social.openLeaderboard')}
            >
              <Text style={styles.leaderboardRowText}>{t('social.openLeaderboard')}</Text>
              <Text style={styles.leaderboardRowChev}>→</Text>
            </TouchableOpacity>
          </View>

          {friends.length > 0 ? (
            <>
              <Text style={styles.listSectionLabel}>{t('friends.yourFriends', { count: friends.length })}</Text>
              <View style={styles.friendList}>
                {friends.map((item) => {
                  const ring = accentForId(item.username);
                  return (
                    <TouchableOpacity
                      key={item.username}
                      style={styles.friendRow}
                      onPress={() => openFriendProfile(item.username)}
                      activeOpacity={0.88}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.displayName} @${item.username}`}
                    >
                      <View style={[styles.friendAvatar, { borderColor: ring }]}>
                        <Text style={[styles.friendAvatarText, { color: ring }]}>
                          {item.displayName.slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.friendMeta}>
                        <Text style={styles.friendName} numberOfLines={1}>
                          {item.displayName}
                        </Text>
                        <Text style={styles.friendHandle} numberOfLines={1}>
                          @{item.username}
                        </Text>
                      </View>
                      <Text style={styles.friendChev}>→</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>👋</Text>
              <Text style={styles.emptyTitle}>{t('friends.emptyTitle')}</Text>
              <Text style={styles.emptyBody}>{t('friends.emptyBody')}</Text>
              <PrimaryButton label={t('friends.emptyCta')} onPress={openAdd} variant="red" style={styles.emptyCta} />
            </View>
          )}

          <View style={styles.socialCard}>
            <Text style={styles.socialEyebrow}>{t('account.followUs')}</Text>
            <Text style={styles.socialSubtitle}>{t('account.followSub')}</Text>
            <SocialFollowRow />
          </View>
        </ScrollView>
      </View>

      <MyQrModal
        visible={qrOpen}
        onClose={() => setQrOpen(false)}
        qrValue={qrPayload}
        username={user.username}
        displayName={user.displayName}
        onCopied={() => Alert.alert(t('friendsAlerts.copiedTitle'), t('friendsAlerts.copiedBody'))}
        onScanSomeoneElse={() => {
          setQrOpen(false);
          setFriendScannerOpen(true);
        }}
      />

      <AddFriendModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onRequestScanner={() => {
          setAddOpen(false);
          setFriendScannerOpen(true);
        }}
      />

      <QrScannerModal
        visible={friendScannerOpen}
        onClose={() => setFriendScannerOpen(false)}
        onUsernameScanned={(username) => {
          resolveFromUsername(username);
        }}
      />
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
  pageIntro: {
    marginBottom: spacing.lg,
    paddingHorizontal: 2,
  },
  introEyebrow: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.casinoGold,
    letterSpacing: 2.2,
    marginBottom: spacing.sm,
  },
  introTitle: {
    fontSize: fontSize.hero - 2,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: -0.8,
    marginBottom: spacing.sm,
  },
  introLead: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 21,
    maxWidth: 360,
  },
  identityCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  identityLabel: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  handleText: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  copyPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.nearBlack,
  },
  copyPillText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.white,
    letterSpacing: 0.4,
  },
  identityHint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  identityDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  actionPair: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionTile: {
    flex: 1,
    minHeight: 76,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTileQr: {
    backgroundColor: colors.casinoFelt,
    borderWidth: 1,
    borderColor: 'rgba(240,193,76,0.45)',
  },
  actionTileAdd: {
    backgroundColor: colors.red,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  actionTileTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.white,
    letterSpacing: 0.5,
  },
  actionTileTitleOnRed: {
    color: colors.white,
  },
  actionTileSub: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: 'rgba(248,250,252,0.72)',
    marginTop: 4,
  },
  actionTileSubOnRed: {
    color: 'rgba(255,255,255,0.88)',
  },
  leaderboardRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.08)',
  },
  leaderboardRowText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  leaderboardRowChev: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  listSectionLabel: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    paddingLeft: 2,
  },
  friendList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  friendAvatarText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
  },
  friendMeta: {
    flex: 1,
    minWidth: 0,
  },
  friendName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  friendHandle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    marginTop: 3,
  },
  friendChev: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.08)',
    marginBottom: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
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
  socialCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
  },
  socialEyebrow: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  socialSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
});
