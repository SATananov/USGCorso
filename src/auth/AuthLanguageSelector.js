import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

export default function AuthLanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {['en', 'bg', 'it'].map((item) => {
        const active = language === item;

        return (
          <Pressable
            key={item}
            onPress={() => setLanguage(item)}
            style={[styles.button, active && styles.buttonActive]}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {item.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 24,
    },
    button: {
      minWidth: 46,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      alignItems: 'center',
    },
    buttonActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    text: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '700',
    },
    textActive: {
      color: colors.gold,
    },
  });
}
