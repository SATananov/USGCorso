import { useCallback, useMemo, useState, useRef } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppControls } from '../app/AppControlContext';
import { useAuth } from '../auth/AuthContext';
import { dogCopy } from '../dogs/dogCopy';
import { getMyDogs } from '../dogs/dogService';
import { useLanguage } from '../i18n/LanguageContext';
import { profileCopy } from '../profile/profileCopy';
import { getMyProfile, isLocalProfileReady } from '../profile/profileService';
import { useTheme } from '../theme/ThemeContext';

const sectionConfig = [
  { id: 'myCorso', icon: require('../../assets/icons/my-corso.png') },
  { id: 'corsoFriendly', icon: require('../../assets/icons/corso-friendly.png') },
  { id: 'knowledge', icon: require('../../assets/icons/knowledge.png') },
  { id: 'community', icon: require('../../assets/icons/community.png') },
  { id: 'services', icon: require('../../assets/icons/services.png') },
  { id: 'events', icon: require('../../assets/icons/events.png') },
  { id: 'corsoMatch', icon: require('../../assets/icons/corso-match.png') },
  { id: 'about', icon: require('../../assets/icons/about-usg.png') },
];

export default function HomeScreen({
navigation }) {
  const scrollRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    }, [])
  );
  const { t, language } = useLanguage();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { leaveGuestMode } = useAppControls();
  const copy = profileCopy[language] ?? profileCopy.en;
  const dogText = dogCopy[language] ?? dogCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [openSection, setOpenSection] = useState(null);
  const [showHero, setShowHero] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [dogCount, setDogCount] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadHomeState() {
        if (!user) {
          if (active) {
            setProfileIncomplete(false);
            setDogCount(null);
          }
          return;
        }

        const [{ data: profile, error: profileError }, { data: dogs, error: dogsError }] =
          await Promise.all([
            getMyProfile(user.id),
            getMyDogs(user.id),
          ]);

        if (!active) {
          return;
        }

        setProfileIncomplete(!profileError && !isLocalProfileReady(profile));
        setDogCount(dogsError ? null : (dogs?.length ?? 0));
      }

      loadHomeState();

      return () => {
        active = false;
      };
    }, [user])
  );

  function toggleSection(sectionId) {
    setOpenSection(openSection === sectionId ? null : sectionId);
  }

  function openItem(item, sectionId) {
    if (!user) {
      const guestSectionRoutes = {
        myCorso: 'My Corso',
        corsoFriendly: 'Corso Friendly',
        knowledge: 'Knowledge',
        community: 'Community',
        services: 'Services',
        events: 'Events',
        corsoMatch: 'Corso Match',
        about: 'About',
      };

      const routeName = guestSectionRoutes[sectionId];

      if (routeName) {
        navigation.navigate(routeName);
        return;
      }
    }

    navigation.navigate('Details', { title: item });
  }

  function openProfile() {
    navigation.getParent()?.navigate('AccountSettings');
  }

  function openMyCorso() {
    navigation.navigate('My Corso');
  }

  function addDog() {
    navigation.navigate('My Corso', { openAddDog: true });
  }

  function exitGuestHome() {
    leaveGuestMode();
  }

  function dogStatusText() {
    if (dogCount === null) {
      return '';
    }

    if (dogCount === 0) {
      return dogText.noDogsHome;
    }

    if (dogCount === 1) {
      return dogText.dogCountOne;
    }

    return `${dogCount} ${dogText.dogCountMany}`;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        ref={scrollRef} contentContainerStyle={styles.content}>
        <Pressable style={styles.heroBox} onPress={() => setShowHero(true)}>
          <Image
            source={require('../../assets/ecosystem-hero.png')}
            style={styles.hero}
            resizeMode="contain"
          />
        </Pressable>

        <Text style={styles.title}>USG Corso</Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>

        {profileIncomplete ? (
          <View style={styles.profileWarning}>
            <View style={styles.profileWarningMarker} />
            <View style={styles.profileWarningText}>
              <Text style={styles.profileWarningTitle}>{copy.homeWarningTitle}</Text>
              <Text style={styles.profileWarningBody}>{copy.homeWarningText}</Text>
              <Pressable style={styles.profileWarningButton} onPress={openProfile}>
                <Text style={styles.profileWarningButtonText}>
                  {copy.homeWarningAction}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.menu}>
          {sectionConfig.map((section) => {
            const isOpen = openSection === section.id;
            const title = t(`home.sections.${section.id}.title`);
            const items =
              t(`home.sections.${section.id}.items`) instanceof Array
                ? t(`home.sections.${section.id}.items`)
                : [];

            return (
              <View
                key={section.id}
                style={[styles.section, isOpen && styles.sectionOpen]}
              >
                <Pressable
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(section.id)}
                >
                  <View style={styles.sectionTitleRow}>
                    <Image source={section.icon} style={styles.sectionIconImage} />
                    <View style={styles.sectionTitleTextWrap}>
                      <Text
                        style={[
                          styles.sectionHeaderText,
                          section.id === 'services' && styles.longSectionTitle,
                        ]}
                      >
                        {title}
                      </Text>

                    </View>
                  </View>

                  <Text style={styles.sectionToggle}>
                    {isOpen ? '−' : '+'}
                  </Text>
                </Pressable>

                {section.id === 'myCorso' ? (
                  <View style={styles.myCorsoActions}>
                    <Pressable style={styles.myCorsoOpenButton} onPress={openMyCorso}>
                      <Text style={styles.myCorsoOpenButtonText}>
                        {dogText.viewDogs}
                      </Text>
                      {dogCount !== null ? (
                        <View style={styles.myCorsoCountBadge}>
                          <Text style={styles.myCorsoCountText}>{dogCount}</Text>
                        </View>
                      ) : null}
                    </Pressable>
                    <Pressable style={styles.myCorsoAddButton} onPress={addDog}>
                      <Text style={styles.myCorsoAddButtonText}>
                        + {dogText.addDog}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                {isOpen ? (
                  <View style={styles.sectionContent}>
                    {section.id === 'about' ? (
                      <>
                        <Text style={styles.aboutText}>{t('home.aboutText')}</Text>
                        <Text style={styles.philosophy}>FUNZIONE CREA IL TIPO</Text>
                        <Text style={styles.philosophySmall}>
                          {t('home.philosophyTranslation')}
                        </Text>
                      </>
                    ) : (
                      items.map((item) => (
                        <Pressable
                          key={item}
                          style={styles.menuItem}
                          onPress={() =>
                            section.id === 'community' &&
                            item === items[items.length - 1]
                              ? navigation.navigate('Community')
                              : section.id === 'corsoFriendly'
                                ? navigation.navigate('Corso Friendly')
                                : openItem(item, section.id)
                          }
                        >
                          <Text style={styles.menuItemText}>{item}</Text>
                          <Text style={styles.menuItemArrow}>›</Text>
                        </Pressable>
                      ))
                    )}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        {!user ? (
          <View style={styles.guestExitRow}>
            <Pressable style={styles.guestBackButton} onPress={exitGuestHome}>
              <Text style={styles.guestBackText}>← {language === 'bg' ? 'НАЗАД' : language === 'it' ? 'INDIETRO' : 'BACK'}</Text>
            </Pressable>

            <Pressable style={styles.guestAuthButton} onPress={exitGuestHome}>
              <Text
                style={styles.guestAuthText}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
              >
                {language === 'bg'
                  ? 'ВХОД / РЕГИСТРАЦИЯ'
                  : language === 'it'
                    ? 'ACCEDI / REGISTRATI'
                    : 'SIGN IN / REGISTER'} →
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>USG — Unico Suo Genere™</Text>
          <Text style={styles.footerRights}>{t('home.rights')}</Text>
        </View>
      </ScrollView>

      <Modal visible={showHero} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <Pressable
            style={styles.closeButton}
            onPress={() => setShowHero(false)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>

          <Image
            source={require('../../assets/ecosystem-hero.png')}
            style={styles.modalImage}
            resizeMode="contain"
          />

          <Text style={styles.modalHint}>{t('home.ecosystemHint')}</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 28,
    },
    heroBox: {
      width: '100%',
      height: 210,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    hero: { width: '100%', height: '100%' },
    title: {
      color: colors.text,
      fontSize: 27,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 13,
      textAlign: 'center',
      marginTop: 3,
      marginBottom: 13,
    },
    profileWarning: {
      flexDirection: 'row',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
      padding: 12,
      marginBottom: 10,
    },
    profileWarningMarker: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: colors.gold,
      marginTop: 5,
      marginRight: 10,
    },
    profileWarningText: { flex: 1 },
    profileWarningTitle: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '800',
    },
    profileWarningBody: {
      color: colors.textSoft,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 4,
    },
    profileWarningButton: {
      alignSelf: 'flex-start',
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.gold,
      paddingHorizontal: 10,
      paddingVertical: 7,
      marginTop: 9,
    },
    profileWarningButtonText: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.6,
    },
    menu: { width: '100%' },
    section: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      marginBottom: 7,
      overflow: 'hidden',
      shadowColor: colors.gold,
      shadowOpacity: 0.08,
      shadowRadius: 5,
      elevation: 1,
    },
    sectionOpen: {
      borderColor: colors.gold,
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 3,
    },
    sectionHeader: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
    },
    sectionTitleRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
    },
    sectionIconImage: {
      width: 42,
      height: 42,
      marginRight: 11,
      borderRadius: 21,
    },
    sectionTitleTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    sectionHeaderText: {
      flexShrink: 1,
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold',
      letterSpacing: 0.8,
    },
    longSectionTitle: {
      fontSize: 12,
      letterSpacing: 0.5,
    },
    sectionToggle: {
      color: colors.gold,
      fontSize: 22,
      marginLeft: 8,
    },
    myCorsoActions: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 12,
      paddingBottom: 10,
    },
    myCorsoOpenButton: {
      flex: 1,
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    myCorsoOpenButtonText: {
      color: colors.textSoft,
      fontSize: 9,
      fontWeight: '800',
      textAlign: 'center',
    },
    myCorsoCountBadge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.activeSurface,
      borderWidth: 1,
      borderColor: colors.gold,
      marginLeft: 8,
      paddingHorizontal: 6,
    },
    myCorsoCountText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
    },
    myCorsoAddButton: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9,
      backgroundColor: colors.gold,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    myCorsoAddButtonText: {
      color: colors.background,
      fontSize: 9,
      fontWeight: '900',
      textAlign: 'center',
    },
    sectionContent: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    menuItem: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuItemText: { color: colors.gold, fontSize: 14 },
    menuItemArrow: { color: colors.goldSoft, fontSize: 22 },
    aboutText: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      paddingTop: 8,
    },
    philosophy: {
      color: colors.gold,
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 14,
    },
    philosophySmall: {
      color: colors.text,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 4,
      marginBottom: 8,
    },
    guestExitRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
      marginBottom: 14,
    },
    guestBackButton: {
      flex: 1,
      minHeight: 56,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    guestBackText: {
      color: colors.gold,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '900',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    guestAuthButton: {
      flex: 1,
      minHeight: 56,
      borderRadius: 12,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    guestAuthText: {
      color: colors.background,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '900',
      letterSpacing: 0.4,
      textAlign: 'center',
    },
    footer: { alignItems: 'center', marginTop: 10 },
    footerBrand: { color: colors.textMuted, fontSize: 11 },
    footerRights: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
    modalBackground: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalImage: { width: '100%', height: '78%' },
    closeButton: {
      position: 'absolute',
      top: 46,
      right: 22,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    closeButtonText: { color: colors.gold, fontSize: 30, lineHeight: 32 },
    modalHint: { color: '#b8b8b8', fontSize: 12, marginTop: 10 },
  });
}



