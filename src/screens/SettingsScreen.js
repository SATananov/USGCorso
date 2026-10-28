import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppControls } from '../app/AppControlContext';
import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

const languageOptions = [
  { code: 'en', label: 'EN' },
  { code: 'bg', label: 'BG' },
  { code: 'it', label: 'IT' },
];

const RESET_KEYS = [
  '@usgcorso/language',
  '@usgcorso/theme',
  '@usgcorso/notification-preferences',
  '@usgcorso/privacy-preferences',
];

export default function SettingsScreen({ navigation }) {
  const { language, setLanguage, t } = useLanguage();
  const { themeName, setThemeName, colors } = useTheme();
  const { replayIntro } = useAppControls();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const rows = [
    {
      key: 'notifications',
      title: t('settings.notifications'),
      description: t('settings.notificationsHint'),
      route: 'NotificationSettings',
    },
    {
      key: 'privacy',
      title: t('settings.privacy'),
      description: t('settings.privacyHint'),
      route: 'PrivacySettings',
    },
    {
      key: 'account',
      title: t('settings.account'),
      description: t('settings.accountHint'),
      route: 'AccountSettings',
    },
    {
      key: 'help',
      title: t('settings.help'),
      description: t('settings.helpHint'),
      route: 'HelpSupport',
    },
    {
      key: 'legal',
      title: t('settings.legal'),
      description: t('settings.legalHint'),
      route: 'Legal',
    },
  ];

  function confirmReset() {
    Alert.alert(
      t('settings.resetTitle'),
      t('settings.resetConfirm'),
      [
        {
          text: t('settings.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.resetAction'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(RESET_KEYS);
              setLanguage('en');
              setThemeName('dark');
              Alert.alert(
                t('settings.resetDoneTitle'),
                t('settings.resetDone')
              );
            } catch (error) {
              console.warn('Reset preferences failed:', error);
              Alert.alert(
                t('settings.resetFailedTitle'),
                t('settings.resetFailed')
              );
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.kicker}>USG CORSO</Text>
          <Text style={styles.title}>{t('settings.title')}</Text>
          <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('settings.theme')}</Text>

          <View style={styles.choiceRow}>
            <Pressable
              onPress={() => setThemeName('dark')}
              style={[
                styles.choiceButton,
                themeName === 'dark' && styles.choiceButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.choiceButtonText,
                  themeName === 'dark' && styles.choiceButtonTextActive,
                ]}
              >
                {t('settings.darkTheme')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setThemeName('light')}
              style={[
                styles.choiceButton,
                themeName === 'light' && styles.choiceButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.choiceButtonText,
                  themeName === 'light' && styles.choiceButtonTextActive,
                ]}
              >
                {t('settings.lightTheme')}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.helper}>{t('settings.themeHint')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>

          <View style={styles.languageRow}>
            {languageOptions.map((option) => {
              const active = language === option.code;

              return (
                <Pressable
                  key={option.code}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setLanguage(option.code)}
                  style={[
                    styles.languageButton,
                    active && styles.languageButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.languageButtonText,
                      active && styles.languageButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.helper}>{t('settings.languageHint')}</Text>
        </View>

        <View style={styles.card}>
          {rows.map((row, index) => (
            <View key={row.key}>
              {index > 0 && <View style={styles.separator} />}

              <Pressable
                onPress={() => navigation.navigate(row.route)}
                style={({ pressed }) => [
                  styles.row,
                  pressed && styles.rowPressed,
                ]}
              >
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{row.title}</Text>
                  <Text style={styles.rowDescription}>{row.description}</Text>
                </View>
                <Text style={styles.rowArrow}>›</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('settings.quickActions')}</Text>

          <Pressable
            onPress={replayIntro}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text style={styles.actionButtonTitle}>{t('settings.replayIntro')}</Text>
            <Text style={styles.actionButtonText}>{t('settings.replayIntroHint')}</Text>
          </Pressable>

          <View style={styles.separator} />

          <Pressable
            onPress={confirmReset}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text style={styles.dangerTitle}>{t('settings.resetPreferences')}</Text>
            <Text style={styles.actionButtonText}>{t('settings.resetPreferencesHint')}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <Text style={styles.aboutText}>{t('settings.aboutText')}</Text>

          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>{t('settings.version')}</Text>
            <Text style={styles.versionValue}>0.1.0</Text>
          </View>
        </View>

        <Text style={styles.footer}>USG — Unico Suo Genere™</Text>
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
      paddingHorizontal: spacing.md,
      paddingTop: 18,
      paddingBottom: 34,
    },
    headerCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: 28,
      alignItems: 'center',
      marginBottom: 14,
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
      fontSize: 28,
      fontWeight: '700',
      textAlign: 'center',
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 20,
      textAlign: 'center',
      marginTop: 8,
      maxWidth: 300,
    },
    card: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 18,
      marginBottom: 12,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 14,
    },
    choiceRow: {
      flexDirection: 'row',
      gap: 10,
    },
    choiceButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    choiceButtonActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    choiceButtonText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '700',
    },
    choiceButtonTextActive: {
      color: colors.gold,
    },
    languageRow: {
      flexDirection: 'row',
      gap: 10,
    },
    languageButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    languageButtonActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    languageButtonText: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '700',
    },
    languageButtonTextActive: {
      color: colors.gold,
    },
    helper: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 66,
      borderRadius: 12,
      paddingHorizontal: 4,
    },
    rowPressed: {
      backgroundColor: colors.activeSurface,
    },
    rowText: {
      flex: 1,
    },
    rowTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    rowDescription: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 3,
    },
    rowArrow: {
      color: colors.gold,
      fontSize: 26,
      marginLeft: 12,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 2,
    },
    actionButton: {
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 4,
    },
    actionButtonPressed: {
      backgroundColor: colors.activeSurface,
    },
    actionButtonTitle: {
      color: colors.gold,
      fontSize: 15,
      fontWeight: '700',
    },
    dangerTitle: {
      color: '#b14b42',
      fontSize: 15,
      fontWeight: '700',
    },
    actionButtonText: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 4,
    },
    aboutText: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
    },
    versionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    versionLabel: {
      color: colors.textMuted,
      fontSize: 12,
    },
    versionValue: {
      color: colors.goldSoft,
      fontSize: 12,
      fontWeight: '700',
    },
    footer: {
      color: colors.textMuted,
      fontSize: 10,
      textAlign: 'center',
      marginTop: 10,
    },
  });
}
