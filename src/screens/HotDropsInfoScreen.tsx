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

  return (
    <SgScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.body}>{t('hotDropsInfo.body')}</Text>
      {bulletKeys.map((k) => (
        <Text key={k} style={styles.bullet}>
          • {t(`hotDropsInfo.${k}`)}
        </Text>
      ))}
      <View style={styles.callout}>
        <Text style={styles.calloutText}>{t('hotDropsInfo.callout')}</Text>
      </View>
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
    marginBottom: spacing.md,
  },
  bullet: {
    fontSize: fontSize.sm,
    color: sg.text,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  callout: {
    marginTop: spacing.lg,
    backgroundColor: sg.surface2,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: sg.line,
  },
  calloutText: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 20,
  },
});
