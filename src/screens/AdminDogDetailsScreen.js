import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  deleteAdminDog,
  deleteAdminDogPhoto,
  getAdminDogDetails,
  updateAdminDog,
} from '../admin/adminDogService';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import USGProgressBar from '../components/USGProgressBar';

const copy = {
  bg: {
    title: 'Управление на куче',
    profile: 'ПРОФИЛ НА КУЧЕТО',
    owner: 'СОБСТВЕНИК',
    photo: 'ОСНОВНА СНИМКА',
    edit: 'РЕДАКТИРАЙ',
    save: 'ЗАПАЗИ',
    cancel: 'ОТКАЗ',
    removePhoto: 'ИЗТРИЙ СНИМКАТА',
    removeDog: 'ИЗТРИЙ ПРОФИЛА ОКОНЧАТЕЛНО',
    photoTitle: 'Изтриване на снимка',
    photoMessage: 'Основната снимка ще бъде премахната окончателно. Продължаваме ли?',
    dogTitle: 'Окончателно изтриване',
    dogMessage: 'Профилът на кучето и снимката му ще бъдат премахнати окончателно. Продължаваме ли?',
    loadError: 'Профилът на кучето не можа да се зареди.',
    actionError: 'Действието не можа да се изпълни.',
    name: 'Име',
    sex: 'Пол',
    color: 'Цвят',
    birthDate: 'Дата на раждане',
    country: 'Държава',
    city: 'Град',
    kennel: 'Развъдник',
    breeder: 'Развъдчик',
    registrationNumber: 'Регистрационен номер',
    description: 'Описание',
    communityVisible: 'Публично в Общността',
    created: 'Създадено',
    updated: 'Обновено',
    user: 'Потребител',
    noPhoto: 'Няма основна снимка.',
  },
  en: {
    title: 'Dog Management',
    profile: 'DOG PROFILE',
    owner: 'OWNER',
    photo: 'MAIN PHOTO',
    edit: 'EDIT',
    save: 'SAVE',
    cancel: 'CANCEL',
    removePhoto: 'DELETE PHOTO',
    removeDog: 'DELETE PROFILE PERMANENTLY',
    photoTitle: 'Delete photo',
    photoMessage: 'The main photo will be permanently removed. Continue?',
    dogTitle: 'Permanent deletion',
    dogMessage: 'The dog profile and its photo will be permanently removed. Continue?',
    loadError: 'Dog profile could not be loaded.',
    actionError: 'The action could not be completed.',
    name: 'Name',
    sex: 'Sex',
    color: 'Color',
    birthDate: 'Birth date',
    country: 'Country',
    city: 'City',
    kennel: 'Kennel',
    breeder: 'Breeder',
    registrationNumber: 'Registration number',
    description: 'Description',
    communityVisible: 'Visible in Community',
    created: 'Created',
    updated: 'Updated',
    user: 'User',
    noPhoto: 'There is no main photo.',
  },
  it: {
    title: 'Gestione cane',
    profile: 'PROFILO DEL CANE',
    owner: 'PROPRIETARIO',
    photo: 'FOTO PRINCIPALE',
    edit: 'MODIFICA',
    save: 'SALVA',
    cancel: 'ANNULLA',
    removePhoto: 'ELIMINA FOTO',
    removeDog: 'ELIMINA PROFILO DEFINITIVAMENTE',
    photoTitle: 'Elimina foto',
    photoMessage: 'La foto principale sarà eliminata definitivamente. Continuare?',
    dogTitle: 'Eliminazione definitiva',
    dogMessage: 'Il profilo del cane e la sua foto saranno eliminati definitivamente. Continuare?',
    loadError: 'Impossibile caricare il profilo del cane.',
    actionError: 'Impossibile completare l’azione.',
    name: 'Nome',
    sex: 'Sesso',
    color: 'Colore',
    birthDate: 'Data di nascita',
    country: 'Paese',
    city: 'Città',
    kennel: 'Allevamento',
    breeder: 'Allevatore',
    registrationNumber: 'Numero di registrazione',
    description: 'Descrizione',
    communityVisible: 'Visibile nella Comunità',
    created: 'Creato',
    updated: 'Aggiornato',
    user: 'Utente',
    noPhoto: 'Non c’è una foto principale.',
  },
};

function createEditState(dog) {
  return {
    name: dog.name || '',
    sex: dog.sex || '',
    color: dog.color || '',
    birthDate: dog.birth_date || '',
    country: dog.country || '',
    city: dog.city || '',
    kennel: dog.kennel || '',
    breeder: dog.breeder || '',
    registrationNumber: dog.registration_number || '',
    description: dog.description || '',
    communityVisible: Boolean(dog.community_visible),
  };
}

export default function AdminDogDetailsScreen({ route, navigation }) {
  const { dogId } = route.params;
  const { language } = useLanguage();
  const { colors } = useTheme();
  const labels = copy[language] ?? copy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [dog, setDog] = useState(null);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const result = await getAdminDogDetails(dogId);

    if (result.error || !result.data) {
      setDog(null);
      setError(labels.loadError);
    } else {
      setDog(result.data);
    }

    setLoading(false);
  }, [dogId, labels.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  function field(key, value) {
    setValues((current) =>
      current ? { ...current, [key]: value } : current
    );
  }

  async function save() {
    if (!dog || !values) {
      return;
    }

    setWorking(true);
    setError('');

    const result = await updateAdminDog(dog.id, values);

    if (result.error) {
      setError(labels.actionError);
      setWorking(false);
      return;
    }

    setEditing(false);
    await load();
    setWorking(false);
  }

  function confirmPhotoDelete() {
    if (!dog?.photo_path) {
      return;
    }

    Alert.alert(labels.photoTitle, labels.photoMessage, [
      { text: labels.cancel, style: 'cancel' },
      {
        text: labels.removePhoto,
        style: 'destructive',
        onPress: async () => {
          setWorking(true);
          const result = await deleteAdminDogPhoto(dog.id);

          if (result.error) {
            setError(labels.actionError);
            setWorking(false);
            return;
          }

          await load();
          setWorking(false);
        },
      },
    ]);
  }

  function confirmDogDelete() {
    if (!dog) {
      return;
    }

    Alert.alert(labels.dogTitle, labels.dogMessage, [
      { text: labels.cancel, style: 'cancel' },
      {
        text: labels.removeDog,
        style: 'destructive',
        onPress: async () => {
          setWorking(true);
          const result = await deleteAdminDog(dog.id);

          if (result.error) {
            setError(labels.actionError);
            setWorking(false);
            return;
          }

          navigation.goBack();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <USGProgressBar label={labels.title} />
        </View>
      </SafeAreaView>
    );
  }

  if (!dog) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={styles.error}>{error || labels.loadError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.kicker}>USG CORSO ADMIN</Text>
          <Text style={styles.title}>{dog.name}</Text>
          <Text style={styles.visibility}>
            {dog.community_visible
              ? labels.communityVisible
              : 'PRIVATE'}
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{labels.profile}</Text>

          {editing ? (
            <>
              <Field
                value={values.name}
                onChangeText={(value) => field('name', value)}
                placeholder={labels.name}
                styles={styles}
                colors={colors}
              />
              <Field
                value={values.sex}
                onChangeText={(value) => field('sex', value)}
                placeholder={labels.sex}
                styles={styles}
                colors={colors}
              />
              <Field
                value={values.color}
                onChangeText={(value) => field('color', value)}
                placeholder={labels.color}
                styles={styles}
                colors={colors}
              />
              <Field
                value={values.birthDate}
                onChangeText={(value) => field('birthDate', value)}
                placeholder={labels.birthDate}
                styles={styles}
                colors={colors}
              />
              <Field
                value={values.country}
                onChangeText={(value) => field('country', value)}
                placeholder={labels.country}
                styles={styles}
                colors={colors}
              />
              <Field
                value={values.city}
                onChangeText={(value) => field('city', value)}
                placeholder={labels.city}
                styles={styles}
                colors={colors}
              />
              <Field
                value={values.kennel}
                onChangeText={(value) => field('kennel', value)}
                placeholder={labels.kennel}
                styles={styles}
                colors={colors}
              />
              <Field
                value={values.breeder}
                onChangeText={(value) => field('breeder', value)}
                placeholder={labels.breeder}
                styles={styles}
                colors={colors}
              />
              <Field
                value={values.registrationNumber}
                onChangeText={(value) =>
                  field('registrationNumber', value)
                }
                placeholder={labels.registrationNumber}
                styles={styles}
                colors={colors}
              />
              <TextInput
                value={values.description}
                onChangeText={(value) => field('description', value)}
                placeholder={labels.description}
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.textarea]}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  {labels.communityVisible}
                </Text>
                <Switch
                  value={values.communityVisible}
                  onValueChange={(value) =>
                    field('communityVisible', value)
                  }
                />
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => setEditing(false)}
                >
                  <Text style={styles.secondaryText}>{labels.cancel}</Text>
                </Pressable>
                <Pressable
                  style={styles.primaryButton}
                  disabled={working}
                  onPress={save}
                >
                  <Text style={styles.primaryText}>{labels.save}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Info label={labels.sex} value={dog.sex} styles={styles} />
              <Info label={labels.color} value={dog.color} styles={styles} />
              <Info
                label={labels.birthDate}
                value={dog.birth_date}
                styles={styles}
              />
              <Info label={labels.country} value={dog.country} styles={styles} />
              <Info label={labels.city} value={dog.city} styles={styles} />
              <Info label={labels.kennel} value={dog.kennel} styles={styles} />
              <Info label={labels.breeder} value={dog.breeder} styles={styles} />
              <Info
                label={labels.registrationNumber}
                value={dog.registration_number}
                styles={styles}
              />
              <Info
                label={labels.description}
                value={dog.description}
                styles={styles}
              />
              <Info
                label={labels.created}
                value={new Date(dog.created_at).toLocaleString()}
                styles={styles}
              />
              <Info
                label={labels.updated}
                value={new Date(dog.updated_at).toLocaleString()}
                styles={styles}
              />

              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  setValues(createEditState(dog));
                  setEditing(true);
                }}
              >
                <Text style={styles.primaryText}>{labels.edit}</Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{labels.owner}</Text>
          <Info
            label={labels.user}
            value={
              dog.owner_display_name ||
              dog.owner_username ||
              'USG Member'
            }
            styles={styles}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{labels.photo}</Text>

          {dog.photo_url ? (
            <>
              <Image source={{ uri: dog.photo_url }} style={styles.photo} />
              <Pressable
                style={styles.deleteButton}
                onPress={confirmPhotoDelete}
              >
                <Text style={styles.deleteText}>{labels.removePhoto}</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.empty}>{labels.noPhoto}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Pressable
            style={styles.deleteButton}
            onPress={confirmDogDelete}
          >
            <Text style={styles.deleteText}>{labels.removeDog}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ value, onChangeText, placeholder, styles, colors }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      style={styles.input}
    />
  );
}

function Info({ label, value, styles }) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return (
    <View style={styles.infoRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{String(value)}</Text>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    hero: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 20,
      marginBottom: 12,
    },
    kicker: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 2,
    },
    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '900',
      marginTop: 8,
    },
    visibility: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: '900',
      marginTop: 5,
    },
    card: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 16,
      marginBottom: 12,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '900',
      marginBottom: 10,
    },
    infoRow: {
      marginBottom: 9,
    },
    metaLabel: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    metaValue: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 2,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.background,
      color: colors.text,
      paddingHorizontal: 11,
      paddingVertical: 10,
      fontSize: 11,
      marginBottom: 8,
    },
    textarea: {
      minHeight: 100,
    },
    switchRow: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    switchLabel: {
      color: colors.textSoft,
      fontSize: 10,
      flex: 1,
    },
    photo: {
      width: '100%',
      height: 260,
      borderRadius: 14,
      backgroundColor: '#09090b',
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
    },
    primaryButton: {
      flexGrow: 1,
      minHeight: 40,
      borderRadius: 999,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      marginTop: 8,
    },
    primaryText: {
      color: '#070708',
      fontSize: 8,
      fontWeight: '900',
      textAlign: 'center',
    },
    secondaryButton: {
      flexGrow: 1,
      minHeight: 40,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    secondaryText: {
      color: colors.gold,
      fontSize: 8,
      fontWeight: '900',
      textAlign: 'center',
    },
    deleteButton: {
      width: '100%',
      minHeight: 40,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.textMuted,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      marginTop: 10,
    },
    deleteText: {
      color: colors.textSoft,
      fontSize: 8,
      fontWeight: '900',
    },
    empty: {
      color: colors.textSoft,
      fontSize: 11,
    },
    error: {
      color: colors.danger || '#d66',
      fontSize: 11,
      marginBottom: 10,
    },
  });
}
