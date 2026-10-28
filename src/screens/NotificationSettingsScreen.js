import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

const STORAGE_KEY = '@usgcorso/notification-preferences';

const defaults = {
  events: true,
  community: true,
  lostFound: true,
};

export default function NotificationSettingsScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [preferences, setPreferences] = useState(defaults);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          setPreferences({ ...defaults, ...JSON.parse(saved) });
        }
      })
      .catch((error) => console.warn('Notification preferences restore failed:', error));
  }, []);

  function updatePreference(key, value) {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((error) =>
      console.warn('Notification preferences save failed:', error)
    );
  }

  const items = [
    ['events', t('settings.notificationsEvents'), t('settings.notificationsEventsHint')],
    ['community', t('settings.notificationsCommunity'), t('settings.notificationsCommunityHint')],
    ['lostFound', t('settings.notificationsLostFound'), t('settings.notificationsLostFoundHint')],
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>{t('settings.notificationsIntro')}</Text>

        <View style={styles.card}>
          {items.map(([key, title, description], index) => (
            <View key={key}>
              {index > 0 && <View style={styles.separator} />}
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{title}</Text>
                  <Text style={styles.rowDescription}>{description}</Text>
                </View>
                <Switch
                  value={preferences[key]}
                  onValueChange={(value) => updatePreference(key, value)}
                  trackColor={{
                    false: colors.border,
                    true: colors.goldSoft,
                  }}
                  thumbColor={preferences[key] ? colors.gold : colors.textMuted}
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.note}>{t('settings.notificationsLocalNote')}</Text>
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
    intro: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 14,
    },
    card: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: 18,
    },
    row: {
      minHeight: 84,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
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
      marginTop: 4,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
    },
    note: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 12,
    },
  });
}
