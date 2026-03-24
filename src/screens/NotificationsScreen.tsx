import React, { useLayoutEffect, useState } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../tokens/colors';
import { fontSize, fontWeight } from '../tokens/typography';
import { radius, spacing } from '../tokens/spacing';
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
      headerTintColor: colors.textPrimary,
      headerTitleStyle: { fontWeight: fontWeight.bold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: colors.surfaceElevated },
    });
  }, [navigation, t]);

  const keys: ToggleKey[] = ['order', 'drops', 'promos', 'social'];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
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
            trackColor={{ false: colors.border, true: colors.red }}
            thumbColor={colors.white}
          />
        </View>
      ))}

      <Text style={styles.note}>{t('notifications.note')}</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  rowSub: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  note: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
