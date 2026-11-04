import { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import { useRef as useBackToTopRef, useState as useBackToTopState } from 'react';
import USGBackToTop from '../components/USGBackToTop';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

const copy = {
  en: {
    kicker: 'PUBLIC KNOWLEDGE',
    content: 'Content',
    updated: 'Updated',
    untitled: 'Untitled material',
    noContent: 'No text content is available for this material.',
    notFound: 'This Knowledge material could not be opened.',
  },
  bg: {
    kicker: 'ПУБЛИЧНО ЗНАНИЕ',
    content: 'Съдържание',
    updated: 'Обновено',
    untitled: 'Материал без заглавие',
    noContent: 'За този материал няма налично текстово съдържание.',
    notFound: 'Този материал от „Знание“ не може да бъде отворен.',
  },
  it: {
    kicker: 'CONOSCENZA PUBBLICA',
    content: 'Contenuto',
    updated: 'Aggiornato',
    untitled: 'Contenuto senza titolo',
    noContent: 'Non è disponibile contenuto testuale per questo materiale.',
    notFound: 'Questo contenuto Knowledge non può essere aperto.',
  },
};

function getContentTypeLabel(type, language) {
  const labels = {
    en: {
      article: 'ARTICLE',
      image: 'IMAGE',
    },
    bg: {
      article: 'СТАТИЯ',
      image: 'ИЗОБРАЖЕНИЕ',
    },
    it: {
      article: 'ARTICOLO',
      image: 'IMMAGINE',
    },
  };

  return labels[language]?.[type] ?? labels.en[type] ?? type ?? labels.en.article;
}

function formatDate(value, language) {
  if (!value) {
    return '';
  }

  try {
    return new Intl.DateTimeFormat(
      language === 'bg' ? 'bg-BG' : language === 'it' ? 'it-IT' : 'en-GB',
      { dateStyle: 'medium' }
    ).format(new Date(value));
  } catch {
    return '';
  }
}

export default function KnowledgePublicDetailsScreen({ route }) {
  const backToTopRef = useBackToTopRef(null);
  const [backToTopVisible, setBackToTopVisible] = useBackToTopState(false);
  const { language: backToTopLanguage } = useLanguage();
  const item = route.params?.item;
  const { language } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const labels = copy[language] ?? copy.en;

  if (!item) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centerState}>
          <Text style={styles.emptyText}>{labels.notFound}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const updated = formatDate(item.updated_at, language);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        ref={backToTopRef}
        onScroll={(event) => {
          const visible = event.nativeEvent.contentOffset.y > 220;
          setBackToTopVisible((current) => current === visible ? current : visible);
        }}
        scrollEventThrottle={32} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>{labels.kicker}</Text>
          <Text style={styles.title}>
            {item.title || labels.untitled}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.type}>
              {getContentTypeLabel(item.content_type, language)}
            </Text>
            {updated ? (
              <Text style={styles.date}>
                {labels.updated}: {updated}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{labels.content}</Text>
          <Text style={styles.body}>
            {item.body || labels.noContent}
          </Text>
        </View>

        <Text style={styles.footer}>USG — Unico Suo Genere™</Text>
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
      paddingBottom: 36,
    },
    hero: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 22,
      marginBottom: 14,
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.4,
      marginBottom: 10,
    },
    title: {
      color: colors.text,
      fontSize: 26,
      lineHeight: 32,
      fontWeight: '900',
    },
    metaRow: {
      marginTop: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    type: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    date: {
      color: colors.textMuted,
      fontSize: 10,
      flexShrink: 1,
      textAlign: 'right',
    },
    card: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 22,
    },
    sectionLabel: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    body: {
      color: colors.textSoft,
      fontSize: 15,
      lineHeight: 24,
    },
    footer: {
      color: colors.textMuted,
      fontSize: 9,
      textAlign: 'center',
      marginTop: 22,
      letterSpacing: 0.8,
    },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    emptyText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      textAlign: 'center',
    },
  });
}
