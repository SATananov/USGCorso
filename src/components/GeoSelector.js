import { useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useTheme } from '../theme/ThemeContext';

export default function GeoSelector({
  label,
  value,
  placeholder,
  options,
  loading,
  allowWhileLoading = false,
  disabled,
  searchPlaceholder,
  emptyText,
  searchAliases,
  allowCustom = false,
  customOptionLabel,
  onPress,
  onSelect,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const searchInputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalize = (value) => String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .trim();
    const normalized = normalize(query);

    if (!normalized) {
      return options;
    }

    return options.filter((item) =>
      [item, ...(searchAliases?.(item) ?? [])].some((candidate) => normalize(candidate).includes(normalized))
    );
  }, [options, query, searchAliases]);

  function openModal() {
    if (disabled || (loading && !allowWhileLoading)) {
      return;
    }

    onPress?.();
    setQuery('');
    setOpen(true);
  }

  function choose(item) {
    setOpen(false);
    setQuery('');
    Keyboard.dismiss();
    onSelect(item);
  }

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          onPress={openModal}
          style={[
            styles.selector,
            disabled && styles.selectorDisabled,
          ]}
        >
          <Text
            style={[
              styles.selectorText,
              !value && styles.placeholder,
            ]}
            numberOfLines={1}
          >
            {loading && !allowWhileLoading ? '...' : value || placeholder}
          </Text>
          <Text style={styles.chevron}>⌄</Text>
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onShow={() => requestAnimationFrame(() => searchInputRef.current?.focus())}
        onRequestClose={() => {
          setOpen(false);
          Keyboard.dismiss();
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable
            style={styles.backdrop}
            onPress={() => {
              setOpen(false);
              Keyboard.dismiss();
            }}
          />

          <View style={styles.sheet}>
            <TextInput
              ref={searchInputRef}
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={styles.search}
            />

            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}
            >
              {filtered.length ? (
                filtered.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => choose(item)}
                    style={styles.option}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.empty}>{emptyText}</Text>
              )}
              {allowCustom && query.trim() ? (
                <Pressable
                  onPress={() => choose(query.trim())}
                  style={styles.option}
                >
                  <Text style={[styles.optionText, styles.customOption]}>
                    {customOptionLabel?.(query.trim()) || query.trim()}
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    field: {
      marginTop: 15,
    },
    label: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '700',
      marginBottom: 6,
    },
    selector: {
      minHeight: 46,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 13,
    },
    selectorDisabled: {
      opacity: 0.5,
    },
    selectorText: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
    },
    placeholder: {
      color: colors.textMuted,
    },
    chevron: {
      color: colors.gold,
      fontSize: 18,
      marginLeft: 8,
    },
    modalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
    },
    sheet: {
      maxHeight: '78%',
      flexShrink: 1,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.background,
      padding: 16,
      paddingBottom: 24,
    },
    optionsList: {
      flexShrink: 1,
    },
    search: {
      minHeight: 46,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.text,
      paddingHorizontal: 13,
      fontSize: 13,
      marginBottom: 10,
    },
    option: {
      minHeight: 46,
      justifyContent: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingHorizontal: 4,
    },
    optionText: {
      color: colors.text,
      fontSize: 13,
    },
    customOption: {
      color: colors.gold,
      fontWeight: '800',
    },
    empty: {
      color: colors.textMuted,
      fontSize: 12,
      textAlign: 'center',
      paddingVertical: 24,
    },
  });
}
