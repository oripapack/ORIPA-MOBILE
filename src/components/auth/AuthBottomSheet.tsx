import React, { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../tokens/spacing';
import { BOOT_ENTRANCE_SPRING } from '../splash/AppBootEntrance';

const { height: SH } = Dimensions.get('window');
/**
 * Fixed panel height (most of the screen) — inner `ScrollView` scrolls. Using explicit `height`
 * avoids RN flex collapse where the sheet looked ~25% tall with content clipped.
 */
export const AUTH_SHEET_HEIGHT = Math.min(SH * 0.78, 600);
const OFFSCREEN = AUTH_SHEET_HEIGHT + 56;
const DISMISS_THRESHOLD = 88;

const SPRING_OUT = { damping: 18, stiffness: 260, mass: 0.55 } as const;

export type ConfirmDismissActions = {
  confirm: () => void;
  cancel: () => void;
};

export type AuthBottomSheetRef = {
  /** Run the same dismiss guard as backdrop / swipe (e.g. header close button). */
  requestCloseWithConfirmation: () => void;
};

type Props = {
  visible: boolean;
  onRequestClose: () => void;
  /** When false, only the panel is shown (parent already rendered blur). Tap outside still dismisses. */
  showBackdrop?: boolean;
  /**
   * When set, backdrop tap / swipe / ref close runs this instead of closing immediately.
   * Call `actions.confirm()` to animate closed; `actions.cancel()` to snap the sheet open (e.g. alert dismissed).
   */
  confirmDismiss?: (actions: ConfirmDismissActions) => void;
  children: React.ReactNode;
};

/**
 * Slide-up auth shell: solid dim (no blur) so the lobby behind stays readable; sheet stays transparent.
 */
export const AuthBottomSheet = forwardRef<AuthBottomSheetRef, Props>(function AuthBottomSheet(
  { visible, onRequestClose, showBackdrop = true, confirmDismiss, children },
  ref,
) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(OFFSCREEN);
  const startY = useSharedValue(0);

  const snapClosed = useCallback(
    (then?: () => void) => {
      translateY.value = withSpring(OFFSCREEN, SPRING_OUT, (finished) => {
        if (finished && then) runOnJS(then)();
      });
    },
    [translateY],
  );

  const animateOpen = useCallback(() => {
    translateY.value = withSpring(0, BOOT_ENTRANCE_SPRING);
  }, [translateY]);

  const beginClose = useCallback(() => {
    snapClosed(onRequestClose);
  }, [snapClosed, onRequestClose]);

  const promptDismiss = useCallback(() => {
    if (confirmDismiss) {
      confirmDismiss({
        confirm: () => beginClose(),
        cancel: () => animateOpen(),
      });
    } else {
      beginClose();
    }
  }, [confirmDismiss, beginClose, animateOpen]);

  useImperativeHandle(
    ref,
    () => ({
      requestCloseWithConfirmation: () => promptDismiss(),
    }),
    [promptDismiss],
  );

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, BOOT_ENTRANCE_SPRING);
    } else {
      translateY.value = OFFSCREEN;
    }
  }, [visible, translateY]);

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
        runOnJS(promptDismiss)();
      } else {
        translateY.value = withSpring(0, BOOT_ENTRANCE_SPRING);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      {showBackdrop ? (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => promptDismiss()} />
          <View style={styles.dim} pointerEvents="none" />
        </>
      ) : (
        <Pressable style={styles.dismissHit} onPress={() => promptDismiss()} />
      )}

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            {
              height: AUTH_SHEET_HEIGHT,
              paddingBottom: Math.max(insets.bottom, spacing.sm),
            },
          ]}
          pointerEvents="auto"
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0)']}
            style={styles.sheetTopGlow}
            pointerEvents="none"
          />
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
          <View style={styles.body}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 4000,
    elevation: 4000,
  },
  dismissHit: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 22, 0.55)',
  },
  /**
   * Still no solid fill — only a light “rim” + shadow so users can see where the sheet ends
   * without a second opaque layer.
   */
  sheet: {
    zIndex: 2,
    width: '100%',
    alignSelf: 'stretch',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.16)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
      },
      android: {
        // Avoid high elevation — it can add a gray “card” fill behind the view.
        elevation: 3,
      },
    }),
  },
  sheetTopGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
});
