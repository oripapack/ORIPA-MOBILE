import React, { useLayoutEffect, useState } from 'react';
import { sg } from '../tokens/sg';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { openExternalUrl } from '../utils/openExternalUrl';
import { SUPPORT_EMAIL } from '../config/app';
import Ionicons from '@expo/vector-icons/Ionicons';

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + sg.space.xxl }]}
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

      <Text style={styles.sectionLabel}>{t('helpCenter.guidesSection')}</Text>
      <View style={styles.guidesCard}>
        <TouchableOpacity
          style={styles.guideRow}
          onPress={() => navigation.navigate('HotDropsInfo')}
          activeOpacity={0.78}
          accessibilityRole="button"
        >
          <Ionicons name="flash-outline" size={20} color={sg.gold} />
          <Text style={styles.guideTitle}>{t('hotDropsInfo.navTitle')}</Text>
          <Ionicons name="chevron-forward" size={18} color={sg.muted} />
        </TouchableOpacity>
        <View style={styles.guideDivider} />
        <TouchableOpacity
          style={styles.guideRow}
          onPress={() => navigation.navigate('PromosInfo')}
          activeOpacity={0.78}
          accessibilityRole="button"
        >
          <Ionicons name="pricetag-outline" size={20} color={sg.gold} />
          <Text style={styles.guideTitle}>{t('promosInfo.navTitle')}</Text>
          <Ionicons name="chevron-forward" size={18} color={sg.muted} />
        </TouchableOpacity>
      </View>

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
  container: { flex: 1, backgroundColor: sg.bg },
  content: { padding: sg.space.md, paddingTop: sg.space.md },
  lead: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: sg.space.lg,
  },
  faqCard: {
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.panel,
    padding: sg.space.md,
    marginBottom: sg.space.sm,
    borderWidth: 1,
    borderColor: sg.line,
  },
  faqQ: {
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  faqA: {
    marginTop: sg.space.sm,
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.bodyBold,
    color: sg.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: sg.space.lg,
    marginBottom: sg.space.sm,
  },
  guidesCard: {
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: sg.radius.panel,
    backgroundColor: sg.surface2,
    overflow: 'hidden',
  },
  guideRow: {
    minHeight: 54,
    paddingHorizontal: sg.space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
  },
  guideTitle: {
    flex: 1,
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  guideDivider: {
    height: 1,
    marginLeft: sg.space.md + 20 + sg.space.sm,
    backgroundColor: sg.line,
  },
  contactBtn: {
    backgroundColor: sg.gold,
    borderRadius: sg.radius.panel,
    paddingVertical: sg.space.md,
    alignItems: 'center',
  },
  contactBtnText: {
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyBold,
    color: sg.onGold,
  },
  footnote: {
    marginTop: sg.space.sm,
    fontSize: sg.type.xs,
    color: sg.muted,
    lineHeight: 18,
  },
});
