import { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

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
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function MyMaterialDetailsScreen({ route }) {
  const item = route.params?.item;
  const { language, t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!item) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>{t('myMaterials.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>
            {t(`myMaterials.sections.${item.section_key}`)}
          </Text>
          <Text style={styles.title}>
            {item.title || t('myMaterials.untitled')}
          </Text>

          <View style={styles.statusRow}>
            <Text style={styles.typeText}>
              {t(`myMaterials.types.${item.content_type}`)}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {t(`myMaterials.status.${item.status}`)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t('myMaterials.content')}</Text>
          <Text style={styles.body}>
            {item.body || t('myMaterials.noContent')}
          </Text>
        </View>

        {item.moderation_note ? (
          <View style={styles.noteCard}>
            <Text style={styles.noteLabel}>
              {t('myMaterials.moderationNote')}
            </Text>
            <Text style={styles.noteText}>{item.moderation_note}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.metaItem}>
            <Text style={styles.label}>{t('myMaterials.created')}</Text>
            <Text style={styles.metaValue}>
              {formatDate(item.created_at, language)}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.metaItem}>
            <Text style={styles.label}>{t('myMaterials.updated')}</Text>
            <Text style={styles.metaValue}>
              {formatDate(item.updated_at, language)}
            </Text>
          </View>

          {item.approved_at ? (
            <>
              <View style={styles.separator} />
              <View style={styles.metaItem}>
                <Text style={styles.label}>{t('myMaterials.approvedAt')}</Text>
                <Text style={styles.metaValue}>
                  {formatDate(item.approved_at, language)}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            {t('myMaterials.editComingNext')}
          </Text>
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
      fontWeight: '900',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 7,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '900',
      lineHeight: 30,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginTop: 14,
    },
    typeText: {
      flex: 1,
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: '700',
    },
    statusBadge: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.goldSoft,
      backgroundColor: colors.activeSurface,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    statusText: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: '900',
    },
    card: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 17,
      marginBottom: 10,
    },
    label: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    body: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 21,
      marginTop: 9,
    },
    noteCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.goldSoft,
      backgroundColor: colors.activeSurface,
      padding: 17,
      marginBottom: 10,
    },
    noteLabel: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    noteText: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 8,
    },
    metaItem: {
      paddingVertical: 3,
    },
    metaValue: {
      color: colors.text,
      fontSize: 12,
      marginTop: 5,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 13,
    },
    infoCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 15,
    },
    infoText: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 18,
      textAlign: 'center',
    },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
      textAlign: 'center',
    },
  });
}
