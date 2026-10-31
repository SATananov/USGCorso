import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../notifications/notificationService';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

function formatDate(value, language) {
  if (!value) {
    return '';
  }

  const locale = language === 'bg' ? 'bg-BG' : language === 'it' ? 'it-IT' : 'en-GB';

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function NotificationsScreen() {
  const { language, t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      setItems(await getNotifications());
    } catch {
      setError(t('settings.notificationsInboxLoadFailed'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function openItem(item) {
    if (item.read_at) {
      return;
    }

    try {
      await markNotificationRead(item.id);
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, read_at: new Date().toISOString() }
            : entry
        )
      );
    } catch {
      setError(t('settings.notificationsMarkReadFailed'));
    }
  }

  async function markAllRead() {
    try {
      await markAllNotificationsRead();
      const now = new Date().toISOString();
      setItems((current) =>
        current.map((entry) => ({
          ...entry,
          read_at: entry.read_at || now,
        }))
      );
    } catch {
      setError(t('settings.notificationsMarkReadFailed'));
    }
  }

  const unreadCount = items.filter((item) => !item.read_at).length;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={colors.gold}
          />
        }
      >
        <View style={styles.headerCard}>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>USG CORSO</Text>
            <Text style={styles.title}>{t('settings.notificationsCenter')}</Text>
            <Text style={styles.subtitle}>
              {t('settings.notificationsCenterSubtitle')}
            </Text>
          </View>

          <View style={styles.unreadBadge}>
            <Text style={styles.unreadValue}>{unreadCount}</Text>
            <Text style={styles.unreadLabel}>
              {t('settings.notificationsUnread')}
            </Text>
          </View>
        </View>

        {unreadCount > 0 ? (
          <Pressable
            onPress={markAllRead}
            style={({ pressed }) => [
              styles.markAllButton,
              pressed && styles.markAllButtonPressed,
            ]}
          >
            <Text style={styles.markAllText}>
              {t('settings.notificationsMarkAllRead')}
            </Text>
          </Pressable>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.loadingText}>
              {t('settings.notificationsLoading')}
            </Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {t('settings.notificationsEmptyTitle')}
            </Text>
            <Text style={styles.emptyText}>
              {t('settings.notificationsEmptyText')}
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => openItem(item)}
              style={({ pressed }) => [
                styles.notificationCard,
                !item.read_at && styles.notificationCardUnread,
                pressed && styles.notificationCardPressed,
              ]}
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.category}>
                  {t(`settings.notificationCategory_${item.category}`)}
                </Text>
                {!item.read_at ? <View style={styles.unreadDot} /> : null}
              </View>

              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationBody}>{item.body}</Text>
              <Text style={styles.date}>
                {formatDate(item.created_at, language)}
              </Text>
            </Pressable>
          ))
        )}
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
      paddingBottom: 36,
    },
    headerCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 12,
    },
    headerText: {
      flex: 1,
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 2.4,
      marginBottom: 7,
    },
    title: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '800',
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 5,
    },
    unreadBadge: {
      minWidth: 58,
      minHeight: 58,
      borderRadius: 29,
      borderWidth: 1,
      borderColor: colors.goldSoft,
      backgroundColor: colors.activeSurface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    unreadValue: {
      color: colors.gold,
      fontSize: 18,
      fontWeight: '900',
    },
    unreadLabel: {
      color: colors.textSoft,
      fontSize: 8,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 1,
    },
    markAllButton: {
      minHeight: 42,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    markAllButtonPressed: {
      opacity: 0.72,
    },
    markAllText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    loadingBox: {
      minHeight: 150,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    loadingText: {
      color: colors.textSoft,
      fontSize: 12,
    },
    emptyCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 24,
      alignItems: 'center',
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
      textAlign: 'center',
    },
    emptyText: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 7,
    },
    notificationCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 16,
      marginBottom: 10,
    },
    notificationCardUnread: {
      borderColor: colors.goldSoft,
      backgroundColor: colors.activeSurface,
    },
    notificationCardPressed: {
      opacity: 0.78,
    },
    cardTopRow: {
      minHeight: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 7,
    },
    category: {
      color: colors.goldSoft,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.gold,
    },
    notificationTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
      lineHeight: 20,
    },
    notificationBody: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      marginTop: 5,
    },
    date: {
      color: colors.textMuted,
      fontSize: 9,
      marginTop: 10,
    },
    error: {
      color: colors.danger || '#d66',
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 12,
    },
  });
}
