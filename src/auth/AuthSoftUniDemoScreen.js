import { useMemo, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import USGBackToTop from '../components/USGBackToTop';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

const requirements = [
  {
    points: 20,
    bg: { title: 'Навигация и структура', topic: 'Навигация и упражнения по навигация', detail: 'Два комбинирани навигатора, динамични екрани, списък с детайли и предаване на параметри.', example: 'Примери в USGCorso: Knowledge → детайли; Corso Friendly → детайли на място.' },
    en: { title: 'Navigation and structure', topic: 'Navigation and navigation exercises', detail: 'Two composed navigators, dynamic screens, list-to-details flow and route parameters.', example: 'USGCorso examples: Knowledge → details; Corso Friendly → place details.' },
    it: { title: 'Navigazione e struttura', topic: 'Navigazione ed esercizi di navigazione', detail: 'Due navigatori combinati, schermate dinamiche, elenco → dettagli e parametri di navigazione.', example: 'Esempi in USGCorso: Knowledge → dettagli; Corso Friendly → dettagli di un luogo.' },
  },
  {
    points: 15,
    bg: { title: 'Автентикация и сесии', topic: 'Автентикация, изграждане и публикуване', detail: 'Регистрация, вход, изход, защитени маршрути и запазване на сесия след рестарт.', example: 'Пример в USGCorso: реален вход чрез Supabase и лични потребителски екрани.' },
    en: { title: 'Authentication and sessions', topic: 'Authentication, build and deployment', detail: 'Registration, login, logout, protected routes and session persistence after restart.', example: 'USGCorso example: real Supabase login and personal user screens.' },
    it: { title: 'Autenticazione e sessioni', topic: 'Autenticazione, build e distribuzione', detail: 'Registrazione, accesso, uscita, percorsi protetti e persistenza della sessione.', example: 'Esempio in USGCorso: accesso Supabase e schermate personali.' },
  },
  {
    points: 25,
    bg: { title: 'Данни и операции', topic: 'Управление на състоянието и данните', detail: 'Външен API, четене, създаване, редактиране, изтриване, обновяване и състояния при грешки.', example: 'Пример в USGCorso: Моите материали — създаване, преглед, редактиране и изтриване.' },
    en: { title: 'Data and operations', topic: 'State management and data persistence', detail: 'External API, read, create, edit, delete, refresh, loading and error states.', example: 'USGCorso example: My Materials — create, read, edit and delete.' },
    it: { title: 'Dati e operazioni', topic: 'Gestione dello stato e persistenza dei dati', detail: 'API esterna, lettura, creazione, modifica, eliminazione, aggiornamento ed errori.', example: 'Esempio in USGCorso: I miei materiali — creazione, lettura, modifica ed eliminazione.' },
  },
  {
    points: 20,
    bg: { title: 'Форми и валидация', topic: 'Оформление, стилове и потребителски вход', detail: 'Различни видове полета, проверки на данни, управление на клавиатурата и безопасни зони.', example: 'Пример в USGCorso: регистрационна форма и добавяне на материал.' },
    en: { title: 'Forms and validation', topic: 'Layout, styling and user input', detail: 'Multiple input types, field validation, keyboard handling and safe areas.', example: 'USGCorso example: registration form and adding a material.' },
    it: { title: 'Moduli e validazione', topic: 'Layout, stili e input utente', detail: 'Diversi tipi di input, validazione, gestione della tastiera e aree sicure.', example: 'Esempio in USGCorso: registrazione e aggiunta di un materiale.' },
  },
  {
    points: 20,
    bg: { title: 'Мобилни функционалности', topic: 'Мобилни функции и упражнения', detail: 'Поне една смислена native функция с реален резултат.', example: 'Примери в USGCorso: камера, избор на снимка, местоположение и карта.' },
    en: { title: 'Native mobile features', topic: 'Native features and exercises', detail: 'At least one meaningful native mobile feature producing a real result.', example: 'USGCorso examples: camera, image picker, device location and map.' },
    it: { title: 'Funzionalità native', topic: 'Funzionalità native ed esercizi', detail: 'Almeno una funzionalità nativa significativa con risultato reale.', example: 'Esempi in USGCorso: fotocamera, immagini, posizione e mappa.' },
  },
  {
    points: null,
    bg: { title: 'Изграждане и представяне', topic: 'Подготовка за представяне', detail: 'GitHub, README, успешно изграждане и инсталиране на Android Debug APK. Самостоятелна release версия още не е потвърдена.', example: 'Проверен checkpoint: e82b3dc; Gradle assembleDebug: PASS; ADB инсталация: PASS.' },
    en: { title: 'Build and presentation', topic: 'Project presentation', detail: 'GitHub, README, successful Android Debug APK build and installation. A standalone release build has not yet been verified.', example: 'Verified checkpoint: e82b3dc; Gradle assembleDebug: PASS; ADB installation: PASS.' },
    it: { title: 'Build e presentazione', topic: 'Presentazione del progetto', detail: 'GitHub, README, build e installazione APK Android Debug riusciti. Una build release autonoma non è ancora stata verificata.', example: 'Checkpoint verificato: e82b3dc; Gradle assembleDebug: PASS; installazione ADB: PASS.' },
  },
];

const content = {
  bg: {
    title: 'СофтУни', subtitle: 'Изпитна демонстрация · React Native',
    intro: 'Пет оценявани области (общо 100 точки) и допълнителна секция за представяне на проекта. Отвори категория, за да провериш реалните функции на USGCorso.',
    course: 'ТЕМИ ОТ КУРСА', implementation: 'РЕАЛИЗАЦИЯ В USGCORSO', points: 'точки', total: '100 ТОЧКИ',
    notice: 'Бутоните водят към реалните екрани. За лични функции се изисква вход; демонстрацията не заобикаля автентикацията. Секция 06 не носи изпитни точки.',
    login: 'ВХОД КЪМ ДЕМОТО', back: 'НАЗАД', openKnowledge: 'ОТВОРИ РЕАЛНИЯ СПИСЪК С МАТЕРИАЛИ',
    authLogin: 'ПРОВЕРИ РЕАЛЕН ВХОД', authRegister: 'ПРОВЕРИ РЕГИСТРАЦИЯ',
    authNote: 'Използват се истинските форми и Supabase Auth. За теста е необходим отделен потребителски акаунт. Няма автоматичен вход или заобикаляне на защитата.',
    noPoints: 'Допълнителна секция · без точки',
    realActions: 'ПРОВЕРИ В ПРИЛОЖЕНИЕТО',
    signInNote: 'Защитените екрани изискват вход. След успешен вход ще се отвори избраната функция.',
    create: 'CREATE — ДОБАВИ МАТЕРИАЛ', read: 'READ — МОИТЕ МАТЕРИАЛИ', update: 'UPDATE — ИЗБЕРИ МАТЕРИАЛ ЗА РЕДАКЦИЯ', remove: 'DELETE — ИЗБЕРИ МАТЕРИАЛ ЗА ИЗТРИВАНЕ',
    formRegister: 'ФОРМА ЗА РЕГИСТРАЦИЯ', formMaterial: 'ФОРМА ЗА МАТЕРИАЛ И ВАЛИДАЦИЯ',
    camera: 'КАМЕРА / ГАЛЕРИЯ / OCR', location: 'МЕСТОПОЛОЖЕНИЕ И КАРТА',
    github: 'ОТВОРИ GITHUB ХРАНИЛИЩЕТО',
  },
  en: {
    title: 'SoftUni', subtitle: 'Exam demonstration · React Native',
    intro: 'Five graded areas (100 points total) and an extra project presentation section. Open a category to test real USGCorso features.',
    course: 'COURSE TOPICS', implementation: 'IMPLEMENTATION IN USGCORSO', points: 'points', total: '100 POINTS',
    notice: 'Buttons open real screens. Personal features require sign-in; the demo does not bypass authentication. Section 06 carries no exam points.',
    login: 'SIGN IN TO DEMO', back: 'BACK', openKnowledge: 'OPEN REAL KNOWLEDGE LIST',
    authLogin: 'TEST REAL SIGN IN', authRegister: 'TEST REGISTRATION',
    authNote: 'The existing forms and Supabase Auth are used. Use a separate test account. No automatic sign-in or authentication bypass.',
    noPoints: 'Extra section · no points',
    realActions: 'TEST IN THE APPLICATION',
    signInNote: 'Protected screens require sign-in. Your chosen feature will open after a successful login.',
    create: 'CREATE — ADD MATERIAL', read: 'READ — MY MATERIALS', update: 'UPDATE — SELECT MATERIAL TO EDIT', remove: 'DELETE — SELECT MATERIAL TO REMOVE',
    formRegister: 'REGISTRATION FORM', formMaterial: 'MATERIAL FORM AND VALIDATION',
    camera: 'CAMERA / GALLERY / OCR', location: 'LOCATION AND MAP',
    github: 'OPEN GITHUB REPOSITORY',
  },
  it: {
    title: 'SoftUni', subtitle: 'Dimostrazione d’esame · React Native',
    intro: 'Cinque aree valutate (100 punti in totale) e una sezione extra per la presentazione. Apri una categoria per provare le funzioni reali di USGCorso.',
    course: 'ARGOMENTI DEL CORSO', implementation: 'IMPLEMENTAZIONE IN USGCORSO', points: 'punti', total: '100 PUNTI',
    notice: 'I pulsanti aprono schermate reali. Le funzioni personali richiedono l’accesso e la demo non aggira l’autenticazione. La sezione 06 non assegna punti.',
    login: 'ACCEDI ALLA DEMO', back: 'INDIETRO', openKnowledge: 'APRI ELENCO REALE DELLE CONOSCENZE',
    authLogin: 'PROVA ACCESSO REALE', authRegister: 'PROVA REGISTRAZIONE',
    authNote: 'Vengono usati i moduli esistenti e Supabase Auth. Utilizza un account di prova separato. Nessun accesso automatico o aggiramento delle protezioni.',
    noPoints: 'Sezione extra · senza punti',
    realActions: 'PROVA NELL’APPLICAZIONE',
    signInNote: 'Le schermate protette richiedono l’accesso. La funzione scelta si aprirà dopo l’autenticazione.',
    create: 'CREATE — AGGIUNGI MATERIALE', read: 'READ — I MIEI MATERIALI', update: 'UPDATE — SELEZIONA MATERIALE DA MODIFICARE', remove: 'DELETE — SELEZIONA MATERIALE DA ELIMINARE',
    formRegister: 'MODULO DI REGISTRAZIONE', formMaterial: 'MODULO MATERIALE E VALIDAZIONE',
    camera: 'FOTOCAMERA / GALLERIA / OCR', location: 'POSIZIONE E MAPPA',
    github: 'APRI REPOSITORY GITHUB',
  },
};

export default function AuthSoftUniDemoScreen({ onBack, onLogin, onOpenKnowledge, onOpenAuthLogin, onOpenAuthRegister, onOpenFeature, initialDemoView, onDemoViewChange }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const copy = content[language] ?? content.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scrollRef = useRef(null);
  const [expanded, setExpanded] = useState(() => initialDemoView?.expanded ?? null);
  const scrollRestoredRef = useRef(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 40 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onContentSizeChange={() => {
          if (scrollRestoredRef.current) return;
          scrollRestoredRef.current = true;
          const y = initialDemoView?.scrollY ?? 0;
          if (y > 0) {
            scrollRef.current?.scrollTo({ y, animated: false });
          }
        }}
        onScroll={(event) => {
          const y = event.nativeEvent.contentOffset.y;
          setShowBackToTop((current) => current === (y > 240) ? current : y > 240);
          if (scrollRestoredRef.current) onDemoViewChange?.({ scrollY: Math.max(0, y) });
        }}
      >
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← {copy.back}</Text>
        </Pressable>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>USG CORSO</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
          <Text style={styles.total}>{copy.total}</Text>
          <Text style={styles.intro}>{copy.intro}</Text>
          {requirements.map((item, index) => {
            const detail = item[language] ?? item.en;
            const open = expanded === index;
            return (
              <View key={index} style={styles.feature}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  onPress={() => {
                    const next = open ? null : index;
                    setExpanded(next);
                    onDemoViewChange?.({ expanded: next });
                  }}
                  style={styles.featureHeader}
                >
                  <Text style={styles.featureNumber} numberOfLines={1} allowFontScaling={false}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                  <View style={styles.featureHeading}>
                    <Text style={styles.featureText}>{detail.title}</Text>
                    <Text style={styles.featurePoints}>{item.points === null ? copy.noPoints : item.points + ' ' + copy.points}</Text>
                  </View>
                  <Text style={styles.chevron}>{open ? '−' : '+'}</Text>
                </Pressable>
                {open ? (
                  <View style={styles.detail}>
                    <Text style={styles.detailLabel}>{copy.course}</Text>
                    <Text style={styles.detailText}>{detail.topic}</Text>
                    <Text style={styles.detailLabel}>{copy.implementation}</Text>
                    <Text style={styles.detailText}>{detail.detail}</Text>
                    <Text style={styles.exampleText}>{detail.example}</Text>
                    {index === 0 && onOpenKnowledge ? (
                      <Pressable accessibilityRole="button" onPress={onOpenKnowledge} style={styles.realDemoButton}>
                        <Text style={styles.realDemoText}>{copy.openKnowledge} →</Text>
                      </Pressable>
                    ) : null}
                    {index >= 2 && index <= 4 && onOpenFeature ? (
                      <View style={styles.authDemoActions}>
                        <Text style={styles.detailLabel}>{copy.realActions}</Text>
                        <Text style={styles.authDemoNote}>{copy.signInNote}</Text>
                        {(index === 2 ? [
                          [copy.create, 'AddMaterial'],
                          [copy.read, 'MyMaterials'],
                          [copy.update, 'MyMaterials'],
                          [copy.remove, 'MyMaterials'],
                        ] : index === 3 ? [
                          ...(onOpenAuthRegister ? [[copy.formRegister, 'register']] : []),
                          [copy.formMaterial, 'AddMaterial'],
                        ] : [
                          [copy.camera, 'AddMaterial'],
                          [copy.location, 'CorsoFriendly'],
                        ]).map(([label, destination]) => (
                          <Pressable
                            key={label}
                            accessibilityRole="button"
                            onPress={() => destination === 'register' ? onOpenAuthRegister?.() : onOpenFeature(destination)}
                            style={styles.realDemoButton}
                          >
                            <Text style={styles.realDemoText}>{label} →</Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                    {index === 5 ? (
                      <Pressable
                        accessibilityRole="link"
                        onPress={() => Linking.openURL('https://github.com/SATananov/USGCorso')}
                        style={styles.realDemoButton}
                      >
                        <Text style={styles.realDemoText}>{copy.github} →</Text>
                      </Pressable>
                    ) : null}
                    {index === 1 && onOpenAuthLogin && onOpenAuthRegister ? (
                      <View style={styles.authDemoActions}>
                        <Text style={styles.authDemoNote}>{copy.authNote}</Text>
                        <Pressable accessibilityRole="button" onPress={onOpenAuthLogin} style={styles.realDemoButton}>
                          <Text style={styles.realDemoText}>{copy.authLogin} →</Text>
                        </Pressable>
                        <Pressable accessibilityRole="button" onPress={onOpenAuthRegister} style={styles.realDemoButton}>
                          <Text style={styles.realDemoText}>{copy.authRegister} →</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })}
          <Text style={styles.notice}>{copy.notice}</Text>
          <Pressable accessibilityRole="button" onPress={onLogin} style={styles.loginButton}>
            <Text style={styles.loginText}>{copy.login} →</Text>
          </Pressable>
        </View>
      </ScrollView>
      <USGBackToTop
        visible={showBackToTop}
        language={language}
        bottomOffset={Math.max(insets.bottom, 16) + 14}
        onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
      />
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 18 },
    backButton: { paddingVertical: 10, alignSelf: 'flex-start' },
    backText: { color: colors.gold, fontSize: 14, fontWeight: '700' },
    card: { marginTop: 14, backgroundColor: colors.surface, borderColor: colors.goldSoft, borderWidth: 1, borderRadius: 22, padding: 20 },
    eyebrow: { color: colors.goldSoft, fontSize: 11, letterSpacing: 3, textAlign: 'center', fontWeight: '800' },
    title: { color: colors.gold, fontSize: 28, fontWeight: '900', textAlign: 'center', marginTop: 14 },
    subtitle: { color: colors.text, fontSize: 14, textAlign: 'center', marginTop: 8 },
    total: { color: colors.gold, fontSize: 12, fontWeight: '800', textAlign: 'center', marginTop: 20, letterSpacing: 1 },
    intro: { color: colors.textSoft, fontSize: 14, lineHeight: 22, marginTop: 14, marginBottom: 10 },
    feature: { borderBottomWidth: 1, borderBottomColor: colors.border },
    featureHeader: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
    featureNumber: { color: colors.gold, fontWeight: '900', fontSize: 16, width: 36, flexShrink: 0, textAlign: 'center', includeFontPadding: false },
    featureHeading: { flex: 1 },
    featureText: { color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: '700' },
    featurePoints: { color: colors.goldSoft, fontSize: 11, marginTop: 4 },
    chevron: { color: colors.gold, fontSize: 21, width: 24, textAlign: 'center' },
    detail: { paddingLeft: 46, paddingRight: 4, paddingBottom: 16 },
    detailLabel: { color: colors.gold, fontSize: 10, fontWeight: '800', marginTop: 12, letterSpacing: 0.6 },
    detailText: { color: colors.text, fontSize: 12, lineHeight: 19, marginTop: 5 },
    exampleText: { color: colors.textSoft, fontSize: 12, lineHeight: 19, marginTop: 10 },
    notice: { color: colors.textMuted, fontSize: 12, lineHeight: 19, marginTop: 22 },
    authDemoActions: { marginTop: 12 },
    authDemoNote: { color: colors.textSoft, fontSize: 12, lineHeight: 19 },
    realDemoButton: { marginTop: 14, minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 8 },
    realDemoText: { color: colors.gold, fontWeight: '800', fontSize: 11, textAlign: 'center' },
    loginButton: { minHeight: 52, backgroundColor: colors.gold, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 22, paddingHorizontal: 8 },
    loginText: { color: colors.background, fontWeight: '900', fontSize: 13, letterSpacing: 0.3 },
  });
}
