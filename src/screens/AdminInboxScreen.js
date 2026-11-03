import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import {
  getAdminInboxData,
} from '../admin/adminInboxService';
import USGProgressBar from '../components/USGProgressBar';

const copy = {
  bg: {
    title: 'ADMIN INBOX',
    subtitle: 'Всички нови и важни неща на едно място.',
    action: 'ИЗИСКВА ДЕЙСТВИЕ',
    info: 'ИНФОРМАЦИЯ',
    places: 'Чакащи места',
    media: 'Чакащи снимки',
    content: 'Чакащи материали',
    applications: 'Професионални заявки',
    users: 'Регистрирани потребители',
    recentUsers: 'Нови потребители за 7 дни',
    profiles: 'Одобрени професионални профили',
    empty: 'Няма чакащи административни задачи.',
    refresh: 'ОБНОВИ',
    loadError: 'Admin inbox не можа да бъде зареден.',
    openAdmin: 'ОТВОРИ КОНТРОЛЕН ЦЕНТЪР',
  },
  en: {
    title: 'ADMIN INBOX',
    subtitle: 'All new and important items in one place.',
    action: 'NEEDS ACTION',
    info: 'INFORMATION',
    places: 'Pending places',
    media: 'Pending photos',
    content: 'Pending content',
    applications: 'Professional applications',
    users: 'Registered users',
    recentUsers: 'New users in 7 days',
    profiles: 'Approved professional profiles',
    empty: 'There are no pending administrative tasks.',
    refresh: 'REFRESH',
    loadError: 'Admin inbox could not be loaded.',
    openAdmin: 'OPEN CONTROL CENTER',
  },
  it: {
    title: 'ADMIN INBOX',
    subtitle: 'Tutte le novità e gli elementi importanti in un unico posto.',
    action: 'RICHIEDE AZIONE',
    info: 'INFORMAZIONI',
    places: 'Luoghi in attesa',
    media: 'Foto in attesa',
    content: 'Contenuti in attesa',
    applications: 'Richieste professionali',
    users: 'Utenti registrati',
    recentUsers: 'Nuovi utenti negli ultimi 7 giorni',
    profiles: 'Profili professionali approvati',
    empty: 'Non ci sono attività amministrative in attesa.',
    refresh: 'AGGIORNA',
    loadError: 'Impossibile caricare Admin Inbox.',
    openAdmin: 'APRI CENTRO DI CONTROLLO',
  },
};

function MetricCard({ label, value, styles, highlight = false }) {
  return (
    <View style={[styles.metricCard, highlight && styles.metricCardHighlight]}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function AdminInboxScreen({ navigation }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const labels = copy[language] ?? copy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErrorText('');

    const result = await getAdminInboxData(user?.id);

    if (result.error) {
      setErrorText(labels.loadError);
    }

    setData(result.data ?? null);
    setLoading(false);
  }, [labels.loadError, user?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const pendingTotal =
    (data?.pendingPlaces ?? 0) +
    (data?.pendingMedia ?? 0) +
    (data?.pendingContent ?? 0) +
    (data?.pendingApplications ?? 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <USGProgressBar label={labels.title} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.kicker}>USG CORSO</Text>
          <Text style={styles.title}>{labels.title}</Text>
          <Text style={styles.subtitle}>{labels.subtitle}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{labels.action}</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>{pendingTotal}</Text>
            </View>
          </View>

          {pendingTotal === 0 ? (
            <Text style={styles.empty}>{labels.empty}</Text>
          ) : null}

          <View style={styles.grid}>
            <MetricCard
              label={labels.places}
              value={data?.pendingPlaces ?? 0}
              styles={styles}
              highlight={(data?.pendingPlaces ?? 0) > 0}
            />
            <MetricCard
              label={labels.media}
              value={data?.pendingMedia ?? 0}
              styles={styles}
              highlight={(data?.pendingMedia ?? 0) > 0}
            />
            <MetricCard
              label={labels.content}
              value={data?.pendingContent ?? 0}
              styles={styles}
              highlight={(data?.pendingContent ?? 0) > 0}
            />
            <MetricCard
              label={labels.applications}
              value={data?.pendingApplications ?? 0}
              styles={styles}
              highlight={(data?.pendingApplications ?? 0) > 0}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.info}</Text>

          <View style={styles.grid}>
            <MetricCard
              label={labels.users}
              value={data?.registeredUsers ?? 0}
              styles={styles}
            />
            <MetricCard
              label={labels.recentUsers}
              value={data?.recentUsers ?? 0}
              styles={styles}
            />
            <MetricCard
              label={labels.profiles}
              value={data?.approvedProfiles ?? 0}
              styles={styles}
            />
          </View>
        </View>

        {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

        <Pressable style={styles.refreshButton} onPress={load}>
          <Text style={styles.refreshText}>{labels.refresh}</Text>
        </Pressable>

        <Pressable
          style={styles.adminButton}
          onPress={() => navigation.navigate('Admin')}
        >
          <Text style={styles.adminButtonText}>{labels.openAdmin}</Text>
        </Pressable>
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
    center: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
      gap: 16,
    },
    hero: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 22,
      backgroundColor: colors.surface,
      padding: 22,
      alignItems: 'center',
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 3,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '900',
      marginTop: 10,
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 20,
      textAlign: 'center',
      marginTop: 10,
    },
    section: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      backgroundColor: colors.surface,
      padding: 16,
      gap: 14,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    sectionTitle: {
      color: colors.gold,
      fontSize: 13,
      fontWeight: '900',
      letterSpacing: 0.8,
    },
    totalBadge: {
      minWidth: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.activeSurface,
      paddingHorizontal: 8,
    },
    totalBadgeText: {
      color: colors.gold,
      fontSize: 14,
      fontWeight: '900',
    },
    empty: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    metricCard: {
      width: '48%',
      minHeight: 104,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: colors.background,
      padding: 14,
      justifyContent: 'space-between',
    },
    metricCardHighlight: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    metricValue: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '900',
    },
    metricLabel: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '700',
    },
    error: {
      color: colors.error || '#d76c6c',
      fontSize: 12,
      textAlign: 'center',
    },
    refreshButton: {
      minHeight: 46,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
    },
    refreshText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    adminButton: {
      minHeight: 48,
      borderRadius: 14,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    adminButtonText: {
      color: colors.background,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.7,
      textAlign: 'center',
    },
  });
}
