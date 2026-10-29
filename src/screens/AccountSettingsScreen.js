import { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';
import { accountCopy } from '../auth/accountCopy';
import { useAuth } from '../auth/AuthContext';

export default function AccountSettingsScreen() {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const { user } = useAuth();
  const copy = accountCopy[language] ?? accountCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);


  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.kicker}>USG CORSO</Text>
          <Text style={styles.title}>{copy.accountTitle}</Text>

          {user ? (
            <>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{copy.statusActive}</Text>
              </View>

              <Text style={styles.label}>{copy.signedInAs}</Text>
              <Text style={styles.email} numberOfLines={1}>
                {user.email}
              </Text>

              <Text style={styles.note}>{copy.profileComing}</Text>


            </>
          ) : (
            <>
              <View style={styles.statusRow}>
                <View style={styles.guestDot} />
                <Text style={styles.statusText}>{copy.guestStatus}</Text>
              </View>
              <Text style={styles.note}>{copy.guestText}</Text>
            </>
          )}
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
      alignItems: 'center',
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 3,
      marginBottom: 12,
    },
    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '700',
      textAlign: 'center',
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 22,
    },
    statusDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: colors.gold,
      marginRight: 8,
    },
    guestDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.textMuted,
      marginRight: 8,
    },
    statusText: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    label: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 22,
    },
    email: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
      marginTop: 6,
      maxWidth: '100%',
    },
    note: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 20,
    },
    error: {
      color: '#c76c6c',
      fontSize: 11,
      lineHeight: 17,
      textAlign: 'center',
      marginTop: 14,
    },
    button: {
      width: '100%',
      minHeight: 48,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 24,
    },
    buttonText: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
    },
  });
}

