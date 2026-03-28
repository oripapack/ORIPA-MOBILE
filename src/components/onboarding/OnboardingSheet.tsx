import React, { useCallback, useEffect } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PrimaryButton } from '../shared/PrimaryButton';
import { SecondaryButton } from '../shared/SecondaryButton';
import { BOOT_ENTRANCE_SPRING } from '../splash/AppBootEntrance';

const { height: SH } = Dimensions.get('window');
const SHEET_HEIGHT = Math.min(SH * 0.52, 440);
const OFFSCREEN = SHEET_HEIGHT + 48;
const DISMISS_THRESHOLD = 88;

const SPRING_OUT = { damping: 18, stiffness: 260, mass: 0.55 } as const;

type Props = {
  onDismiss: () => void;
  onContinueGuest: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
};

/** Draggable bottom sheet — spring open, pan down to dismiss. */
export function OnboardingSheet({ onDismiss, onContinueGuest, onSignIn, onSignUp }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(OFFSCREEN);
  const startY = useSharedValue(0);

  const closeThen = useCallback(
    (fn: () => void) => {
      translateY.value = withSpring(OFFSCREEN, SPRING_OUT, (finished) => {
        if (finished) runOnJS(fn)();
      });
    },
    [translateY],
  );

  useEffect(() => {
    translateY.value = withSpring(0, BOOT_ENTRANCE_SPRING);
  }, [translateY]);

  const pan = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      const next = startY.value + e.translationY;
      translateY.value = Math.max(0, next);
    })
    .onEnd((e) => {
      if (translateY.value > DISMISS_THRESHOLD || e.velocityY > 900) {
        translateY.value = withSpring(OFFSCREEN, SPRING_OUT, (finished) => {
          if (finished) runOnJS(onDismiss)();
        });
      } else {
        translateY.value = withSpring(0, BOOT_ENTRANCE_SPRING);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm },
          ]}
        >
          <LinearGradient
            colors={['#141816', '#0E1210', '#0A0E0C']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.handleWrap} accessibilityRole="adjustable">
            <View style={styles.handle} />
          </View>

          <Text style={styles.title}>{t('onboarding.welcomeTitle')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.welcomeSubtitle')}</Text>

          <View style={styles.actions}>
            <SecondaryButton label={t('onboarding.signInCta')} onPress={() => closeThen(onSignIn)} />
            <PrimaryButton
              label={t('onboarding.signUpCta')}
              variant="red"
              onPress={() => closeThen(onSignUp)}
            />
            <Pressable onPress={() => closeThen(onContinueGuest)} style={styles.guestBtn} hitSlop={12}>
              <Text style={styles.guestText}>{t('onboarding.continueGuest')}</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>{t('onboarding.sheetHint')}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 3000,
    elevation: 3000,
  },
  sheet: {
    minHeight: SHEET_HEIGHT,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.45,
        shadowRadius: 24,
      },
      android: { elevation: 28 },
    }),
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  guestText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  hint: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
