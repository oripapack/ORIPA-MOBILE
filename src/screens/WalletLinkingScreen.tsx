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
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@clerk/clerk-expo';
import { fontSize } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { RootStackParamList } from '../navigation/types';
import { createClerkAuthedClient } from '../lib/supabaseAuthed';
import { isSupabaseConfigured } from '../lib/supabase';
import { showUserMessage } from '../utils/showUserMessage';
import { SgScreen } from '../components/ui/SgScreen';
import { SgUnavailableService } from '../components/ui';
import { ADVANCED_ACCOUNT_SERVICES_ARE_LIVE } from '../config/app';

type Nav = StackNavigationProp<RootStackParamList, 'WalletLinking'>;

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function WalletLinkingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { userId, isLoaded } = useAuth();
  const [address, setAddress] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('walletLinking.navTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  React.useEffect(() => {
    if (!isLoaded) return;
    if (!ADVANCED_ACCOUNT_SERVICES_ARE_LIVE) {
      setLoaded(true);
      return;
    }

    void (async () => {
      if (!userId || !isSupabaseConfigured) {
        setLoaded(true);
        return;
      }

      try {
        const supabase = await createClerkAuthedClient();
        if (!supabase) {
          setLoaded(true);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('wallet_address')
          .eq('id', userId)
          .maybeSingle();

        if (!error && data?.wallet_address) {
          setAddress(data.wallet_address);
        }
      } catch {
        /* ignore load errors */
      } finally {
        setLoaded(true);
      }
    })();
  }, [isLoaded, userId]);

  const onSave = useCallback(async () => {
    const inputAddress = address.trim();

    if (!EVM_ADDRESS_RE.test(inputAddress)) {
      showUserMessage(t('walletLinking.invalidTitle'), t('walletLinking.invalidBody'));
      return;
    }

    if (!userId) {
      showUserMessage(t('common.error'), t('walletLinking.notSignedIn'));
      return;
    }

    if (!isSupabaseConfigured) {
      showUserMessage(t('common.error'), t('walletLinking.notConfigured'));
      return;
    }

    setSaving(true);
    try {
      const supabase = await createClerkAuthedClient();
      if (!supabase) {
        showUserMessage(t('common.error'), t('walletLinking.authFailed'));
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ wallet_address: inputAddress })
        .eq('id', userId);

      if (error) {
        showUserMessage(t('common.error'), error.message);
        return;
      }

      setAddress(inputAddress);
      showUserMessage(t('walletLinking.savedTitle'), t('walletLinking.savedBody'));
    } catch {
      showUserMessage(t('common.error'), t('walletLinking.saveFailed'));
    } finally {
      setSaving(false);
    }
  }, [address, t, userId]);

  if (!ADVANCED_ACCOUNT_SERVICES_ARE_LIVE) {
    return <SgUnavailableService code="ACCOUNT / WALLET" />;
  }

  if (!loaded) {
    return (
      <SgScreen>
        <View style={styles.container} />
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
      <Text style={styles.lead}>{t('walletLinking.lead')}</Text>

      <View style={styles.field}>
        <Text style={styles.label}>{t('walletLinking.fieldLabel')}</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder={t('walletLinking.placeholder')}
          placeholderTextColor={sg.muted}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
        />
      </View>

      <Text style={styles.hint}>{t('walletLinking.hint')}</Text>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={() => void onSave()}
        activeOpacity={0.88}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={sg.text} />
        ) : (
          <Text style={styles.saveBtnText}>{t('walletLinking.save')}</Text>
        )}
      </TouchableOpacity>
      </ScrollView>
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.base, paddingTop: spacing.md },
  lead: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  field: { marginBottom: spacing.sm },
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
    fontFamily: sg.font.bodyMedium,
  },
  hint: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  saveBtn: {
    backgroundColor: sg.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
  },
});
