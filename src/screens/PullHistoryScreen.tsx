import React, { useLayoutEffect } from 'react';
import { sg } from '../tokens/sg';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fontSize } from '../tokens/typography';
import { spacing } from '../tokens/spacing';
import { RootStackParamList } from '../navigation/types';
import { PullHistoryRow, useCompletedPullsSorted } from '../components/account/PullHistoryRow';
import { SgScreen } from '../components/ui';

type Nav = StackNavigationProp<RootStackParamList, 'PullHistory'>;

export function PullHistoryScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const pulls = useCompletedPullsSorted();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('pullHistoryScreen.navTitle'),
      headerShown: true,
      headerTintColor: sg.text,
      headerTitleStyle: { fontFamily: sg.font.bodyBold },
      headerShadowVisible: false,
      headerStyle: { backgroundColor: sg.surface2 },
    });
  }, [navigation, t]);

  return (
    <SgScreen>
      <FlatList
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxxl, paddingTop: spacing.md },
        ]}
        data={pulls}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Text style={styles.lead}>{t('pullHistoryScreen.lead')}</Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('rewards.noPullsTitle')}</Text>
            <Text style={styles.emptyBody}>{t('rewards.noPullsBody')}</Text>
          </View>
        }
        renderItem={({ item }) => <PullHistoryRow pull={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SgScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingHorizontal: spacing.base },
  lead: {
    fontSize: fontSize.sm,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    marginBottom: spacing.xs,
  },
  emptyBody: {
    fontSize: fontSize.sm,
    color: sg.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
