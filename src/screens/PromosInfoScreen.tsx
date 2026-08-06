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
import Ionicons from '@expo/vector-icons/Ionicons';

type Nav = StackNavigationProp<RootStackParamList, 'PromosInfo'>;

export function PromosInfoScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('promosInfo.navTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  const bulletKeys = ['b1', 'b2', 'b3'] as const;
  const bulletIcons = ['document-text-outline', 'options-outline', 'git-compare-outline'] as const;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>{t('promosInfo.eyebrow')}</Text>
      <Text style={styles.title}>{t('promosInfo.title')}</Text>
      <Text style={styles.body}>{t('promosInfo.body')}</Text>
      <View style={styles.stepsCard}>
        {bulletKeys.map((k, index) => (
          <View key={k} style={[styles.stepRow, index < bulletKeys.length - 1 && styles.stepBorder]}>
            <View style={styles.iconWell}>
              <Ionicons name={bulletIcons[index]} size={19} color={sg.gold} />
            </View>
            <Text style={styles.stepText}>{t(`promosInfo.${k}`)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.callout}>
        <Text style={styles.calloutTitle}>{t('promosInfo.vsHotTitle')}</Text>
        <Text style={styles.calloutText}>{t('promosInfo.vsHotBody')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: sg.bg },
  content: { padding: spacing.base, paddingTop: spacing.md },
  eyebrow: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  stepsCard: {
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: radius.lg,
    backgroundColor: sg.surface2,
    overflow: 'hidden',
  },
  stepRow: {
    minHeight: 70,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepBorder: {
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  iconWell: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.09)',
  },
  stepText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: sg.text,
    lineHeight: 20,
  },
  callout: {
    marginTop: spacing.lg,
    backgroundColor: sg.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: sg.line,
  },
  calloutTitle: {
    fontSize: fontSize.sm,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    marginBottom: spacing.xs,
  },
  calloutText: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 20,
  },
});
