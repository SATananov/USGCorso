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
  deleteAdminPlace,
  deleteAdminPlaceMedia,
  getAdminPlaceDetails,
  getAdminPlaceMediaForPlace,
  reviewAdminPlaceMedia,
  setAdminPlaceMediaCover,
  setAdminPlaceStatus,
  updateAdminPlace,
  updateAdminPlaceMediaCaption,
} from '../admin/adminService';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import USGProgressBar from '../components/USGProgressBar';

const copy = {
  bg: {
    title: 'Управление на място',
    details: 'ИНФОРМАЦИЯ',
    owner: 'ДОБАВЕНО ОТ',
    stats: 'СТАТИСТИКА',
    photos: 'СНИМКИ',
    edit: 'РЕДАКТИРАЙ',
    save: 'ЗАПАЗИ',
    cancel: 'ОТКАЗ',
    approve: 'ОДОБРИ',
    reject: 'ОТХВЪРЛИ',
    archive: 'АРХИВИРАЙ',
    restore: 'ВЪЗСТАНОВИ',
    remove: 'ИЗТРИЙ ОКОНЧАТЕЛНО',
    removeTitle: 'Окончателно изтриване',
    removeMessage: 'Мястото и свързаните с него данни ще бъдат премахнати окончателно. Продължаваме ли?',
    loadError: 'Информацията за мястото не можа да се зареди.',
    actionError: 'Действието не можа да се изпълни.',
    name: 'Име',
    category: 'Категория',
    description: 'Описание',
    country: 'Държава',
    city: 'Град',
    address: 'Адрес',
    phone: 'Телефон',
    website: 'Уебсайт',
    latitude: 'Ширина',
    longitude: 'Дължина',
    friendly: 'Подходящо за Кане Корсо',
    yes: 'Да',
    no: 'Не',
    status: 'Статус',
    created: 'Добавено',
    updated: 'Обновено',
    username: 'Потребител',
    reviews: 'Ревюта',
    rating: 'Средна оценка',
    favorites: 'Любими',
    noPhotos: 'Няма снимки.',
    pending: 'ЧАКАЩА',
    approved: 'ОДОБРЕНА',
    rejected: 'ОТХВЪРЛЕНА',
    cover: 'ОСНОВНА',
    setCover: 'НАПРАВИ ОСНОВНА',
    editCaption: 'РЕДАКТИРАЙ НАДПИС',
    deletePhoto: 'ИЗТРИЙ СНИМКА',
    photoDeleteTitle: 'Изтриване на снимка',
    photoDeleteMessage: 'Снимката ще бъде премахната окончателно. Продължаваме ли?',
  },
  en: {
    title: 'Place Management',
    details: 'INFORMATION',
    owner: 'ADDED BY',
    stats: 'STATISTICS',
    photos: 'PHOTOS',
    edit: 'EDIT',
    save: 'SAVE',
    cancel: 'CANCEL',
    approve: 'APPROVE',
    reject: 'REJECT',
    archive: 'ARCHIVE',
    restore: 'RESTORE',
    remove: 'DELETE PERMANENTLY',
    removeTitle: 'Permanent deletion',
    removeMessage: 'The place and its related data will be permanently removed. Continue?',
    loadError: 'Place information could not be loaded.',
    actionError: 'The action could not be completed.',
    name: 'Name',
    category: 'Category',
    description: 'Description',
    country: 'Country',
    city: 'City',
    address: 'Address',
    phone: 'Phone',
    website: 'Website',
    latitude: 'Latitude',
    longitude: 'Longitude',
    friendly: 'Cane Corso Friendly',
    yes: 'Yes',
    no: 'No',
    status: 'Status',
    created: 'Created',
    updated: 'Updated',
    username: 'User',
    reviews: 'Reviews',
    rating: 'Average rating',
    favorites: 'Favorites',
    noPhotos: 'There are no photos.',
    pending: 'PENDING',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    cover: 'COVER',
    setCover: 'SET AS COVER',
    editCaption: 'EDIT CAPTION',
    deletePhoto: 'DELETE PHOTO',
    photoDeleteTitle: 'Delete photo',
    photoDeleteMessage: 'The photo will be permanently removed. Continue?',
  },
  it: {
    title: 'Gestione luogo',
    details: 'INFORMAZIONI',
    owner: 'AGGIUNTO DA',
    stats: 'STATISTICHE',
    photos: 'FOTO',
    edit: 'MODIFICA',
    save: 'SALVA',
    cancel: 'ANNULLA',
    approve: 'APPROVA',
    reject: 'RIFIUTA',
    archive: 'ARCHIVIA',
    restore: 'RIPRISTINA',
    remove: 'ELIMINA DEFINITIVAMENTE',
    removeTitle: 'Eliminazione definitiva',
    removeMessage: 'Il luogo e i dati collegati saranno eliminati definitivamente. Continuare?',
    loadError: 'Impossibile caricare le informazioni del luogo.',
    actionError: 'Impossibile completare l’azione.',
    name: 'Nome',
    category: 'Categoria',
    description: 'Descrizione',
    country: 'Paese',
    city: 'Città',
    address: 'Indirizzo',
    phone: 'Telefono',
    website: 'Sito web',
    latitude: 'Latitudine',
    longitude: 'Longitudine',
    friendly: 'Adatto al Cane Corso',
    yes: 'Sì',
    no: 'No',
    status: 'Stato',
    created: 'Creato',
    updated: 'Aggiornato',
    username: 'Utente',
    reviews: 'Recensioni',
    rating: 'Valutazione media',
    favorites: 'Preferiti',
    noPhotos: 'Non ci sono foto.',
    pending: 'IN ATTESA',
    approved: 'APPROVATA',
    rejected: 'RIFIUTATA',
    cover: 'COPERTINA',
    setCover: 'IMPOSTA COPERTINA',
    editCaption: 'MODIFICA DIDASCALIA',
    deletePhoto: 'ELIMINA FOTO',
    photoDeleteTitle: 'Elimina foto',
    photoDeleteMessage: 'La foto sarà eliminata definitivamente. Continuare?',
  },
};

function createEditState(place) {
  return {
    name: place.name || '',
    category: place.category || 'other',
    description: place.description || '',
    country: place.country || '',
    city: place.city || '',
    address: place.address || '',
    phone: place.phone || '',
    website: place.website || '',
    latitude: String(place.latitude ?? ''),
    longitude: String(place.longitude ?? ''),
    caneCorsoFriendly: Boolean(place.cane_corso_friendly),
  };
}

export default function AdminPlaceDetailsScreen({ route, navigation }) {
  const { placeId } = route.params;
  const { language } = useLanguage();
  const { colors } = useTheme();
  const labels = copy[language] ?? copy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [place, setPlace] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState(null);
  const [captionId, setCaptionId] = useState(null);
  const [captionDraft, setCaptionDraft] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const [detailResult, mediaResult] = await Promise.all([
      getAdminPlaceDetails(placeId),
      getAdminPlaceMediaForPlace(placeId),
    ]);

    if (detailResult.error || mediaResult.error) {
      setError(labels.loadError);
      setLoading(false);
      return;
    }

    const detail = Array.isArray(detailResult.data)
      ? detailResult.data[0]
      : detailResult.data;

    setPlace(detail ?? null);
    setPhotos(mediaResult.data ?? []);
    setLoading(false);
  }, [labels.loadError, placeId]);

  useEffect(() => {
    load();
  }, [load]);

  async function savePlace() {
    if (!editValues || !place) {
      return;
    }

    setWorking(true);
    setError('');

    const result = await updateAdminPlace(place.id, editValues);

    if (result.error) {
      setError(labels.actionError);
      setWorking(false);
      return;
    }

    setEditing(false);
    await load();
    setWorking(false);
  }

  async function changePlaceStatus(status) {
    if (!place) {
      return;
    }

    setWorking(true);
    setError('');

    const result = await setAdminPlaceStatus(place.id, status);

    if (result.error) {
      setError(labels.actionError);
      setWorking(false);
      return;
    }

    await load();
    setWorking(false);
  }

  function confirmPlaceDelete() {
    if (!place) {
      return;
    }

    Alert.alert(labels.removeTitle, labels.removeMessage, [
      { text: labels.cancel, style: 'cancel' },
      {
        text: labels.remove,
        style: 'destructive',
        onPress: async () => {
          setWorking(true);
          const result = await deleteAdminPlace(place.id);

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

  async function changePhotoStatus(photoId, status) {
    setWorking(true);
    setError('');

    const result = await reviewAdminPlaceMedia(photoId, status);

    if (result.error) {
      setError(labels.actionError);
      setWorking(false);
      return;
    }

    await load();
    setWorking(false);
  }

  async function setCover(photoId) {
    setWorking(true);
    setError('');

    const result = await setAdminPlaceMediaCover(photoId);

    if (result.error) {
      setError(labels.actionError);
      setWorking(false);
      return;
    }

    await load();
    setWorking(false);
  }

  async function saveCaption(photoId) {
    setWorking(true);
    setError('');

    const result = await updateAdminPlaceMediaCaption(
      photoId,
      captionDraft
    );

    if (result.error) {
      setError(labels.actionError);
      setWorking(false);
      return;
    }

    setCaptionId(null);
    setCaptionDraft('');
    await load();
    setWorking(false);
  }

  function confirmPhotoDelete(photo) {
    Alert.alert(labels.photoDeleteTitle, labels.photoDeleteMessage, [
      { text: labels.cancel, style: 'cancel' },
      {
        text: labels.deletePhoto,
        style: 'destructive',
        onPress: async () => {
          setWorking(true);
          const result = await deleteAdminPlaceMedia(photo.id);

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

  function editField(key, value) {
    setEditValues((current) =>
      current ? { ...current, [key]: value } : current
    );
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

  if (!place) {
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
          <Text style={styles.title}>{place.name}</Text>
          <Text style={styles.status}>{place.status}</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{labels.details}</Text>

          {editing ? (
            <>
              <Field
                value={editValues.name}
                onChangeText={(value) => editField('name', value)}
                placeholder={labels.name}
                styles={styles}
                colors={colors}
              />
              <Field
                value={editValues.category}
                onChangeText={(value) => editField('category', value)}
                placeholder={labels.category}
                styles={styles}
                colors={colors}
              />
              <TextInput
                value={editValues.description}
                onChangeText={(value) => editField('description', value)}
                placeholder={labels.description}
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.textarea]}
              />
              <Field
                value={editValues.country}
                onChangeText={(value) => editField('country', value)}
                placeholder={labels.country}
                styles={styles}
                colors={colors}
              />
              <Field
                value={editValues.city}
                onChangeText={(value) => editField('city', value)}
                placeholder={labels.city}
                styles={styles}
                colors={colors}
              />
              <Field
                value={editValues.address}
                onChangeText={(value) => editField('address', value)}
                placeholder={labels.address}
                styles={styles}
                colors={colors}
              />
              <Field
                value={editValues.phone}
                onChangeText={(value) => editField('phone', value)}
                placeholder={labels.phone}
                styles={styles}
                colors={colors}
              />
              <Field
                value={editValues.website}
                onChangeText={(value) => editField('website', value)}
                placeholder={labels.website}
                styles={styles}
                colors={colors}
              />

              <View style={styles.row}>
                <Field
                  value={editValues.latitude}
                  onChangeText={(value) => editField('latitude', value)}
                  placeholder={labels.latitude}
                  styles={styles}
                  colors={colors}
                  compact
                />
                <Field
                  value={editValues.longitude}
                  onChangeText={(value) => editField('longitude', value)}
                  placeholder={labels.longitude}
                  styles={styles}
                  colors={colors}
                  compact
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.metaLabel}>{labels.friendly}</Text>
                <Switch
                  value={editValues.caneCorsoFriendly}
                  onValueChange={(value) =>
                    editField('caneCorsoFriendly', value)
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
                  onPress={savePlace}
                >
                  <Text style={styles.primaryText}>{labels.save}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Info label={labels.category} value={place.category} styles={styles} />
              <Info label={labels.description} value={place.description} styles={styles} />
              <Info label={labels.country} value={place.country} styles={styles} />
              <Info label={labels.city} value={place.city} styles={styles} />
              <Info label={labels.address} value={place.address} styles={styles} />
              <Info label={labels.phone} value={place.phone} styles={styles} />
              <Info label={labels.website} value={place.website} styles={styles} />
              <Info
                label={`${labels.latitude} / ${labels.longitude}`}
                value={`${place.latitude}, ${place.longitude}`}
                styles={styles}
              />
              <Info
                label={labels.friendly}
                value={place.cane_corso_friendly ? labels.yes : labels.no}
                styles={styles}
              />
              <Info label={labels.created} value={new Date(place.created_at).toLocaleString()} styles={styles} />
              <Info label={labels.updated} value={new Date(place.updated_at).toLocaleString()} styles={styles} />

              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  setEditValues(createEditState(place));
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
            label={labels.username}
            value={place.owner_display_name || place.owner_username || 'USG Member'}
            styles={styles}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{labels.stats}</Text>
          <View style={styles.metrics}>
            <Metric label={labels.reviews} value={place.review_count} styles={styles} />
            <Metric
              label={labels.rating}
              value={Number(place.average_rating || 0).toFixed(1)}
              styles={styles}
            />
            <Metric label={labels.favorites} value={place.favorite_count} styles={styles} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{labels.photos}</Text>

          {photos.length === 0 ? (
            <Text style={styles.empty}>{labels.noPhotos}</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoList}
            >
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  <View style={styles.imageWrap}>
                    {photo.signed_url ? (
                      <Image
                        source={{ uri: photo.signed_url }}
                        style={styles.image}
                      />
                    ) : (
                      <View style={styles.image} />
                    )}

                    <View style={styles.photoBadges}>
                      <Text style={styles.photoBadge}>
                        {labels[photo.status] || photo.status}
                      </Text>
                      {photo.is_cover ? (
                        <Text style={styles.photoBadge}>{labels.cover}</Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.photoBody}>
                    {captionId === photo.id ? (
                      <>
                        <TextInput
                          value={captionDraft}
                          onChangeText={setCaptionDraft}
                          maxLength={160}
                          multiline
                          placeholderTextColor={colors.textMuted}
                          style={styles.captionInput}
                        />
                        <View style={styles.actions}>
                          <Pressable
                            style={styles.secondaryButton}
                            onPress={() => {
                              setCaptionId(null);
                              setCaptionDraft('');
                            }}
                          >
                            <Text style={styles.secondaryText}>
                              {labels.cancel}
                            </Text>
                          </Pressable>
                          <Pressable
                            style={styles.primaryButton}
                            onPress={() => saveCaption(photo.id)}
                          >
                            <Text style={styles.primaryText}>
                              {labels.save}
                            </Text>
                          </Pressable>
                        </View>
                      </>
                    ) : (
                      <>
                        {photo.caption ? (
                          <Text style={styles.caption}>{photo.caption}</Text>
                        ) : null}

                        <Pressable
                          style={styles.textAction}
                          onPress={() => {
                            setCaptionId(photo.id);
                            setCaptionDraft(photo.caption || '');
                          }}
                        >
                          <Text style={styles.textActionLabel}>
                            {labels.editCaption}
                          </Text>
                        </Pressable>
                      </>
                    )}

                    <View style={styles.actions}>
                      {photo.status !== 'approved' ? (
                        <Pressable
                          style={styles.primaryButton}
                          onPress={() =>
                            changePhotoStatus(photo.id, 'approved')
                          }
                        >
                          <Text style={styles.primaryText}>
                            {labels.approve}
                          </Text>
                        </Pressable>
                      ) : null}

                      {photo.status !== 'rejected' ? (
                        <Pressable
                          style={styles.secondaryButton}
                          onPress={() =>
                            changePhotoStatus(photo.id, 'rejected')
                          }
                        >
                          <Text style={styles.secondaryText}>
                            {labels.reject}
                          </Text>
                        </Pressable>
                      ) : null}

                      {photo.status === 'approved' && !photo.is_cover ? (
                        <Pressable
                          style={styles.secondaryButton}
                          onPress={() => setCover(photo.id)}
                        >
                          <Text style={styles.secondaryText}>
                            {labels.setCover}
                          </Text>
                        </Pressable>
                      ) : null}

                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => confirmPhotoDelete(photo)}
                      >
                        <Text style={styles.deleteText}>
                          {labels.deletePhoto}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{labels.status}</Text>

          <View style={styles.actions}>
            {place.status !== 'approved' ? (
              <Pressable
                style={styles.primaryButton}
                onPress={() => changePlaceStatus('approved')}
              >
                <Text style={styles.primaryText}>{labels.approve}</Text>
              </Pressable>
            ) : null}

            {place.status !== 'rejected' ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => changePlaceStatus('rejected')}
              >
                <Text style={styles.secondaryText}>{labels.reject}</Text>
              </Pressable>
            ) : null}

            {place.status !== 'archived' ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => changePlaceStatus('archived')}
              >
                <Text style={styles.secondaryText}>{labels.archive}</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.primaryButton}
                onPress={() => changePlaceStatus('approved')}
              >
                <Text style={styles.primaryText}>{labels.restore}</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.deleteButton}
              onPress={confirmPlaceDelete}
            >
              <Text style={styles.deleteText}>{labels.remove}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  value,
  onChangeText,
  placeholder,
  styles,
  colors,
  compact = false,
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      style={[styles.input, compact && styles.compactInput]}
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

function Metric({ label, value, styles }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
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
    status: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      textTransform: 'uppercase',
      marginTop: 6,
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
    row: {
      flexDirection: 'row',
      gap: 8,
    },
    compactInput: {
      flex: 1,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      minHeight: 44,
    },
    metrics: {
      flexDirection: 'row',
      gap: 8,
    },
    metric: {
      flex: 1,
      minHeight: 84,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      padding: 11,
      justifyContent: 'center',
    },
    metricValue: {
      color: colors.gold,
      fontSize: 22,
      fontWeight: '900',
    },
    metricLabel: {
      color: colors.textSoft,
      fontSize: 9,
      marginTop: 3,
    },
    photoList: {
      gap: 12,
      paddingTop: 4,
    },
    photoCard: {
      width: 260,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      overflow: 'hidden',
    },
    imageWrap: {
      width: 260,
      height: 180,
    },
    image: {
      width: 260,
      height: 180,
      backgroundColor: '#09090b',
    },
    photoBadges: {
      position: 'absolute',
      top: 9,
      left: 9,
      flexDirection: 'row',
      gap: 6,
    },
    photoBadge: {
      color: colors.gold,
      backgroundColor: 'rgba(7, 7, 8, 0.92)',
      borderWidth: 1,
      borderColor: colors.gold,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 7,
      fontWeight: '900',
    },
    photoBody: {
      padding: 12,
    },
    caption: {
      color: colors.text,
      fontSize: 11,
      lineHeight: 16,
    },
    captionInput: {
      minHeight: 70,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surfaceSoft,
      color: colors.text,
      padding: 10,
      fontSize: 10,
    },
    textAction: {
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    textActionLabel: {
      color: colors.gold,
      fontSize: 8,
      fontWeight: '900',
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
      marginTop: 4,
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
