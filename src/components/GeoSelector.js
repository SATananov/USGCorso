import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
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
  disabled,
  searchPlaceholder,
  emptyText,
  onPress,
  onSelect,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return options;
    }

    return options.filter((item) => item.toLowerCase().includes(normalized));
  }, [options, query]);

  function openModal() {
    if (disabled || loading) {
      return;
    }

    onPress?.();
    setQuery('');
    setOpen(true);
  }

  function choose(item) {
    onSelect(item);
    setOpen(false);
    setQuery('');
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
            {loading ? '...' : value || placeholder}
          </Text>
          <Text style={styles.chevron}>⌄</Text>
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setOpen(false)}
          />

          <View style={styles.sheet}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              style={styles.search}
            />

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
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
            </ScrollView>
          </View>
        </View>
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
      maxHeight: '72%',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.background,
      padding: 16,
      paddingBottom: 24,
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
    empty: {
      color: colors.textMuted,
      fontSize: 12,
      textAlign: 'center',
      paddingVertical: 24,
    },
  });
}
