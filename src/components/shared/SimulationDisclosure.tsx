import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { SHOW_SIMULATION_DISCLOSURE } from '../../config/app';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { PrimaryButton } from './PrimaryButton';

const STORAGE_KEY = 'pullhub_simulation_disclosure_ack_v1';

type Phase = 'loading' | 'need' | 'done';

/**
 * Blocking modal on first launch: user acknowledges that credits / rewards are simulated.
 * Replaces the top demo banner for cleaner layout; preference is stored on device.
 */
export function SimulationDisclosure() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [phase, setPhase] = useState<Phase>('loading');

  useEffect(() => {
    if (!SHOW_SIMULATION_DISCLOSURE) {
      setPhase('done');
      return;
    }
    let cancelled = false;
    void AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (cancelled) return;
      setPhase(v === '1' ? 'done' : 'need');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const onConfirm = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '1');
    setPhase('done');
  }, []);

  if (!SHOW_SIMULATION_DISCLOSURE || phase === 'done') {
    return null;
  }

  if (phase === 'loading') {
    return (
      <View style={[styles.loadingVeil, { paddingTop: insets.top }]} pointerEvents="auto">
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => {}} statusBarTranslucent>
      <View style={[styles.overlay, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.sheet} accessibilityRole="none">
          <ScrollView
            style={[styles.scroll, { maxHeight: windowHeight * 0.62 }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>{t('demoSimulation.title')}</Text>
            <Text style={styles.body}>{t('demoSimulation.body')}</Text>
            <View style={styles.jaBlock}>
              <Text style={styles.titleJa}>{t('demoSimulation.titleJa')}</Text>
              <Text style={styles.bodyJa}>{t('demoSimulation.bodyJa')}</Text>
            </View>
          </ScrollView>
          <PrimaryButton label={t('demoSimulation.confirm')} variant="red" onPress={onConfirm} style={styles.btn} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loadingVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  scroll: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  body: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 0,
    textAlign: 'center',
  },
  jaBlock: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  titleJa: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  bodyJa: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'left',
  },
  btn: {
    width: '100%',
  },
});
