import React, { useCallback, useLayoutEffect, useState } from 'react';
import { sg } from '../tokens/sg';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { SHIPPING_ADDRESS_STORAGE_KEY } from '../lib/shippingAddress';
import { showUserMessage } from '../utils/showUserMessage';

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
  const [form, setForm] = useState<Form>(empty);
  const [loaded, setLoaded] = useState(false);

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
    void (async () => {
      try {
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
  }, []);

  const onSave = useCallback(async () => {
    if (!form.fullName.trim() || !form.line1.trim() || !form.city.trim() || !form.country.trim()) {
      showUserMessage(t('shippingAddress.missingTitle'), t('shippingAddress.missingBody'));
      return;
    }
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      showUserMessage(t('shippingAddress.savedTitle'), t('shippingAddress.savedBody'));
    } catch {
      showUserMessage(t('common.error'), t('shippingAddress.saveFailed'));
    }
  }, [form, t]);

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
      />
    </View>
  );

  if (!loaded) {
    return <View style={[styles.container, { backgroundColor: sg.bg }]} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + sg.space.xxl }]}
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
      <TouchableOpacity style={styles.saveBtn} onPress={() => void onSave()} activeOpacity={0.88}>
        <Text style={styles.saveBtnText}>{t('shippingAddress.save')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: sg.bg },
  content: { padding: sg.space.md, paddingTop: sg.space.md },
  lead: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: sg.space.lg,
  },
  field: { marginBottom: sg.space.md },
  label: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    marginBottom: sg.space.xs,
  },
  input: {
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.btn,
    borderWidth: 1,
    borderColor: sg.line,
    paddingHorizontal: sg.space.md,
    paddingVertical: sg.space.sm,
    fontSize: sg.type.base,
    color: sg.text,
    minHeight: 48,
  },
  inputMulti: { minHeight: 72, paddingTop: sg.space.sm },
  row2: { flexDirection: 'row', gap: sg.space.sm },
  col: { flex: 1 },
  saveBtn: {
    marginTop: sg.space.md,
    backgroundColor: sg.gold,
    borderRadius: sg.radius.panel,
    paddingVertical: sg.space.md,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
  },
});
