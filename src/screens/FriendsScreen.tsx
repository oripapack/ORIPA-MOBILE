import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
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
import { useGuestMode } from '../context/GuestModeContext';
import { useFriendInviteResolver } from '../hooks/useFriendInviteResolver';
import { QrScannerModal } from '../components/friends/QrScannerModal';
import { navigationRef } from '../navigation/navigationRef';
import { VaultFramedCard } from '../components/shared/VaultFramedCard';

const RING_PALETTE = [colors.red, colors.gold, '#2563EB', '#7C3AED', '#059669', '#EA580C'];

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
  const { isGuest } = useGuestMode();
  const user = useAppStore((s) => s.user);
  const friends = useAppStore((s) => s.friends);

  const [qrOpen, setQrOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [friendScannerOpen, setFriendScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { resolveFromUsername } = useFriendInviteResolver({ onAdded: () => setAddOpen(false) });

  const qrPayload = useMemo(
    () => (user.username.trim() ? buildFriendQrPayload(user.username) : ''),
    [user.username],
  );

  const filteredFriends = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter(
      (f) =>
        f.username.toLowerCase().includes(q) ||
        f.displayName.toLowerCase().includes(q),
    );
  }, [friends, searchQuery]);

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

  const hasUsername = Boolean(user.username.trim());

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
          {isGuest ? (
            <VaultFramedCard style={styles.guestBanner}>
              <Text style={styles.guestBannerTitle}>{t('onboarding.friendsGuestTitle')}</Text>
              <Text style={styles.guestBannerBody}>{t('onboarding.friendsGuestBody')}</Text>
            </VaultFramedCard>
          ) : null}

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroKickerRow}>
              <View style={styles.heroRule} />
              <Text style={styles.heroEyebrow}>{t('friends.heroEyebrow')}</Text>
            </View>
            <View style={styles.heroTitleRow}>
              <Text style={styles.heroTitle}>{t('friends.title')}</Text>
              {friends.length > 0 ? (
                <View style={styles.countPill}>
                  <Text style={styles.countPillText}>{friends.length}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.heroLead}>{t('friends.lead')}</Text>
          </View>

          {/* Identity — shared vault frame */}
          <VaultFramedCard style={styles.vaultCard}>
            <Text style={styles.metaLabel}>{t('friends.yourUsername')}</Text>
              <View style={styles.handleBlock}>
                <Text style={styles.handleText} numberOfLines={1} selectable>
                  {hasUsername ? `@${user.username}` : '—'}
                </Text>
                <TouchableOpacity
                  onPress={copyMyUsername}
                  style={styles.copyBtn}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={t('myQr.copy')}
                >
                  <Ionicons name="copy-outline" size={18} color={colors.gold} />
                  <Text style={styles.copyBtnLabel}>{t('myQr.copy')}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>{t('friends.usernameHint')}</Text>

              <Text style={styles.sectionConnectLabel}>{t('friends.sectionConnect')}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionPrimary}
                  onPress={openQr}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                  accessibilityLabel={t('friends.showQr')}
                >
                  <LinearGradient
                    colors={['rgba(232,197,71,0.18)', 'rgba(34,197,94,0.12)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Ionicons name="qr-code-outline" size={22} color={colors.gold} />
                  <View style={styles.actionTextCol}>
                    <Text style={styles.actionTitle}>{t('friends.qrShort')}</Text>
                    <Text style={styles.actionSub}>{t('friends.qrActionSub')}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionPrimary}
                  onPress={openAdd}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                  accessibilityLabel={t('friends.addFriend')}
                >
                  <LinearGradient
                    colors={['rgba(196,30,58,0.35)', 'rgba(196,30,58,0.2)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Ionicons name="person-add-outline" size={22} color={colors.white} />
                  <View style={styles.actionTextCol}>
                    <Text style={[styles.actionTitle, styles.actionTitleOnCta]}>{t('friends.add')}</Text>
                    <Text style={[styles.actionSub, styles.actionSubOnCta]}>{t('friends.addActionSub')}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.leaderboardCard}
                onPress={openLeaderboard}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel={t('social.openLeaderboard')}
              >
                <View style={styles.leaderboardIconWrap}>
                  <Ionicons name="podium-outline" size={22} color={colors.gold} />
                </View>
                <View style={styles.leaderboardTextCol}>
                  <Text style={styles.leaderboardTitle}>{t('social.openLeaderboard')}</Text>
                  <Text style={styles.leaderboardHint}>{t('friends.leaderboardHint')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
          </VaultFramedCard>

          {/* Friends list */}
          {friends.length > 0 ? (
            <>
              <View style={styles.listHeader}>
                <Text style={styles.listSectionTitle}>{t('friends.yourFriends', { count: friends.length })}</Text>
              </View>
              <View style={styles.searchWrap}>
                <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t('friends.searchPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  style={styles.searchInput}
                  autoCorrect={false}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                />
              </View>
              {filteredFriends.length === 0 ? (
                <View style={styles.noMatch}>
                  <Text style={styles.noMatchText}>{t('friends.noSearchMatches')}</Text>
                </View>
              ) : (
                <View style={styles.friendList}>
                  {filteredFriends.map((item) => {
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
                        <View style={[styles.friendAccent, { backgroundColor: ring }]} />
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
                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          ) : (
            <VaultFramedCard style={styles.emptyVaultWrap} contentStyle={styles.emptyVaultContent}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="people-outline" size={36} color={colors.gold} />
              </View>
              <Text style={styles.emptyTitle}>{t('friends.emptyTitle')}</Text>
              <Text style={styles.emptyBody}>{t('friends.emptyBody')}</Text>
              <PrimaryButton label={t('friends.emptyCta')} onPress={openAdd} variant="red" style={styles.emptyCta} />
            </VaultFramedCard>
          )}

          {/* Social */}
          <VaultFramedCard style={styles.socialCardWrap}>
            <Text style={styles.socialEyebrow}>{t('account.followUs')}</Text>
            <Text style={styles.socialSubtitle}>{t('account.followSub')}</Text>
            <SocialFollowRow />
          </VaultFramedCard>
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
  guestBanner: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
  },
  guestBannerTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  guestBannerBody: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  hero: {
    marginBottom: spacing.lg,
  },
  heroKickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  heroRule: {
    width: 28,
    height: 2,
    backgroundColor: colors.gold,
    opacity: 0.85,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 2.4,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },
  countPill: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(232,197,71,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.35)',
  },
  countPillText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.gold,
    textAlign: 'center',
  },
  heroLead: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    maxWidth: 380,
    letterSpacing: 0.15,
  },
  vaultCard: {
    marginBottom: spacing.xl,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  handleBlock: {
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
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.35)',
    backgroundColor: 'rgba(232,197,71,0.08)',
  },
  copyBtnLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.gold,
    letterSpacing: 0.4,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  sectionConnectLabel: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 72,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actionTextCol: {
    flex: 1,
    minWidth: 0,
  },
  actionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  actionTitleOnCta: {
    color: colors.white,
  },
  actionSub: {
    fontSize: 10,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    marginTop: 3,
  },
  actionSubOnCta: {
    color: 'rgba(255,255,255,0.88)',
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(5,8,6,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  leaderboardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(232,197,71,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.22)',
  },
  leaderboardTextCol: {
    flex: 1,
    minWidth: 0,
  },
  leaderboardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  leaderboardHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 3,
  },
  listHeader: {
    marginBottom: spacing.sm,
  },
  listSectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: 'rgba(5,8,6,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  noMatch: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  noMatchText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  friendList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(21,32,24,0.75)',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  friendAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    opacity: 0.75,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginLeft: 2,
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
  emptyVaultWrap: {
    marginBottom: spacing.xl,
  },
  emptyVaultContent: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,197,71,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232,197,71,0.22)',
    marginBottom: spacing.lg,
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
    lineHeight: 22,
    marginBottom: spacing.lg,
    maxWidth: 300,
  },
  emptyCta: {
    minWidth: 220,
  },
  socialCardWrap: {
    marginTop: spacing.xs,
  },
  socialEyebrow: {
    fontSize: 9,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 2,
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
