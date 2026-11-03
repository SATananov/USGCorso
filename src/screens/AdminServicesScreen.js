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

import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import {
  getAdminProfessionalApplications,
  reviewProfessionalApplication,
} from '../services/professionalAccessService';
import AdminServiceVisibility from '../components/AdminServiceVisibility';
import USGProgressBar from '../components/USGProgressBar';

const copy = {
  bg: {
    title: 'АДМИН УСЛУГИ',
    subtitle: 'Професионалисти, организации, заявки и публичност на профилите.',
    pending: 'ЧАКАЩИ ЗАЯВКИ',
    noPending: 'Няма чакащи професионални заявки.',
    approve: 'ОДОБРИ',
    reject: 'ОТКАЖИ',
    needsChanges: 'ИЗИСКАЙ ПРОМЕНИ',
    professional: 'ПРОФЕСИОНАЛИСТ',
    organization: 'ОРГАНИЗАЦИЯ',
    refresh: 'ОБНОВИ',
    loadError: 'Заявките не можаха да бъдат заредени.',
    actionError: 'Промяната не можа да бъде запазена.',
    profiles: 'ПРОФИЛИ И ПУБЛИЧНОСТ',
  },
  en: {
    title: 'ADMIN SERVICES',
    subtitle: 'Professionals, organizations, applications and profile visibility.',
    pending: 'PENDING APPLICATIONS',
    noPending: 'There are no pending professional applications.',
    approve: 'APPROVE',
    reject: 'REJECT',
    needsChanges: 'REQUEST CHANGES',
    professional: 'PROFESSIONAL',
    organization: 'ORGANIZATION',
    refresh: 'REFRESH',
    loadError: 'Applications could not be loaded.',
    actionError: 'The change could not be saved.',
    profiles: 'PROFILES AND VISIBILITY',
  },
  it: {
    title: 'SERVIZI ADMIN',
    subtitle: 'Professionisti, organizzazioni, richieste e visibilità dei profili.',
    pending: 'RICHIESTE IN ATTESA',
    noPending: 'Non ci sono richieste professionali in attesa.',
    approve: 'APPROVA',
    reject: 'RIFIUTA',
    needsChanges: 'RICHIEDI MODIFICHE',
    professional: 'PROFESSIONISTA',
    organization: 'ORGANIZZAZIONE',
    refresh: 'AGGIORNA',
    loadError: 'Impossibile caricare le richieste.',
    actionError: 'Impossibile salvare la modifica.',
    profiles: 'PROFILI E VISIBILITÀ',
  },
};

export default function AdminServicesScreen() {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const labels = copy[language] ?? copy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [errorText, setErrorText] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorText('');

    const { data, error } = await getAdminProfessionalApplications('pending');

    if (error) {
      setApplications([]);
      setErrorText(labels.loadError);
    } else {
      setApplications(Array.isArray(data) ? data : []);
    }

    setLoading(false);
  }, [labels.loadError]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function review(applicationId, decision) {
    if (busyId) {
      return;
    }

    setBusyId(applicationId);
    setErrorText('');

    const { error } = await reviewProfessionalApplication({
      applicationId,
      decision,
      note: '',
    });

    if (error) {
      setErrorText(labels.actionError);
      setBusyId(null);
      return;
    }

    await load();
    setRefreshToken((value) => value + 1);
    setBusyId(null);
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
            <Text style={styles.sectionTitle}>{labels.pending}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{applications.length}</Text>
            </View>
          </View>

          {loading ? (
            <USGProgressBar label={labels.pending} />
          ) : applications.length === 0 ? (
            <Text style={styles.empty}>{labels.noPending}</Text>
          ) : (
            applications.map((item) => (
              <View key={item.id} style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <View style={styles.applicationText}>
                    <Text style={styles.applicationName}>
                      {item.display_name ||
                        item.full_name ||
                        item.email ||
                        item.user_id}
                    </Text>
                    <Text style={styles.applicationType}>
                      {item.requested_type === 'organization'
                        ? labels.organization
                        : labels.professional}
                    </Text>
                  </View>
                </View>

                <View style={styles.applicationDetails}>
                  <Text style={styles.detailText}>{item.profile_name || '-'}</Text>
                  <Text style={styles.detailText}>{item.contact_phone || '-'}</Text>
                  <Text style={styles.detailText}>{item.contact_email || item.email || '-'}</Text>
                  <Text style={styles.detailText}>
                    {[item.city, item.country].filter(Boolean).join(', ') || '-'}
                  </Text>
                </View>

                {item.message ? (
                  <Text style={styles.message}>{item.message}</Text>
                ) : null}

                <View style={styles.actions}>
                  <Pressable
                    disabled={busyId === item.id}
                    style={styles.approveButton}
                    onPress={() => review(item.id, 'approved')}
                  >
                    <Text style={styles.approveText}>{labels.approve}</Text>
                  </Pressable>

                  <Pressable
                    disabled={busyId === item.id}
                    style={styles.outlineButton}
                    onPress={() => review(item.id, 'needs_changes')}
                  >
                    <Text style={styles.outlineText}>{labels.needsChanges}</Text>
                  </Pressable>

                  <Pressable
                    disabled={busyId === item.id}
                    style={styles.outlineButton}
                    onPress={() => review(item.id, 'rejected')}
                  >
                    <Text style={styles.outlineText}>{labels.reject}</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}

          {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

          <Pressable style={styles.refreshButton} onPress={load}>
            <Text style={styles.refreshText}>{labels.refresh}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.profiles}</Text>
          <AdminServiceVisibility refreshToken={refreshToken} />
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
      fontSize: 27,
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
    countBadge: {
      minWidth: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    countText: {
      color: colors.gold,
      fontSize: 13,
      fontWeight: '900',
    },
    empty: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    applicationCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: colors.background,
      padding: 14,
      gap: 10,
    },
    applicationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    applicationText: {
      flex: 1,
    },
    applicationName: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
    },
    applicationType: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.6,
      marginTop: 4,
    },
    applicationDetails: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
      padding: 10,
      gap: 5,
    },
    detailText: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 17,
    },
    message: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
    },
    actions: {
      gap: 8,
    },
    approveButton: {
      minHeight: 42,
      borderRadius: 12,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    approveText: {
      color: colors.background,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.6,
    },
    outlineButton: {
      minHeight: 40,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.goldDark || colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    outlineText: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    error: {
      color: colors.error || '#d76c6c',
      fontSize: 12,
      textAlign: 'center',
    },
    refreshButton: {
      minHeight: 42,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
    },
    refreshText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.6,
    },
  });
}
