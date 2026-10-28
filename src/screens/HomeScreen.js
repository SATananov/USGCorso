import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';

const sectionConfig = [
  {
    id: 'myCorso',
    icon: require('../../assets/icons/my-corso.png'),
  },
  {
    id: 'corsoFriendly',
    icon: require('../../assets/icons/corso-friendly.png'),
  },
  {
    id: 'knowledge',
    icon: require('../../assets/icons/knowledge.png'),
  },
  {
    id: 'community',
    icon: require('../../assets/icons/community.png'),
  },
  {
    id: 'services',
    icon: require('../../assets/icons/services.png'),
  },
  {
    id: 'events',
    icon: require('../../assets/icons/events.png'),
  },
  {
    id: 'corsoMatch',
    icon: require('../../assets/icons/corso-match.png'),
  },
  {
    id: 'about',
    icon: require('../../assets/icons/about-usg.png'),
  },
];

export default function HomeScreen({ navigation }) {
  const { t } = useLanguage();
  const [openSection, setOpenSection] = useState(null);
  const [showHero, setShowHero] = useState(false);

  function toggleSection(sectionId) {
    setOpenSection(openSection === sectionId ? null : sectionId);
  }

  function openItem(item) {
    navigation.navigate('Details', { title: item });
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
                style={[
                  styles.section,
                  isOpen && styles.sectionOpen,
                ]}
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

                {isOpen && (
                  <View style={styles.sectionContent}>
                    {section.id === 'about' ? (
                      <>
                        <Text style={styles.aboutText}>
                          {t('home.aboutText')}
                        </Text>

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
                )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
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
    color: '#ffffff',
    fontSize: 27,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#b8b8b8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 13,
  },
  menu: {
    width: '100%',
  },
  section: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#8f6418',
    borderRadius: 12,
    marginBottom: 7,
    overflow: 'hidden',
    shadowColor: '#d4af37',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionOpen: {
    borderColor: '#d4af37',
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
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  longSectionTitle: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  sectionToggle: {
    color: '#d4af37',
    fontSize: 22,
    marginLeft: 8,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: '#5d4318',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  menuItem: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
  },
  menuItemText: {
    color: '#d4af37',
    fontSize: 14,
  },
  menuItemArrow: {
    color: '#8e793c',
    fontSize: 22,
  },
  aboutText: {
    color: '#c7c7c7',
    fontSize: 12,
    lineHeight: 18,
    paddingTop: 8,
  },
  philosophy: {
    color: '#d4af37',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 14,
  },
  philosophySmall: {
    color: '#ffffff',
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
    color: '#777777',
    fontSize: 11,
  },
  footerRights: {
    color: '#5f5f5f',
    fontSize: 10,
    marginTop: 2,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.96)',
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
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#4a3b17',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  closeButtonText: {
    color: '#d4af37',
    fontSize: 30,
    lineHeight: 32,
  },
  modalHint: {
    color: '#a8a8a8',
    fontSize: 12,
    marginTop: 10,
  },
});
