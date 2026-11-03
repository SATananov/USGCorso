import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useLanguage } from '../i18n/LanguageContext';
import {
  getServiceLabel,
  serviceCategoryGroups,
} from '../services/serviceCategories';
import { getPublicProfessionalProfile } from '../services/professionalProfileService';

const copy = {
  bg: {
    back: 'НАЗАД',
    publicProfile: 'ПУБЛИЧЕН ПРОФИЛ',
    verified: 'ПРОВЕРЕН ОТ USG',
    professional: 'ПРОФЕСИОНАЛИСТ',
    organization: 'ОРГАНИЗАЦИЯ',
    location: 'МЕСТОПОЛОЖЕНИЕ',
    categories: 'КАТЕГОРИИ',
    about: 'ОПИСАНИЕ',
    contact: 'КОНТАКТИ',
    contactPerson: 'Лице за контакт',
    phone: 'Телефон',
    email: 'Email',
    website: 'Website',
    address: 'Адрес',
    facebook: 'Facebook',
    instagram: 'Instagram',
    privacyTitle: 'ПОВЕРИТЕЛНОСТ',
    privacyText:
      'Този публичен профил показва само информация, одобрена за публично представяне в USG.',
    locationFallback: 'Местоположението не е публикувано',
    descriptionFallback: 'Все още няма публикувано описание.',
    loadError: 'Публичният профил не можа да бъде зареден.',
    notFound: 'Този профил не е наличен публично.',
    retry: 'ОПИТАЙ ОТНОВО',
  },
  en: {
    back: 'BACK',
    publicProfile: 'PUBLIC PROFILE',
    verified: 'VERIFIED BY USG',
    professional: 'PROFESSIONAL',
    organization: 'ORGANIZATION',
    location: 'LOCATION',
    categories: 'CATEGORIES',
    about: 'ABOUT',
    contact: 'CONTACTS',
    contactPerson: 'Contact person',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    address: 'Address',
    facebook: 'Facebook',
    instagram: 'Instagram',
    privacyTitle: 'PRIVACY',
    privacyText:
      'This public profile shows only information approved for public presentation in USG.',
    locationFallback: 'Location is not published',
    descriptionFallback: 'No public description has been published yet.',
    loadError: 'The public profile could not be loaded.',
    notFound: 'This profile is not publicly available.',
    retry: 'TRY AGAIN',
  },
  it: {
    back: 'INDIETRO',
    publicProfile: 'PROFILO PUBBLICO',
    verified: 'VERIFICATO DA USG',
    professional: 'PROFESSIONISTA',
    organization: 'ORGANIZZAZIONE',
    location: 'LOCALITÀ',
    categories: 'CATEGORIE',
    about: 'PROFILO',
    contact: 'CONTATTI',
    contactPerson: 'Referente',
    phone: 'Telefono',
    email: 'Email',
    website: 'Sito web',
    address: 'Indirizzo',
    facebook: 'Facebook',
    instagram: 'Instagram',
    privacyTitle: 'PRIVACY',
    privacyText:
      'Questo profilo pubblico mostra solo informazioni approvate per la presentazione pubblica in USG.',
    locationFallback: 'La località non è pubblicata',
    descriptionFallback: 'Non è stata ancora pubblicata una descrizione.',
    loadError: 'Impossibile caricare il profilo pubblico.',
    notFound: 'Questo profilo non è disponibile pubblicamente.',
    retry: 'RIPROVA',
  }
};

function getLocation(profile, fallback) {
  const parts = [profile?.city, profile?.region, profile?.country].filter(Boolean);
  return parts.length ? parts.join(', ') : fallback;
}

function getCategoryLabel(categoryKey, language) {
  for (const group of serviceCategoryGroups) {
    const item = group.items.find((entry) => entry.key === categoryKey);

    if (item) {
      return getServiceLabel(item, language);
    }
  }

  return categoryKey;
}

export default function ServicePublicProfileDetails({
  profileId,
  onBack,
}) {
  const { language } = useLanguage();
  const labels = copy[language] || copy.en;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  const loadProfile = useCallback(async () => {
    if (!profileId) return;

    setLoading(true);
    setErrorText('');

    const { data, error } = await getPublicProfessionalProfile(profileId);

    if (error) {
      setProfile(null);
      setErrorText(labels.loadError);
      setLoading(false);
      return;
    }

    const result = Array.isArray(data) ? data[0] ?? null : data ?? null;

    setProfile(result);

    if (!result) {
      setErrorText(labels.notFound);
    }

    setLoading(false);
  }, [labels.loadError, labels.notFound, profileId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const categoryLabels = useMemo(
    () =>
      (profile?.categories ?? []).map((categoryKey) =>
        getCategoryLabel(categoryKey, language)
      ),
    [language, profile?.categories]
  );

  const isLongName = (profile?.display_name?.length ?? 0) > 22;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backArrow}>{'\u2039'}</Text>
          <Text style={styles.backLabel}>{labels.back}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator />
        </View>
      ) : errorText ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateText}>{errorText}</Text>
          <Pressable style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryLabel}>{labels.retry}</Text>
          </Pressable>
        </View>
      ) : profile ? (
        <>
          <View style={styles.identityCard}>
            <Image
              source={
                profile.public_image_url
                  ? { uri: profile.public_image_url }
                  : require('../../assets/services-public-profile-fallback-crest.png')
              }
              style={[
                styles.profileImage,
                !profile.public_image_url && styles.profileImageFallback,
              ]}
              resizeMode={profile.public_image_url ? 'cover' : 'contain'}
            />

            <Text style={styles.kicker}>{labels.publicProfile}</Text>
            <Text
              style={[styles.name, isLongName && styles.nameLong]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
            >
              {profile.display_name}
            </Text>

            <View style={styles.badgeRow}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {profile.profile_type === 'organization'
                    ? labels.organization
                    : labels.professional}
                </Text>
              </View>

              {profile.verified ? (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>{labels.verified}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{labels.location}</Text>
            <Text style={styles.sectionValue}>
              {getLocation(profile, labels.locationFallback)}
            </Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{labels.categories}</Text>

            <View style={styles.categoryList}>
              {categoryLabels.map((label) => (
                <View key={label} style={styles.categoryChip}>
                  <Text style={styles.categoryChipText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{labels.about}</Text>
            <Text style={styles.description}>
              {profile.short_description || labels.descriptionFallback}
            </Text>
          </View>

          {profile.contact_person ||
          profile.phone ||
          profile.email ||
          profile.website ||
          profile.address ||
          profile.facebook_url ||
          profile.instagram_url ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{labels.contact}</Text>

              {profile.contact_person ? (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>{labels.contactPerson}</Text>
                  <Text style={styles.contactValue}>{profile.contact_person}</Text>
                </View>
              ) : null}

              {profile.phone ? (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>{labels.phone}</Text>
                  <Text style={styles.contactValue}>{profile.phone}</Text>
                </View>
              ) : null}

              {profile.email ? (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>{labels.email}</Text>
                  <Text style={styles.contactValue}>{profile.email}</Text>
                </View>
              ) : null}

              {profile.website ? (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>{labels.website}</Text>
                  <Text style={styles.contactValue}>{profile.website}</Text>
                </View>
              ) : null}

              {profile.address ? (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>{labels.address}</Text>
                  <Text style={styles.contactValue}>{profile.address}</Text>
                </View>
              ) : null}

              {profile.facebook_url ? (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>{labels.facebook}</Text>
                  <Text style={styles.contactValue}>{profile.facebook_url}</Text>
                </View>
              ) : null}

              {profile.instagram_url ? (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>{labels.instagram}</Text>
                  <Text style={styles.contactValue}>{profile.instagram_url}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={styles.privacyCard}>
            <Text style={styles.privacyTitle}>{labels.privacyTitle}</Text>
            <Text style={styles.privacyText}>{labels.privacyText}</Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#080808',
  },
  content: {
    paddingBottom: 44,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
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
  identityCard: {
    marginHorizontal: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.34)',
    borderRadius: 20,
    backgroundColor: '#111111',
  },
  profileImage: {
    width: '100%',
    height: 210,
    borderRadius: 16,
    marginBottom: 18,
    backgroundColor: '#080808',
  },
  nameLong: {
    fontSize: 24,
    lineHeight: 29,
  },
  profileImageFallback: {
    height: 230,
    backgroundColor: '#080808',
  },
  kicker: {
    color: '#b99532',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  name: {
    color: '#f5f1e8',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    marginTop: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  typeBadge: {
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#0d0d0d',
  },
  typeBadgeText: {
    color: '#c9b36c',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  verifiedBadge: {
    borderWidth: 1,
    borderColor: '#c9a63d',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(201, 166, 61, 0.1)',
  },
  verifiedText: {
    color: '#d8b64b',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.22)',
    borderRadius: 18,
    backgroundColor: '#101010',
  },
  sectionTitle: {
    color: '#b99532',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  sectionValue: {
    color: '#eee8dc',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 9,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: '#0b0b0b',
  },
  categoryChipText: {
    color: '#d8c47d',
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    color: '#d6d0c4',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  contactRow: {
    marginTop: 12,
  },
  contactLabel: {
    color: '#9f8746',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  contactValue: {
    color: '#eee8dc',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  privacyCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
    borderRadius: 18,
    backgroundColor: '#0c0c0c',
  },
  privacyTitle: {
    color: '#9f8746',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  privacyText: {
    color: '#9f998f',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  stateCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    borderRadius: 18,
    backgroundColor: '#111111',
    alignItems: 'center',
  },
  stateText: {
    color: '#d6d0c4',
    fontSize: 14,
    lineHeight: 21,
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
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
