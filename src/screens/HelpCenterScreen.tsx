import React, { useLayoutEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { RootStackParamList } from '../navigation/types';
import { openExternalUrl } from '../utils/openExternalUrl';
import { SUPPORT_EMAIL } from '../config/app';

type Nav = StackNavigationProp<RootStackParamList, 'HelpCenter'>;

export function HelpCenterScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const faqIds = ['credits', 'shipping', 'drops'] as const;
  const [openId, setOpenId] = useState<string | null>('credits');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('helpCenter.navTitle'),
      headerShown: true,
      headerTintColor: colors.nearBlack,
      headerTitleStyle: { fontWeight: fontWeight.bold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: colors.white },
    });
  }, [navigation, t]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.lead}>{t('helpCenter.lead')}</Text>

      {faqIds.map((id) => {
        const expanded = openId === id;
        return (
          <View key={id} style={styles.faqCard}>
            <TouchableOpacity
              onPress={() => setOpenId(expanded ? null : id)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
            >
              <Text style={styles.faqQ}>{t(`helpCenter.faq.${id}.q`)}</Text>
            </TouchableOpacity>
            {expanded ? <Text style={styles.faqA}>{t(`helpCenter.faq.${id}.a`)}</Text> : null}
          </View>
        );
      })}

      <Text style={styles.sectionLabel}>{t('helpCenter.contactSection')}</Text>
      <TouchableOpacity
        style={styles.contactBtn}
        onPress={() => void openExternalUrl(`mailto:${SUPPORT_EMAIL}`, t('helpCenter.emailUs'))}
        activeOpacity={0.85}
      >
        <Text style={styles.contactBtnText}>{t('helpCenter.emailCta', { email: SUPPORT_EMAIL })}</Text>
      </TouchableOpacity>
      <Text style={styles.footnote}>{t('helpCenter.responseTime')}</Text>
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
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqQ: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  faqA: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  contactBtn: {
    backgroundColor: colors.red,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  contactBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  footnote: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
