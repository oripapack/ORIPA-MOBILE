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
import { sg } from '../../tokens/sg';
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
      <View style={[styles.container, { paddingTop: insets.top + sg.space.sm }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('search.title')}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={close} activeOpacity={0.85}>
            <Ionicons name="close" size={22} color={sg.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={sg.muted} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder={t('search.placeholder')}
            placeholderTextColor={sg.muted}
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
              <Ionicons name="close-circle" size={18} color={sg.muted} />
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
    backgroundColor: sg.bg,
    paddingHorizontal: sg.space.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: sg.space.sm,
  },
  headerTitle: {
    fontSize: sg.type.lg,
    fontFamily: sg.font.display,
    color: sg.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: sg.radius.tag,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: sg.surface2,
    borderRadius: sg.radius.panel,
    borderWidth: 1,
    borderColor: sg.line,
    paddingHorizontal: sg.space.md,
    minHeight: 48,
    marginBottom: sg.space.md,
  },
  searchIcon: {
    marginRight: sg.space.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: sg.type.base,
    fontFamily: sg.font.body,
    color: sg.text,
    paddingVertical: sg.space.sm,
  },
  clearBtn: {
    marginLeft: sg.space.xs,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    paddingVertical: sg.space.lg,
  },
  emptyTitle: {
    fontSize: sg.type.base,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 20,
  },
  row: {
    padding: sg.space.md,
    borderRadius: sg.radius.panel,
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.line,
    marginBottom: sg.space.sm,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: sg.space.sm,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: sg.type.base,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  sub: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 20,
    marginBottom: 6,
  },
  hint: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.body,
    color: sg.muted,
  },
  pricePill: {
    paddingHorizontal: sg.space.sm,
    paddingVertical: 6,
    borderRadius: sg.radius.tag,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  priceText: {
    fontSize: sg.type.xs,
    fontFamily: sg.font.dataBold,
    color: sg.gold,
    fontVariant: [...sg.numeric],
  },
});
