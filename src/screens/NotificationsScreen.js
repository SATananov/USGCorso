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
import { useRef as useBackToTopRef, useState as useBackToTopState, useEffect as useBackToTopEffect } from 'react';
import USGBackToTop from '../components/USGBackToTop';
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

function getNotificationPresentation(item, language) {
  const data = item.data ?? {};
  const label = data.title || data.profile_name || '';

  if (item.entity_type === 'content_item' && item.target_exists === false) {
    if (language === 'bg') {
      return {
        category: 'ИСТОРИЯ',
        title: 'Материалът е изтрит',
        body: 'Този материал вече не е наличен. Известието е запазено само като история.',
        action: null,
      };
    }

    if (language === 'it') {
      return {
        category: 'CRONOLOGIA',
        title: 'Il contenuto è stato eliminato',
        body: 'Questo contenuto non è più disponibile. La notifica viene conservata solo come cronologia.',
        action: null,
      };
    }

    return {
      category: 'HISTORY',
      title: 'The material was deleted',
      body: 'This material is no longer available. The notification is kept only as history.',
      action: null,
    };
  }

  if (item.event_type === 'content_pending_review') {
    if (language === 'bg') {
      return {
        category: 'НОВ МАТЕРИАЛ',
        title: 'Нов материал чака преглед',
        body: label
          ? `Потребител изпрати „${label}“ за одобрение.`
          : 'Потребител изпрати нов материал за одобрение.',
        action: 'ОТВОРИ МАТЕРИАЛА',
      };
    }

    if (language === 'it') {
      return {
        category: 'NUOVO CONTENUTO',
        title: 'Nuovo contenuto in attesa di revisione',
        body: label
          ? `Un utente ha inviato “${label}” per l’approvazione.`
          : 'Un utente ha inviato un nuovo contenuto per l’approvazione.',
        action: 'APRI IL CONTENUTO',
      };
    }

    return {
      category: 'NEW MATERIAL',
      title: 'New material awaiting review',
      body: label
        ? `A user submitted “${label}” for approval.`
        : 'A user submitted new material for approval.',
      action: 'OPEN MATERIAL',
    };
  }

  if (item.event_type === 'professional_application_pending') {
    if (language === 'bg') {
      return {
        category: 'ПРОФЕСИОНАЛНА ЗАЯВКА',
        title: 'Нова професионална заявка',
        body: label
          ? `Получена е заявка за „${label}“.`
          : 'Получена е нова професионална заявка.',
        action: 'ОТВОРИ ADMIN SERVICES',
      };
    }

    if (language === 'it') {
      return {
        category: 'CANDIDATURA PROFESSIONALE',
        title: 'Nuova candidatura professionale',
        body: label
          ? `È stata ricevuta una candidatura per “${label}”.`
          : 'È stata ricevuta una nuova candidatura professionale.',
        action: 'APRI ADMIN SERVICES',
      };
    }

    return {
      category: 'PROFESSIONAL APPLICATION',
      title: 'New professional application',
      body: label
        ? `A new application was received for “${label}”.`
        : 'A new professional application was received.',
      action: 'OPEN ADMIN SERVICES',
    };
  }

  if (
    item.event_type === 'content_approved' ||
    item.event_type === 'content_rejected' ||
    item.event_type === 'content_returned_for_review'
  ) {
    const note = data.moderation_note?.trim();
    const isApproved = item.event_type === 'content_approved';
    const isRejected = item.event_type === 'content_rejected';

    if (language === 'bg') {
      const title = isApproved
        ? 'Материалът ти е одобрен'
        : isRejected
          ? 'Материалът ти не е одобрен'
          : 'Материалът ти е върнат за корекция';
      let body = isApproved
        ? `USG Admin одобри „${label || 'материала'}“.`
        : isRejected
          ? `USG Admin отхвърли „${label || 'материала'}“.`
          : `USG Admin върна „${label || 'материала'}“ за преглед и корекция.`;

      if (note) {
        body += `\nСъобщение от администратор: ${note}`;
      }

      return {
        category: 'МОИТЕ МАТЕРИАЛИ',
        title,
        body,
        action: null,
      };
    }

    if (language === 'it') {
      const title = isApproved
        ? 'Il tuo materiale è stato approvato'
        : isRejected
          ? 'Il tuo materiale non è stato approvato'
          : 'Il tuo materiale richiede modifiche';
      let body = isApproved
        ? `USG Admin ha approvato “${label || 'il materiale'}”.`
        : isRejected
          ? `USG Admin ha rifiutato “${label || 'il materiale'}”.`
          : `USG Admin ha restituito “${label || 'il materiale'}” per revisione e correzione.`;

      if (note) {
        body += `\nMessaggio dell’amministratore: ${note}`;
      }

      return {
        category: 'I MIEI CONTENUTI',
        title,
        body,
        action: null,
      };
    }

    const title = isApproved
      ? 'Your material was approved'
      : isRejected
        ? 'Your material was not approved'
        : 'Your material needs changes';
    let body = isApproved
      ? `USG Admin approved “${label || 'your material'}”.`
      : isRejected
        ? `USG Admin rejected “${label || 'your material'}”.`
        : `USG Admin returned “${label || 'your material'}” for review and correction.`;

    if (note) {
      body += `\nAdmin message: ${note}`;
    }

    return {
      category: 'MY MATERIALS',
      title,
      body,
      action: null,
    };
  }

  if (
    item.event_type === 'professional_application_approved' ||
    item.event_type === 'professional_application_rejected' ||
    item.event_type === 'professional_application_needs_changes'
  ) {
    const note = data.admin_note?.trim();
    const isApproved = item.event_type === 'professional_application_approved';
    const isRejected = item.event_type === 'professional_application_rejected';

    if (language === 'bg') {
      const title = isApproved
        ? 'Професионалният ти профил е одобрен'
        : isRejected
          ? 'Професионалната ти заявка не е одобрена'
          : 'Професионалната ти заявка изисква промени';
      let body = isApproved
        ? `USG Admin одобри „${label || 'професионалния профил'}“.`
        : isRejected
          ? `USG Admin отхвърли заявката за „${label || 'професионалния профил'}“.`
          : `USG Admin върна заявката за „${label || 'професионалния профил'}“ за корекция.`;

      if (note) {
        body += `\nСъобщение от администратор: ${note}`;
      }

      return {
        category: 'ПРОФЕСИОНАЛЕН ПРОФИЛ',
        title,
        body,
        action: null,
      };
    }

    if (language === 'it') {
      const title = isApproved
        ? 'Il tuo profilo professionale è stato approvato'
        : isRejected
          ? 'La tua candidatura professionale non è stata approvata'
          : 'La tua candidatura professionale richiede modifiche';
      let body = isApproved
        ? `USG Admin ha approvato “${label || 'il profilo professionale'}”.`
        : isRejected
          ? `USG Admin ha rifiutato la candidatura per “${label || 'il profilo professionale'}”.`
          : `USG Admin ha restituito la candidatura per “${label || 'il profilo professionale'}” per correzioni.`;

      if (note) {
        body += `\nMessaggio dell’amministratore: ${note}`;
      }

      return {
        category: 'PROFILO PROFESSIONALE',
        title,
        body,
        action: null,
      };
    }

    const title = isApproved
      ? 'Your professional profile was approved'
      : isRejected
        ? 'Your professional application was not approved'
        : 'Your professional application needs changes';
    let body = isApproved
      ? `USG Admin approved “${label || 'your professional profile'}”.`
      : isRejected
        ? `USG Admin rejected the application for “${label || 'your professional profile'}”.`
        : `USG Admin returned the application for “${label || 'your professional profile'}” for changes.`;

    if (note) {
      body += `\nAdmin message: ${note}`;
    }

    return {
      category: 'PROFESSIONAL PROFILE',
      title,
      body,
      action: null,
    };
  }

  return {
    category: null,
    title: item.title,
    body: item.body,
    action: null,
  };
}

export default function NotificationsScreen({ navigation }) {
  const backToTopRef = useBackToTopRef(null);
  const [backToTopVisible, setBackToTopVisible] = useBackToTopState(false);
  const { language: backToTopLanguage } = useLanguage();
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
      return true;
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
      return true;
    } catch {
      setError(t('settings.notificationsMarkReadFailed'));
      return false;
    }
  }

  async function openNotificationTarget(item) {
    const marked = await openItem(item);

    if (!marked) {
      return;
    }

    if (
      item.event_type === 'content_pending_review' &&
      item.entity_id &&
      item.data?.section_key
    ) {
      navigation.navigate('AdminContentDetails', {
        itemId: item.entity_id,
        sectionKey: item.data.section_key,
      });
      return;
    }

    if (item.event_type === 'professional_application_pending') {
      navigation.navigate('AdminServices');
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
        ref={backToTopRef}
        onScroll={(event) => {
          const visible = event.nativeEvent.contentOffset.y > 220;
          setBackToTopVisible((current) => current === visible ? current : visible);
        }}
        scrollEventThrottle={32}
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
          items.map((item) => {
            const presentation = getNotificationPresentation(item, language);
            const hasAction =
              item.target_exists !== false &&
              (item.event_type === 'content_pending_review' ||
                item.event_type === 'professional_application_pending');

            return (
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
                    {presentation.category ||
                      t(`settings.notificationCategory_${item.category}`)}
                  </Text>
                  {!item.read_at ? <View style={styles.unreadDot} /> : null}
                </View>

                <Text style={styles.notificationTitle}>
                  {presentation.title}
                </Text>
                <Text style={styles.notificationBody}>
                  {presentation.body}
                </Text>

                {hasAction ? (
                  <Pressable
                    onPress={() => openNotificationTarget(item)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      pressed && styles.actionButtonPressed,
                    ]}
                  >
                    <Text style={styles.actionButtonText}>
                      {presentation.action}
                    </Text>
                  </Pressable>
                ) : null}

                <Text style={styles.date}>
                  {formatDate(item.created_at, language)}
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
      <USGBackToTop
        visible={backToTopVisible}
        language={backToTopLanguage}
        bottomOffset={68}
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
      minWidth: 92,
      minHeight: 62,
      borderRadius: 31,
      borderWidth: 1,
      borderColor: colors.goldSoft,
      backgroundColor: colors.activeSurface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    unreadValue: {
      color: colors.gold,
      fontSize: 20,
      lineHeight: 22,
      fontWeight: '900',
    },
    unreadLabel: {
      color: colors.textSoft,
      fontSize: 8,
      lineHeight: 11,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 2,
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
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.3,
      textAlign: 'center',
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
    actionButton: {
      minHeight: 40,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
      marginTop: 14,
    },
    actionButtonPressed: {
      opacity: 0.72,
    },
    actionButtonText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.4,
      textAlign: 'center',
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
