import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
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
import { FriendsHubMenu } from '../components/friends/FriendsHubMenu';
import { FriendsActivityCard } from '../components/friends/FriendsActivityCard';
import {
  buildFriendsRecentActivity,
  buildLeaderboard,
  buildMinimalSocialProfile,
  deriveSocialProfileFromUser,
  getSocialProfile,
  type LeaderboardEntry,
} from '../data/socialMock';
import { formatUsd } from '../lib/socialFormat';
import { PUBLIC_WEB_ORIGIN } from '../config/app';

const RING_PALETTE = [colors.red, colors.gold, '#2563EB', '#7C3AED', '#059669', '#EA580C'];

function accentForId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h += id.charCodeAt(i);
  return RING_PALETTE[h % RING_PALETTE.length];
}

const LB_PREVIEW = 3;

/** Seconds between auto-advance steps; keep slow so it feels ambient, not flashy */
const ACTIVITY_AUTO_SCROLL_INTERVAL_MS = 4200;
/** After the user drags the carousel, pause auto-scroll for this long */
const ACTIVITY_AUTO_SCROLL_PAUSE_AFTER_DRAG_MS = 14_000;

export function FriendsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { refreshControl } = usePullToRefresh();
  const { requireAuth } = useRequireAuth();
  const { isGuest } = useGuestMode();
  const user = useAppStore((s) => s.user);
  const friends = useAppStore((s) => s.friends);

  const [menuOpen, setMenuOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [friendScannerOpen, setFriendScannerOpen] = useState(false);

  const { resolveFromUsername } = useFriendInviteResolver({ onAdded: () => setAddOpen(false) });

  const qrPayload = useMemo(
    () => (user.username.trim() ? buildFriendQrPayload(user.username) : ''),
    [user.username],
  );

  const meProfile = useMemo(() => deriveSocialProfileFromUser(user), [user]);

  const activityFeed = useMemo(
    () => (friends.length > 0 ? buildFriendsRecentActivity(friends, 24) : []),
    [friends],
  );

  const leaderboardPreview = useMemo((): LeaderboardEntry[] => {
    const full = buildLeaderboard('totalValue', user.username, meProfile, friends);
    return full.slice(0, LB_PREVIEW);
  }, [user.username, meProfile, friends]);

  const friendRows = useMemo(
    () =>
      friends.map((f) => ({
        entry: f,
        profile: getSocialProfile(f.username) ?? buildMinimalSocialProfile(f),
      })),
    [friends],
  );

  const activityCardWidth = Math.min(300, Math.max(232, Dimensions.get('window').width * 0.72));
  const activityScrollRef = useRef<ScrollView>(null);
  const activityScrollXRef = useRef(0);
  const activityPauseAutoUntilRef = useRef(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [activityCarouselMetrics, setActivityCarouselMetrics] = useState({ layoutW: 0, contentW: 0 });

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (!cancelled) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  const activityCardStride = activityCardWidth + spacing.sm;

  useEffect(() => {
    if (!isFocused || reduceMotion || activityFeed.length < 2) return;
    const { layoutW, contentW } = activityCarouselMetrics;
    if (layoutW < 8 || contentW <= layoutW) return;

    const tick = () => {
      if (Date.now() < activityPauseAutoUntilRef.current) return;
      const maxScroll = Math.max(0, contentW - layoutW);
      let next = activityScrollXRef.current + activityCardStride;
      if (next > maxScroll - 4) next = 0;
      activityScrollRef.current?.scrollTo({ x: next, animated: true });
    };

    const id = setInterval(tick, ACTIVITY_AUTO_SCROLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [
    isFocused,
    reduceMotion,
    activityFeed.length,
    activityCarouselMetrics.layoutW,
    activityCarouselMetrics.contentW,
    activityCardStride,
  ]);

  const onActivityCarouselLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setActivityCarouselMetrics((s) => (s.layoutW === w ? s : { ...s, layoutW: w }));
  }, []);

  const onActivityContentSizeChange = useCallback((w: number) => {
    setActivityCarouselMetrics((s) => (s.contentW === w ? s : { ...s, contentW: w }));
  }, []);

  const pauseActivityAutoScroll = useCallback(() => {
    activityPauseAutoUntilRef.current = Date.now() + ACTIVITY_AUTO_SCROLL_PAUSE_AFTER_DRAG_MS;
  }, []);

  const openLeaderboard = useCallback(
    () =>
      requireAuth(() => {
        if (navigationRef.isReady()) navigationRef.navigate('FriendsLeaderboard');
      }),
    [requireAuth],
  );

  const openPromotions = useCallback(
    () =>
      requireAuth(() => {
        if (navigationRef.isReady()) navigationRef.navigate('Promotions');
      }),
    [requireAuth],
  );

  const openFriendProfile = useCallback(
    (username: string) =>
      requireAuth(() => {
        if (navigationRef.isReady()) navigationRef.navigate('FriendProfile', { username });
      }),
    [requireAuth],
  );

  const openAdd = useCallback(() => requireAuth(() => setAddOpen(true)), [requireAuth]);

  const copyInviteLink = useCallback(async () => {
    const handle = user.username.trim();
    if (!handle) {
      Alert.alert(t('friendsAlerts.noUsernameTitle'), t('friendsAlerts.noUsernameBody'));
      return;
    }
    const link = `${PUBLIC_WEB_ORIGIN}?r=${encodeURIComponent(handle)}`;
    await Clipboard.setStringAsync(link);
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert(t('friendsAlerts.copiedTitle'), t('friendsAlerts.copiedBody'));
  }, [user.username, t]);

  const onHubSelect = useCallback(
    (action: 'addUsername' | 'scanQr' | 'showQr' | 'shareInvite' | 'promo') => {
      requireAuth(() => {
        if (action === 'addUsername') setAddOpen(true);
        else if (action === 'scanQr') setFriendScannerOpen(true);
        else if (action === 'showQr') {
          if (!user.username.trim()) {
            Alert.alert(t('friendsAlerts.noUsernameTitle'), t('friendsAlerts.noUsernameBody'));
            return;
          }
          setQrOpen(true);
        } else if (action === 'shareInvite') void copyInviteLink();
        else if (action === 'promo') openPromotions();
      });
    },
    [requireAuth, copyInviteLink, openPromotions, user.username, t],
  );

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

          {/* Header — content-first; utilities live in the menu */}
          <View style={styles.headerRow}>
            <Text style={styles.pageTitle}>{t('friends.title')}</Text>
            {!isGuest ? (
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => setMenuOpen(true)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('friends.hubMenuTitle')}
              >
                <Ionicons name="ellipsis-horizontal" size={26} color={colors.textPrimary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerBtnPlaceholder} />
            )}
          </View>

          {/* 1 — Recent activity (horizontal — primary focus) */}
          <View style={styles.sectionActivity}>
            <Text style={styles.sectionEyebrow}>{t('friends.sectionActivity')}</Text>
            {friends.length === 0 || activityFeed.length === 0 ? (
              <Text style={styles.inlineEmpty}>{t('friends.emptyActivity')}</Text>
            ) : (
              <View style={styles.activityCarouselBleed}>
                <ScrollView
                  ref={activityScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  contentContainerStyle={styles.activityCarousel}
                  onLayout={onActivityCarouselLayout}
                  onContentSizeChange={onActivityContentSizeChange}
                  onScroll={(ev) => {
                    activityScrollXRef.current = ev.nativeEvent.contentOffset.x;
                  }}
                  scrollEventThrottle={32}
                  onScrollBeginDrag={pauseActivityAutoScroll}
                >
                  {activityFeed.map((item) => (
                    <FriendsActivityCard
                      key={item.id}
                      item={item}
                      cardWidth={activityCardWidth}
                      onOpenProfile={openFriendProfile}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* 2 — Leaderboard (compact) */}
          <View style={styles.sectionLeaderboard}>
            <Text style={styles.sectionEyebrowSm}>{t('friends.sectionLeaderboard')}</Text>
            <Text style={styles.sectionHintCompact}>{t('friends.leaderboardPreviewHint')}</Text>
            {leaderboardPreview.length === 0 ? (
              <Text style={styles.inlineEmptySm}>{t('friends.emptyLeaderboardHint')}</Text>
            ) : (
              <View style={styles.leaderboardBlock}>
                {leaderboardPreview.map((e) => (
                  <TouchableOpacity
                    key={e.username}
                    style={[styles.lbRow, e.isCurrentUser && styles.lbRowMe]}
                    onPress={openLeaderboard}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.lbRank}>{e.rank}</Text>
                    <Text style={styles.lbEmoji}>{e.avatarEmoji}</Text>
                    <View style={styles.lbMeta}>
                      <Text style={styles.lbName} numberOfLines={1}>
                        {e.displayName}
                        {e.isCurrentUser ? ` (${t('social.you')})` : ''}
                      </Text>
                      <Text style={styles.lbUn} numberOfLines={1}>
                        @{e.username}
                      </Text>
                    </View>
                    <Text style={styles.lbVal}>{formatUsd(e.value)}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.seeAllBtn} onPress={openLeaderboard} activeOpacity={0.85}>
                  <Text style={styles.seeAllText}>{t('friends.leaderboardSeeAll')}</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.gold} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 3 — Squad */}
          <View style={styles.sectionSquad}>
            <Text style={styles.sectionEyebrowSm}>{t('friends.sectionSquad')}</Text>
            {friends.length === 0 ? (
              <View style={styles.emptySquadInline}>
                <Text style={styles.emptySquadTitleSm}>{t('friends.emptySquadTitle')}</Text>
                <Text style={styles.emptySquadBodySm}>{t('friends.emptySquadBody')}</Text>
                <PrimaryButton label={t('friends.emptyCta')} onPress={openAdd} variant="red" style={styles.emptyCtaSm} />
              </View>
            ) : (
              <View style={styles.squadBlock}>
                {friendRows.map(({ entry, profile }) => {
                  const ring = accentForId(entry.username);
                  return (
                    <TouchableOpacity
                      key={entry.username}
                      style={styles.squadRow}
                      onPress={() => openFriendProfile(entry.username)}
                      activeOpacity={0.88}
                    >
                      <View style={[styles.squadAccent, { backgroundColor: ring }]} />
                      <View style={[styles.squadAvatar, { borderColor: ring }]}>
                        <Text style={[styles.squadAvatarText, { color: ring }]}>
                          {entry.displayName.slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.squadMeta}>
                        <Text style={styles.squadName} numberOfLines={1}>
                          {entry.displayName}
                        </Text>
                        <Text style={styles.squadHandle} numberOfLines={1}>
                          @{entry.username}
                        </Text>
                        <Text style={styles.squadStat} numberOfLines={1}>
                          {t('social.bestPull')}: {profile.stats.bestPullCardName}
                        </Text>
                        <Text style={styles.squadStatMuted}>{formatUsd(profile.stats.totalEstimatedValue)} total</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Social footer */}
          <View style={styles.socialFooter}>
            <Text style={styles.socialFooterTitle}>{t('friends.followFooterTitle')}</Text>
            <Text style={styles.socialFooterSub}>{t('friends.followFooterSub')}</Text>
            <SocialFollowRow compact />
          </View>
        </ScrollView>
      </View>

      <FriendsHubMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onSelect={onHubSelect} />

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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerBtnPlaceholder: {
    width: 44,
    height: 44,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 2.2,
    marginBottom: spacing.md,
  },
  sectionEyebrowSm: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 1.6,
    marginBottom: spacing.sm,
    opacity: 0.92,
  },
  sectionActivity: {
    marginBottom: spacing.xl + spacing.sm,
  },
  sectionLeaderboard: {
    marginBottom: spacing.lg + spacing.xs,
  },
  sectionSquad: {
    marginBottom: spacing.md,
  },
  sectionHintCompact: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    opacity: 0.75,
    lineHeight: 14,
  },
  activityCarouselBleed: {
    marginHorizontal: -spacing.base,
  },
  activityCarousel: {
    paddingLeft: spacing.base,
    paddingRight: spacing.base,
    paddingBottom: spacing.xs,
  },
  inlineEmpty: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    paddingVertical: spacing.sm,
    opacity: 0.85,
  },
  inlineEmptySm: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
    paddingVertical: spacing.xs,
    opacity: 0.8,
  },
  leaderboardBlock: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(5,8,6,0.5)',
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  lbRowMe: {
    backgroundColor: 'rgba(232,197,71,0.06)',
  },
  lbRank: {
    width: 24,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    color: colors.gold,
    textAlign: 'center',
  },
  lbEmoji: {
    fontSize: 18,
  },
  lbMeta: {
    flex: 1,
    minWidth: 0,
  },
  lbName: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  lbUn: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  lbVal: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm + 2,
    backgroundColor: 'rgba(232,197,71,0.06)',
  },
  seeAllText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.gold,
  },
  squadBlock: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  squadRow: {
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
  squadAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    opacity: 0.75,
  },
  squadAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginLeft: 2,
  },
  squadAvatarText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
  },
  squadMeta: {
    flex: 1,
    minWidth: 0,
  },
  squadName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  squadHandle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    marginTop: 2,
  },
  squadStat: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  squadStatMuted: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptySquadInline: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  emptySquadTitleSm: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptySquadBodySm: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
    maxWidth: 300,
    opacity: 0.9,
  },
  emptyCtaSm: {
    minWidth: 200,
    alignSelf: 'center',
  },
  socialFooter: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  socialFooterTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.textMuted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  socialFooterSub: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
    textAlign: 'center',
    maxWidth: 320,
    opacity: 0.9,
  },
});
