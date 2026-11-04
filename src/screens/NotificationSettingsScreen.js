import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useRef as useBackToTopRef, useState as useBackToTopState } from 'react';
import USGBackToTop from '../components/USGBackToTop';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../notifications/notificationService';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

const STORAGE_KEY = '@usgcorso/notification-preferences';

const defaults = {
  moderation: true,
  events: true,
  community: true,
  lostFound: true,
};

export default function NotificationSettingsScreen({ navigation }) {
  const backToTopRef = useBackToTopRef(null);
  const [backToTopVisible, setBackToTopVisible] = useBackToTopState(false);
  const { language: backToTopLanguage } = useLanguage();
  const { session } = useAuth();
  const { language, t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [preferences, setPreferences] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        if (session?.user?.id) {
          const remote = await getNotificationPreferences();

          if (active && remote) {
            setPreferences({
              moderation: remote.moderation,
              events: remote.events,
              community: remote.community,
              lostFound: remote.lost_found,
            });
          }
        } else {
          const saved = await AsyncStorage.getItem(STORAGE_KEY);

          if (active && saved) {
            setPreferences({ ...defaults, ...JSON.parse(saved) });
          }
        }
      } catch {
        if (active) {
          setError(t('settings.notificationsLoadFailed'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [session?.user?.id, t]);

  async function updatePreference(key, value) {
    const previous = preferences;
    const next = { ...preferences, [key]: value };

    setPreferences(next);
    setSavingKey(key);
    setError('');

    try {
      if (session?.user?.id) {
        await updateNotificationPreferences({
          ...next,
          preferredLanguage: language,
        });
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    } catch {
      setPreferences(previous);
      setError(t('settings.notificationsSaveFailed'));
    } finally {
      setSavingKey('');
    }
  }

  const items = [
    [
      'moderation',
      t('settings.notificationsModeration'),
      t('settings.notificationsModerationHint'),
    ],
    ['events', t('settings.notificationsEvents'), t('settings.notificationsEventsHint')],
    [
      'community',
      t('settings.notificationsCommunity'),
      t('settings.notificationsCommunityHint'),
    ],
    [
      'lostFound',
      t('settings.notificationsLostFound'),
      t('settings.notificationsLostFoundHint'),
    ],
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        ref={backToTopRef}
        onScroll={(event) => {
          const visible = event.nativeEvent.contentOffset.y > 220;
          setBackToTopVisible((current) => current === visible ? current : visible);
        }}
        scrollEventThrottle={32} contentContainerStyle={styles.content}>
        <Text style={styles.intro}>{t('settings.notificationsIntro')}</Text>

        {session?.user?.id ? (
          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            style={({ pressed }) => [
              styles.centerCard,
              pressed && styles.centerCardPressed,
            ]}
          >
            <View style={styles.centerText}>
              <Text style={styles.centerTitle}>
                {t('settings.notificationsCenter')}
              </Text>
              <Text style={styles.centerDescription}>
                {t('settings.notificationsCenterHint')}
              </Text>
            </View>
            <Text style={styles.centerArrow}>›</Text>
          </Pressable>
        ) : null}

        <View style={styles.card}>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.loadingText}>
                {t('settings.notificationsLoading')}
              </Text>
            </View>
          ) : (
            items.map(([key, title, description], index) => (
              <View key={key}>
                {index > 0 && <View style={styles.separator} />}
                <View style={styles.row}>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{title}</Text>
                    <Text style={styles.rowDescription}>{description}</Text>
                  </View>
                  <Switch
                    disabled={Boolean(savingKey)}
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
            ))
          )}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.note}>
          {session?.user?.id
            ? t('settings.notificationsAccountNote')
            : t('settings.notificationsLocalNote')}
        </Text>
      </ScrollView>
      <USGBackToTop
        visible={backToTopVisible}
        language={backToTopLanguage}
        onPress={() => backToTopRef.current?.scrollTo({ y: 0, animated: true })}
      />
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
    centerCard: {
      minHeight: 82,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.goldSoft,
      backgroundColor: colors.activeSurface,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    centerCardPressed: {
      opacity: 0.78,
    },
    centerText: {
      flex: 1,
    },
    centerTitle: {
      color: colors.gold,
      fontSize: 15,
      fontWeight: '800',
    },
    centerDescription: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 4,
    },
    centerArrow: {
      color: colors.gold,
      fontSize: 28,
      marginLeft: 12,
    },
    card: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: 18,
    },
    loadingRow: {
      minHeight: 84,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    loadingText: {
      color: colors.textSoft,
      fontSize: 12,
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
    error: {
      color: colors.danger || '#d66',
      fontSize: 12,
      lineHeight: 18,
      marginTop: 12,
    },
  });
}
