import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { RootStackParamList } from '../navigation/types';

const STORAGE_KEY = '@pullhub_shipping_address_v1';

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
      headerTintColor: colors.nearBlack,
      headerTitleStyle: { fontWeight: fontWeight.bold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: colors.white },
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
      Alert.alert(t('shippingAddress.missingTitle'), t('shippingAddress.missingBody'));
      return;
    }
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      Alert.alert(t('shippingAddress.savedTitle'), t('shippingAddress.savedBody'));
    } catch {
      Alert.alert(t('common.error'), t('shippingAddress.saveFailed'));
    }
  }, [form, t]);

  const field = (key: keyof Form, multiline?: boolean) => (
    <View style={styles.field}>
      <Text style={styles.label}>{t(`shippingAddress.fields.${key}`)}</Text>
      <TextInput
        value={form[key]}
        onChangeText={(v) => setForm((s) => ({ ...s, [key]: v }))}
        placeholder={t(`shippingAddress.placeholders.${key}`)}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, multiline && styles.inputMulti]}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );

  if (!loaded) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  return (
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
      <TouchableOpacity style={styles.saveBtn} onPress={() => void onSave()} activeOpacity={0.88}>
        <Text style={styles.saveBtnText}>{t('shippingAddress.save')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base, paddingTop: spacing.md },
  lead: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  field: { marginBottom: spacing.md },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    minHeight: 48,
  },
  inputMulti: { minHeight: 72, paddingTop: spacing.sm },
  row2: { flexDirection: 'row', gap: spacing.sm },
  col: { flex: 1 },
  saveBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.red,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
