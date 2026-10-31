import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import {
  deletePlaceMedia,
  getPlaceMedia,
  moderatePlaceMedia,
  setPlaceMediaCover,
  uploadPlaceMedia,
} from './placeMediaService';

const MAX_BYTES = 5 * 1024 * 1024;

const copyByLanguage = {
  bg: {
    title: 'СНИМКИ НА МЯСТОТО',
    subtitle: 'Вижте как изглежда мястото или добавете снимка от общността.',
    take: 'СНИМАЙ',
    choose: 'ИЗБЕРИ СНИМКА',
    caption: 'Кратко описание на снимката...',
    upload: 'КАЧИ СНИМКАТА',
    cancel: 'ОТКАЗ',
    pending: 'ЧАКА ОДОБРЕНИЕ',
    approved: 'ОДОБРЕНА',
    rejected: 'ОТХВЪРЛЕНА',
    cover: 'ОСНОВНА',
    setCover: 'НАПРАВИ ОСНОВНА',
    approve: 'ОДОБРИ',
    reject: 'ОТХВЪРЛИ',
    remove: 'ИЗТРИЙ',
    empty: 'Все още няма снимки за това място.',
    permission: 'Нужно е разрешение за камерата или снимките.',
    tooLarge: 'Снимката трябва да е до 5 MB.',
    loadError: 'Снимките не можаха да се заредят.',
    uploadError: 'Снимката не можа да се качи.',
    actionError: 'Действието не можа да се изпълни.',
    pendingInfo: 'Снимките от общността се публикуват след одобрение.',
    uploading: 'КАЧВА СЕ...',
  },
  en: {
    title: 'PLACE PHOTOS',
    subtitle: 'See what the place looks like or add a community photo.',
    take: 'TAKE PHOTO',
    choose: 'CHOOSE PHOTO',
    caption: 'Short photo description...',
    upload: 'UPLOAD PHOTO',
    cancel: 'CANCEL',
    pending: 'PENDING APPROVAL',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    cover: 'COVER',
    setCover: 'SET AS COVER',
    approve: 'APPROVE',
    reject: 'REJECT',
    remove: 'DELETE',
    empty: 'There are no photos for this place yet.',
    permission: 'Camera or photo library permission is required.',
    tooLarge: 'The photo must be 5 MB or smaller.',
    loadError: 'Photos could not be loaded.',
    uploadError: 'The photo could not be uploaded.',
    actionError: 'The action could not be completed.',
    pendingInfo: 'Community photos are published after approval.',
    uploading: 'UPLOADING...',
  },
  it: {
    title: 'FOTO DEL LUOGO',
    subtitle: 'Guarda il luogo o aggiungi una foto dalla community.',
    take: 'SCATTA FOTO',
    choose: 'SCEGLI FOTO',
    caption: 'Breve descrizione della foto...',
    upload: 'CARICA FOTO',
    cancel: 'ANNULLA',
    pending: 'IN ATTESA',
    approved: 'APPROVATA',
    rejected: 'RIFIUTATA',
    cover: 'COPERTINA',
    setCover: 'IMPOSTA COPERTINA',
    approve: 'APPROVA',
    reject: 'RIFIUTA',
    remove: 'ELIMINA',
    empty: 'Non ci sono ancora foto per questo luogo.',
    permission: 'È necessaria l’autorizzazione per fotocamera o foto.',
    tooLarge: 'La foto deve essere di massimo 5 MB.',
    loadError: 'Impossibile caricare le foto.',
    uploadError: 'Impossibile caricare la foto.',
    actionError: 'Impossibile completare l’azione.',
    pendingInfo: 'Le foto della community vengono pubblicate dopo l’approvazione.',
    uploading: 'CARICAMENTO...',
  },
};

export default function PlacePhotoSection({ place, role }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const copy = copyByLanguage[language] ?? copyByLanguage.en;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [caption, setCaption] = useState('');
  const [errorText, setErrorText] = useState('');

  const canManage =
    role === 'admin' ||
    (Boolean(user?.id) && place?.created_by === user.id);

  const loadMedia = useCallback(async () => {
    if (!place?.id) {
      return;
    }

    setLoading(true);
    const result = await getPlaceMedia(place.id);

    if (result.error) {
      setMedia([]);
      setErrorText(copy.loadError);
    } else {
      setMedia(result.data ?? []);
      setErrorText('');
    }

    setLoading(false);
  }, [copy.loadError, place?.id]);

  useFocusEffect(
    useCallback(() => {
      loadMedia();
    }, [loadMedia])
  );

  function acceptAsset(result) {
    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];

    if (asset.fileSize && asset.fileSize > MAX_BYTES) {
      setErrorText(copy.tooLarge);
      return;
    }

    setSelectedAsset(asset);
    setCaption('');
    setErrorText('');
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setErrorText(copy.permission);
      return;
    }

    acceptAsset(
      await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.82,
      })
    );
  }

  async function choosePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setErrorText(copy.permission);
      return;
    }

    acceptAsset(
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.82,
      })
    );
  }

  async function upload() {
    if (!user?.id || !selectedAsset || uploading) {
      return;
    }

    setUploading(true);
    setErrorText('');

    try {
      const result = await uploadPlaceMedia(
        user.id,
        place.id,
        selectedAsset.uri,
        selectedAsset.mimeType,
        caption
      );

      if (result.error) {
        setErrorText(copy.uploadError);
        return;
      }

      setSelectedAsset(null);
      setCaption('');
      await loadMedia();
    } finally {
      setUploading(false);
    }
  }

  async function runAction(mediaId, action) {
    if (busyId) {
      return;
    }

    setBusyId(mediaId);
    setErrorText('');

    try {
      const result = await action();

      if (result.error) {
        setErrorText(copy.actionError);
        return;
      }

      await loadMedia();
    } finally {
      setBusyId(null);
    }
  }

  const visibleMedia = media.filter(
    (item) =>
      item.status === 'approved' ||
      item.owner_user_id === user?.id ||
      canManage
  );

  const cover =
    visibleMedia.find(
      (item) => item.status === 'approved' && item.is_cover && item.signed_url
    ) ??
    visibleMedia.find(
      (item) => item.status === 'approved' && item.signed_url
    );

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.subtitle}>{copy.subtitle}</Text>

      {cover ? (
        <View style={styles.coverFrame}>
          <Image source={{ uri: cover.signed_url }} style={styles.coverImage} />
          <View style={styles.coverBadge}>
            <Text style={styles.coverBadgeText}>{copy.cover}</Text>
          </View>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} />
        </View>
      ) : visibleMedia.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gallery}
        >
          {visibleMedia.map((item) => {
            const isOwn = item.owner_user_id === user?.id;
            const canDelete = role === 'admin' || isOwn || canManage;
            const canModerate = role === 'admin' && item.status === 'pending';

            return (
              <View key={item.id} style={styles.card}>
                {item.signed_url ? (
                  <Image source={{ uri: item.signed_url }} style={styles.photo} />
                ) : (
                  <View style={styles.photo} />
                )}

                <View style={styles.meta}>
                  <View style={styles.statusRow}>
                    <Text style={styles.status}>
                      {item.status === 'approved'
                        ? copy.approved
                        : item.status === 'rejected'
                          ? copy.rejected
                          : copy.pending}
                    </Text>
                    {item.is_cover ? (
                      <Text style={styles.coverText}>{copy.cover}</Text>
                    ) : null}
                  </View>

                  {item.caption ? (
                    <Text numberOfLines={2} style={styles.captionText}>
                      {item.caption}
                    </Text>
                  ) : null}

                  <View style={styles.actions}>
                    {canManage &&
                    item.status === 'approved' &&
                    !item.is_cover ? (
                      <Pressable
                        style={styles.smallButton}
                        disabled={busyId === item.id}
                        onPress={() =>
                          runAction(item.id, () => setPlaceMediaCover(item.id))
                        }
                      >
                        <Text style={styles.smallButtonText}>{copy.setCover}</Text>
                      </Pressable>
                    ) : null}

                    {canModerate ? (
                      <>
                        <Pressable
                          style={styles.smallButton}
                          disabled={busyId === item.id}
                          onPress={() =>
                            runAction(item.id, () =>
                              moderatePlaceMedia(item.id, 'approved')
                            )
                          }
                        >
                          <Text style={styles.smallButtonText}>{copy.approve}</Text>
                        </Pressable>
                        <Pressable
                          style={styles.smallButton}
                          disabled={busyId === item.id}
                          onPress={() =>
                            runAction(item.id, () =>
                              moderatePlaceMedia(item.id, 'rejected')
                            )
                          }
                        >
                          <Text style={styles.smallButtonText}>{copy.reject}</Text>
                        </Pressable>
                      </>
                    ) : null}

                    {canDelete ? (
                      <Pressable
                        style={styles.smallButton}
                        disabled={busyId === item.id}
                        onPress={() =>
                          runAction(item.id, () => deletePlaceMedia(item.id))
                        }
                      >
                        <Text style={styles.smallButtonText}>{copy.remove}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={styles.empty}>{copy.empty}</Text>
      )}

      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

      {selectedAsset ? (
        <View style={styles.uploadPanel}>
          <Image source={{ uri: selectedAsset.uri }} style={styles.preview} />
          <TextInput
            value={caption}
            onChangeText={setCaption}
            maxLength={160}
            placeholder={copy.caption}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <View style={styles.row}>
            <Pressable
              style={styles.secondaryButton}
              disabled={uploading}
              onPress={() => {
                setSelectedAsset(null);
                setCaption('');
              }}
            >
              <Text style={styles.secondaryText}>{copy.cancel}</Text>
            </Pressable>
            <Pressable
              style={styles.primaryButton}
              disabled={uploading}
              onPress={upload}
            >
              <Text style={styles.primaryText}>
                {uploading ? copy.uploading : copy.upload}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.row}>
          <Pressable style={styles.secondaryButton} onPress={takePhoto}>
            <Text style={styles.secondaryText}>{copy.take}</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={choosePhoto}>
            <Text style={styles.primaryText}>{copy.choose}</Text>
          </Pressable>
        </View>
      )}

      {!canManage ? (
        <Text style={styles.pendingInfo}>{copy.pendingInfo}</Text>
      ) : null}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    section: {
      marginTop: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 22,
      backgroundColor: colors.surface,
    },
    title: {
      color: colors.gold,
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    subtitle: {
      marginTop: 6,
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    center: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    coverFrame: {
      marginTop: 14,
      height: 210,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.45)',
      backgroundColor: '#09090b',
    },
    coverImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    coverBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: '#d4af37',
      backgroundColor: 'rgba(7, 7, 8, 0.88)',
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    coverBadgeText: {
      color: '#d4af37',
      fontSize: 9,
      fontWeight: '900',
    },
    gallery: {
      gap: 12,
      paddingTop: 14,
    },
    card: {
      width: 220,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    photo: {
      width: 220,
      height: 150,
      resizeMode: 'cover',
      backgroundColor: '#09090b',
    },
    meta: {
      padding: 11,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    status: {
      flex: 1,
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '900',
    },
    coverText: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: '900',
    },
    captionText: {
      marginTop: 7,
      color: colors.text,
      fontSize: 12,
      lineHeight: 17,
    },
    actions: {
      marginTop: 10,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    smallButton: {
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.55)',
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 6,
    },
    smallButtonText: {
      color: colors.gold,
      fontSize: 8,
      fontWeight: '900',
    },
    empty: {
      marginTop: 14,
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    error: {
      marginTop: 10,
      color: '#ff8f8f',
      fontSize: 12,
      lineHeight: 17,
    },
    row: {
      marginTop: 14,
      flexDirection: 'row',
      gap: 10,
    },
    uploadPanel: {
      marginTop: 14,
      gap: 10,
    },
    preview: {
      width: '100%',
      height: 190,
      borderRadius: 16,
      resizeMode: 'cover',
      backgroundColor: '#09090b',
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.background,
      color: colors.text,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 12,
    },
    primaryButton: {
      flex: 1,
      minHeight: 42,
      borderRadius: 999,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    primaryText: {
      color: '#070708',
      fontSize: 10,
      fontWeight: '900',
      textAlign: 'center',
    },
    secondaryButton: {
      flex: 1,
      minHeight: 42,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    secondaryText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      textAlign: 'center',
    },
    pendingInfo: {
      marginTop: 10,
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 15,
    },
  });
}
