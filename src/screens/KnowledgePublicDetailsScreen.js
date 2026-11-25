import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import { getPublicKnowledgeItem } from '../knowledge/knowledgePublicService';
import { translateOnDevice } from '../translation/mlkitTranslationService';
import { useRef as useBackToTopRef, useState as useBackToTopState } from 'react';
import USGBackToTop from '../components/USGBackToTop';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';
import { formatTimestamp } from '../utils/dateTime';

const copy = {
  en: {
    choose: 'Translation language',
    showOriginal: 'SHOW ORIGINAL',
    kicker: 'PUBLIC KNOWLEDGE',
    content: 'Content',
    updated: 'Updated',
    untitled: 'Untitled material',
    noContent: 'No text content is available for this material.',
    notFound: 'This Knowledge material could not be opened.',
    translate: 'TRANSLATE ON THIS DEVICE',
    translating: 'Translating on device…',
    machine: 'Machine translation — please verify important details.',
    wifi: 'Connect to Wi-Fi to download the language model and try again.',
    wifiHint: 'A Wi-Fi connection is recommended for the first language-model download.',
    failed: 'Translation unavailable. Original text is shown.',
    original: 'Original text is shown. Tap the button above to translate on this device.',
    loading: 'Loading article…',
  },
  bg: {
    choose: 'Език за превод',
    showOriginal: 'ПОКАЖИ ОРИГИНАЛА',
    kicker: 'ПУБЛИЧНО ЗНАНИЕ',
    content: 'Съдържание',
    updated: 'Обновено',
    untitled: 'Материал без заглавие',
    noContent: 'За този материал няма налично текстово съдържание.',
    notFound: 'Този материал от „Знание“ не може да бъде отворен.',
    translate: 'ПРЕВЕДИ НА ТЕЛЕФОНА',
    translating: 'Превеждане на телефона…',
    machine: 'Машинен превод — провери важните подробности.',
    wifi: 'Свържи се с Wi-Fi за изтегляне на езиковия модел и опитай отново.',
    wifiHint: 'За първото изтегляне на езиковия модел е препоръчителна Wi-Fi връзка.',
    failed: 'Преводът не е наличен. Показан е оригиналният текст.',
    original: 'Показан е оригиналният текст. Натисни бутона по-горе за превод на телефона.',
    loading: 'Зареждане на статията…',
  },
  it: {
    choose: 'Lingua di traduzione',
    showOriginal: 'MOSTRA ORIGINALE',
    kicker: 'CONOSCENZA PUBBLICA',
    content: 'Contenuto',
    updated: 'Aggiornato',
    untitled: 'Contenuto senza titolo',
    noContent: 'Non è disponibile contenuto testuale per questo materiale.',
    notFound: 'Questo contenuto della sezione Conoscenza non può essere aperto.',
    translate: 'TRADUCI SUL DISPOSITIVO',
    translating: 'Traduzione sul dispositivo…',
    machine: 'Traduzione automatica — verifica i dettagli importanti.',
    wifi: 'Connettiti al Wi-Fi per scaricare il modello linguistico e riprova.',
    wifiHint: 'Per il primo download del modello linguistico è consigliata una connessione Wi-Fi.',
    failed: 'Traduzione non disponibile. Viene mostrato il testo originale.',
    original: 'Viene mostrato il testo originale. Tocca il pulsante qui sopra per tradurre sul dispositivo.',
    loading: 'Caricamento articolo…',
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
  return formatTimestamp(value, ({ bg: 'bg-BG', en: 'en-GB', it: 'it-IT' }[language] || 'en-GB'), { dateStyle: 'medium' });
}

export default function KnowledgePublicDetailsScreen({ route }) {
  const { language } = useLanguage();
  return <KnowledgeArticle key={`${route.params?.item?.id ?? ''}:${language}`} route={route} />;
}

function KnowledgeArticle({ route }) {
  const backToTopRef = useBackToTopRef(null);
  const [backToTopVisible, setBackToTopVisible] = useBackToTopState(false);
  const { language: backToTopLanguage } = useLanguage();
  const item = route.params?.item;
  const { language } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const labels = copy[language] ?? copy.en;
  const [remote, setRemote] = useState(null);
  const [machine, setMachine] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    let active = true;
    setRemote(null);
    setMachine(null);
    setBusy(false);
    setMessage('');
    if (item?.id) {
      getPublicKnowledgeItem(item.id, language).then((result) => {
        if (active && !result.error && result.data) setRemote({ language, item: result.data });
      });
    }
    return () => { active = false; };
  }, [item?.id, language]);

  const actual = remote?.language === language ? remote.item : null;
  const current = actual ?? item;
  const source = actual?.source_language;
  const supported = ['bg', 'en', 'it'];
  const sourceTitle = actual?.original_title ?? (!actual?.has_translation ? current?.title : null);
  const sourceBody = actual?.original_body ?? (!actual?.has_translation ? current?.body : null);
  const canTranslate = Boolean(actual && supported.includes(source) && (sourceTitle || sourceBody));
  const selectedTarget = target ?? (source !== language ? language : supported.find((value) => value !== source));
  const machineText = machine?.id === item?.id ? machine : null;
  const displayedTitle = machineText?.title ?? (showOriginal ? sourceTitle : current?.title);
  const displayedBody = machineText?.body ?? (showOriginal ? sourceBody : current?.body);

  async function onTranslate() {
    if (!canTranslate || busy || !supported.includes(selectedTarget) || selectedTarget === source) return;
    setBusy(true);
    setMessage('');
    try {
      const translatedTitle = sourceTitle ? await translateOnDevice(sourceTitle, source, selectedTarget) : '';
      const translatedBody = sourceBody ? await translateOnDevice(sourceBody, source, selectedTarget) : '';
      setShowOriginal(false);
      setMachine({ id: actual.id, language: selectedTarget, title: translatedTitle || sourceTitle, body: translatedBody || sourceBody });
    } catch (error) {
      setMachine(null);
      setShowOriginal(true);
      const errorText = String(error?.code ?? '') + String(error?.message ?? error);
      setMessage(errorText.includes('MODEL_DOWNLOAD_FAILED') ? labels.wifi : labels.failed);
    } finally {
      setBusy(false);
    }
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centerState}>
          <Text style={styles.emptyText}>{labels.notFound}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const updated = formatDate(current.updated_at, language);

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
            {displayedTitle || labels.untitled}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.type}>
              {getContentTypeLabel(current.content_type, language)}
            </Text>
            {updated ? (
              <Text style={styles.date}>
                {labels.updated}: {updated}
              </Text>
            ) : null}
          </View>
        </View>

        {canTranslate ? (
          <View style={styles.translationPanel}>
            <Text style={styles.sectionLabel}>{labels.choose}</Text>
            <View style={styles.languageRow}>
              {supported.filter((value) => value !== source).map((value) => (
                <Pressable key={value} disabled={busy} accessibilityRole="button" accessibilityState={{ selected: selectedTarget === value, disabled: busy }} onPress={() => { setTarget(value); setMessage(''); }} style={[styles.languageButton, selectedTarget === value && { backgroundColor: colors.gold }]}>
                  <Text style={[styles.translateButtonText, selectedTarget === value && { color: '#08080a' }]}>{value.toUpperCase()}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable disabled={busy} style={styles.translateButton} onPress={onTranslate}>
              <Text style={styles.translateButtonText}>{busy ? labels.translating : labels.translate}</Text>
            </Pressable>
            <Pressable disabled={busy} style={styles.translateButton} onPress={() => { setMachine(null); setShowOriginal(true); setMessage(''); }}>
              <Text style={styles.translateButtonText}>{labels.showOriginal} ({source.toUpperCase()})</Text>
            </Pressable>
            {busy ? <ActivityIndicator color={colors.gold} /> : null}
            {machineText ? <Text style={styles.noticeText}>{machineText.language.toUpperCase()} · {labels.machine}</Text> : null}
            {message ? <Text style={styles.noticeText}>{message}</Text> : null}
            <Text style={styles.noticeText}>{labels.wifiHint}</Text>
          </View>
        ) : null}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{labels.content}</Text>
          <Text style={styles.body}>
            {displayedBody || labels.noContent}
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
    translationPanel: { marginBottom: 14 },
    languageRow: { flexDirection: 'row', gap: 10 },
    languageButton: { flex: 1, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.gold, borderRadius: radius.md },
    translateButton: {
      borderWidth: 1,
      borderColor: colors.goldDark,
      backgroundColor: colors.activeSurface,
      borderRadius: radius.md,
      padding: 14,
      marginTop: 14,
      alignItems: 'center',
    },
    translateButtonText: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.6,
    },
    notice: {
      marginTop: 12,
      alignItems: 'center',
      gap: 8,
    },
    noticeText: {
      marginTop: 12,
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
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
