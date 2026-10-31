import { useFocusEffect } from '@react-navigation/native';
import { useMemo, useState, useCallback, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useAppControls } from '../app/AppControlContext';
import AuthWelcomeCarousel from '../auth/AuthWelcomeCarousel';
import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';
import USGScrollHint from './USGScrollHint';

const copy = {
  bg: {
    myCorso: {
      title: 'Моето Корсо',
      body:
        'Тук създаваш и управляваш профилите на своите Cane Corso, добавяш снимки, основна информация и подготвяш профила за споделяне с общността.',
    },
    corsoFriendly: {
      title: 'Корсо места',
      body:
        'Тук ще откриваш полезни места и услуги за Cane Corso и други едри породи, ще разглеждаш картата и ще можеш да предлагаш нови проверени места.',
    },
    knowledge: {
      title: 'Знание',
      body:
        'Тук се събира съдържание за история, функция, тип, развитие, здраве, обучение и културата около Cane Corso.',
    },
    community: {
      title: 'Общност',
      body:
        'Тук ще откриваш профили на Cane Corso от USG общността и ще участваш в бъдещи обществени функции и взаимодействия.',
    },
    services: {
      title: 'Професионалисти и услуги',
      body:
        'Тук ще намираш полезни специалисти, услуги и контакти, свързани с Cane Corso и отговорното отглеждане на едри породи.',
    },
    events: {
      title: 'Събития',
      body:
        'Тук ще се събират срещи, изложби, инициативи и други събития, които са полезни за общността на Cane Corso.',
    },
    corsoMatch: {
      title: 'Корсо избор',
      body:
        'Тук ще се развиват функции за по-добро откриване и свързване на подходящи профили според целите и контекста на потребителя.',
    },
    about: {
      title: 'За USG',
      body:
        'Тук ще намериш повече за идеята, ценностите и развитието на USG — Unico Suo Genere™ като независима образователна и културна среда.',
    },
    status: 'Активира се след регистрация',
    note:
      'Като гост виждаш предварителен преглед. След регистрация или вход ще получиш достъп до активните функции на тази секция.',
    home: 'НАЧАЛО',
    auth: 'ВХОД / РЕГИСТРАЦИЯ',
  },
  en: {
    myCorso: {
      title: 'My Corso',
      body:
        'Create and manage profiles for your Cane Corso, add photos and essential information, and prepare profiles to share with the community.',
    },
    corsoFriendly: {
      title: 'Corso Places',
      body:
        'Discover useful places and services for Cane Corso and other large breeds, explore the map, and suggest new verified places.',
    },
    knowledge: {
      title: 'Knowledge',
      body:
        'Explore content about history, function, type, development, health, training, and Cane Corso culture.',
    },
    community: {
      title: 'Community',
      body:
        'Discover Cane Corso profiles from the USG community and take part in future community features and interactions.',
    },
    services: {
      title: 'Professionals & Services',
      body:
        'Find useful professionals, services, and contacts connected with Cane Corso and responsible care for large breeds.',
    },
    events: {
      title: 'Events',
      body:
        'Find meetings, shows, initiatives, and other events that are useful to the Cane Corso community.',
    },
    corsoMatch: {
      title: 'Corso Match',
      body:
        'Future tools will help discover and connect suitable profiles based on the user’s goals and context.',
    },
    about: {
      title: 'About USG',
      body:
        'Learn more about the idea, values, and development of USG — Unico Suo Genere™ as an independent educational and cultural environment.',
    },
    status: 'Available after registration',
    note:
      'As a guest you can see this preview. Sign in or create an account to use the active features of this section.',
    home: 'HOME',
    auth: 'SIGN IN / REGISTER',
  },
  it: {
    myCorso: {
      title: 'Il mio Corso',
      body:
        'Crea e gestisci i profili dei tuoi Cane Corso, aggiungi foto e informazioni essenziali e prepara i profili da condividere con la comunità.',
    },
    corsoFriendly: {
      title: 'Luoghi Corso',
      body:
        'Scopri luoghi e servizi utili per Cane Corso e altre razze di grande taglia, esplora la mappa e proponi nuovi luoghi verificati.',
    },
    knowledge: {
      title: 'Conoscenza',
      body:
        'Esplora contenuti su storia, funzione, tipo, sviluppo, salute, educazione e cultura del Cane Corso.',
    },
    community: {
      title: 'Comunità',
      body:
        'Scopri i profili Cane Corso della comunità USG e partecipa alle future funzioni e interazioni della comunità.',
    },
    services: {
      title: 'Professionisti e servizi',
      body:
        'Trova professionisti, servizi e contatti utili legati al Cane Corso e alla gestione responsabile delle razze di grande taglia.',
    },
    events: {
      title: 'Eventi',
      body:
        'Scopri incontri, esposizioni, iniziative e altri eventi utili alla comunità del Cane Corso.',
    },
    corsoMatch: {
      title: 'Corso Match',
      body:
        'Le future funzioni aiuteranno a trovare e collegare profili adatti in base agli obiettivi e al contesto dell’utente.',
    },
    about: {
      title: 'Su USG',
      body:
        'Scopri l’idea, i valori e lo sviluppo di USG — Unico Suo Genere™ come ambiente educativo e culturale indipendente.',
    },
    status: 'Disponibile dopo la registrazione',
    note:
      'Come ospite puoi vedere questa anteprima. Accedi o crea un account per usare le funzioni attive di questa sezione.',
    home: 'HOME',
    auth: 'ACCEDI / REGISTRATI',
  },
};

export default function GuestSectionPreview({
sectionKey,
  navigation,
}) {
  const scrollRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    }, [])
  );
  const { language } = useLanguage();
  const { colors } = useTheme();
  const { leaveGuestMode } = useAppControls();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const languageCopy = copy[language] ?? copy.en;
  const section = languageCopy[sectionKey] ?? languageCopy.about;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 28 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          if (event.nativeEvent.contentOffset.y > 24 && showScrollHint) {
            setShowScrollHint(false);
          }
        }}
        scrollEventThrottle={16}
      >
        <AuthWelcomeCarousel colors={colors} />

        <View style={styles.card}>
          <Text style={styles.brand}>USG — UNICO SUO GENERE™</Text>
          <Text style={styles.title}>{section.title}</Text>
          <Text style={styles.body}>{section.body}</Text>

          <View style={styles.status}>
            <Text style={styles.statusText}>{languageCopy.status}</Text>
          </View>

          <Text style={styles.note}>{languageCopy.note}</Text>

          <View style={styles.actions}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.secondaryText}>← {languageCopy.home}</Text>
            </Pressable>

            <Pressable
              style={styles.primaryButton}
              onPress={leaveGuestMode}
            >
              <Text
                style={styles.primaryText}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.76}
              >
                {languageCopy.auth} →
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <USGScrollHint
        visible={showScrollHint}
        bottom={Math.max(insets.bottom, 16) + 8}
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
      flexGrow: 1,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 24,
    },
    brand: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 2.4,
      textAlign: 'center',
      marginBottom: 12,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '800',
      textAlign: 'center',
    },
    body: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 22,
      textAlign: 'center',
      marginTop: 14,
    },
    status: {
      marginTop: 22,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    statusText: {
      color: colors.gold,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '900',
      letterSpacing: 0.6,
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    note: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 16,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 22,
    },
    secondaryButton: {
      flex: 1,
      minHeight: 58,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    secondaryText: {
      color: colors.gold,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '900',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    primaryButton: {
      flex: 1,
      minHeight: 58,
      borderRadius: radius.md,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    primaryText: {
      color: colors.background,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '900',
      letterSpacing: 0.4,
      textAlign: 'center',
    },
  });
}
