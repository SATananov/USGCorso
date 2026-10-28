import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

export default function HelpSupportScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const faq = [
    [t('settings.helpLanguageQ'), t('settings.helpLanguageA')],
    [t('settings.helpThemeQ'), t('settings.helpThemeA')],
    [t('settings.helpDataQ'), t('settings.helpDataA')],
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>USG CORSO</Text>
          <Text style={styles.title}>{t('settings.help')}</Text>
          <Text style={styles.subtitle}>{t('settings.helpIntro')}</Text>
        </View>

        {faq.map(([question, answer], index) => (
          <View key={question} style={styles.card}>
            <Text style={styles.question}>{question}</Text>
            <Text style={styles.answer}>{answer}</Text>
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.question}>{t('settings.supportTitle')}</Text>
          <Text style={styles.answer}>{t('settings.supportText')}</Text>
        </View>
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
    hero: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 24,
      alignItems: 'center',
      marginBottom: 12,
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 3,
      marginBottom: 10,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 8,
    },
    card: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 18,
      marginBottom: 10,
    },
    question: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    answer: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      marginTop: 6,
    },
  });
}
