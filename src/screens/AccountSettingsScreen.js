import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

export default function AccountSettingsScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.kicker}>USG CORSO</Text>
          <Text style={styles.title}>{t('settings.account')}</Text>
          <Text style={styles.body}>{t('settings.accountPrepared')}</Text>

          <View style={styles.status}>
            <Text style={styles.statusText}>{t('settings.authNotConnected')}</Text>
          </View>
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
    body: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 21,
      textAlign: 'center',
      marginTop: 12,
    },
    status: {
      marginTop: 22,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    statusText: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '700',
      textAlign: 'center',
    },
  });
}
