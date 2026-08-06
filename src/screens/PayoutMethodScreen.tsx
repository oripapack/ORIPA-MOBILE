import React, { useLayoutEffect } from 'react';
import { sg } from '../tokens/sg';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type Nav = StackNavigationProp<RootStackParamList, 'PayoutMethod'>;

export function PayoutMethodScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('payoutMethod.navTitle'),
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
      <Text style={styles.body}>{t('payoutMethod.body')}</Text>
      <View style={styles.card}>
        <Text style={styles.cardLine}>• {t('payoutMethod.line1')}</Text>
        <Text style={styles.cardLine}>• {t('payoutMethod.line2')}</Text>
        <Text style={styles.cardLine}>• {t('payoutMethod.line3')}</Text>
      </View>
      <Text style={styles.note}>{t('payoutMethod.note')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: sg.bg },
  content: { padding: sg.space.md, paddingTop: sg.space.md },
  body: {
    fontSize: sg.type.sm,
    color: sg.muted,
    lineHeight: 22,
    marginBottom: sg.space.lg,
  },
  card: {
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.panel,
    padding: sg.space.md,
    borderWidth: 1,
    borderColor: sg.line,
    marginBottom: sg.space.md,
  },
  cardLine: {
    fontSize: sg.type.sm,
    color: sg.text,
    lineHeight: 22,
    marginBottom: sg.space.xs,
  },
  note: {
    fontSize: sg.type.xs,
    color: sg.muted,
    lineHeight: 18,
  },
});
