import React, { useLayoutEffect, useState } from 'react';
import { sg } from '../tokens/sg';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type Nav = StackNavigationProp<RootStackParamList, 'Notifications'>;

type ToggleKey = 'order' | 'drops' | 'promos' | 'social';

export function NotificationsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    order: true,
    drops: true,
    promos: false,
    social: true,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('notifications.navTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  const keys: ToggleKey[] = ['order', 'drops', 'promos', 'social'];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + sg.space.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.lead}>{t('notifications.lead')}</Text>

      {keys.map((key) => (
        <View key={key} style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{t(`notifications.toggles.${key}.title`)}</Text>
            <Text style={styles.rowSub}>{t(`notifications.toggles.${key}.sub`)}</Text>
          </View>
          <Switch
            value={toggles[key]}
            onValueChange={(v) => setToggles((s) => ({ ...s, [key]: v }))}
            trackColor={{ false: sg.line, true: sg.gold }}
            thumbColor={sg.text}
          />
        </View>
      ))}

      <Text style={styles.note}>{t('notifications.note')}</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: sg.space.md,
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.panel,
    padding: sg.space.md,
    marginBottom: sg.space.sm,
    borderWidth: 1,
    borderColor: sg.line,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: {
    fontSize: sg.type.base,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
  },
  rowSub: {
    fontSize: sg.type.xs,
    color: sg.muted,
    marginTop: 4,
    lineHeight: 18,
  },
  note: {
    marginTop: sg.space.md,
    fontSize: sg.type.xs,
    color: sg.muted,
    lineHeight: 18,
  },
});
