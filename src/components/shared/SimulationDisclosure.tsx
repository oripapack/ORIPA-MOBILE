import React, { useCallback, useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { SHOW_SIMULATION_DISCLOSURE } from '../../config/app';
import { sg } from '../../tokens/sg';
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
    /** Dark veil only — branded boot lives under this in `AppSplashScreen` (no generic spinner). */
    return <View style={[styles.loadingVeil, { paddingTop: insets.top }]} pointerEvents="auto" />;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => {}} statusBarTranslucent>
      <View style={[styles.overlay, { paddingTop: insets.top + sg.space.md, paddingBottom: insets.bottom + sg.space.lg }]}>
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
          <PrimaryButton label={t('demoSimulation.confirm')} onPress={onConfirm} style={styles.btn} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loadingVeil: {
    ...StyleSheet.absoluteFillObject,
    /** Transparent so branded `AppSplashScreen` shows through while AsyncStorage resolves. */
    backgroundColor: 'transparent',
    zIndex: 10000,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    paddingHorizontal: sg.space.lg,
  },
  sheet: {
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.panel,
    padding: sg.space.lg,
    borderWidth: 1,
    borderColor: sg.line,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  scroll: {
    marginBottom: sg.space.md,
  },
  scrollContent: {
    paddingBottom: sg.space.xs,
  },
  title: {
    fontSize: sg.type.xl,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: sg.space.md,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  body: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    lineHeight: 22,
    marginBottom: 0,
    textAlign: 'center',
  },
  jaBlock: {
    marginTop: sg.space.lg,
    paddingTop: sg.space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: sg.line,
  },
  titleJa: {
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    marginBottom: sg.space.sm,
    textAlign: 'center',
  },
  bodyJa: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    lineHeight: 24,
    textAlign: 'left',
  },
  btn: {
    width: '100%',
  },
});
