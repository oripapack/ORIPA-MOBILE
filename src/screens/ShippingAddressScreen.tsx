import React, { useCallback, useLayoutEffect, useState } from 'react';
import { sg } from '../tokens/sg';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fontSize } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { RootStackParamList } from '../navigation/types';
import { SHIPPING_ADDRESS_STORAGE_KEY } from '../lib/shippingAddress';
import { createShippingAddressLive, getUserShippingAddressesLive } from '../data/shipping';
import { useAppStore } from '../store/useAppStore';
import { showUserMessage } from '../utils/showUserMessage';
import { SgScreen } from '../components/ui';
import { SHIPPING_IS_LIVE } from '../config/app';

const STORAGE_KEY = SHIPPING_ADDRESS_STORAGE_KEY;

type Nav = StackNavigationProp<RootStackParamList, 'ShippingAddress'>;

type Form = {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postal: string;
  country: string;
};

const empty: Form = {
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postal: '',
  country: '',
};

export function ShippingAddressScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const userId = useAppStore((s) => s.user.id);
  const [form, setForm] = useState<Form>(empty);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const releaseBlocked = !__DEV__ && !SHIPPING_IS_LIVE;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('shippingAddress.navTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  React.useEffect(() => {
    if (releaseBlocked) {
      setLoaded(true);
      return;
    }
    void (async () => {
      try {
        const live = await getUserShippingAddressesLive();
        if (live[0]) {
          const a = live[0];
          setForm({
            fullName: a.recipient_name,
            line1: a.street1,
            line2: a.street2 ?? '',
            city: a.city,
            region: a.state ?? '',
            postal: a.postal_code ?? '',
            country: a.country,
          });
          return;
        }
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Form>;
          setForm({ ...empty, ...parsed });
        }
      } catch {
        /* ignore */
      } finally {
        setLoaded(true);
      }
    })();
  }, [releaseBlocked]);

  const onSave = useCallback(async () => {
    if (!form.fullName.trim() || !form.line1.trim() || !form.city.trim() || !form.country.trim()) {
      showUserMessage(t('shippingAddress.missingTitle'), t('shippingAddress.missingBody'));
      return;
    }
    setSaving(true);
    try {
      const result = await createShippingAddressLive(userId, {
        fullName: form.fullName,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        region: form.region || undefined,
        postal: form.postal || undefined,
        country: form.country,
      });
      if (!result.ok) {
        showUserMessage(t('common.error'), result.message || t('shippingAddress.saveFailed'));
        return;
      }
      showUserMessage(t('shippingAddress.savedTitle'), t('shippingAddress.savedBody'));
    } catch {
      showUserMessage(t('common.error'), t('shippingAddress.saveFailed'));
    } finally {
      setSaving(false);
    }
  }, [form, t, userId]);

  const field = (key: keyof Form, multiline?: boolean) => (
    <View style={styles.field}>
      <Text style={styles.label}>{t(`shippingAddress.fields.${key}`)}</Text>
      <TextInput
        value={form[key]}
        onChangeText={(v) => setForm((s) => ({ ...s, [key]: v }))}
        placeholder={t(`shippingAddress.placeholders.${key}`)}
        placeholderTextColor={sg.muted}
        style={[styles.input, multiline && styles.inputMulti]}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        accessibilityLabel={t(`shippingAddress.fields.${key}`)}
      />
    </View>
  );

  if (releaseBlocked) {
    return (
      <SgScreen constrainContent>
        <View style={styles.releasePage} accessibilityRole="summary">
          <Text style={styles.releaseEyebrow}>{t('shippingAddress.releaseEyebrow')}</Text>
          <Text style={styles.releaseTitle}>{t('shippingAddress.releaseTitle')}</Text>
          <Text style={styles.releaseBody}>{t('shippingAddress.releaseBody')}</Text>
          <View style={styles.releasePanel}>
            <Text style={styles.releasePanelCode}>FULFILLMENT / ADDRESS</Text>
            <Text style={styles.releasePanelStatus}>{t('shippingAddress.releaseStatus')}</Text>
          </View>
        </View>
      </SgScreen>
    );
  }

  if (!loaded) {
    return (
      <SgScreen>
        <View
          style={styles.loadingPage}
          accessibilityRole="progressbar"
          accessibilityLabel={t('shippingAddress.loading')}
        >
          <ActivityIndicator size="small" color={sg.goldHi} />
          <Text style={styles.loadingText}>{t('shippingAddress.loading')}</Text>
        </View>
      </SgScreen>
    );
  }

  return (
    <SgScreen constrainContent>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>{t('shippingAddress.lead')}</Text>
        {field('fullName')}
        {field('line1')}
        {field('line2', true)}
        {field('city')}
        <View style={styles.row2}>
          <View style={styles.col}>{field('region')}</View>
          <View style={styles.col}>{field('postal')}</View>
        </View>
        {field('country')}
        <TouchableOpacity
          style={[styles.saveBtn, saving ? styles.saveBtnDisabled : null]}
          onPress={() => void onSave()}
          activeOpacity={0.88}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel={t('shippingAddress.save')}
          accessibilityState={{ disabled: saving, busy: saving }}
        >
          <Text style={styles.saveBtnText}>{t('shippingAddress.save')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  loadingPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: sg.space.sm,
  },
  loadingText: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    lineHeight: sg.type.label.lineHeight,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.muted,
    textTransform: 'uppercase',
  },
  releasePage: {
    flex: 1,
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.xl,
  },
  releaseEyebrow: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    lineHeight: sg.type.label.lineHeight,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.warning,
    marginBottom: sg.space.sm,
  },
  releaseTitle: {
    fontFamily: sg.font.display,
    fontSize: sg.type.title.fontSize,
    lineHeight: sg.type.title.lineHeight,
    letterSpacing: sg.type.title.letterSpacing,
    color: sg.text,
    marginBottom: sg.space.sm,
  },
  releaseBody: {
    fontFamily: sg.font.body,
    fontSize: sg.type.body.fontSize,
    lineHeight: sg.type.body.lineHeight,
    color: sg.muted,
  },
  releasePanel: {
    minHeight: 112,
    marginTop: sg.space.xl,
    padding: sg.space.md,
    justifyContent: 'space-between',
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.lineStrong,
    borderLeftWidth: 3,
    borderLeftColor: sg.gold,
  },
  releasePanelCode: {
    fontFamily: sg.font.label,
    fontSize: sg.type.label.fontSize,
    lineHeight: sg.type.label.lineHeight,
    letterSpacing: sg.type.label.letterSpacing,
    color: sg.muted,
  },
  releasePanelStatus: {
    fontFamily: sg.font.label,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1,
    color: sg.warning,
  },
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.base, paddingTop: spacing.md },
  lead: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  field: { marginBottom: spacing.md },
  label: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: sg.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: sg.line,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: fontSize.base,
    color: sg.text,
    minHeight: 48,
  },
  inputMulti: { minHeight: 72, paddingTop: spacing.sm },
  row2: { flexDirection: 'row', gap: spacing.sm },
  col: { flex: 1 },
  saveBtn: {
    marginTop: spacing.md,
    backgroundColor: sg.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.55 },
  saveBtnText: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
  },
});
