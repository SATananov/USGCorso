import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import {
  getAdminPendingPlaces,
  requestAdminPlaceChanges,
  reviewAdminPlace,
  updateAdminPlace,
} from '../admin/adminService';
import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';
import USGProgressBar from './USGProgressBar';

const copy = {
  bg: {
    title: 'Чакащи Корсо места',
    count: 'Чакащи предложения',
    refresh: 'ОБНОВИ',
    empty: 'Няма чакащи предложения.',
    loadError: 'Чакащите места не можаха да се заредят.',
    approve: 'ОДОБРИ',
    reject: 'ОТХВЪРЛИ',
    edit: 'РЕДАКТИРАЙ',
    requestChanges: 'ИЗИСКАЙ КОРЕКЦИЯ',
    approveTitle: 'Одобряване на място',
    approveMessage: 'Да направим ли това място публично на Корсо картата?',
    rejectTitle: 'Отхвърляне на място',
    rejectMessage: 'Да отхвърлим ли това предложение?',
    requestTitle: 'Корекция от потребителя',
    requestHint: 'Опиши кратко какво трябва да бъде поправено.',
    sendRequest: 'ИЗПРАТИ',
    cancel: 'ОТКАЗ',
    save: 'ЗАПАЗИ',
    actionError: 'Промяната не можа да бъде записана.',
    category: 'Категория',
    address: 'Адрес',
    coordinates: 'Координати',
    submitted: 'Изпратено',
    friendly: 'Подходящо за Кане Корсо',
    yes: 'Да',
    no: 'Не',
    unknown: 'Няма данни',
    editTitle: 'Редакция на Корсо място',
    name: 'Име',
    description: 'Описание',
    country: 'Държава',
    city: 'Град',
    phone: 'Телефон',
    website: 'Уебсайт',
    latitude: 'Географска ширина',
    longitude: 'Географска дължина',
    markerHint: 'Премести маркера за корекция на координатите.',
    moderationNote: 'Бележка към потребителя',
  },
  en: {
    title: 'Pending Corso places',
    count: 'Pending submissions',
    refresh: 'REFRESH',
    empty: 'No pending submissions.',
    loadError: 'Pending places could not be loaded.',
    approve: 'APPROVE',
    reject: 'REJECT',
    edit: 'EDIT',
    requestChanges: 'REQUEST CHANGES',
    approveTitle: 'Approve place',
    approveMessage: 'Make this place public on the Corso map?',
    rejectTitle: 'Reject place',
    rejectMessage: 'Reject this submission?',
    requestTitle: 'Request user correction',
    requestHint: 'Briefly describe what should be corrected.',
    sendRequest: 'SEND',
    cancel: 'CANCEL',
    save: 'SAVE',
    actionError: 'The change could not be saved.',
    category: 'Category',
    address: 'Address',
    coordinates: 'Coordinates',
    submitted: 'Submitted',
    friendly: 'Cane Corso Friendly',
    yes: 'Yes',
    no: 'No',
    unknown: 'No data',
    editTitle: 'Edit Corso place',
    name: 'Name',
    description: 'Description',
    country: 'Country',
    city: 'City',
    phone: 'Phone',
    website: 'Website',
    latitude: 'Latitude',
    longitude: 'Longitude',
    markerHint: 'Drag the marker to correct the coordinates.',
    moderationNote: 'Note to user',
  },
  it: {
    title: 'Luoghi Corso in attesa',
    count: 'Proposte in attesa',
    refresh: 'AGGIORNA',
    empty: 'Nessuna proposta in attesa.',
    loadError: 'Impossibile caricare i luoghi in attesa.',
    approve: 'APPROVA',
    reject: 'RIFIUTA',
    edit: 'MODIFICA',
    requestChanges: 'RICHIEDI CORREZIONE',
    approveTitle: 'Approva luogo',
    approveMessage: 'Rendere pubblico questo luogo sulla mappa Corso?',
    rejectTitle: 'Rifiuta luogo',
    rejectMessage: 'Rifiutare questa proposta?',
    requestTitle: 'Richiedi correzione',
    requestHint: 'Descrivi brevemente cosa deve essere corretto.',
    sendRequest: 'INVIA',
    cancel: 'ANNULLA',
    save: 'SALVA',
    actionError: 'Impossibile salvare la modifica.',
    category: 'Categoria',
    address: 'Indirizzo',
    coordinates: 'Coordinate',
    submitted: 'Inviato',
    friendly: 'Adatto al Cane Corso',
    yes: 'Sì',
    no: 'No',
    unknown: 'Nessun dato',
    editTitle: 'Modifica luogo Corso',
    name: 'Nome',
    description: 'Descrizione',
    country: 'Paese',
    city: 'Città',
    phone: 'Telefono',
    website: 'Sito web',
    latitude: 'Latitudine',
    longitude: 'Longitudine',
    markerHint: 'Sposta il marcatore per correggere le coordinate.',
    moderationNote: 'Nota per l’utente',
  },
};

const categories = [
  'veterinary',
  'breeder',
  'trainer',
  'pet_shop',
  'large_dog_hotel',
  'pet_transport',
  'grooming',
  'pharmacy',
  'park',
  'dog_park',
  'shelter',
  'other',
];

const categoryLabels = {
  veterinary: { bg: 'Ветеринар', en: 'Veterinary', it: 'Veterinario' },
  breeder: { bg: 'Развъдник', en: 'Breeder', it: 'Allevatore' },
  trainer: { bg: 'Треньор', en: 'Trainer', it: 'Addestratore' },
  pet_shop: { bg: 'Зоомагазин', en: 'Pet shop', it: 'Negozio per animali' },
  large_dog_hotel: { bg: 'Хотел за кучета', en: 'Dog hotel', it: 'Hotel per cani' },
  pet_transport: { bg: 'Транспорт', en: 'Transport', it: 'Trasporto' },
  grooming: { bg: 'Груминг', en: 'Grooming', it: 'Toelettatura' },
  pharmacy: { bg: 'Аптека', en: 'Pharmacy', it: 'Farmacia' },
  park: { bg: 'Парк', en: 'Park', it: 'Parco' },
  dog_park: { bg: 'Кучешки парк', en: 'Dog park', it: 'Parco per cani' },
  shelter: { bg: 'Приют', en: 'Shelter', it: 'Rifugio' },
  other: { bg: 'Друго', en: 'Other', it: 'Altro' },
};

function categoryLabel(category, language) {
  return categoryLabels[category]?.[language] || category;
}

function createEditState(place) {
  return {
    id: place.id,
    name: place.name || '',
    category: place.category || 'other',
    description: place.description || '',
    country: place.country || '',
    city: place.city || '',
    address: place.address || '',
    latitude: String(place.latitude ?? ''),
    longitude: String(place.longitude ?? ''),
    phone: place.phone || '',
    website: place.website || '',
    caneCorsoFriendly: Boolean(
      place.cane_corso_friendly ?? place.caneCorsoFriendly ?? false
    ),
  };
}

export default function AdminPlacesModeration() {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const labels = copy[language] ?? copy.en;
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [error, setError] = useState('');
  const [editPlace, setEditPlace] = useState(null);
  const [requestPlace, setRequestPlace] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data, error: loadError } = await getAdminPendingPlaces();

    if (loadError) {
      setPlaces([]);
      setError(labels.loadError);
      setLoading(false);
      return;
    }

    setPlaces(data ?? []);
    setLoading(false);
  }, [labels.loadError]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  const performReview = useCallback(
    async (placeId, decision) => {
      setWorkingId(placeId);
      setError('');

      const { error: reviewError } = await reviewAdminPlace(placeId, decision);

      if (reviewError) {
        setError(labels.actionError);
        setWorkingId('');
        return;
      }

      setPlaces((current) => current.filter((item) => item.id !== placeId));
      setWorkingId('');
    },
    [labels.actionError]
  );

  async function saveEdit() {
    if (!editPlace) {
      return;
    }

    const latitude = Number(editPlace.latitude);
    const longitude = Number(editPlace.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError(labels.actionError);
      return;
    }

    setWorkingId(editPlace.id);
    setError('');

    const { data, error: updateError } = await updateAdminPlace(
      editPlace.id,
      editPlace
    );

    if (updateError) {
      setError(labels.actionError);
      setWorkingId('');
      return;
    }

    const updated = Array.isArray(data) ? data[0] : data;

    setPlaces((current) =>
      current.map((item) =>
        item.id === editPlace.id ? { ...item, ...updated } : item
      )
    );
    setWorkingId('');
    setEditPlace(null);
  }

  async function sendChangeRequest() {
    if (!requestPlace || !reviewNote.trim()) {
      return;
    }

    setWorkingId(requestPlace.id);
    setError('');

    const { error: requestError } = await requestAdminPlaceChanges(
      requestPlace.id,
      reviewNote
    );

    if (requestError) {
      setError(labels.actionError);
      setWorkingId('');
      return;
    }

    setPlaces((current) =>
      current.filter((item) => item.id !== requestPlace.id)
    );
    setWorkingId('');
    setReviewNote('');
    setRequestPlace(null);
  }

  function confirmReview(place, decision) {
    const approving = decision === 'approved';

    Alert.alert(
      approving ? labels.approveTitle : labels.rejectTitle,
      approving ? labels.approveMessage : labels.rejectMessage,
      [
        {
          text: labels.cancel,
          style: 'cancel',
        },
        {
          text: approving ? labels.approve : labels.reject,
          style: approving ? 'default' : 'destructive',
          onPress: () => performReview(place.id, decision),
        },
      ]
    );
  }

  function updateEditField(field, value) {
    setEditPlace((current) =>
      current ? { ...current, [field]: value } : current
    );
  }

  const editLatitude = Number(editPlace?.latitude);
  const editLongitude = Number(editPlace?.longitude);
  const hasEditCoordinates =
    Number.isFinite(editLatitude) &&
    Number.isFinite(editLongitude) &&
    editLatitude >= -90 &&
    editLatitude <= 90 &&
    editLongitude >= -180 &&
    editLongitude <= 180;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{labels.title}</Text>
          <Text style={styles.count}>
            {labels.count}: {places.length}
          </Text>
        </View>

        <Pressable style={styles.refreshButton} onPress={loadPlaces}>
          <Text style={styles.refreshText}>{labels.refresh}</Text>
        </Pressable>
      </View>

      {loading ? <USGProgressBar label={labels.title} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && !error && places.length === 0 ? (
        <Text style={styles.empty}>{labels.empty}</Text>
      ) : null}

      {places.map((place) => {
        const address = [place.address, place.city, place.country]
          .filter(Boolean)
          .join(', ');
        const coordinates =
          Number.isFinite(Number(place.latitude)) &&
          Number.isFinite(Number(place.longitude))
            ? `${Number(place.latitude).toFixed(6)}, ${Number(place.longitude).toFixed(6)}`
            : labels.unknown;
        const friendlyValue =
          place.cane_corso_friendly ??
          place.caneCorsoFriendly ??
          null;

        return (
          <View key={place.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.placeName}>{place.name || labels.unknown}</Text>
                <Text style={styles.category}>
                  {categoryLabel(place.category, language)}
                </Text>
              </View>
              <Text style={styles.pendingBadge}>PENDING</Text>
            </View>

            <Text style={styles.metaLabel}>{labels.address}</Text>
            <Text style={styles.metaValue}>{address || labels.unknown}</Text>

            <Text style={styles.metaLabel}>{labels.coordinates}</Text>
            <Text style={styles.metaValue}>{coordinates}</Text>

            {friendlyValue !== null ? (
              <>
                <Text style={styles.metaLabel}>{labels.friendly}</Text>
                <Text style={styles.metaValue}>
                  {friendlyValue ? labels.yes : labels.no}
                </Text>
              </>
            ) : null}

            <Text style={styles.metaLabel}>{labels.submitted}</Text>
            <Text style={styles.metaValue}>
              {place.created_at
                ? new Date(place.created_at).toLocaleString()
                : labels.unknown}
            </Text>

            <View style={styles.secondaryActions}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => setEditPlace(createEditState(place))}
              >
                <Text style={styles.secondaryText}>{labels.edit}</Text>
              </Pressable>

              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setReviewNote('');
                  setRequestPlace(place);
                }}
              >
                <Text style={styles.secondaryText}>{labels.requestChanges}</Text>
              </Pressable>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={[styles.actionButton, styles.rejectButton]}
                disabled={workingId === place.id}
                onPress={() => confirmReview(place, 'rejected')}
              >
                <Text style={styles.rejectText}>{labels.reject}</Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, styles.approveButton]}
                disabled={workingId === place.id}
                onPress={() => confirmReview(place, 'approved')}
              >
                <Text style={styles.approveText}>
                  {workingId === place.id ? '...' : labels.approve}
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      <Modal
        visible={Boolean(editPlace)}
        animationType="slide"
        onRequestClose={() => setEditPlace(null)}
      >
        <View style={styles.modalRoot}>
          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <Text style={styles.modalTitle}>{labels.editTitle}</Text>

            <Text style={styles.inputLabel}>{labels.name}</Text>
            <TextInput
              style={styles.input}
              value={editPlace?.name ?? ''}
              onChangeText={(value) => updateEditField('name', value)}
            />

            <Text style={styles.inputLabel}>{labels.category}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryRow}>
                {categories.map((category) => {
                  const selected = editPlace?.category === category;

                  return (
                    <Pressable
                      key={category}
                      style={[
                        styles.categoryChip,
                        selected && styles.categoryChipSelected,
                      ]}
                      onPress={() => updateEditField('category', category)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          selected && styles.categoryChipTextSelected,
                        ]}
                      >
                        {categoryLabel(category, language)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={styles.inputLabel}>{labels.description}</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              multiline
              value={editPlace?.description ?? ''}
              onChangeText={(value) => updateEditField('description', value)}
            />

            <Text style={styles.inputLabel}>{labels.country}</Text>
            <TextInput
              style={styles.input}
              value={editPlace?.country ?? ''}
              onChangeText={(value) => updateEditField('country', value)}
            />

            <Text style={styles.inputLabel}>{labels.city}</Text>
            <TextInput
              style={styles.input}
              value={editPlace?.city ?? ''}
              onChangeText={(value) => updateEditField('city', value)}
            />

            <Text style={styles.inputLabel}>{labels.address}</Text>
            <TextInput
              style={styles.input}
              value={editPlace?.address ?? ''}
              onChangeText={(value) => updateEditField('address', value)}
            />

            {hasEditCoordinates ? (
              <>
                <Text style={styles.inputLabel}>{labels.markerHint}</Text>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  mapType="hybrid"
                  style={styles.map}
                  initialRegion={{
                    latitude: editLatitude,
                    longitude: editLongitude,
                    latitudeDelta: 0.006,
                    longitudeDelta: 0.006,
                  }}
                  onPress={(event) => {
                    const coordinate = event.nativeEvent.coordinate;
                    updateEditField('latitude', String(coordinate.latitude));
                    updateEditField('longitude', String(coordinate.longitude));
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: editLatitude,
                      longitude: editLongitude,
                    }}
                    draggable
                    onDragEnd={(event) => {
                      const coordinate = event.nativeEvent.coordinate;
                      updateEditField('latitude', String(coordinate.latitude));
                      updateEditField('longitude', String(coordinate.longitude));
                    }}
                  />
                </MapView>
              </>
            ) : null}

            <Text style={styles.inputLabel}>{labels.latitude}</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={editPlace?.latitude ?? ''}
              onChangeText={(value) => updateEditField('latitude', value)}
            />

            <Text style={styles.inputLabel}>{labels.longitude}</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={editPlace?.longitude ?? ''}
              onChangeText={(value) => updateEditField('longitude', value)}
            />

            <Text style={styles.inputLabel}>{labels.phone}</Text>
            <TextInput
              style={styles.input}
              value={editPlace?.phone ?? ''}
              onChangeText={(value) => updateEditField('phone', value)}
            />

            <Text style={styles.inputLabel}>{labels.website}</Text>
            <TextInput
              style={styles.input}
              value={editPlace?.website ?? ''}
              autoCapitalize="none"
              onChangeText={(value) => updateEditField('website', value)}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{labels.friendly}</Text>
              <Switch
                value={Boolean(editPlace?.caneCorsoFriendly)}
                onValueChange={(value) =>
                  updateEditField('caneCorsoFriendly', value)
                }
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setEditPlace(null)}
              >
                <Text style={styles.modalCancelText}>{labels.cancel}</Text>
              </Pressable>

              <Pressable style={styles.modalSave} onPress={saveEdit}>
                <Text style={styles.modalSaveText}>{labels.save}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={Boolean(requestPlace)}
        transparent
        animationType="fade"
        onRequestClose={() => setRequestPlace(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.requestCard}>
            <Text style={styles.modalTitle}>{labels.requestTitle}</Text>
            <Text style={styles.requestHint}>{labels.requestHint}</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              multiline
              value={reviewNote}
              onChangeText={setReviewNote}
              placeholder={labels.moderationNote}
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => {
                  setReviewNote('');
                  setRequestPlace(null);
                }}
              >
                <Text style={styles.modalCancelText}>{labels.cancel}</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalSave,
                  !reviewNote.trim() && styles.disabledButton,
                ]}
                disabled={!reviewNote.trim()}
                onPress={sendChangeRequest}
              >
                <Text style={styles.modalSaveText}>{labels.sendRequest}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    section: {
      marginBottom: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12,
    },
    headerText: {
      flex: 1,
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    count: {
      color: colors.textSoft,
      fontSize: 11,
      marginTop: 3,
    },
    refreshButton: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.gold,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    refreshText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
    },
    card: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surfaceSoft,
      padding: 16,
      marginBottom: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 10,
    },
    cardTitleWrap: {
      flex: 1,
    },
    placeName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
    },
    category: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '700',
      marginTop: 4,
    },
    pendingBadge: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
    },
    metaLabel: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '700',
      textTransform: 'uppercase',
      marginTop: 8,
    },
    metaValue: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 2,
    },
    secondaryActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },
    secondaryButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 8,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryText: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: '800',
      textAlign: 'center',
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
    },
    actionButton: {
      flex: 1,
      borderRadius: radius.md,
      paddingVertical: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rejectButton: {
      borderWidth: 1,
      borderColor: colors.danger || '#c96b6b',
    },
    approveButton: {
      backgroundColor: colors.gold,
    },
    rejectText: {
      color: colors.danger || '#d77',
      fontSize: 11,
      fontWeight: '800',
    },
    approveText: {
      color: colors.background,
      fontSize: 11,
      fontWeight: '900',
    },
    error: {
      color: colors.danger || '#d66',
      fontSize: 12,
      marginBottom: 10,
    },
    empty: {
      color: colors.textSoft,
      fontSize: 12,
      marginBottom: 10,
    },
    modalRoot: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalContent: {
      padding: spacing.md,
      paddingBottom: 40,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '800',
      marginBottom: 16,
    },
    inputLabel: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      marginTop: 12,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      color: colors.text,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
    },
    multiline: {
      minHeight: 96,
      textAlignVertical: 'top',
    },
    categoryRow: {
      flexDirection: 'row',
      gap: 8,
      paddingBottom: 4,
    },
    categoryChip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    categoryChipSelected: {
      borderColor: colors.gold,
      backgroundColor: colors.surfaceSoft,
    },
    categoryChipText: {
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: '700',
    },
    categoryChipTextSelected: {
      color: colors.gold,
    },
    map: {
      height: 280,
      borderRadius: radius.md,
      marginTop: 4,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 18,
      paddingVertical: 8,
    },
    switchLabel: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 22,
    },
    modalCancel: {
      flex: 1,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      alignItems: 'center',
    },
    modalSave: {
      flex: 1,
      borderRadius: radius.md,
      backgroundColor: colors.gold,
      paddingVertical: 12,
      alignItems: 'center',
    },
    modalCancelText: {
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: '800',
    },
    modalSaveText: {
      color: colors.background,
      fontSize: 11,
      fontWeight: '900',
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.72)',
      justifyContent: 'center',
      padding: spacing.md,
    },
    requestCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surface,
      padding: 18,
    },
    requestHint: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 12,
    },
    disabledButton: {
      opacity: 0.45,
    },
  });
}
