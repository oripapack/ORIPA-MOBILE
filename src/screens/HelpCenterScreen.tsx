import React, { useLayoutEffect, useState } from 'react';
import { sg } from '../tokens/sg';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fontSize } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
import { RootStackParamList } from '../navigation/types';
import { openExternalUrl } from '../utils/openExternalUrl';
import { SUPPORT_EMAIL } from '../config/app';
import { SgScreen } from '../components/ui/SgScreen';

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
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  return (
    <SgScreen>
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
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.base, paddingTop: spacing.md },
  lead: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  faqCard: {
    backgroundColor: sg.surface2,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: sg.line,
  },
  faqQ: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  faqA: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  contactBtn: {
    backgroundColor: sg.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  contactBtnText: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
  },
  footnote: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    color: sg.muted,
    lineHeight: 18,
  },
});
