import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';
import { authCopy } from './authCopy';
import AuthLanguageSelector from './AuthLanguageSelector';

export default function AuthCheckEmailScreen({ onLogin }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const copy = authCopy[language] ?? authCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AuthLanguageSelector />

        <View style={styles.card}>
          <Text style={styles.brand}>{copy.brand}</Text>
          <Text style={styles.title}>{copy.checkEmailTitle}</Text>
          <Text style={styles.body}>{copy.checkEmailText}</Text>

          <Pressable style={styles.primaryButton} onPress={onLogin}>
            <Text style={styles.primaryText}>{copy.returnToLogin}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.md,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 28,
    },
    brand: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 3,
      textAlign: 'center',
      marginBottom: 12,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '700',
      textAlign: 'center',
    },
    body: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 21,
      textAlign: 'center',
      marginTop: 14,
      marginBottom: 24,
    },
    primaryButton: {
      minHeight: 50,
      borderRadius: radius.md,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
    },
    primaryText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
    },
  });
}
