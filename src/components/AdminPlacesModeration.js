import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  deleteAdminPlace,
  getAdminPlacesByStatus,
  setAdminPlaceStatus,
  updateAdminPlace,
} from '../admin/adminService';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import USGProgressBar from './USGProgressBar';

const STATUSES = ['pending', 'approved', 'rejected', 'archived'];

const copy = {
  bg: {
    title: 'Корсо места',
    pending: 'ЧАКАЩИ',
    approved: 'ОДОБРЕНИ',
    rejected: 'ОТХВЪРЛЕНИ',
    archived: 'АРХИВ',
    empty: 'Няма места в този статус.',
    loadError: 'Местата не можаха да се заредят.',
    actionError: 'Действието не можа да се изпълни.',
    open: 'ОТВОРИ',
    edit: 'РЕДАКТИРАЙ',
    save: 'ЗАПАЗИ',
    cancel: 'ОТКАЗ',
    approve: 'ОДОБРИ',
    reject: 'ОТХВЪРЛИ',
    archive: 'АРХИВИРАЙ',
    restore: 'ВЪЗСТАНОВИ',
    remove: 'ИЗТРИЙ ОКОНЧАТЕЛНО',
    removeTitle: 'Окончателно изтриване',
    removeMessage: 'Мястото, ревютата, любимите и свързаните снимки ще бъдат премахнати. Продължаваме ли?',
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
    correction: 'КОРЕКЦИЯ',
  },
  en: {
    title: 'Corso Places',
    pending: 'PENDING',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    archived: 'ARCHIVE',
    empty: 'There are no places with this status.',
    loadError: 'Places could not be loaded.',
    actionError: 'The action could not be completed.',
    open: 'OPEN',
    edit: 'EDIT',
    save: 'SAVE',
    cancel: 'CANCEL',
    approve: 'APPROVE',
    reject: 'REJECT',
    archive: 'ARCHIVE',
    restore: 'RESTORE',
    remove: 'DELETE PERMANENTLY',
    removeTitle: 'Permanent deletion',
    removeMessage: 'The place, reviews, favorites and related photos will be removed. Continue?',
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
    correction: 'CORRECTION',
  },
  it: {
    title: 'Luoghi Corso',
    pending: 'IN ATTESA',
    approved: 'APPROVATI',
    rejected: 'RIFIUTATI',
    archived: 'ARCHIVIO',
    empty: 'Nessun luogo con questo stato.',
    loadError: 'Impossibile caricare i luoghi.',
    actionError: 'Impossibile completare l’azione.',
    open: 'APRI',
    edit: 'MODIFICA',
    save: 'SALVA',
    cancel: 'ANNULLA',
    approve: 'APPROVA',
    reject: 'RIFIUTA',
    archive: 'ARCHIVIA',
    restore: 'RIPRISTINA',
    remove: 'ELIMINA DEFINITIVAMENTE',
    removeTitle: 'Eliminazione definitiva',
    removeMessage: 'Il luogo, le recensioni, i preferiti e le foto collegate saranno rimossi. Continuare?',
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
    correction: 'CORREZIONE',
  },
};

function editState(place) {
  return {
    id: place.id,
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

export default function AdminPlacesModeration() {
  const navigation = useNavigation();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const labels = copy[language] ?? copy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [activeStatus, setActiveStatus] = useState('pending');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    setError('');

    const result = await getAdminPlacesByStatus(activeStatus);

    if (result.error) {
      setPlaces([]);
      setError(labels.loadError);
    } else {
      setPlaces(result.data ?? []);
    }

    setLoading(false);
  }, [activeStatus, labels.loadError]);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  async function changeStatus(placeId, status) {
    setWorkingId(placeId);
    setError('');

    const result = await setAdminPlaceStatus(placeId, status);

    if (result.error) {
      setError(labels.actionError);
      setWorkingId('');
      return;
    }

    setPlaces((current) => current.filter((item) => item.id !== placeId));
    setWorkingId('');
  }

  async function saveEdit() {
    if (!editing) {
      return;
    }

    const latitude = Number(editing.latitude);
    const longitude = Number(editing.longitude);

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

    setWorkingId(editing.id);
    setError('');

    const result = await updateAdminPlace(editing.id, editing);

    if (result.error) {
      setError(labels.actionError);
      setWorkingId('');
      return;
    }

    const updated = Array.isArray(result.data) ? result.data[0] : result.data;

    setPlaces((current) =>
      current.map((item) =>
        item.id === editing.id ? { ...item, ...updated } : item
      )
    );
    setEditing(null);
    setWorkingId('');
  }

  function confirmDelete(place) {
    Alert.alert(labels.removeTitle, labels.removeMessage, [
      { text: labels.cancel, style: 'cancel' },
      {
        text: labels.remove,
        style: 'destructive',
        onPress: async () => {
          setWorkingId(place.id);
          setError('');

          const result = await deleteAdminPlace(place.id);

          if (result.error) {
            setError(labels.actionError);
            setWorkingId('');
            return;
          }

          setPlaces((current) =>
            current.filter((item) => item.id !== place.id)
          );
          setWorkingId('');
        },
      },
    ]);
  }

  function field(key, value) {
    setEditing((current) =>
      current ? { ...current, [key]: value } : current
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{labels.title}</Text>
        <Pressable style={styles.refresh} onPress={loadPlaces}>
          <Text style={styles.refreshText}>↻</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {STATUSES.map((status) => (
          <Pressable
            key={status}
            style={[
              styles.tab,
              activeStatus === status && styles.tabActive,
            ]}
            onPress={() => {
              setActiveStatus(status);
              setEditing(null);
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeStatus === status && styles.tabTextActive,
              ]}
            >
              {labels[status]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? <USGProgressBar label={labels.title} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && !error && places.length === 0 ? (
        <Text style={styles.empty}>{labels.empty}</Text>
      ) : null}

      {places.map((place) => {
        const isEditing = editing?.id === place.id;
        const location = [place.address, place.city, place.country]
          .filter(Boolean)
          .join(', ');

        return (
          <View key={place.id} style={styles.card}>
            {isEditing ? (
              <>
                <TextInput
                  value={editing.name}
                  onChangeText={(value) => field('name', value)}
                  placeholder={labels.name}
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
                <TextInput
                  value={editing.category}
                  onChangeText={(value) => field('category', value)}
                  placeholder={labels.category}
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
                <TextInput
                  value={editing.description}
                  onChangeText={(value) => field('description', value)}
                  placeholder={labels.description}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  textAlignVertical="top"
                  style={[styles.input, styles.textarea]}
                />
                <TextInput
                  value={editing.country}
                  onChangeText={(value) => field('country', value)}
                  placeholder={labels.country}
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
                <TextInput
                  value={editing.city}
                  onChangeText={(value) => field('city', value)}
                  placeholder={labels.city}
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
                <TextInput
                  value={editing.address}
                  onChangeText={(value) => field('address', value)}
                  placeholder={labels.address}
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
                <TextInput
                  value={editing.phone}
                  onChangeText={(value) => field('phone', value)}
                  placeholder={labels.phone}
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
                <TextInput
                  value={editing.website}
                  onChangeText={(value) => field('website', value)}
                  placeholder={labels.website}
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
                <View style={styles.coordRow}>
                  <TextInput
                    value={editing.latitude}
                    onChangeText={(value) => field('latitude', value)}
                    placeholder={labels.latitude}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    style={[styles.input, styles.coordInput]}
                  />
                  <TextInput
                    value={editing.longitude}
                    onChangeText={(value) => field('longitude', value)}
                    placeholder={labels.longitude}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    style={[styles.input, styles.coordInput]}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>{labels.friendly}</Text>
                  <Switch
                    value={editing.caneCorsoFriendly}
                    onValueChange={(value) =>
                      field('caneCorsoFriendly', value)
                    }
                  />
                </View>

                <View style={styles.actions}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => setEditing(null)}
                  >
                    <Text style={styles.secondaryText}>{labels.cancel}</Text>
                  </Pressable>
                  <Pressable
                    style={styles.primaryButton}
                    disabled={workingId === place.id}
                    onPress={saveEdit}
                  >
                    <Text style={styles.primaryText}>{labels.save}</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={styles.cardHeader}>
                  <View style={styles.cardText}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.category}>{place.category}</Text>
                  </View>
                  {place.status === 'changes_requested' ? (
                    <Text style={styles.correctionBadge}>
                      {labels.correction}
                    </Text>
                  ) : null}
                </View>

                <Text style={styles.meta}>{location}</Text>

                {place.description ? (
                  <Text numberOfLines={4} style={styles.description}>
                    {place.description}
                  </Text>
                ) : null}

                <View style={styles.actions}>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() =>
                      navigation.navigate('AdminPlaceDetails', {
                        placeId: place.id,
                      })
                    }
                  >
                    <Text style={styles.primaryText}>{labels.open}</Text>
                  </Pressable>

                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => setEditing(editState(place))}
                  >
                    <Text style={styles.secondaryText}>{labels.edit}</Text>
                  </Pressable>

                  {activeStatus !== 'approved' ? (
                    <Pressable
                      style={styles.primaryButton}
                      disabled={workingId === place.id}
                      onPress={() => changeStatus(place.id, 'approved')}
                    >
                      <Text style={styles.primaryText}>{labels.approve}</Text>
                    </Pressable>
                  ) : null}

                  {activeStatus !== 'rejected' ? (
                    <Pressable
                      style={styles.secondaryButton}
                      disabled={workingId === place.id}
                      onPress={() => changeStatus(place.id, 'rejected')}
                    >
                      <Text style={styles.secondaryText}>{labels.reject}</Text>
                    </Pressable>
                  ) : null}

                  {activeStatus !== 'archived' ? (
                    <Pressable
                      style={styles.secondaryButton}
                      disabled={workingId === place.id}
                      onPress={() => changeStatus(place.id, 'archived')}
                    >
                      <Text style={styles.secondaryText}>{labels.archive}</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={styles.primaryButton}
                      disabled={workingId === place.id}
                      onPress={() => changeStatus(place.id, 'approved')}
                    >
                      <Text style={styles.primaryText}>{labels.restore}</Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={styles.deleteButton}
                    disabled={workingId === place.id}
                    onPress={() => confirmDelete(place)}
                  >
                    <Text style={styles.deleteText}>{labels.remove}</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    section: {
      marginTop: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 14,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '900',
    },
    refresh: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
    },
    refreshText: {
      color: colors.gold,
      fontSize: 18,
      fontWeight: '900',
    },
    tabs: {
      gap: 8,
      paddingTop: 12,
      paddingBottom: 5,
    },
    tab: {
      minHeight: 38,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    tabActive: {
      borderColor: colors.gold,
    },
    tabText: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '900',
    },
    tabTextActive: {
      color: colors.gold,
    },
    card: {
      marginTop: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      padding: 13,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    cardText: {
      flex: 1,
    },
    placeName: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
    },
    category: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: '800',
      marginTop: 3,
    },
    correctionBadge: {
      color: colors.gold,
      fontSize: 8,
      fontWeight: '900',
    },
    meta: {
      color: colors.textSoft,
      fontSize: 10,
      marginTop: 8,
    },
    description: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surfaceSoft,
      color: colors.text,
      paddingHorizontal: 11,
      paddingVertical: 10,
      fontSize: 11,
      marginBottom: 8,
    },
    textarea: {
      minHeight: 90,
    },
    coordRow: {
      flexDirection: 'row',
      gap: 8,
    },
    coordInput: {
      flex: 1,
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
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    primaryButton: {
      flexGrow: 1,
      minHeight: 38,
      borderRadius: 999,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 11,
    },
    primaryText: {
      color: '#070708',
      fontSize: 8,
      fontWeight: '900',
      textAlign: 'center',
    },
    secondaryButton: {
      flexGrow: 1,
      minHeight: 38,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 11,
    },
    secondaryText: {
      color: colors.gold,
      fontSize: 8,
      fontWeight: '900',
      textAlign: 'center',
    },
    deleteButton: {
      width: '100%',
      minHeight: 38,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.textMuted,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 11,
    },
    deleteText: {
      color: colors.textSoft,
      fontSize: 8,
      fontWeight: '900',
    },
    empty: {
      color: colors.textSoft,
      fontSize: 11,
      marginTop: 12,
    },
    error: {
      color: colors.danger || '#d66',
      fontSize: 11,
      marginTop: 10,
    },
  });
}
