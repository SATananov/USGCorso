import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

export default function LegalScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('settings.termsTitle')}</Text>
          <Text style={styles.body}>{t('settings.termsText')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t('settings.privacyPolicyTitle')}</Text>
          <Text style={styles.body}>{t('settings.privacyPolicyText')}</Text>
        </View>

        <Text style={styles.note}>{t('settings.legalDraftNote')}</Text>
      </ScrollView>
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
      padding: spacing.md,
      paddingBottom: 32,
    },
    card: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 20,
      marginBottom: 12,
    },
    title: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
      marginBottom: 10,
    },
    body: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
    },
    note: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 4,
    },
  });
}
