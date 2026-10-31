import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import GeoSelector from '../components/GeoSelector';
import USGProgressBar from '../components/USGProgressBar';
import { dogCopy } from '../dogs/dogCopy';
import {
  deleteDogPhoto,
  getDogPhotoUrl,
  uploadDogPhoto,
} from '../dogs/dogPhotoService';
import {
  createDog,
  deleteDog,
  getMyDogs,
  updateDog,
} from '../dogs/dogService';
import { useLanguage } from '../i18n/LanguageContext';
import { getCities, getCountries } from '../profile/geoService';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

const EMPTY_FORM = {
  name: '',
  sex: '',
  color: '',
  birthDay: '',
  birthMonth: '',
  birthYear: '',
  country: '',
  city: '',
  kennel: '',
  breeder: '',
  registrationNumber: '',
  description: '',
  communityVisible: false,
};

const photoCopy = {
  bg: {
    addPhoto: 'КАЧИ СНИМКА',
    changePhoto: 'СМЕНИ СНИМКА',
    removePhoto: 'ИЗТРИЙ СНИМКА',
    removePhotoConfirm: 'Сигурни ли сте, че искате да изтриете снимката на Корсо?',
    photoWorking: 'ОБРАБОТВА СЕ...',
    permission: 'Нужно е разрешение за достъп до снимките.',
    uploadError: 'Снимката на Корсо не можа да се качи.',
    uploaded: 'Снимката на Корсо е запазена.',
    removeError: 'Снимката на Корсо не можа да се изтрие.',
    removed: 'Снимката на Корсо е изтрита.',
  },
  en: {
    addPhoto: 'ADD PHOTO',
    changePhoto: 'CHANGE PHOTO',
    removePhoto: 'REMOVE PHOTO',
    removePhotoConfirm: 'Are you sure you want to remove the Corso photo?',
    photoWorking: 'WORKING...',
    permission: 'Photo library permission is required.',
    uploadError: 'The Corso photo could not be uploaded.',
    uploaded: 'The Corso photo was saved.',
    removeError: 'The Corso photo could not be removed.',
    removed: 'The Corso photo was removed.',
  },
  it: {
    addPhoto: 'AGGIUNGI FOTO',
    changePhoto: 'CAMBIA FOTO',
    removePhoto: 'RIMUOVI FOTO',
    removePhotoConfirm: 'Vuoi rimuovere la foto del Corso?',
    photoWorking: 'ELABORAZIONE...',
    permission: 'È necessaria l’autorizzazione per accedere alle foto.',
    uploadError: 'Impossibile caricare la foto del Corso.',
    uploaded: 'La foto del Corso è stata salvata.',
    removeError: 'Impossibile rimuovere la foto del Corso.',
    removed: 'La foto del Corso è stata rimossa.',
  },
};

const COLOR_OPTIONS = [
  'black',
  'gray',
  'fawn',
  'red',
  'blackBrindle',
  'grayBrindle',
  'brindle',
];

export default function MyCorsoScreen({ route, navigation }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const copy = dogCopy[language] ?? dogCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [dogs, setDogs] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [openFormSection, setOpenFormSection] = useState('basic');
  const [loading, setLoading] = useState(Boolean(user));
  const [saving, setSaving] = useState(false);
  const [photoBusyId, setPhotoBusyId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const loadDogs = useCallback(async () => {
    if (!user) {
      setDogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: loadError } = await getMyDogs(user.id);

    if (loadError) {
      setDogs([]);
      setError(copy.loadError);
      setLoading(false);
      return;
    }

    setDogs(data ?? []);
    setLoading(false);
  }, [copy.loadError, user]);

  const loadCountries = useCallback(async () => {
    if (countries.length || countriesLoading) {
      return;
    }

    setCountriesLoading(true);

    try {
      setCountries(await getCountries());
    } catch {
      setError(copy.geoLoadError);
    } finally {
      setCountriesLoading(false);
    }
  }, [copy.geoLoadError, countries.length, countriesLoading]);

  const loadCities = useCallback(
    async (country) => {
      if (!country) {
        setCities([]);
        return;
      }

      setCitiesLoading(true);

      try {
        setCities(await getCities(country));
      } catch {
        setCities([]);
        setError(copy.geoLoadError);
      } finally {
        setCitiesLoading(false);
      }
    },
    [copy.geoLoadError]
  );

  function openNewDog() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCities([]);
    setError('');
    setMessage('');
    setOpenFormSection('basic');
    setFormOpen(true);
  }

  useFocusEffect(
    useCallback(() => {
      loadDogs();

      if (route?.params?.openAddDog) {
        openNewDog();
        navigation.setParams({ openAddDog: false });
      }
    }, [loadDogs, navigation, route?.params?.openAddDog])
  );

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setError('');
    setMessage('');
  }

  function selectCountry(country) {
    setForm((current) => ({
      ...current,
      country,
      city: '',
    }));
    setError('');
    setMessage('');
    loadCities(country);
  }

  function openEditDog(dog) {
    const birth = splitBirthDate(dog.birth_date);

    setEditingId(dog.id);
    setForm({
      name: dog.name ?? '',
      sex: dog.sex ?? '',
      color: dog.color ?? '',
      birthDay: birth.day,
      birthMonth: birth.month,
      birthYear: birth.year,
      country: dog.country ?? '',
      city: dog.city ?? '',
      kennel: dog.kennel ?? '',
      breeder: dog.breeder ?? '',
      registrationNumber: dog.registration_number ?? '',
      description: dog.description ?? '',
      communityVisible: Boolean(dog.community_visible),
    });
    setError('');
    setMessage('');
    setOpenFormSection('basic');
    setFormOpen(true);

    if (dog.country) {
      loadCities(dog.country);
    }
  }

  function closeForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCities([]);
    setError('');
    setOpenFormSection('basic');
    setFormOpen(false);
  }

  function validate() {
    if (!form.name.trim() || !form.sex) {
      setOpenFormSection('basic');
      return copy.required;
    }

    const hasAnyDate =
      Boolean(form.birthDay) ||
      Boolean(form.birthMonth) ||
      Boolean(form.birthYear);

    if (
      hasAnyDate &&
      (!form.birthDay ||
        !form.birthMonth ||
        !form.birthYear ||
        !isValidDate(form.birthYear, form.birthMonth, form.birthDay))
    ) {
      setOpenFormSection('basic');
      return copy.dateInvalid;
    }

    if (form.description.trim().length > 400) {
      setOpenFormSection('about');
      return copy.descriptionInvalid;
    }

    return '';
  }

  async function handleSave() {
    if (!user || saving) {
      return;
    }

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    const payload = {
      ...form,
      birthDate:
        form.birthYear && form.birthMonth && form.birthDay
          ? `${form.birthYear}-${form.birthMonth}-${form.birthDay}`
          : '',
    };

    const result = editingId
      ? await updateDog(user.id, editingId, payload)
      : await createDog(user.id, payload);

    if (result.error) {
      setError(`${copy.saveError} ${result.error.message ?? ''}`.trim());
      setSaving(false);
      return;
    }

    setMessage(copy.saved);
    setSaving(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCities([]);
    setOpenFormSection('basic');
    setFormOpen(false);
    await loadDogs();
  }

  async function handlePhotoUpload(dog) {
    if (!user || photoBusyId) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError(photoCopy[language]?.permission ?? photoCopy.en.permission);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    setPhotoBusyId(dog.id);
    setError('');
    setMessage('');

    try {
      const uploadResult = await uploadDogPhoto(
        user.id,
        dog.id,
        asset.uri,
        asset.mimeType
      );

      if (uploadResult.error) {
        setError(photoCopy[language]?.uploadError ?? photoCopy.en.uploadError);
        return;
      }

      setMessage(photoCopy[language]?.uploaded ?? photoCopy.en.uploaded);
      await loadDogs();
    } finally {
      setPhotoBusyId(null);
    }
  }

  function handlePhotoDelete(dog) {
    const text = photoCopy[language] ?? photoCopy.en;

    Alert.alert(text.removePhoto, text.removePhotoConfirm, [
      {
        text: copy.no,
        style: 'cancel',
      },
      {
        text: text.removePhoto,
        style: 'destructive',
        onPress: async () => {
          if (!user || photoBusyId) {
            return;
          }

          setPhotoBusyId(dog.id);
          setError('');
          setMessage('');

          try {
            const result = await deleteDogPhoto(
              user.id,
              dog.id,
              dog.photo_path
            );

            if (result.error) {
              setError(text.removeError);
              return;
            }

            setMessage(text.removed);
            await loadDogs();
          } finally {
            setPhotoBusyId(null);
          }
        },
      },
    ]);
  }

  function handleDelete(dog) {
    Alert.alert(copy.confirmDelete, copy.confirmDeleteText, [
      {
        text: copy.no,
        style: 'cancel',
      },
      {
        text: copy.yesDelete,
        style: 'destructive',
        onPress: async () => {
          if (!user) {
            return;
          }

          const { error: deleteError } = await deleteDog(user.id, dog.id);

          if (deleteError) {
            setError(copy.deleteError);
            return;
          }

          setMessage(copy.deleted);
          await loadDogs();
        },
      },
    ]);
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={styles.note}>{copy.loadError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeroFrame}>
            <Image
              source={require('../../assets/my-corso-hero.png')}
              style={styles.sectionHeroImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.hero}>
            <Text style={styles.kicker}>{copy.kicker}</Text>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle}>{copy.subtitle}</Text>

            {!formOpen ? (
              <Pressable style={styles.primaryButton} onPress={openNewDog}>
                <Text style={styles.primaryButtonText}>{copy.addDog}</Text>
              </Pressable>
            ) : null}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {message ? <Text style={styles.success}>{message}</Text> : null}

          {formOpen ? (
            <DogForm
              copy={copy}
              colors={colors}
              styles={styles}
              form={form}
              editing={Boolean(editingId)}
              saving={saving}
              countries={countries}
              cities={cities}
              countriesLoading={countriesLoading}
              citiesLoading={citiesLoading}
              openSection={openFormSection}
              onToggleSection={(section) =>
                setOpenFormSection((current) =>
                  current === section ? null : section
                )
              }
              onChange={updateField}
              onCountry={selectCountry}
              onLoadCountries={loadCountries}
              onLoadCities={loadCities}
              onSave={handleSave}
              onCancel={closeForm}
            />
          ) : null}

          {loading ? (
            <USGProgressBar label={copy.loading} />
          ) : dogs.length ? (
            <View style={styles.list}>
              {dogs.map((dog) => (
                <View key={dog.id} style={styles.dogCardWrap}>
                  <DogPhotoPanel
                    dog={dog}
                    language={language}
                    styles={styles}
                    busy={photoBusyId === dog.id}
                    onUpload={() => handlePhotoUpload(dog)}
                    onDelete={() => handlePhotoDelete(dog)}
                  />
                  <DogCard
                    dog={dog}
                    copy={copy}
                    styles={styles}
                    onEdit={() => openEditDog(dog)}
                    onDelete={() => handleDelete(dog)}
                  />
                </View>
              ))}
            </View>
          ) : !error ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
              <Text style={styles.emptyText}>{copy.emptyText}</Text>
              {!formOpen ? (
                <Pressable style={styles.emptyButton} onPress={openNewDog}>
                  <Text style={styles.emptyButtonText}>{copy.addFirstDog}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DogForm({
  copy,
  colors,
  styles,
  form,
  editing,
  saving,
  countries,
  cities,
  countriesLoading,
  citiesLoading,
  openSection,
  onToggleSection,
  onChange,
  onCountry,
  onLoadCountries,
  onLoadCities,
  onSave,
  onCancel,
}) {
  const currentYear = new Date().getFullYear();
  const dayOptions = Array.from({ length: 31 }, (_, index) =>
    String(index + 1).padStart(2, '0')
  );
  const monthOptions = Array.from({ length: 12 }, (_, index) =>
    String(index + 1).padStart(2, '0')
  );
  const yearOptions = Array.from({ length: 30 }, (_, index) =>
    String(currentYear - index)
  );

  const colorOptions = COLOR_OPTIONS.map((value) => ({
    value,
    label: copy[value],
  }));

  return (
    <View style={styles.formCard}>
      <AccordionSection
        title={copy.basicSection}
        open={openSection === 'basic'}
        onPress={() => onToggleSection('basic')}
        styles={styles}
      >
        <Field
          label={copy.name}
          value={form.name}
          placeholder={copy.namePlaceholder}
          onChangeText={(value) => onChange('name', value)}
          styles={styles}
          colors={colors}
        />

        <Text style={styles.label}>{copy.sex}</Text>
        <View style={styles.sexRow}>
          <ChoiceButton
            label={copy.male}
            selected={form.sex === 'male'}
            onPress={() => onChange('sex', 'male')}
            styles={styles}
          />
          <ChoiceButton
            label={copy.female}
            selected={form.sex === 'female'}
            onPress={() => onChange('sex', 'female')}
            styles={styles}
          />
        </View>

        <OptionSelector
          label={copy.color}
          value={form.color}
          placeholder={copy.colorPlaceholder}
          options={colorOptions}
          onSelect={(value) => onChange('color', value)}
          copy={copy}
          styles={styles}
        />

        <Text style={styles.label}>{copy.birthDate}</Text>
        <View style={styles.dateRow}>
          <OptionSelector
            compact
            label={copy.day}
            value={form.birthDay}
            placeholder={copy.selectDay}
            options={dayOptions}
            onSelect={(value) => onChange('birthDay', value)}
            copy={copy}
            styles={styles}
          />
          <OptionSelector
            compact
            label={copy.month}
            value={form.birthMonth}
            placeholder={copy.selectMonth}
            options={monthOptions}
            onSelect={(value) => onChange('birthMonth', value)}
            copy={copy}
            styles={styles}
          />
          <OptionSelector
            compact
            label={copy.year}
            value={form.birthYear}
            placeholder={copy.selectYear}
            options={yearOptions}
            onSelect={(value) => onChange('birthYear', value)}
            copy={copy}
            styles={styles}
          />
        </View>
      </AccordionSection>

      <AccordionSection
        title={copy.originSection}
        open={openSection === 'origin'}
        onPress={() => onToggleSection('origin')}
        styles={styles}
      >
        <Field
          label={copy.kennel}
          value={form.kennel}
          placeholder={copy.kennelPlaceholder}
          onChangeText={(value) => onChange('kennel', value)}
          styles={styles}
          colors={colors}
        />

        <Field
          label={copy.breeder}
          value={form.breeder}
          placeholder={copy.breederPlaceholder}
          onChangeText={(value) => onChange('breeder', value)}
          styles={styles}
          colors={colors}
        />

        <Field
          label={copy.registration}
          value={form.registrationNumber}
          placeholder={copy.registrationPlaceholder}
          onChangeText={(value) => onChange('registrationNumber', value)}
          autoCapitalize="characters"
          styles={styles}
          colors={colors}
        />
      </AccordionSection>

      <AccordionSection
        title={copy.locationSection}
        open={openSection === 'location'}
        onPress={() => onToggleSection('location')}
        styles={styles}
      >
        <GeoSelector
          label={copy.country}
          value={form.country}
          placeholder={copy.countryPlaceholder}
          options={countries}
          loading={countriesLoading}
          searchPlaceholder={copy.searchCountry}
          emptyText={copy.noGeoResults}
          onPress={onLoadCountries}
          onSelect={onCountry}
        />

        <GeoSelector
          label={copy.city}
          value={form.city}
          placeholder={
            form.country ? copy.cityPlaceholder : copy.chooseCountryFirst
          }
          options={cities}
          loading={citiesLoading}
          disabled={!form.country}
          searchPlaceholder={copy.searchCity}
          emptyText={copy.noGeoResults}
          onPress={() => onLoadCities(form.country)}
          onSelect={(value) => onChange('city', value)}
        />
      </AccordionSection>

      <AccordionSection
        title={copy.aboutSection}
        open={openSection === 'about'}
        onPress={() => onToggleSection('about')}
        styles={styles}
      >
        <Field
          label={copy.description}
          value={form.description}
          placeholder={copy.descriptionPlaceholder}
          onChangeText={(value) => onChange('description', value)}
          multiline
          maxLength={400}
          styles={styles}
          colors={colors}
        />
      </AccordionSection>

      <AccordionSection
        title={copy.visibilitySection}
        open={openSection === 'visibility'}
        onPress={() => onToggleSection('visibility')}
        styles={styles}
      >
        <View style={styles.shareCard}>
          <View style={styles.shareText}>
            <Text style={styles.shareTitle}>{copy.shareTitle}</Text>
            <Text style={styles.shareDescription}>{copy.shareText}</Text>
          </View>
          <Switch
            value={form.communityVisible}
            onValueChange={(value) => onChange('communityVisible', value)}
            trackColor={{ false: colors.border, true: colors.goldSoft }}
            thumbColor={form.communityVisible ? colors.gold : colors.textMuted}
          />
        </View>
      </AccordionSection>

      <View style={styles.formActions}>
        <Pressable style={styles.secondaryButton} onPress={onCancel}>
          <Text style={styles.secondaryButtonText}>{copy.cancel}</Text>
        </Pressable>

        {saving ? (
          <View style={styles.savingWrap}>
            <USGProgressBar label={copy.saving} />
          </View>
        ) : (
          <Pressable style={styles.primaryButtonSmall} onPress={onSave}>
            <Text style={styles.primaryButtonText}>
              {editing ? copy.update : copy.save}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function AccordionSection({ title, open, onPress, styles, children }) {
  return (
    <View style={[styles.accordion, open && styles.accordionOpen]}>
      <Pressable style={styles.accordionHeader} onPress={onPress}>
        <Text style={styles.accordionTitle}>{title}</Text>
        <Text style={styles.accordionToggle}>{open ? '−' : '+'}</Text>
      </Pressable>
      {open ? <View style={styles.accordionContent}>{children}</View> : null}
    </View>
  );
}

function DogPhotoPanel({
  dog,
  language,
  styles,
  busy,
  onUpload,
  onDelete,
}) {
  const text = photoCopy[language] ?? photoCopy.en;
  const [photoUrl, setPhotoUrl] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPhoto() {
      if (!dog.photo_path) {
        setPhotoUrl('');
        return;
      }

      const { data } = await getDogPhotoUrl(dog.photo_path);

      if (active) {
        setPhotoUrl(data ?? '');
      }
    }

    loadPhoto();

    return () => {
      active = false;
    };
  }, [dog.photo_path]);

  return (
    <View style={styles.photoPanel}>
      <View style={styles.photoFrame}>
        {photoUrl ? (
          <Pressable style={styles.photoTapTarget} onPress={() => setPreviewOpen(true)}>
            <Image
              source={{ uri: photoUrl }}
              style={styles.dogPhoto}
              resizeMode="contain"
            />
          </Pressable>
        ) : (
          <View style={styles.photoFallback}>
            <Text style={styles.photoFallbackText}>
              {(dog.name || 'C').slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <Modal
        visible={previewOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewOpen(false)}
      >
        <Pressable
          style={styles.photoPreviewBackdrop}
          onPress={() => setPreviewOpen(false)}
        >
          <Pressable
            style={styles.photoPreviewClose}
            onPress={() => setPreviewOpen(false)}
          >
            <Text style={styles.photoPreviewCloseText}>×</Text>
          </Pressable>

          <Image
            source={{ uri: photoUrl }}
            style={styles.photoPreviewImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>

      <View style={styles.photoActions}>
        <Pressable
          style={styles.photoPrimaryButton}
          onPress={onUpload}
          disabled={busy}
        >
          <Text style={styles.photoPrimaryText}>
            {busy
              ? text.photoWorking
              : dog.photo_path
                ? text.changePhoto
                : text.addPhoto}
          </Text>
        </Pressable>

        {dog.photo_path ? (
          <Pressable
            style={styles.photoSecondaryButton}
            onPress={onDelete}
            disabled={busy}
          >
            <Text style={styles.photoSecondaryText}>{text.removePhoto}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function DogCard({ dog, copy, styles, onEdit, onDelete }) {
  const location = [dog.city, dog.country].filter(Boolean).join(', ');
  const colorLabel = dog.color ? copy[dog.color] : '';

  return (
    <View style={styles.dogCard}>
      <View style={styles.dogHeader}>
        <View style={styles.dogTitleWrap}>
          <Text style={styles.dogName}>{dog.name}</Text>
          <Text style={styles.dogMeta}>
            {dog.sex === 'male' ? copy.male : copy.female}
            {colorLabel ? ` · ${colorLabel}` : ''}
            {dog.birth_date ? ` · ${dog.birth_date}` : ''}
          </Text>
        </View>

        <View
          style={[
            styles.visibilityBadge,
            dog.community_visible && styles.visibilityBadgePublic,
          ]}
        >
          <Text style={styles.visibilityText}>
            {dog.community_visible ? copy.publicLabel : copy.privateLabel}
          </Text>
        </View>
      </View>

      {location ? <Text style={styles.dogInfo}>{location}</Text> : null}
      {dog.kennel ? <Text style={styles.dogInfo}>{dog.kennel}</Text> : null}
      {dog.registration_number ? (
        <Text style={styles.dogInfo}>{dog.registration_number}</Text>
      ) : null}
      {dog.description ? (
        <Text style={styles.dogDescription}>{dog.description}</Text>
      ) : null}

      <Text style={styles.ownerOnly}>{copy.ownerOnly}</Text>

      <View style={styles.cardActions}>
        <Pressable style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>{copy.editDog}</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>{copy.deleteDog}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function OptionSelector({
  label,
  value,
  placeholder,
  options,
  onSelect,
  copy,
  styles,
  compact = false,
}) {
  const [open, setOpen] = useState(false);

  const normalized = options.map((option) =>
    typeof option === 'string'
      ? { value: option, label: option }
      : option
  );

  const selected = normalized.find((option) => option.value === value);

  return (
    <View style={compact ? styles.compactSelector : styles.selectorBlock}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.selectorButton} onPress={() => setOpen(true)}>
        <Text
          numberOfLines={1}
          style={[
            styles.selectorText,
            !selected && styles.selectorPlaceholder,
          ]}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Text style={styles.selectorArrow}>⌄</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView style={styles.modalList}>
              {normalized.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.modalOption,
                    value === option.value && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      value === option.value && styles.modalOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={styles.modalClose}
              onPress={() => setOpen(false)}
            >
              <Text style={styles.modalCloseText}>{copy.close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ChoiceButton({ label, selected, onPress, styles }) {
  return (
    <Pressable
      style={[styles.choiceButton, selected && styles.choiceButtonSelected]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.choiceButtonText,
          selected && styles.choiceButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChangeText,
  multiline = false,
  maxLength,
  autoCapitalize = 'sentences',
  styles,
  colors,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onChangeText={onChangeText}
        multiline={multiline}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

function splitBirthDate(value) {
  if (!value) {
    return { year: '', month: '', day: '' };
  }

  const [year = '', month = '', day = ''] = value.split('-');
  return { year, month, day };
}

function isValidDate(year, month, day) {
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: 40 },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    sectionHeroFrame: {
      width: '100%',
      aspectRatio: 1.5,
      marginBottom: 14,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    sectionHeroImage: {
      width: '100%',
      height: '100%',
    },
    hero: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 18,
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 2,
    },
    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '800',
      marginTop: 5,
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 6,
      marginBottom: 16,
    },
    primaryButton: {
      alignSelf: 'flex-start',
      borderRadius: radius.md,
      backgroundColor: colors.gold,
      paddingHorizontal: 16,
      paddingVertical: 11,
    },
    primaryButtonSmall: {
      minWidth: 150,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: colors.gold,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    primaryButtonText: {
      color: colors.background,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    formCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surface,
      padding: 10,
      marginTop: 12,
    },
    accordion: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      marginBottom: 8,
      overflow: 'hidden',
    },
    accordionOpen: {
      borderColor: colors.gold,
      backgroundColor: colors.surfaceSoft,
    },
    accordionHeader: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
    },
    accordionTitle: {
      flex: 1,
      color: colors.text,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    accordionToggle: {
      color: colors.gold,
      fontSize: 22,
      marginLeft: 10,
    },
    accordionContent: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: 14,
      paddingBottom: 4,
    },
    field: { marginBottom: 14 },
    label: {
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: '700',
      marginBottom: 7,
    },
    input: {
      minHeight: 46,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      color: colors.text,
      fontSize: 14,
      paddingHorizontal: 13,
      paddingVertical: 10,
    },
    inputMultiline: { minHeight: 100, textAlignVertical: 'top' },
    sexRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    choiceButton: {
      flex: 1,
      alignItems: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      paddingVertical: 11,
    },
    choiceButtonSelected: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    choiceButtonText: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: '700',
    },
    choiceButtonTextSelected: { color: colors.gold },
    selectorBlock: { marginBottom: 14 },
    compactSelector: { flex: 1, minWidth: 0 },
    selectorButton: {
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      paddingHorizontal: 12,
    },
    selectorText: {
      flex: 1,
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    selectorPlaceholder: { color: colors.textMuted, fontWeight: '500' },
    selectorArrow: { color: colors.gold, fontSize: 18, marginLeft: 6 },
    dateRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'center',
      padding: 22,
      backgroundColor: 'rgba(0,0,0,0.72)',
    },
    modalCard: {
      maxHeight: '72%',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surface,
      padding: 16,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 12,
    },
    modalList: { flexGrow: 0 },
    modalOption: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 13,
      paddingHorizontal: 4,
    },
    modalOptionSelected: { backgroundColor: colors.activeSurface },
    modalOptionText: { color: colors.textSoft, fontSize: 14 },
    modalOptionTextSelected: { color: colors.gold, fontWeight: '800' },
    modalClose: {
      alignItems: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 11,
      marginTop: 14,
    },
    modalCloseText: {
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: '800',
    },
    shareCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 13,
      marginBottom: 10,
    },
    shareText: { flex: 1, paddingRight: 12 },
    shareTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
    shareDescription: {
      color: colors.textSoft,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 4,
    },
    formActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginTop: 8,
      paddingHorizontal: 4,
      paddingBottom: 2,
    },
    secondaryButton: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    secondaryButtonText: {
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: '800',
    },
    savingWrap: { flex: 1 },
    list: { marginTop: 12, gap: 12 },
    dogCardWrap: {
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    photoPanel: {
      borderWidth: 1,
      borderColor: colors.border,
      borderBottomWidth: 0,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      backgroundColor: colors.surface,
      padding: 12,
    },
    photoFrame: {
      width: '100%',
      aspectRatio: 16 / 10,
      borderRadius: radius.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    photoTapTarget: {
      width: '100%',
      height: '100%',
    },
    dogPhoto: {
      width: '100%',
      height: '100%',
    },
    photoPreviewBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.96)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 18,
    },
    photoPreviewImage: {
      width: '100%',
      height: '82%',
    },
    photoPreviewClose: {
      position: 'absolute',
      top: 48,
      right: 22,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surface,
      zIndex: 2,
    },
    photoPreviewCloseText: {
      color: colors.gold,
      fontSize: 30,
      lineHeight: 32,
    },
    photoFallback: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.activeSurface,
    },
    photoFallbackText: {
      color: colors.gold,
      fontSize: 42,
      fontWeight: '900',
    },
    photoActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 10,
    },
    photoPrimaryButton: {
      flex: 1,
      minHeight: 38,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.gold,
      paddingHorizontal: 10,
    },
    photoPrimaryText: {
      color: colors.background,
      fontSize: 9,
      fontWeight: '900',
    },
    photoSecondaryButton: {
      flex: 1,
      minHeight: 38,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
    },
    photoSecondaryText: {
      color: colors.textSoft,
      fontSize: 9,
      fontWeight: '800',
    },
    dogCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 16,
    },
    dogHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
    },
    dogTitleWrap: { flex: 1 },
    dogName: { color: colors.text, fontSize: 21, fontWeight: '800' },
    dogMeta: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '700',
      marginTop: 4,
    },
    visibilityBadge: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 9,
      paddingVertical: 5,
    },
    visibilityBadgePublic: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    visibilityText: {
      color: colors.textSoft,
      fontSize: 9,
      fontWeight: '800',
    },
    dogInfo: { color: colors.textSoft, fontSize: 11, marginTop: 8 },
    dogDescription: {
      color: colors.text,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 12,
    },
    ownerOnly: { color: colors.textMuted, fontSize: 9, marginTop: 12 },
    cardActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
    editButton: {
      flex: 1,
      alignItems: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.gold,
      paddingVertical: 10,
    },
    editButtonText: { color: colors.gold, fontSize: 10, fontWeight: '900' },
    deleteButton: {
      flex: 1,
      alignItems: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.danger || '#b85c5c',
      paddingVertical: 10,
    },
    deleteButtonText: {
      color: colors.danger || '#b85c5c',
      fontSize: 10,
      fontWeight: '900',
    },
    emptyCard: {
      alignItems: 'center',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 24,
      marginTop: 12,
    },
    emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
    emptyText: {
      color: colors.textSoft,
      fontSize: 11,
      marginTop: 6,
      textAlign: 'center',
    },
    emptyButton: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.gold,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginTop: 16,
    },
    emptyButtonText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
    },
    error: {
      color: colors.danger || '#b85c5c',
      fontSize: 11,
      lineHeight: 16,
      marginTop: 12,
    },
    success: {
      color: colors.gold,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 12,
    },
    note: { color: colors.textSoft, fontSize: 12, textAlign: 'center' },
  });
}

