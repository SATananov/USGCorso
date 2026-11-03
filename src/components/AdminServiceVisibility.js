import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useLanguage } from '../i18n/LanguageContext';
import {
  getAdminProfessionalProfileFieldVisibility,
  getAdminProfessionalProfilesVisibility,
  setAdminProfessionalProfileFieldVisibility,
} from '../services/professionalProfileService';
import { getServiceLabel, serviceCategoryGroups } from '../services/serviceCategories';
import { useTheme } from '../theme/ThemeContext';

const copy = {
  bg: {
    title: 'ПУБЛИЧНОСТ НА ПРОФИЛИТЕ',
    subtitle:
      'Избери профил и реши какво могат да виждат посетителите.',
    settings: 'НАСТРОЙКИ НА ПУБЛИЧНОСТТА',
    closeSettings: 'ЗАТВОРИ НАСТРОЙКИТЕ',
    image: 'Профилна снимка',
    description: 'Описание',
    location: 'Местоположение',
    contactPerson: 'Лице за контакт',
    phone: 'Телефон',
    email: 'Email',
    website: 'Уебсайт',
    address: 'Точен адрес',
    facebook: 'Facebook',
    instagram: 'Instagram',
    public: 'ПУБЛИЧНО',
    private: 'СКРИТО',
    show: 'ПОКАЖИ',
    hide: 'СКРИЙ',
    noImage: 'Няма качена снимка.',
    noProfiles: 'Няма професионални или организационни профили.',
    loadError: 'Профилите не можаха да бъдат заредени.',
    saveError: 'Промяната не можа да бъде запазена.',
    professional: 'ПРОФЕСИОНАЛИСТ',
    organization: 'ОРГАНИЗАЦИЯ',
    coreInfo:
      'Името, типът и категориите са основна публична идентичност и не се скриват.',
  },
  en: {
    title: 'PROFILE VISIBILITY',
    subtitle:
      'Choose a profile and decide what visitors are allowed to see.',
    settings: 'VISIBILITY SETTINGS',
    closeSettings: 'CLOSE SETTINGS',
    image: 'Profile image',
    description: 'Description',
    location: 'Location',
    contactPerson: 'Contact person',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    address: 'Exact address',
    facebook: 'Facebook',
    instagram: 'Instagram',
    public: 'PUBLIC',
    private: 'HIDDEN',
    show: 'SHOW',
    hide: 'HIDE',
    noImage: 'No image has been uploaded.',
    noProfiles: 'There are no professional or organization profiles.',
    loadError: 'Profiles could not be loaded.',
    saveError: 'The change could not be saved.',
    professional: 'PROFESSIONAL',
    organization: 'ORGANIZATION',
    coreInfo:
      'Name, profile type and categories are core public identity and remain visible.',
  },
  it: {
    title: 'VISIBILITÀ DEI PROFILI',
    subtitle:
      'Scegli un profilo e decidi cosa possono vedere i visitatori.',
    settings: 'IMPOSTAZIONI VISIBILITÀ',
    closeSettings: 'CHIUDI IMPOSTAZIONI',
    image: 'Immagine profilo',
    description: 'Descrizione',
    location: 'Posizione',
    contactPerson: 'Referente',
    phone: 'Telefono',
    email: 'Email',
    website: 'Sito web',
    address: 'Indirizzo esatto',
    facebook: 'Facebook',
    instagram: 'Instagram',
    public: 'PUBBLICO',
    private: 'NASCOSTO',
    show: 'MOSTRA',
    hide: 'NASCONDI',
    noImage: 'Nessuna immagine caricata.',
    noProfiles: 'Non ci sono profili professionali o organizzativi.',
    loadError: 'Impossibile caricare i profili.',
    saveError: 'Impossibile salvare la modifica.',
    professional: 'PROFESSIONISTA',
    organization: 'ORGANIZZAZIONE',
    coreInfo:
      'Nome, tipo di profilo e categorie sono identità pubblica di base e restano visibili.',
  },
};

const managedFields = [
  { key: 'profile_image_url', labelKey: 'image', requiresValue: 'profile_image_url' },
  { key: 'short_description', labelKey: 'description', requiresValue: 'short_description' },
  { key: 'location', labelKey: 'location' },
  { key: 'contact_person', labelKey: 'contactPerson', requiresValue: 'contact_person' },
  { key: 'phone', labelKey: 'phone', requiresValue: 'phone' },
  { key: 'email', labelKey: 'email', requiresValue: 'email' },
  { key: 'website', labelKey: 'website', requiresValue: 'website' },
  { key: 'address', labelKey: 'address', requiresValue: 'address' },
  { key: 'facebook_url', labelKey: 'facebook', requiresValue: 'facebook_url' },
  { key: 'instagram_url', labelKey: 'instagram', requiresValue: 'instagram_url' },
];

function categoryLabel(categoryKey, language) {
  for (const group of serviceCategoryGroups) {
    const item = group.items.find((entry) => entry.key === categoryKey);

    if (item) {
      return getServiceLabel(item, language);
    }
  }

  return categoryKey;
}

function normalizeVisibility(rows) {
  const map = {};

  for (const row of rows || []) {
    map[row.field_key] = Boolean(row.is_public);
  }

  return map;
}

export default function AdminServiceVisibility({ refreshToken = 0 }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const labels = copy[language] || copy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [profiles, setProfiles] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [visibilityByProfile, setVisibilityByProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState(null);
  const [errorText, setErrorText] = useState('');

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setErrorText('');

    const { data, error } = await getAdminProfessionalProfilesVisibility();

    if (error) {
      setProfiles([]);
      setErrorText(labels.loadError);
      setLoading(false);
      return;
    }

    setProfiles(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [labels.loadError]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles, refreshToken]);

  async function openSettings(profileId) {
    if (expandedId === profileId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(profileId);

    if (visibilityByProfile[profileId]) {
      return;
    }

    const { data, error } =
      await getAdminProfessionalProfileFieldVisibility(profileId);

    if (error) {
      setErrorText(labels.loadError);
      return;
    }

    setVisibilityByProfile((current) => ({
      ...current,
      [profileId]: normalizeVisibility(data),
    }));
  }

  async function toggleField(profile, fieldKey) {
    const busyId = `${profile.id}:${fieldKey}`;

    if (busyKey) {
      return;
    }

    const current =
      visibilityByProfile[profile.id]?.[fieldKey] ??
      (fieldKey === 'profile_image_url'
        ? Boolean(profile.profile_image_public)
        : false);

    const nextValue = !current;

    setBusyKey(busyId);
    setErrorText('');

    const fieldKeys =
      fieldKey === 'location'
        ? ['country', 'region', 'city']
        : [fieldKey];

    for (const targetFieldKey of fieldKeys) {
      const { error } = await setAdminProfessionalProfileFieldVisibility(
        profile.id,
        targetFieldKey,
        nextValue
      );

      if (error) {
        setErrorText(labels.saveError);
        setBusyKey(null);
        return;
      }
    }

    setVisibilityByProfile((currentMap) => ({
      ...currentMap,
      [profile.id]: {
        ...(currentMap[profile.id] || {}),
        ...(fieldKey === 'location'
          ? {
              country: nextValue,
              region: nextValue,
              city: nextValue,
              location: nextValue,
            }
          : { [fieldKey]: nextValue }),
      },
    }));

    setProfiles((currentProfiles) =>
      currentProfiles.map((item) =>
        item.id === profile.id && fieldKey === 'profile_image_url'
          ? { ...item, profile_image_public: nextValue }
          : item
      )
    );

    setBusyKey(null);
  }

  function fieldIsPublic(profile, fieldKey) {
    const visibility = visibilityByProfile[profile.id] || {};

    if (fieldKey === 'location') {
      return Boolean(
        visibility.location ??
          (visibility.country && visibility.region && visibility.city)
      );
    }

    if (fieldKey === 'profile_image_url') {
      return Boolean(
        visibility.profile_image_url ?? profile.profile_image_public
      );
    }

    return Boolean(visibility[fieldKey]);
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{labels.title}</Text>
      <Text style={styles.subtitle}>{labels.subtitle}</Text>

      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      ) : profiles.length === 0 ? (
        <Text style={styles.empty}>{labels.noProfiles}</Text>
      ) : (
        profiles.map((profile) => {
          const expanded = expandedId === profile.id;

          return (
            <View key={profile.id} style={styles.card}>
              <View style={styles.header}>
                <View style={styles.identity}>
                  <Text style={styles.name}>{profile.display_name}</Text>
                  <Text style={styles.type}>
                    {profile.profile_type === 'organization'
                      ? labels.organization
                      : labels.professional}
                  </Text>
                </View>
              </View>

              <View style={styles.categories}>
                {(profile.categories || []).map((key) => (
                  <Text key={key} style={styles.category}>
                    {categoryLabel(key, language)}
                  </Text>
                ))}
              </View>

              {profile.profile_image_url ? (
                <Image
                  source={{ uri: profile.profile_image_url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.noImage}>
                  <Text style={styles.noImageText}>{labels.noImage}</Text>
                </View>
              )}

              <Pressable
                onPress={() => openSettings(profile.id)}
                style={styles.settingsButton}
              >
                <Text style={styles.settingsButtonText}>
                  {expanded ? labels.closeSettings : labels.settings}
                </Text>
              </Pressable>

              {expanded ? (
                <View style={styles.settingsPanel}>
                  <Text style={styles.coreInfo}>{labels.coreInfo}</Text>

                  {managedFields.map((field) => {
                    const hasRequiredValue = field.requiresValue
                      ? Boolean(profile[field.requiresValue])
                      : true;
                    const isPublic = fieldIsPublic(profile, field.key);
                    const currentBusyKey = `${profile.id}:${field.key}`;
                    const isBusy = busyKey === currentBusyKey;

                    return (
                      <View key={field.key} style={styles.visibilityRow}>
                        <View style={styles.visibilityText}>
                          <Text style={styles.fieldLabel}>
                            {labels[field.labelKey]}
                          </Text>
                          <Text
                            style={[
                              styles.stateText,
                              isPublic && styles.stateTextPublic,
                            ]}
                          >
                            {isPublic ? labels.public : labels.private}
                          </Text>
                        </View>

                        <Pressable
                          disabled={!hasRequiredValue || isBusy}
                          onPress={() => toggleField(profile, field.key)}
                          style={[
                            styles.toggleButton,
                            isPublic && styles.toggleButtonPublic,
                            (!hasRequiredValue || isBusy) &&
                              styles.buttonDisabled,
                          ]}
                        >
                          {isBusy ? (
                            <ActivityIndicator />
                          ) : (
                            <Text
                              style={[
                                styles.toggleButtonText,
                                isPublic && styles.toggleButtonTextPublic,
                              ]}
                            >
                              {isPublic ? labels.hide : labels.show}
                            </Text>
                          )}
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    root: {
      gap: 12,
    },
    title: {
      color: colors.gold,
      fontSize: 13,
      fontWeight: '900',
      letterSpacing: 0.8,
      textAlign: 'center',
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
    },
    loading: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    empty: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      paddingVertical: 14,
    },
    error: {
      color: colors.error || '#d76c6c',
      fontSize: 11,
      lineHeight: 17,
      textAlign: 'center',
    },
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: colors.surfaceSoft,
      padding: 14,
      gap: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
    },
    identity: {
      flex: 1,
    },
    name: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
      lineHeight: 20,
    },
    type: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.7,
      marginTop: 4,
    },
    categories: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    category: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '700',
    },
    image: {
      width: '100%',
      height: 170,
      borderRadius: 12,
      backgroundColor: colors.background,
    },
    noImage: {
      minHeight: 90,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      padding: 14,
    },
    noImageText: {
      color: colors.textMuted,
      fontSize: 11,
      textAlign: 'center',
    },
    settingsButton: {
      minHeight: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    settingsButtonText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.6,
      textAlign: 'center',
    },
    settingsPanel: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
      gap: 10,
    },
    coreInfo: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 16,
    },
    visibilityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.background,
      padding: 12,
    },
    visibilityText: {
      flex: 1,
      gap: 4,
    },
    fieldLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '800',
    },
    stateText: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    stateTextPublic: {
      color: colors.gold,
    },
    toggleButton: {
      minWidth: 82,
      minHeight: 38,
      borderRadius: 10,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    toggleButtonPublic: {
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surface,
    },
    toggleButtonText: {
      color: colors.background,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    toggleButtonTextPublic: {
      color: colors.gold,
    },
    buttonDisabled: {
      opacity: 0.42,
    },
  });
}
