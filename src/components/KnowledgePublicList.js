import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getPublicKnowledgeItems } from '../knowledge/knowledgePublicService';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../styles/usgTheme';

const copy = {
  en: {
    heading: 'Approved Knowledge',
    intro: 'Public educational materials approved for the USG Corso Knowledge library.',
    loading: 'Loading approved materials…',
    emptyTitle: 'No approved materials yet',
    emptyText: 'Approved Knowledge submissions will appear here.',
    errorTitle: 'Knowledge could not be loaded',
    errorText: 'Check the connection and try again.',
    retry: 'TRY AGAIN',
    untitled: 'Untitled material',
    updated: 'Updated',
  },
  bg: {
    heading: 'Одобрени материали',
    intro: 'Публични образователни материали, одобрени за библиотеката „Знание“ на USG Corso.',
    loading: 'Зареждане на одобрените материали…',
    emptyTitle: 'Все още няма одобрени материали',
    emptyText: 'Одобрените материали за „Знание“ ще се появят тук.',
    errorTitle: 'Материалите не могат да бъдат заредени',
    errorText: 'Провери връзката и опитай отново.',
    retry: 'ОПИТАЙ ОТНОВО',
    untitled: 'Материал без заглавие',
    updated: 'Обновено',
  },
  it: {
    heading: 'Contenuti approvati',
    intro: 'Materiali educativi pubblici approvati per la biblioteca Knowledge di USG Corso.',
    loading: 'Caricamento dei contenuti approvati…',
    emptyTitle: 'Nessun contenuto approvato',
    emptyText: 'I contenuti Knowledge approvati appariranno qui.',
    errorTitle: 'Impossibile caricare i contenuti',
    errorText: 'Controlla la connessione e riprova.',
    retry: 'RIPROVA',
    untitled: 'Contenuto senza titolo',
    updated: 'Aggiornato',
  },
};

function formatDate(value, language) {
  if (!value) {
    return '';
  }

  try {
    return new Intl.DateTimeFormat(
      language === 'bg' ? 'bg-BG' : language === 'it' ? 'it-IT' : 'en-GB',
      { year: 'numeric', month: 'short', day: 'numeric' }
    ).format(new Date(value));
  } catch {
    return '';
  }
}

export default function KnowledgePublicList() {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const labels = copy[language] ?? copy.en;
  const [items, setItems] = useState([]);
  const [state, setState] = useState('loading');

  const load = useCallback(async () => {
    setState('loading');

    const result = await getPublicKnowledgeItems();

    if (result.error) {
      setItems([]);
      setState('error');
      return;
    }

    setItems(Array.isArray(result.data) ? result.data : []);
    setState('ready');
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.root}>
      <View style={styles.headingWrap}>
        <Text style={styles.heading}>{labels.heading}</Text>
        <Text style={styles.intro}>{labels.intro}</Text>
      </View>

      {state === 'loading' && (
        <View style={styles.stateWrap}>
          <ActivityIndicator />
          <Text style={styles.stateText}>{labels.loading}</Text>
        </View>
      )}

      {state === 'error' && (
        <View style={styles.stateWrap}>
          <Text style={styles.stateTitle}>{labels.errorTitle}</Text>
          <Text style={styles.stateText}>{labels.errorText}</Text>
          <Pressable
            onPress={load}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
          >
            <Text style={styles.retryLabel}>{labels.retry}</Text>
          </Pressable>
        </View>
      )}

      {state === 'ready' && items.length === 0 && (
        <View style={styles.stateWrap}>
          <Text style={styles.stateTitle}>{labels.emptyTitle}</Text>
          <Text style={styles.stateText}>{labels.emptyText}</Text>
        </View>
      )}

      {state === 'ready' &&
        items.map((item) => {
          const updated = formatDate(item.updated_at, language);

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.metaRow}>
                <Text style={styles.type}>{item.content_type || 'article'}</Text>
                {updated ? (
                  <Text style={styles.date}>{labels.updated}: {updated}</Text>
                ) : null}
              </View>
              <Text style={styles.title}>{item.title || labels.untitled}</Text>
              {item.body ? (
                <Text style={styles.body} numberOfLines={5}>
                  {item.body}
                </Text>
              ) : null}
            </View>
          );
        })}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    root: {
      marginTop: spacing.lg,
      gap: spacing.md,
    },
    headingWrap: {
      gap: 6,
    },
    heading: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'left',
    },
    intro: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'left',
    },
    stateWrap: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      padding: spacing.md,
      alignItems: 'center',
      gap: 8,
    },
    stateTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
    },
    stateText: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: 4,
      borderWidth: 1,
      borderColor: colors.goldDark,
      borderRadius: radius.md,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.activeSurface,
    },
    retryButtonPressed: {
      opacity: 0.78,
    },
    retryLabel: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
    },
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      padding: spacing.md,
      gap: 8,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    type: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.1,
      textTransform: 'uppercase',
    },
    date: {
      color: colors.textMuted,
      fontSize: 10,
      flexShrink: 1,
      textAlign: 'right',
    },
    title: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '700',
    },
    body: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
    },
  });
}
