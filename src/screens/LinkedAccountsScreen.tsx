import React, { useLayoutEffect } from 'react';
import { sg } from '../tokens/sg';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fontSize } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { RootStackParamList } from '../navigation/types';
import { SgScreen } from '../components/ui/SgScreen';
import { SgUnavailableService } from '../components/ui';
import { ADVANCED_ACCOUNT_SERVICES_ARE_LIVE } from '../config/app';

type Nav = StackNavigationProp<RootStackParamList, 'LinkedAccounts'>;

export function LinkedAccountsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('linkedAccounts.navTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  if (!ADVANCED_ACCOUNT_SERVICES_ARE_LIVE) {
    return <SgUnavailableService code="ACCOUNT / PROVIDERS" />;
  }

  return (
    <SgScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.body}>{t('linkedAccounts.body')}</Text>
      <Text style={styles.section}>{t('linkedAccounts.whatTitle')}</Text>
      <Text style={styles.para}>{t('linkedAccounts.whatBody')}</Text>
      <Text style={styles.section}>{t('linkedAccounts.futureTitle')}</Text>
      <View style={styles.card}>
        <Text style={styles.cardLine}>• {t('linkedAccounts.futureGoogle')}</Text>
        <Text style={styles.cardLine}>• {t('linkedAccounts.futureApple')}</Text>
        <Text style={styles.cardLine}>• {t('linkedAccounts.futureEmail')}</Text>
      </View>
      <Text style={styles.note}>{t('linkedAccounts.note')}</Text>
      </ScrollView>
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.base, paddingTop: spacing.md },
  body: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  section: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    marginBottom: spacing.xs,
  },
  para: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: sg.surface2,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: sg.line,
    marginBottom: spacing.md,
  },
  cardLine: {
    fontSize: fontSize.sm,
    color: sg.text,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  note: {
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
  },
});
