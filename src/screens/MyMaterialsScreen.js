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

import { useAuth } from '../auth/AuthContext';
import { getMyContentItems } from '../governance/contentGovernanceService';
import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected', 'archived'];
const SECTION_FILTERS = [
  'all',
  'knowledge',
  'community',
  'services',
  'events',
  'corso_match',
];

function formatDate(value, language) {
  if (!value) {
    return '';
  }

  const locale =
    language === 'bg'
      ? 'bg-BG'
      : language === 'it'
        ? 'it-IT'
        : 'en-GB';

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export default function MyMaterialsScreen({ navigation }) {
  const { session } = useAuth();
  const { language, t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (refresh = false) => {
      if (!session?.user?.id) {
        setItems([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const result = await getMyContentItems(null);

        if (result.error) {
          throw result.error;
        }

        setItems(result.data ?? []);
      } catch {
        setError(t('myMaterials.loadFailed'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session?.user?.id, t]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const counts = useMemo(() => {
    const next = {
      all: items.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      archived: 0,
    };

    items.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(next, item.status)) {
        next[item.status] += 1;
      }
    });

    return next;
  }, [items]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const statusMatches =
          statusFilter === 'all' || item.status === statusFilter;
        const sectionMatches =
          sectionFilter === 'all' || item.section_key === sectionFilter;

        return statusMatches && sectionMatches;
      }),
    [items, sectionFilter, statusFilter]
  );

  if (!session?.user?.id) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>{t('myMaterials.signInTitle')}</Text>
          <Text style={styles.emptyText}>{t('myMaterials.signInText')}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <View style={styles.hero}>
          <Text style={styles.kicker}>USG CORSO</Text>
          <Text style={styles.title}>{t('myMaterials.title')}</Text>
          <Text style={styles.subtitle}>{t('myMaterials.subtitle')}</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('AddMaterial')}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
        >
          <Text style={styles.addButtonText}>{t('addMaterial.openCreate')}</Text>
        </Pressable>

        <View style={styles.summaryRow}>
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <View key={status} style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{counts[status]}</Text>
              <Text style={styles.summaryLabel} numberOfLines={1}>
                {t(`myMaterials.status.${status}`)}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('myMaterials.filterStatus')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {STATUS_FILTERS.map((status) => {
            const active = statusFilter === status;

            return (
              <Pressable
                key={status}
                onPress={() => setStatusFilter(status)}
                style={[
                  styles.filterChip,
                  active && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {t(`myMaterials.status.${status}`)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>{t('myMaterials.filterSection')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {SECTION_FILTERS.map((section) => {
            const active = sectionFilter === section;

            return (
              <Pressable
                key={section}
                onPress={() => setSectionFilter(section)}
                style={[
                  styles.filterChip,
                  active && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {t(`myMaterials.sections.${section}`)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.loadingText}>{t('myMaterials.loading')}</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t('myMaterials.emptyTitle')}</Text>
            <Text style={styles.emptyText}>{t('myMaterials.emptyText')}</Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() =>
                navigation.navigate('MyMaterialDetails', {
                  item,
                })
              }
              style={({ pressed }) => [
                styles.itemCard,
                pressed && styles.itemCardPressed,
              ]}
            >
              <View style={styles.itemTopRow}>
                <Text style={styles.itemSection}>
                  {t(`myMaterials.sections.${item.section_key}`)}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'approved' && styles.statusApproved,
                    item.status === 'rejected' && styles.statusRejected,
                    item.status === 'archived' && styles.statusArchived,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {t(`myMaterials.status.${item.status}`)}
                  </Text>
                </View>
              </View>

              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title || t('myMaterials.untitled')}
              </Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  {t(`myMaterials.types.${item.content_type}`)}
                </Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>
                  {formatDate(item.updated_at || item.created_at, language)}
                </Text>
              </View>

              {item.moderation_note ? (
                <Text style={styles.notePreview} numberOfLines={2}>
                  {item.moderation_note}
                </Text>
              ) : null}

              <View style={styles.openRow}>
                <Text style={styles.openText}>{t('myMaterials.open')}</Text>
                <Text style={styles.openArrow}>›</Text>
              </View>
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
    hero: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 20,
      marginBottom: 12,
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
      fontSize: 25,
      fontWeight: '900',
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      marginTop: 6,
    },
    addButton: {
      minHeight: 48,
      borderRadius: 999,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    addButtonPressed: {
      opacity: 0.78,
    },
    addButtonText: {
      color: '#070708',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    summaryCard: {
      flex: 1,
      minHeight: 68,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
    },
    summaryValue: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '900',
    },
    summaryLabel: {
      color: colors.textSoft,
      fontSize: 8,
      fontWeight: '700',
      marginTop: 3,
      textAlign: 'center',
    },
    sectionTitle: {
      color: colors.textSoft,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 7,
    },
    filterRow: {
      gap: 8,
      paddingBottom: 14,
    },
    filterChip: {
      minHeight: 34,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 13,
    },
    filterChipActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    filterText: {
      color: colors.textSoft,
      fontSize: 10,
      fontWeight: '800',
    },
    filterTextActive: {
      color: colors.gold,
    },
    centerState: {
      minHeight: 180,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
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
      marginTop: 4,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 17,
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
    itemCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 16,
      marginBottom: 10,
    },
    itemCardPressed: {
      opacity: 0.78,
    },
    itemTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 8,
    },
    itemSection: {
      flex: 1,
      color: colors.goldSoft,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    statusBadge: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.goldSoft,
      backgroundColor: colors.activeSurface,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
    statusApproved: {
      borderColor: colors.gold,
    },
    statusRejected: {
      borderColor: colors.textMuted,
    },
    statusArchived: {
      opacity: 0.65,
    },
    statusText: {
      color: colors.text,
      fontSize: 8,
      fontWeight: '900',
    },
    itemTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '800',
      lineHeight: 22,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 8,
    },
    metaText: {
      color: colors.textMuted,
      fontSize: 10,
    },
    metaDot: {
      color: colors.goldSoft,
      fontSize: 10,
    },
    notePreview: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 10,
    },
    openRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 5,
      marginTop: 13,
    },
    openText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    openArrow: {
      color: colors.gold,
      fontSize: 20,
      lineHeight: 20,
    },
    error: {
      color: colors.danger || '#d66',
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 12,
    },
  });
}
