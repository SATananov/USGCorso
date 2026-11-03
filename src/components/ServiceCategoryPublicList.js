import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import { getServiceLabel, serviceCategoryGroups } from '../services/serviceCategories';
import { getPublicProfessionalProfiles } from '../services/professionalProfileService';

const copy = {
  bg: {
    publicCatalog: 'ПУБЛИЧЕН КАТАЛОГ',
    empty: 'Все още няма публикувани профили в тази категория.',
    retry: 'ОПИТАЙ ОТНОВО',
    verified: 'ПРОВЕРЕН ОТ USG',
    locationFallback: 'Местоположението не е публикувано',
    loadError: 'Каталогът не можа да бъде зареден.',
    back: 'НАЗАД',
    next: 'НАПРЕД',
    close: 'ЗАТВОРИ',
  },
  en: {
    publicCatalog: 'PUBLIC CATALOG',
    empty: 'There are no published profiles in this category yet.',
    retry: 'TRY AGAIN',
    verified: 'VERIFIED BY USG',
    locationFallback: 'Location is not published',
    loadError: 'The catalog could not be loaded.',
    back: 'BACK',
    next: 'NEXT',
    close: 'CLOSE',
  },
  it: {
    publicCatalog: 'CATALOGO PUBBLICO',
    empty: 'Non ci sono ancora profili pubblicati in questa categoria.',
    retry: 'RIPROVA',
    verified: 'VERIFICATO DA USG',
    locationFallback: 'La località non è pubblicata',
    loadError: 'Impossibile caricare il catalogo.',
    back: 'INDIETRO',
    next: 'AVANTI',
    close: 'CHIUDI',
  },
};

const categoryHeroImages = {
  breeders: require('../../assets/services-breeders-hero.png'),
  trainers: require('../../assets/services-trainers-hero.png'),
  veterinary: require('../../assets/services-veterinary-hero.png'),
  handlers: require('../../assets/services-handlers-hero.png'),
  transport: require('../../assets/services-transport-hero.png'),
  petShops: require('../../assets/services-petshops-hero.png'),
  dogHotels: require('../../assets/services-doghotels-hero.png'),
  sheltersRescues: require('../../assets/services-shelters-rescues-hero.png'),
  grooming: require('../../assets/services-grooming-hero.png'),
  rehabilitation: require('../../assets/services-rehabilitation-hero.png'),
  behavior: require('../../assets/services-behavior-hero.png'),
  nutrition: require('../../assets/services-nutrition-hero.png'),
  photographers: require('../../assets/services-photographers-hero.png'),
  caneCorsoClubs: require('../../assets/services-cane-corso-clubs-hero.png'),
  breedAssociations: require('../../assets/services-breed-associations-hero.png'),
  kennelOrganizations: require('../../assets/services-kennel-organizations-hero.png'),
  workingDogClubs: require('../../assets/services-working-dog-clubs-hero.png'),
  rescueOrganizations: require('../../assets/services-rescue-organizations-hero.png'),
  eventOrganizations: require('../../assets/services-event-organizations-hero.png'),
  trainingAssociations: require('../../assets/services-training-associations-hero.png'),
  veterinaryAssociations: require('../../assets/services-veterinary-associations-hero.png'),
  culturalOrganizations: require('../../assets/services-cultural-organizations-hero.png'),
};

function findCategory(categoryKey) {
  for (const group of serviceCategoryGroups) {
    const item = group.items.find((entry) => entry.key === categoryKey);

    if (item) {
      return { group, item };
    }
  }

  return null;
}

function getNextCategoryKey(categoryKey) {
  const keys = serviceCategoryGroups.flatMap((group) =>
    group.items.map((item) => item.key)
  );
  const index = keys.indexOf(categoryKey);

  if (index < 0 || index >= keys.length - 1) {
    return null;
  }

  return keys[index + 1];
}

function getLocation(profile, fallback) {
  const parts = [profile.city, profile.region, profile.country].filter(Boolean);
  return parts.length ? parts.join(', ') : fallback;
}

export default function ServiceCategoryPublicList({
  categoryKey,
  onOpenProfile,
  onBack,
  onNext,
}) {
  const { language } = useLanguage();
  const labels = copy[language] || copy.en;
  const category = findCategory(categoryKey);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [heroOpen, setHeroOpen] = useState(false);
  const scrollRef = useRef(null);
  const nextCategoryKey = getNextCategoryKey(categoryKey);

  const loadProfiles = useCallback(async () => {
    if (!categoryKey) return;

    setLoading(true);
    setErrorText('');

    const { data, error } = await getPublicProfessionalProfiles(categoryKey);

    if (error) {
      setProfiles([]);
      setErrorText(labels.loadError);
      setLoading(false);
      return;
    }

    setProfiles(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [categoryKey, labels.loadError]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [categoryKey]);

  if (!category) {
    return null;
  }

  const heroImage = categoryHeroImages[categoryKey] || null;

  return (
    <>
      <ScrollView
        ref={scrollRef}
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backArrow}>{'\u2039'}</Text>
            <Text style={styles.backLabel}>{labels.back}</Text>
          </Pressable>

          {nextCategoryKey && onNext ? (
            <Pressable
              style={styles.nextButton}
              onPress={() => onNext(nextCategoryKey)}
            >
              <Text style={styles.nextLabel}>{labels.next}</Text>
              <Text style={styles.nextArrow}>{'\u203A'}</Text>
            </Pressable>
          ) : null}
        </View>

        {heroImage ? (
          <Pressable onPress={() => setHeroOpen(true)}>
            <Image
              source={heroImage}
              style={styles.hero}
              resizeMode="cover"
            />
          </Pressable>
        ) : null}

        <View style={styles.heading}>
          <Text style={styles.kicker}>{labels.publicCatalog}</Text>
          <Text style={styles.title}>
            {getServiceLabel(category.item, language)}
          </Text>
          <Text style={styles.group}>
            {getServiceLabel(category.group, language)}
          </Text>
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator />
          </View>
        ) : errorText ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>{errorText}</Text>
            <Pressable style={styles.retryButton} onPress={loadProfiles}>
              <Text style={styles.retryLabel}>{labels.retry}</Text>
            </Pressable>
          </View>
        ) : profiles.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>{labels.empty}</Text>
          </View>
        ) : (
          profiles.map((profile) => (
            <Pressable
              key={profile.id}
              style={styles.profileCard}
              onPress={() => onOpenProfile?.(profile.id)}
            >
              <View style={styles.profileHeader}>
                <Text style={styles.profileName}>{profile.display_name}</Text>
                {profile.verified ? (
                  <Text style={styles.verified}>{labels.verified}</Text>
                ) : null}
              </View>

              <Text style={styles.location}>
                {getLocation(profile, labels.locationFallback)}
              </Text>

              {profile.short_description ? (
                <Text style={styles.description} numberOfLines={3}>
                  {profile.short_description}
                </Text>
              ) : null}

              <Text style={styles.arrow}>{'\u203A'}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>

      <Modal visible={heroOpen} transparent animationType="fade">
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalClose}
            onPress={() => setHeroOpen(false)}
          >
            <Text style={styles.modalCloseText}>{'\u00D7'}</Text>
          </Pressable>

          <Pressable
            style={styles.modalImageWrap}
            onPress={() => setHeroOpen(false)}
          >
            <Image
              source={heroImage}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </Pressable>

          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setHeroOpen(false)}
          >
            <Text style={styles.modalCloseButtonText}>{labels.close}</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#080808',
  },
  content: {
    paddingBottom: 42,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.34)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#101010',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.34)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#101010',
  },
  nextLabel: {
    color: '#d8b64b',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  nextArrow: {
    color: '#d8b64b',
    fontSize: 24,
    lineHeight: 22,
    marginLeft: 6,
  },
  backArrow: {
    color: '#d8b64b',
    fontSize: 24,
    lineHeight: 22,
    marginRight: 6,
  },
  backLabel: {
    color: '#d8b64b',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  hero: {
    width: '100%',
    height: 232,
    backgroundColor: '#080808',
  },
  heading: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
  },
  kicker: {
    color: '#b99532',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    color: '#f5f1e8',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 7,
  },
  group: {
    color: '#9f8746',
    fontSize: 13,
    marginTop: 5,
  },
  stateCard: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    borderRadius: 18,
    backgroundColor: '#111111',
    alignItems: 'center',
  },
  stateText: {
    color: '#d6d0c4',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#c9a63d',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryLabel: {
    color: '#d8b64b',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    borderRadius: 18,
    backgroundColor: '#111111',
  },
  profileHeader: {
    gap: 8,
  },
  profileName: {
    color: '#f5f1e8',
    fontSize: 19,
    fontWeight: '800',
    paddingRight: 28,
  },
  verified: {
    color: '#d8b64b',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  location: {
    color: '#a99354',
    fontSize: 13,
    marginTop: 10,
  },
  description: {
    color: '#d6d0c4',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  arrow: {
    position: 'absolute',
    right: 18,
    top: 17,
    color: '#d8b64b',
    fontSize: 27,
    fontWeight: '700',
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#c9a63d',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  modalCloseText: {
    color: '#d8b64b',
    fontSize: 34,
    lineHeight: 36,
  },
  modalImageWrap: {
    width: '100%',
    height: '78%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalCloseButton: {
    marginTop: 18,
    minWidth: 160,
    borderWidth: 1,
    borderColor: '#c9a63d',
    borderRadius: 16,
    backgroundColor: '#111111',
    paddingHorizontal: 22,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    color: '#d8b64b',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});
