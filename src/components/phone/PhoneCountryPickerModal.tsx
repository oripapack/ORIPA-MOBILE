import React, { useMemo, useState } from 'react';
import { sg } from '../../tokens/sg';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { transparentModalIOSProps } from '../../constants/modalPresentation';
import { DialCodeOption, PHONE_DIAL_CODES } from '../../constants/phoneDialCodes';

type Props = {
  visible: boolean;
  selected: DialCodeOption;
  onClose: () => void;
  onSelect: (option: DialCodeOption) => void;
};

export function PhoneCountryPickerModal({ visible, selected, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PHONE_DIAL_CODES;
    return PHONE_DIAL_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.dial.includes(s) ||
        c.id.toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      {...transparentModalIOSProps}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + sg.space.md }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.header, { paddingTop: insets.top + sg.space.sm }]}>
            <Text style={styles.headerTitle}>{t('phonePicker.title')}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('phonePicker.close')}
            >
              <Ionicons name="close" size={26} color={sg.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={20} color={sg.muted} />
            <TextInput
              style={styles.searchInput}
              value={q}
              onChangeText={setQ}
              placeholder={t('phonePicker.searchPlaceholder')}
              placeholderTextColor={sg.muted}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          <FlatList
            style={styles.list}
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            renderItem={({ item }) => {
              const isOn = item.id === selected.id;
              return (
                <TouchableOpacity
                  style={[styles.row, isOn && styles.rowOn]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                    setQ('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryCode}>{item.id}</Text>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.rowDial}>{item.dial}</Text>
                  {isOn ? <Ionicons name="checkmark" size={22} color={sg.gold} /> : <View style={styles.checkSpacer} />}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>{t('phonePicker.empty')}</Text>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: sg.surface2,
    borderTopLeftRadius: sg.radius.panel,
    borderTopRightRadius: sg.radius.panel,
    maxHeight: '88%',
    paddingHorizontal: sg.space.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sg.space.sm,
  },
  headerTitle: {
    fontSize: sg.type.lg,
    fontFamily: sg.font.bodyBold,
    color: sg.text,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
    borderWidth: 1,
    borderColor: sg.line,
    borderRadius: sg.radius.btn,
    paddingHorizontal: sg.space.sm,
    marginBottom: sg.space.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? sg.space.md : sg.space.sm,
    fontSize: sg.type.md,
    color: sg.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sg.space.sm,
    paddingVertical: sg.space.md,
    paddingHorizontal: sg.space.xs,
    borderRadius: sg.radius.btn,
  },
  rowOn: {
    backgroundColor: sg.surface,
  },
  countryCode: {
    fontSize: 11,
    fontFamily: sg.font.dataBold,
    color: sg.gold,
    letterSpacing: 0.6,
    width: 32,
    textAlign: 'center',
  },
  rowName: {
    flex: 1,
    fontSize: sg.type.md,
    fontFamily: sg.font.bodyMedium,
    color: sg.text,
  },
  rowDial: {
    fontSize: sg.type.sm,
    fontFamily: sg.font.bodyMedium,
    color: sg.muted,
    marginRight: sg.space.xs,
  },
  checkSpacer: {
    width: 22,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: sg.space.lg,
    color: sg.muted,
    fontSize: sg.type.sm,
  },
  list: {
    maxHeight: 340,
  },
});
