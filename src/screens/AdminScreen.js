import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { adminCopy } from '../admin/adminCopy';
import {
  getAdminPendingPlaceMedia,
  getAdminPendingPlaces,
  getAdminUsers,
  getMyRole,
} from '../admin/adminService';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { getAdminContentItems } from '../governance/contentGovernanceService';
import { useTheme } from '../theme/ThemeContext';
import AdminContentGovernance from '../components/AdminContentGovernance';
import AdminDogModeration from '../components/AdminDogModeration';
import AdminDogsManagement from '../components/AdminDogsManagement';
import AdminPlaceMediaModeration from '../components/AdminPlaceMediaModeration';
import AdminPlacesModeration from '../components/AdminPlacesModeration';
import AdminServiceVisibility from '../components/AdminServiceVisibility';
import USGProgressBar from '../components/USGProgressBar';

const sectionCopy = {
  bg: {
    controlCenter: 'КОНТРОЛЕН ЦЕНТЪР',
    attention: 'ИЗИСКВА ВНИМАНИЕ',
    noAttention: 'Няма чакащи административни задачи.',
    tasks: 'чакащи задачи',
    users: 'ПОТРЕБИТЕЛИ',
    registered: 'Регистрирани',
    recent: 'Нови за 7 дни',
    manageUsers: 'ПОКАЖИ ПОТРЕБИТЕЛИТЕ',
    hideUsers: 'СКРИЙ ПОТРЕБИТЕЛИТЕ',
    mainSections: 'ОСНОВНИ СЕКЦИИ',
    pendingPlaces: 'Чакащи места',
    pendingPhotos: 'Чакащи снимки',
    pendingContent: 'Чакащи материали',
    noQueue: 'Няма активна модерация',
    ready: 'ГОТОВО',
    open: 'ОТВОРИ',
    close: 'ЗАТВОРИ',
    modules: {
      home: ['Начало', 'Общ преглед и системно състояние'],
      myCorso: ['Моето Корсо', 'Профили на кучета и бъдеща медия'],
      places: ['Корсо места', 'Места, снимки и модерация'],
      knowledge: ['Знание', 'Статии, текстове и образователни материали'],
      community: ['Общност', 'Публикации, коментари и сигнали'],
      services: ['Услуги', 'Професионалисти и услуги'],
      events: ['Събития', 'Събития и свързана медия'],
      match: ['Корсо съвпадение', 'Профили, заявки и свързано съдържание'],
      about: ['За USG', 'Основна информация и представяне'],
    },
  },
  en: {
    controlCenter: 'CONTROL CENTER',
    attention: 'NEEDS ATTENTION',
    noAttention: 'There are no pending administrative tasks.',
    tasks: 'pending tasks',
    users: 'USERS',
    registered: 'Registered',
    recent: 'New in 7 days',
    manageUsers: 'SHOW USERS',
    hideUsers: 'HIDE USERS',
    mainSections: 'MAIN SECTIONS',
    pendingPlaces: 'Pending places',
    pendingPhotos: 'Pending photos',
    pendingContent: 'Pending content',
    noQueue: 'No active moderation',
    ready: 'READY',
    open: 'OPEN',
    close: 'CLOSE',
    modules: {
      home: ['Home', 'Overview and system status'],
      myCorso: ['My Corso', 'Dog profiles and future media'],
      places: ['Corso Places', 'Places, photos and moderation'],
      knowledge: ['Knowledge', 'Articles, text and educational content'],
      community: ['Community', 'Posts, comments and reports'],
      services: ['Services', 'Professionals and services'],
      events: ['Events', 'Events and related media'],
      match: ['Corso Match', 'Future requests and content'],
      about: ['About USG', 'Core information and presentation'],
    },
  },
  it: {
    controlCenter: 'CENTRO DI CONTROLLO',
    attention: 'RICHIEDE ATTENZIONE',
    noAttention: 'Non ci sono attività amministrative in attesa.',
    tasks: 'attività in attesa',
    users: 'UTENTI',
    registered: 'Registrati',
    recent: 'Nuovi in 7 giorni',
    manageUsers: 'MOSTRA UTENTI',
    hideUsers: 'NASCONDI UTENTI',
    mainSections: 'SEZIONI PRINCIPALI',
    pendingPlaces: 'Luoghi in attesa',
    pendingPhotos: 'Foto in attesa',
    pendingContent: 'Contenuti in attesa',
    noQueue: 'Nessuna moderazione attiva',
    ready: 'PRONTO',
    open: 'APRI',
    close: 'CHIUDI',
    modules: {
      home: ['Home', 'Panoramica e stato del sistema'],
      myCorso: ['Il mio Corso', 'Profili dei cani e media futuri'],
      places: ['Luoghi Corso', 'Luoghi, foto e moderazione'],
      knowledge: ['Conoscenza', 'Articoli, testi e contenuti educativi'],
      community: ['Community', 'Post, commenti e segnalazioni'],
      services: ['Servizi', 'Professionisti e servizi'],
      events: ['Eventi', 'Eventi e media correlati'],
      match: ['Corso Match', 'Richieste e contenuti futuri'],
      about: ['Informazioni USG', 'Informazioni principali e presentazione'],
    },
  },
};

const MODULES = [
  'home',
  'myCorso',
  'places',
  'knowledge',
  'community',
  'services',
  'events',
  'match',
  'about',
];

export default function AdminScreen() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const labels = adminCopy[language] ?? adminCopy.en;
  const copy = sectionCopy[language] ?? sectionCopy.en;

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [pendingPlaces, setPendingPlaces] = useState([]);
  const [pendingMedia, setPendingMedia] = useState([]);
  const [governanceItems, setGovernanceItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [openModule, setOpenModule] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    const [usersResult, placesResult, mediaResult, governanceResult] =
      await Promise.all([
        getAdminUsers(),
        getAdminPendingPlaces(),
        getAdminPendingPlaceMedia(),
        getAdminContentItems(),
      ]);

    if (
      usersResult.error ||
      placesResult.error ||
      mediaResult.error ||
      governanceResult.error
    ) {
      setError(labels.loadError);
    }

    setUsers(usersResult.data ?? []);
    setPendingPlaces(placesResult.data ?? []);
    setPendingMedia(mediaResult.data ?? []);
    setGovernanceItems(governanceResult.data ?? []);
    setLoading(false);
  }, [labels.loadError]);

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      const { data, error: roleError } = await getMyRole(user?.id);

      if (!active) {
        return;
      }

      const allowed = !roleError && data?.role === 'admin';
      setIsAdmin(allowed);
      setChecking(false);

      if (allowed) {
        loadDashboard();
      }
    }

    checkAccess();

    return () => {
      active = false;
    };
  }, [loadDashboard, user?.id]);

  const recentUsers = useMemo(() => {
    const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return users.filter((item) => {
      const time = new Date(item.created_at).getTime();
      return Number.isFinite(time) && time >= threshold;
    }).length;
  }, [users]);

  const governancePendingCount = governanceItems.filter(
    (item) => item.status === 'pending'
  ).length;

  const attentionCount =
    pendingPlaces.length + pendingMedia.length + governancePendingCount;

  const moduleSectionKeys = {
    home: 'home',
    myCorso: 'my_corso',
    places: 'places',
    knowledge: 'knowledge',
    community: 'community',
    services: 'services',
    events: 'events',
    match: 'corso_match',
    about: 'about',
  };

  function getModulePendingCount(key) {
    const sectionKey = moduleSectionKeys[key];
    const governanceCount = governanceItems.filter(
      (item) =>
        item.section_key === sectionKey &&
        item.status === 'pending'
    ).length;

    return key === 'places'
      ? governanceCount + pendingPlaces.length + pendingMedia.length
      : governanceCount;
  }

  function toggleModule(key) {
    setOpenModule((current) => (current === key ? null : key));
  }

  async function refreshAll() {
    await loadDashboard();
    setRefreshToken((value) => value + 1);
  }

  if (checking) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <USGProgressBar label={labels.accessChecking} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={styles.denied}>{labels.accessDenied}</Text>
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
          <Text style={styles.controlCenter}>{copy.controlCenter}</Text>
          <Text style={styles.subtitle}>{labels.subtitle}</Text>
        </View>

        <View style={styles.attentionCard}>
          <View style={styles.attentionHeader}>
            <View style={styles.attentionText}>
              <Text style={styles.sectionEyebrow}>{copy.attention}</Text>
              <Text style={styles.attentionValue}>{attentionCount}</Text>
              <Text style={styles.attentionLabel}>{copy.tasks}</Text>
            </View>

            <Pressable style={styles.refreshButton} onPress={refreshAll}>
              <Text style={styles.refreshText}>{labels.refresh}</Text>
            </Pressable>
          </View>

          {attentionCount > 0 ? (
            <View style={styles.attentionRows}>
              <Pressable
                style={styles.attentionRow}
                onPress={() => setOpenModule('places')}
              >
                <Text style={styles.attentionRowLabel}>
                  {copy.pendingPlaces}
                </Text>
                <Text style={styles.attentionBadge}>
                  {pendingPlaces.length}
                </Text>
              </Pressable>

              <Pressable
                style={styles.attentionRow}
                onPress={() => setOpenModule('places')}
              >
                <Text style={styles.attentionRowLabel}>
                  {copy.pendingPhotos}
                </Text>
                <Text style={styles.attentionBadge}>
                  {pendingMedia.length}
                </Text>
              </Pressable>

              <View style={styles.attentionRow}>
                <Text style={styles.attentionRowLabel}>
                  {copy.pendingContent}
                </Text>
                <Text style={styles.attentionBadge}>
                  {governancePendingCount}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.allClear}>{copy.noAttention}</Text>
          )}
        </View>

        <View style={styles.systemCard}>
          <View style={styles.systemHeader}>
            <Text style={styles.sectionEyebrow}>{copy.users}</Text>
            <Text style={styles.systemTotal}>{users.length}</Text>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{users.length}</Text>
              <Text style={styles.metricLabel}>{copy.registered}</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{recentUsers}</Text>
              <Text style={styles.metricLabel}>{copy.recent}</Text>
            </View>
          </View>

          <Pressable
            style={styles.outlineButton}
            onPress={() => setShowUsers((current) => !current)}
          >
            <Text style={styles.outlineButtonText}>
              {showUsers ? copy.hideUsers : copy.manageUsers}
            </Text>
          </Pressable>

          {showUsers ? (
            <View style={styles.usersList}>
              {loading ? <USGProgressBar label={labels.usersTitle} /> : null}
              {error ? <Text style={styles.error}>{error}</Text> : null}

              {users.map((item) => {
                const name =
                  item.display_name || item.username || item.email;
                const location = [item.city, item.country]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <View key={item.user_id} style={styles.userCard}>
                    <View style={styles.userHeader}>
                      <View style={styles.userText}>
                        <Text style={styles.userName}>{name}</Text>
                        <Text style={styles.userEmail}>{item.email}</Text>
                      </View>
                      <Text style={styles.roleBadge}>
                        {item.role === 'admin' ? labels.admin : labels.user}
                      </Text>
                    </View>

                    <Text style={styles.metaLabel}>{labels.memberSince}</Text>
                    <Text style={styles.metaValue}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>

                    <Text style={styles.metaLabel}>{labels.location}</Text>
                    <Text style={styles.metaValue}>
                      {location || labels.profileMissing}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>{copy.mainSections}</Text>

        <View style={styles.moduleList}>
          {MODULES.map((key, index) => {
            const [name, description] = copy.modules[key];
            const isOpen = openModule === key;
            const pending = getModulePendingCount(key);

            return (
              <View key={key} style={styles.moduleCard}>
                <Pressable
                  style={styles.moduleHeader}
                  onPress={() => toggleModule(key)}
                >
                  <View style={styles.moduleNumber}>
                    <Text style={styles.moduleNumberText}>
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                  </View>

                  <View style={styles.moduleText}>
                    <Text style={styles.moduleTitle}>{name}</Text>
                    <Text style={styles.moduleDescription}>{description}</Text>
                  </View>

                  <View style={styles.moduleStatus}>
                    {pending > 0 ? (
                      <Text style={styles.modulePending}>{pending}</Text>
                    ) : (
                      <Text style={styles.moduleReady}>{copy.ready}</Text>
                    )}
                    <Text style={styles.moduleAction}>
                      {isOpen ? copy.close : copy.open}
                    </Text>
                  </View>
                </Pressable>

                {isOpen ? (
                  <View style={styles.moduleBody}>
                    {key === 'places' ? (
                      <>
                        <View style={styles.queueSummary}>
                          <View style={styles.queueMetric}>
                            <Text style={styles.queueValue}>
                              {pendingPlaces.length}
                            </Text>
                            <Text style={styles.queueLabel}>
                              {copy.pendingPlaces}
                            </Text>
                          </View>
                          <View style={styles.queueMetric}>
                            <Text style={styles.queueValue}>
                              {pendingMedia.length}
                            </Text>
                            <Text style={styles.queueLabel}>
                              {copy.pendingPhotos}
                            </Text>
                          </View>
                        </View>

                        <AdminPlacesModeration
                          key={`places-${refreshToken}`}
                        />
                        <AdminPlaceMediaModeration
                          key={`media-${refreshToken}`}
                          onChanged={loadDashboard}
                        />
                      </>
                    ) : key === 'services' ? (
                      <AdminServiceVisibility
                        key={`services-${refreshToken}`}
                        refreshToken={refreshToken}
                      />
                    ) : key === 'myCorso' ? (
                      <>
                        <AdminDogModeration onChanged={loadDashboard} />
                        <AdminDogsManagement />
                      </>
                    ) : (
                      <AdminContentGovernance
                        sectionKey={moduleSectionKeys[key]}
                        onChanged={loadDashboard}
                      />
                    )}
                  </View>
                ) : null}
              </View>
            );
          })}
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
      paddingBottom: 40,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.lg,
    },
    hero: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 24,
      alignItems: 'center',
      marginBottom: 14,
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 3,
      marginBottom: 10,
    },
    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '800',
      textAlign: 'center',
    },
    controlCenter: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1.4,
      marginTop: 8,
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 8,
    },
    attentionCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surfaceSoft,
      padding: 18,
      marginBottom: 14,
    },
    attentionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    attentionText: {
      flex: 1,
    },
    sectionEyebrow: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1,
    },
    attentionValue: {
      color: colors.text,
      fontSize: 34,
      fontWeight: '900',
      marginTop: 6,
    },
    attentionLabel: {
      color: colors.textSoft,
      fontSize: 11,
      marginTop: 1,
    },
    refreshButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    refreshText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    attentionRows: {
      marginTop: 14,
      gap: 8,
    },
    attentionRow: {
      minHeight: 42,
      borderRadius: 14,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    attentionRowLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    attentionBadge: {
      minWidth: 28,
      textAlign: 'center',
      color: '#070708',
      backgroundColor: colors.gold,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 11,
      fontWeight: '900',
      overflow: 'hidden',
    },
    allClear: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 14,
    },
    systemCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 18,
      marginBottom: 20,
    },
    systemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    systemTotal: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '900',
    },
    metricRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 14,
    },
    metricBox: {
      flex: 1,
      borderRadius: 14,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    metricValue: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '900',
    },
    metricLabel: {
      color: colors.textSoft,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 3,
    },
    outlineButton: {
      marginTop: 12,
      minHeight: 42,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    outlineButtonText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.6,
    },
    usersList: {
      marginTop: 14,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '900',
      marginBottom: 10,
    },
    moduleList: {
      gap: 10,
    },
    moduleCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      overflow: 'hidden',
    },
    moduleHeader: {
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    moduleNumber: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moduleNumberText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
    },
    moduleText: {
      flex: 1,
    },
    moduleTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
    },
    moduleDescription: {
      color: colors.textSoft,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 3,
    },
    moduleStatus: {
      alignItems: 'flex-end',
      gap: 5,
    },
    modulePending: {
      minWidth: 28,
      textAlign: 'center',
      color: '#070708',
      backgroundColor: colors.gold,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 11,
      fontWeight: '900',
      overflow: 'hidden',
    },
    moduleReady: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: '900',
    },
    moduleAction: {
      color: colors.gold,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    moduleBody: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: 12,
    },
    queueSummary: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 10,
    },
    queueMetric: {
      flex: 1,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      padding: 12,
    },
    queueValue: {
      color: colors.gold,
      fontSize: 22,
      fontWeight: '900',
    },
    queueLabel: {
      color: colors.textSoft,
      fontSize: 10,
      marginTop: 2,
    },
    noQueueBox: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      padding: 14,
    },
    noQueueText: {
      color: colors.textSoft,
      fontSize: 11,
      textAlign: 'center',
    },
    userCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      padding: 14,
      marginBottom: 8,
    },
    userHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 10,
    },
    userText: {
      flex: 1,
    },
    userName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
    },
    userEmail: {
      color: colors.textSoft,
      fontSize: 10,
      marginTop: 3,
    },
    roleBadge: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    metaLabel: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '800',
      textTransform: 'uppercase',
      marginTop: 7,
    },
    metaValue: {
      color: colors.textSoft,
      fontSize: 11,
      marginTop: 2,
    },
    denied: {
      color: colors.text,
      fontSize: 15,
      textAlign: 'center',
    },
    error: {
      color: colors.danger || '#d66',
      fontSize: 11,
      marginBottom: 10,
    },
  });
}
