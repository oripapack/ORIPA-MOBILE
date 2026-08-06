import React, { useLayoutEffect } from 'react';
import { sg } from '../tokens/sg';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import Ionicons from '@expo/vector-icons/Ionicons';

type Nav = StackNavigationProp<RootStackParamList, 'HotDropsInfo'>;

export function HotDropsInfoScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('hotDropsInfo.navTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  const bulletKeys = ['b1', 'b2', 'b3'] as const;
  const bulletIcons = ['calendar-outline', 'analytics-outline', 'notifications-outline'] as const;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + sg.space.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>{t('hotDropsInfo.eyebrow')}</Text>
      <Text style={styles.title}>{t('hotDropsInfo.title')}</Text>
      <Text style={styles.body}>{t('hotDropsInfo.body')}</Text>
      <View style={styles.stepsCard}>
        {bulletKeys.map((k, index) => (
          <View key={k} style={[styles.stepRow, index < bulletKeys.length - 1 && styles.stepBorder]}>
            <View style={styles.iconWell}>
              <Ionicons name={bulletIcons[index]} size={19} color={sg.gold} />
            </View>
            <Text style={styles.stepText}>{t(`hotDropsInfo.${k}`)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.callout}>
        <Text style={styles.calloutText}>{t('hotDropsInfo.callout')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: sg.bg },
  content: { padding: sg.space.md, paddingTop: sg.space.md },
  eyebrow: {
    fontSize: 10,
    fontFamily: sg.font.bodyBold,
    color: sg.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: sg.space.xs,
  },
  title: {
    fontSize: sg.type.xxl,
    fontFamily: sg.font.display,
    color: sg.text,
    letterSpacing: -0.5,
    marginBottom: sg.space.sm,
  },
  body: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 22,
    marginBottom: sg.space.md,
  },
  stepsCard: {
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: sg.radius.panel,
    backgroundColor: sg.surface2,
    overflow: 'hidden',
  },
  stepRow: {
    minHeight: 70,
    padding: sg.space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.md,
  },
  stepBorder: {
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
  },
  iconWell: {
    width: 36,
    height: 36,
    borderRadius: sg.radius.btn,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sg.accentWash,
  },
  stepText: {
    flex: 1,
    fontSize: sg.type.sm,
    color: sg.text,
    lineHeight: 20,
  },
  callout: {
    marginTop: sg.space.lg,
    backgroundColor: sg.surface,
    borderRadius: sg.radius.panel,
    padding: sg.space.md,
    borderWidth: 1,
    borderColor: sg.line,
  },
  calloutText: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 20,
  },
});
