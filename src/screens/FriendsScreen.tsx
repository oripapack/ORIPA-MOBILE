import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { sg } from '../tokens/sg';
import { fontSize, brandFont } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { SgScreen } from '../components/ui';
import { PrimaryButton } from '../components/shared/PrimaryButton';
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
import { showUserMessage } from '../utils/showUserMessage';

const RING_PALETTE = [
  sg.neon,
  sg.gold,
  sg.goldHi,
  sg.chrome,
  sg.success,
  sg.warning,
];

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
  const incomingFriendRequests = useAppStore((s) => s.incomingFriendRequests);
  const acceptIncomingFriendRequest = useAppStore((s) => s.acceptIncomingFriendRequest);
  const declineIncomingFriendRequest = useAppStore((s) => s.declineIncomingFriendRequest);

  const [qrOpen, setQrOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [friendScannerOpen, setFriendScannerOpen] = useState(false);
  /** Re-open Add friends sheet after QR / scanner sub-modals (pageSheet blocks stacked modals). */
  const reopenAddSheetRef = useRef(false);

  const { resolveFromUsername } = useFriendInviteResolver();

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
      showUserMessage(t('friendsAlerts.noUsernameTitle'), t('friendsAlerts.noUsernameBody'));
      return;
    }
    const link = `${PUBLIC_WEB_ORIGIN}?r=${encodeURIComponent(handle)}`;
    await Clipboard.setStringAsync(link);
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    showUserMessage(t('friendsAlerts.copiedTitle'), t('friendsAlerts.copiedBody'));
  }, [user.username, t]);

  const reopenAddSheetIfNeeded = useCallback(() => {
    if (!reopenAddSheetRef.current) return;
    reopenAddSheetRef.current = false;
    setAddOpen(true);
  }, []);

  /** Dismiss add sheet first — otherwise scanner / my-QR modals render behind the pageSheet. */
  const openSubModalFromAdd = useCallback((open: () => void) => {
    reopenAddSheetRef.current = true;
    setAddOpen(false);
    setTimeout(open, Platform.OS === 'web' ? 0 : 320);
  }, []);

  const openScannerFromAdd = useCallback(() => {
    openSubModalFromAdd(() => setFriendScannerOpen(true));
  }, [openSubModalFromAdd]);

  const openMyQrFromAdd = useCallback(() => {
    if (!user.username.trim()) {
      showUserMessage(t('friendsAlerts.noUsernameTitle'), t('friendsAlerts.noUsernameBody'));
      return;
    }
    openSubModalFromAdd(() => setQrOpen(true));
  }, [openSubModalFromAdd, user.username, t]);

  const closeScanner = useCallback(() => {
    setFriendScannerOpen(false);
    reopenAddSheetIfNeeded();
  }, [reopenAddSheetIfNeeded]);

  const closeMyQr = useCallback(() => {
    setQrOpen(false);
    reopenAddSheetIfNeeded();
  }, [reopenAddSheetIfNeeded]);

  return (
    <SgScreen>
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

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.pageTitle}>{t('friends.title')}</Text>
            {!isGuest ? (
              <TouchableOpacity
                style={[styles.headerBtn, styles.headerBtnAdd]}
                onPress={openAdd}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('friends.addFriendA11y')}
              >
                <Ionicons name="add" size={28} color={sg.onGold} />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerBtnPlaceholder} />
            )}
          </View>

          {!isGuest && incomingFriendRequests.length > 0 ? (
            <View style={styles.requestsBlock}>
              <Text style={styles.sectionEyebrow}>{t('friends.sectionRequests')}</Text>
              {incomingFriendRequests.map((req) => (
                <VaultFramedCard key={req.id} contentStyle={styles.requestCardInner}>
                  <Text style={styles.requestName} numberOfLines={1}>
                    {req.displayName}
                  </Text>
                  <Text style={styles.requestHandle} numberOfLines={1}>
                    @{req.username}
                  </Text>
                  <Text style={styles.requestHint}>{t('friends.requestHint')}</Text>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={styles.requestDecline}
                      onPress={() => declineIncomingFriendRequest(req.username)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.requestDeclineText}>{t('friends.declineRequest')}</Text>
                    </TouchableOpacity>
                    <PrimaryButton
                      label={t('friends.acceptRequest')}
                      variant="red"
                      onPress={() => acceptIncomingFriendRequest(req.username)}
                      style={styles.requestAcceptBtn}
                    />
                  </View>
                </VaultFramedCard>
              ))}
            </View>
          ) : null}

          {/* Friends activity — primary; empty state adds CTA directly below */}
          <View style={styles.sectionActivity}>
            <Text style={styles.sectionEyebrow}>{t('friends.sectionActivity')}</Text>
            {friends.length === 0 || activityFeed.length === 0 ? (
              <>
                <Text style={styles.inlineEmpty}>{t('friends.emptyActivity')}</Text>
                <PrimaryButton
                  label={t('friends.emptyCta')}
                  onPress={openAdd}
                  variant="red"
                  style={styles.addFriendsBelowActivity}
                />
              </>
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

          {friends.length > 0 ? (
            <View style={styles.sectionFriends}>
              <Text style={styles.sectionEyebrowSm}>{t('friends.sectionFriends')}</Text>
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
                      <Ionicons name="chevron-forward" size={18} color={sg.muted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Leaderboard (after connections / add-friends CTA) */}
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
                    <Text style={styles.lbEmoji}>{e.displayName.trim().slice(0, 2).toUpperCase()}</Text>
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
                  <Ionicons name="chevron-forward" size={14} color={sg.gold} />
                </TouchableOpacity>
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

      <MyQrModal
        visible={qrOpen}
        onClose={closeMyQr}
        qrValue={qrPayload}
        username={user.username}
        displayName={user.displayName}
        onCopied={() => showUserMessage(t('friendsAlerts.copiedTitle'), t('friendsAlerts.copiedBody'))}
        onScanSomeoneElse={() => {
          setQrOpen(false);
          reopenAddSheetRef.current = true;
          setTimeout(() => setFriendScannerOpen(true), Platform.OS === 'web' ? 0 : 320);
        }}
      />

      <AddFriendModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onRequestScanner={openScannerFromAdd}
        onShowMyQr={openMyQrFromAdd}
        onCopyInviteLink={() => void copyInviteLink()}
      />

      <QrScannerModal
        visible={friendScannerOpen}
        onClose={closeScanner}
        onUsernameScanned={(username) => {
          setFriendScannerOpen(false);
          resolveFromUsername(username);
          reopenAddSheetIfNeeded();
        }}
      />
    </SgScreen>
  );
}

const styles = StyleSheet.create({
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
    fontFamily: brandFont.bold,
    color: sg.gold,
    marginBottom: spacing.xs,
  },
  guestBannerBody: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.regular,
    color: sg.muted,
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
    fontFamily: brandFont.black,
    color: sg.text,
    letterSpacing: -0.5,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  headerBtnAdd: {
    backgroundColor: sg.gold,
    borderColor: sg.cobaltBorder,
  },
  headerBtnPlaceholder: {
    width: 44,
    height: 44,
  },
  requestsBlock: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  requestCardInner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  requestName: {
    fontSize: fontSize.md,
    fontFamily: brandFont.bold,
    color: sg.text,
  },
  requestHandle: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.medium,
    color: sg.muted,
    marginBottom: spacing.xs,
  },
  requestHint: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  requestDecline: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestDeclineText: {
    fontSize: fontSize.sm,
    fontFamily: brandFont.semibold,
    color: sg.muted,
  },
  requestAcceptBtn: {
    flex: 1.2,
    height: 44,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontFamily: brandFont.black,
    color: sg.muted,
    letterSpacing: 2.2,
    marginBottom: spacing.md,
  },
  sectionEyebrowSm: {
    fontSize: 10,
    fontFamily: brandFont.black,
    color: sg.muted,
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
  sectionFriends: {
    marginBottom: spacing.lg + spacing.xs,
  },
  sectionHintCompact: {
    fontSize: 10,
    color: sg.muted,
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
    color: sg.muted,
    lineHeight: 20,
    paddingVertical: spacing.sm,
    opacity: 0.85,
  },
  inlineEmptySm: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
    paddingVertical: spacing.xs,
    opacity: 0.8,
  },
  leaderboardBlock: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface,
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
    borderBottomColor: sg.line,
  },
  lbRowMe: {
    backgroundColor: sg.cobaltWash,
  },
  lbRank: {
    width: 24,
    fontSize: fontSize.sm,
    fontFamily: brandFont.black,
    color: sg.gold,
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
    fontFamily: brandFont.bold,
    color: sg.text,
  },
  lbUn: {
    fontSize: 10,
    color: sg.muted,
    marginTop: 2,
  },
  lbVal: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.black,
    color: sg.text,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm + 2,
    backgroundColor: sg.cobaltWash,
  },
  seeAllText: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.bold,
    color: sg.gold,
  },
  squadBlock: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  squadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: sg.surface2,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: sg.line,
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
    backgroundColor: sg.cobaltWash,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: sg.line,
    marginLeft: 2,
  },
  squadAvatarText: {
    fontSize: fontSize.lg,
    fontFamily: brandFont.black,
  },
  squadMeta: {
    flex: 1,
    minWidth: 0,
  },
  squadName: {
    fontSize: fontSize.md,
    fontFamily: brandFont.bold,
    color: sg.text,
  },
  squadHandle: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.medium,
    color: sg.muted,
    marginTop: 2,
  },
  squadStat: {
    fontSize: fontSize.xs,
    color: sg.muted,
    marginTop: spacing.xs,
  },
  squadStatMuted: {
    fontSize: 10,
    color: sg.muted,
    marginTop: 2,
  },
  addFriendsBelowActivity: {
    marginTop: spacing.md,
    minWidth: 200,
    alignSelf: 'stretch',
  },
  socialFooter: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: sg.line,
    alignItems: 'center',
  },
  socialFooterTitle: {
    fontSize: fontSize.xs,
    fontFamily: brandFont.black,
    color: sg.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  socialFooterSub: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: spacing.sm,
    textAlign: 'center',
    maxWidth: 320,
    opacity: 0.9,
  },
});
