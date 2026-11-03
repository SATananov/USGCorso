import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import {
  getMyProfessionalProfile,
  saveMyProfessionalProfile,
} from '../services/professionalProfileService';
import { getServiceLabel, serviceCategoryGroups } from '../services/serviceCategories';
import { useTheme } from '../theme/ThemeContext';

const copy = {
  bg: {
    title: 'МОЯТ ПРОФЕСИОНАЛЕН ПРОФИЛ',
    subtitle:
      'Попълни информацията си. Новите или променени полета остават скрити, докато администратор не ги разреши за публично показване.',
    displayName: 'Име на профила',
    type: 'Тип',
    categories: 'Категории',
    professional: 'Професионалист',
    organization: 'Организация',
    description: 'Описание',
    country: 'Държава',
    region: 'Област / регион',
    city: 'Град',
    contactPerson: 'Лице за контакт',
    phone: 'Телефон',
    email: 'Email',
    website: 'Website',
    address: 'Точен адрес',
    facebook: 'Facebook',
    instagram: 'Instagram',
    save: 'ЗАПАЗИ ПРОФИЛА',
    saving: 'ЗАПАЗВАНЕ...',
    saved:
      'Профилът е запазен. Управляемите полета са скрити до ново разрешение от администратор.',
    loadError: 'Профилът не можа да бъде зареден.',
    saveError: 'Профилът не можа да бъде запазен.',
    nameRequired: 'Въведи име на профила.',
    noAccess:
      'Няма одобрен професионален или организационен достъп за този акаунт.',
    back: 'НАЗАД',
    privateNote: 'PRIVATE ПО ПОДРАЗБИРАНЕ',
  },
  en: {
    title: 'MY PROFESSIONAL PROFILE',
    subtitle:
      'Complete your information. New or changed fields stay hidden until an administrator approves them for public display.',
    displayName: 'Profile name',
    type: 'Type',
    categories: 'Categories',
    professional: 'Professional',
    organization: 'Organization',
    description: 'Description',
    country: 'Country',
    region: 'Region',
    city: 'City',
    contactPerson: 'Contact person',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    address: 'Exact address',
    facebook: 'Facebook',
    instagram: 'Instagram',
    save: 'SAVE PROFILE',
    saving: 'SAVING...',
    saved:
      'Profile saved. Managed fields are hidden until an administrator approves them again.',
    loadError: 'The profile could not be loaded.',
    saveError: 'The profile could not be saved.',
    nameRequired: 'Enter a profile name.',
    noAccess:
      'This account does not have approved professional or organization access.',
    back: 'BACK',
    privateNote: 'PRIVATE BY DEFAULT',
  },
  it: {
    title: 'IL MIO PROFILO PROFESSIONALE',
    subtitle:
      "Completa le informazioni. I campi nuovi o modificati restano nascosti finché un amministratore non ne approva la visualizzazione pubblica.",
    displayName: 'Nome del profilo',
    type: 'Tipo',
    categories: 'Categorie',
    professional: 'Professionista',
    organization: 'Organizzazione',
    description: 'Descrizione',
    country: 'Paese',
    region: 'Regione',
    city: 'Città',
    contactPerson: 'Referente',
    phone: 'Telefono',
    email: 'Email',
    website: 'Sito web',
    address: 'Indirizzo esatto',
    facebook: 'Facebook',
    instagram: 'Instagram',
    save: 'SALVA PROFILO',
    saving: 'SALVATAGGIO...',
    saved:
      "Profilo salvato. I campi gestiti restano nascosti finché l'amministratore non li approva di nuovo.",
    loadError: 'Impossibile caricare il profilo.',
    saveError: 'Impossibile salvare il profilo.',
    nameRequired: 'Inserisci un nome per il profilo.',
    noAccess:
      "Questo account non dispone di accesso professionale o organizzativo approvato.",
    back: 'INDIETRO',
    privateNote: 'PRIVATO PER IMPOSTAZIONE PREDEFINITA',
  },
};

const initialForm = {
  display_name: '',
  short_description: '',
  country: '',
  region: '',
  city: '',
  contact_person: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  facebook_url: '',
  instagram_url: '',
};

function categoryLabel(categoryKey, language) {
  for (const group of serviceCategoryGroups) {
    const item = group.items.find((entry) => entry.key === categoryKey);

    if (item) {
      return getServiceLabel(item, language);
    }
  }

  return categoryKey;
}

function normalizeValue(value) {
  const text = String(value ?? '').trim();
  return text || null;
}

export default function MyProfessionalProfileScreen({ navigation }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const labels = copy[language] ?? copy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErrorText('');
    setMessage('');

    const { data, error } = await getMyProfessionalProfile();

    if (error) {
      setProfile(null);
      setErrorText(labels.loadError);
      setLoading(false);
      return;
    }

    const result = Array.isArray(data) ? data[0] ?? null : data ?? null;
    setProfile(result);

    if (result) {
      setForm({
        display_name: result.display_name ?? '',
        short_description: result.short_description ?? '',
        country: result.country ?? '',
        region: result.region ?? '',
        city: result.city ?? '',
        contact_person: result.contact_person ?? '',
        phone: result.phone ?? '',
        email: result.email ?? '',
        website: result.website ?? '',
        address: result.address ?? '',
        facebook_url: result.facebook_url ?? '',
        instagram_url: result.instagram_url ?? '',
      });
    } else {
      setForm(initialForm);
    }

    setLoading(false);
  }, [labels.loadError]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setErrorText('');
    setMessage('');
  }

  async function save() {
    const displayName = form.display_name.trim();

    if (!displayName) {
      setErrorText(labels.nameRequired);
      return;
    }

    setSaving(true);
    setErrorText('');
    setMessage('');

    const { data, error } = await saveMyProfessionalProfile({
      displayName,
      shortDescription: normalizeValue(form.short_description),
      country: normalizeValue(form.country),
      region: normalizeValue(form.region),
      city: normalizeValue(form.city),
      contactPerson: normalizeValue(form.contact_person),
      phone: normalizeValue(form.phone),
      email: normalizeValue(form.email),
      website: normalizeValue(form.website),
      address: normalizeValue(form.address),
      facebookUrl: normalizeValue(form.facebook_url),
      instagramUrl: normalizeValue(form.instagram_url),
    });

    if (error) {
      setErrorText(
        error.message?.includes('professional access required')
          ? labels.noAccess
          : labels.saveError
      );
      setSaving(false);
      return;
    }

    const result = Array.isArray(data) ? data[0] ?? null : data ?? null;

    if (result) {
      setProfile(result);
    }

    setMessage(labels.saved);
    setSaving(false);
    await load();
    setMessage(labels.saved);
  }

  const categories = profile?.categories ?? [];
  const profileType = profile?.profile_type;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ {labels.back}</Text>
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.kicker}>USG CORSO</Text>
          <Text style={styles.title}>{labels.title}</Text>
          <Text style={styles.subtitle}>{labels.subtitle}</Text>
          <Text style={styles.privateNote}>{labels.privateNote}</Text>
        </View>

        {profileType ? (
          <View style={styles.identityCard}>
            <View style={styles.identityRow}>
              <Text style={styles.identityLabel}>{labels.type}</Text>
              <Text style={styles.identityValue}>
                {profileType === 'organization'
                  ? labels.organization
                  : labels.professional}
              </Text>
            </View>

            <Text style={styles.identityLabel}>{labels.categories}</Text>
            <View style={styles.categories}>
              {categories.map((key) => (
                <View key={key} style={styles.categoryChip}>
                  <Text style={styles.categoryText}>
                    {categoryLabel(key, language)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.formCard}>
          <Field
            label={labels.displayName}
            value={form.display_name}
            onChangeText={(value) => updateField('display_name', value)}
            styles={styles}
          />

          <Field
            label={labels.description}
            value={form.short_description}
            onChangeText={(value) => updateField('short_description', value)}
            styles={styles}
            multiline
          />

          <Field
            label={labels.country}
            value={form.country}
            onChangeText={(value) => updateField('country', value)}
            styles={styles}
          />

          <Field
            label={labels.region}
            value={form.region}
            onChangeText={(value) => updateField('region', value)}
            styles={styles}
          />

          <Field
            label={labels.city}
            value={form.city}
            onChangeText={(value) => updateField('city', value)}
            styles={styles}
          />

          <Field
            label={labels.contactPerson}
            value={form.contact_person}
            onChangeText={(value) => updateField('contact_person', value)}
            styles={styles}
          />

          <Field
            label={labels.phone}
            value={form.phone}
            onChangeText={(value) => updateField('phone', value)}
            styles={styles}
            keyboardType="phone-pad"
          />

          <Field
            label={labels.email}
            value={form.email}
            onChangeText={(value) => updateField('email', value)}
            styles={styles}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Field
            label={labels.website}
            value={form.website}
            onChangeText={(value) => updateField('website', value)}
            styles={styles}
            autoCapitalize="none"
          />

          <Field
            label={labels.address}
            value={form.address}
            onChangeText={(value) => updateField('address', value)}
            styles={styles}
          />

          <Field
            label={labels.facebook}
            value={form.facebook_url}
            onChangeText={(value) => updateField('facebook_url', value)}
            styles={styles}
            autoCapitalize="none"
          />

          <Field
            label={labels.instagram}
            value={form.instagram_url}
            onChangeText={(value) => updateField('instagram_url', value)}
            styles={styles}
            autoCapitalize="none"
          />

          {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Pressable
            disabled={saving}
            style={[styles.saveButton, saving && styles.disabled]}
            onPress={save}
          >
            <Text style={styles.saveText}>
              {saving ? labels.saving : labels.save}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  styles,
  multiline = false,
  keyboardType,
  autoCapitalize,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, multiline && styles.inputMultiline]}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor="#777168"
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: 16,
      paddingBottom: 44,
      gap: 14,
    },
    backButton: {
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    backText: {
      color: colors.gold,
      fontSize: 13,
      fontWeight: '900',
    },
    hero: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      backgroundColor: colors.surface,
      padding: 20,
      alignItems: 'center',
      gap: 10,
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 3,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '900',
      textAlign: 'center',
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
    },
    privateNote: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.8,
    },
    identityCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      backgroundColor: colors.surface,
      padding: 16,
      gap: 10,
    },
    identityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    identityLabel: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    identityValue: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '900',
    },
    categories: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7,
    },
    categoryChip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 9,
      paddingVertical: 6,
    },
    categoryText: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '700',
    },
    formCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      backgroundColor: colors.surface,
      padding: 16,
      gap: 14,
    },
    field: {
      gap: 6,
    },
    fieldLabel: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    input: {
      minHeight: 46,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.background,
      color: colors.text,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 13,
    },
    inputMultiline: {
      minHeight: 112,
    },
    error: {
      color: colors.error || '#d76c6c',
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
    },
    message: {
      color: colors.goldSoft,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
    },
    saveButton: {
      minHeight: 48,
      borderRadius: 13,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    saveText: {
      color: colors.background,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    disabled: {
      opacity: 0.45,
    },
  });
}
