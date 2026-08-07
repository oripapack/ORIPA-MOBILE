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
import { navigationRef } from '../../navigation/navigationRef';
import { TerminalBackdrop } from '../terminal/TerminalBackdrop';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function GlobalSearchModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const catalogIsPreview = !__DEV__;

  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return mockPacks.filter((p) => {
      const loc = getLocalizedPackFields(p, t);
      const hay = catalogIsPreview
        ? `${loc.title} ${p.tcgCategory ?? ''} ${p.category}`.toLowerCase()
        : `${loc.title} ${loc.valueDescription} ${loc.guaranteeText} ${p.tags.join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [catalogIsPreview, query, t]);

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
        onPress={() => {
          close();
          if (navigationRef.isReady()) {
            navigationRef.navigate('PackDetails', { packId: String(item.id) });
          }
        }}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={t('search.resultA11y', { title: loc.title })}
      >
        <View style={styles.rowSignal} pointerEvents="none" />
        <View style={styles.rowTop}>
          <View style={styles.rowIdentity}>
            <Text style={styles.rowCode}>
              {catalogIsPreview ? 'PACK / RELEASE STATUS' : 'PACK / CATALOG'}
            </Text>
            <Text style={styles.title} numberOfLines={1}>
              {loc.title}
            </Text>
          </View>
          <View style={styles.statusTag}>
            <Text style={styles.statusText}>
              {catalogIsPreview
                ? t('search.releaseSyncLabel')
                : `${item.creditPrice} ${t('packCard.credits')}`}
            </Text>
          </View>
        </View>
        <Text style={styles.sub} numberOfLines={2}>
          {catalogIsPreview ? t('search.releaseSyncBody') : loc.valueDescription}
        </Text>
        <Text style={styles.hint} numberOfLines={1}>
          {catalogIsPreview ? t('search.releaseSyncHint') : loc.guaranteeText}
        </Text>
        <Ionicons name="arrow-forward" size={17} color={sg.goldHi} style={styles.rowArrow} />
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
      <View
        style={[styles.container, { paddingTop: insets.top + sg.space.sm }]}
      >
        <TerminalBackdrop />
        <View style={styles.header}>
          <View style={styles.headerIdentity}>
            <View style={styles.headerMark}>
              <Ionicons name="search" size={18} color={sg.goldHi} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.headerKicker}>TOKYO TERMINAL / CATALOG</Text>
              <Text style={styles.headerTitle}>{t('search.title')}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={close}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
          >
            <Ionicons name="close" size={20} color={sg.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.searchFrame}>
            <Text style={styles.searchLabel}>SEARCH / PACK CATALOG</Text>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={19} color={sg.goldHi} style={styles.searchIcon} />
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
                accessibilityLabel={t('search.placeholder')}
              />
              {query.trim().length > 0 ? (
                <TouchableOpacity
                  onPress={clear}
                  style={styles.clearBtn}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={t('marketplace.clearSearchA11y')}
                >
                  <Ionicons name="close-circle" size={18} color={sg.muted} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {query.trim().length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyCode}>CATALOG / READY</Text>
              <Text style={styles.emptyTitle}>{t('search.emptyTitle')}</Text>
              <Text style={styles.emptyBody}>{t('search.emptyBody')}</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyCode}>CATALOG / NO MATCH</Text>
              <Text style={styles.emptyTitle}>{t('search.noResultsTitle')}</Text>
              <Text style={styles.emptyBody}>{t('search.noResultsBody')}</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(p) => String(p.id)}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[styles.results, { paddingBottom: insets.bottom + sg.space.lg }]}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: sg.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: sg.space.md,
    paddingBottom: sg.space.sm,
    borderBottomWidth: 1,
    borderBottomColor: sg.line,
    backgroundColor: sg.surface,
  },
  headerIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
  },
  headerMark: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: sg.cobaltBorder,
    backgroundColor: sg.cobaltWash,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerKicker: {
    fontFamily: sg.font.label,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0.9,
    color: sg.muted,
  },
  headerTitle: {
    marginTop: 1,
    fontSize: 20,
    lineHeight: 22,
    fontFamily: sg.font.display,
    color: sg.text,
  },
  closeBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: sg.lineStrong,
    backgroundColor: sg.surface2,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: sg.space.md,
    paddingTop: sg.space.md,
  },
  searchFrame: {
    padding: sg.space.sm,
    borderWidth: 1,
    borderColor: sg.line,
    backgroundColor: sg.surface,
    marginBottom: sg.space.md,
  },
  searchLabel: {
    marginBottom: sg.space.sm,
    fontFamily: sg.font.label,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0.9,
    color: sg.muted,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: sg.surface2,
    borderWidth: 1,
    borderColor: sg.lineStrong,
    paddingHorizontal: sg.space.md,
    minHeight: 50,
  },
  searchIcon: {
    marginRight: sg.space.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
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
    padding: sg.space.md,
    borderWidth: 1,
    borderColor: sg.line,
    borderLeftWidth: 3,
    borderLeftColor: sg.gold,
    backgroundColor: sg.surface,
  },
  emptyCode: {
    marginBottom: sg.space.sm,
    fontFamily: sg.font.label,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0.9,
    color: sg.goldHi,
  },
  emptyTitle: {
    fontSize: 19,
    lineHeight: 22,
    fontFamily: sg.font.display,
    color: sg.text,
    marginBottom: sg.space.sm,
  },
  emptyBody: {
    fontSize: 13,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 21,
  },
  list: {
    flex: 1,
  },
  results: {
    gap: sg.space.sm,
  },
  row: {
    position: 'relative',
    overflow: 'hidden',
    padding: sg.space.md,
    paddingLeft: sg.space.md + 3,
    backgroundColor: sg.surface,
    borderWidth: 1,
    borderColor: sg.line,
  },
  rowSignal: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: sg.gold,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: sg.space.sm,
    marginBottom: sg.space.sm,
  },
  rowIdentity: {
    flex: 1,
    minWidth: 0,
  },
  rowCode: {
    marginBottom: 3,
    fontFamily: sg.font.dataBold,
    fontSize: 8,
    letterSpacing: 0.75,
    color: sg.goldHi,
    fontVariant: [...sg.numeric],
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: sg.font.display,
    color: sg.text,
  },
  sub: {
    paddingRight: sg.space.lg,
    fontSize: 13,
    fontFamily: sg.font.body,
    color: sg.muted,
    lineHeight: 19,
    marginBottom: sg.space.sm,
  },
  hint: {
    paddingRight: sg.space.lg,
    fontSize: 10,
    lineHeight: 14,
    fontFamily: sg.font.label,
    letterSpacing: 0.45,
    color: sg.text,
    textTransform: 'uppercase',
  },
  statusTag: {
    paddingHorizontal: sg.space.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: sg.warningBorder,
    backgroundColor: sg.warningWash,
  },
  statusText: {
    fontSize: 9,
    lineHeight: 12,
    fontFamily: sg.font.dataBold,
    color: sg.warning,
    fontVariant: [...sg.numeric],
  },
  rowArrow: {
    position: 'absolute',
    right: sg.space.md,
    bottom: sg.space.md,
  },
});
