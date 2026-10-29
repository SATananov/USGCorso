import { useCallback, useMemo, useState } from 'react';
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

import { useAuth } from '../auth/AuthContext';
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

export default function HomeScreen({ navigation }) {
  const { t, language } = useLanguage();
  const { colors } = useTheme();
  const { user } = useAuth();
  const copy = profileCopy[language] ?? profileCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [openSection, setOpenSection] = useState(null);
  const [showHero, setShowHero] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function checkProfile() {
        if (!user) {
          if (active) {
            setProfileIncomplete(false);
          }
          return;
        }

        const { data, error } = await getMyProfile(user.id);

        if (active) {
          setProfileIncomplete(!error && !isLocalProfileReady(data));
        }
      }

      checkProfile();

      return () => {
        active = false;
      };
    }, [user])
  );

  function toggleSection(sectionId) {
    setOpenSection(openSection === sectionId ? null : sectionId);
  }

  function openItem(item) {
    navigation.navigate('Details', { title: item });
  }

  function openProfile() {
    navigation.getParent()?.navigate('AccountSettings');
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
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
                    <Text
                      style={[
                        styles.sectionHeaderText,
                        section.id === 'services' && styles.longSectionTitle,
                      ]}
                    >
                      {title}
                    </Text>
                  </View>

                  <Text style={styles.sectionToggle}>
                    {isOpen ? '−' : '+'}
                  </Text>
                </Pressable>

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
                          onPress={() => openItem(item)}
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
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
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
    hero: {
      width: '100%',
      height: '100%',
    },
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
    profileWarningText: {
      flex: 1,
    },
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
    menu: {
      width: '100%',
    },
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
    menuItemText: {
      color: colors.gold,
      fontSize: 14,
    },
    menuItemArrow: {
      color: colors.goldSoft,
      fontSize: 22,
    },
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
    footer: {
      alignItems: 'center',
      marginTop: 10,
    },
    footerBrand: {
      color: colors.textMuted,
      fontSize: 11,
    },
    footerRights: {
      color: colors.textMuted,
      fontSize: 10,
      marginTop: 2,
    },
    modalBackground: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalImage: {
      width: '100%',
      height: '78%',
    },
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
    closeButtonText: {
      color: colors.gold,
      fontSize: 30,
      lineHeight: 32,
    },
    modalHint: {
      color: '#b8b8b8',
      fontSize: 12,
      marginTop: 10,
    },
  });
}
