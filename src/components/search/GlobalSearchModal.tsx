import React, { useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '../../tokens/colors';
import { fontSize, fontWeight } from '../../tokens/typography';
import { radius, spacing } from '../../tokens/spacing';
import { mockPacks, type Pack } from '../../data/mockPacks';
import { getLocalizedPackFields } from '../../i18n/packCopy';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { navigationRef } from '../../navigation/navigationRef';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function GlobalSearchModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { requireAuth } = useRequireAuth();

  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return mockPacks.filter((p) => {
      const loc = getLocalizedPackFields(p, t);
      const hay =
        `${loc.title} ${loc.valueDescription} ${loc.guaranteeText} ${p.tags.join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, t]);

  const close = () => {
    Keyboard.dismiss();
    setQuery('');
    onClose();
  };

  const clear = () => setQuery('');

  const renderItem = ({ item }: { item: Pack }) => {
    const loc = getLocalizedPackFields(item, t);
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          requireAuth(() => {
            close();
            if (navigationRef.isReady()) {
              navigationRef.navigate('PackDetails', { packId: String(item.id) });
            }
          })
        }
        activeOpacity={0.9}
      >
        <View style={styles.rowTop}>
          <Text style={styles.title} numberOfLines={1}>
            {loc.title}
          </Text>
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>
              {item.creditPrice} {t('packCard.credits')}
            </Text>
          </View>
        </View>
        <Text style={styles.sub} numberOfLines={2}>
          {loc.valueDescription}
        </Text>
        <Text style={styles.hint} numberOfLines={1}>
          {loc.guaranteeText}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={close}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('search.title')}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={close} activeOpacity={0.85}>
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder={t('search.placeholder')}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => inputRef.current?.blur()}
            clearButtonMode="never"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.trim().length > 0 ? (
            <TouchableOpacity onPress={clear} style={styles.clearBtn} activeOpacity={0.85}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {query.trim().length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('search.emptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('search.emptyBody')}</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('search.noResultsTitle')}</Text>
            <Text style={styles.emptyBody}>{t('search.noResultsBody')}</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(p) => String(p.id)}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  clearBtn: {
    marginLeft: spacing.xs,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  row: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  sub: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  pricePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.nearBlack,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.gold,
  },
});

