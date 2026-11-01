import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  clearAdminDogDescription,
  getAdminDogsByModeration,
  setAdminDogModeration,
} from '../admin/dogModerationService';
import { getDogPhotoUrl } from '../dogs/dogPhotoService';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import USGDialog from './USGDialog';
import USGProgressBar from './USGProgressBar';

const copyByLanguage = {
  bg: {
    title: 'МОДЕРАЦИЯ НА КОРСО',
    subtitle: 'Публичните профили трябва да съдържат само Cane Corso и релевантна информация.',
    pending: 'ЧАКА',
    approved: 'ОДОБРЕНО',
    rejected: 'ОТХВЪРЛЕНО',
    needsChanges: 'ЗА КОРЕКЦИЯ',
    empty: 'Няма профили с този статус.',
    note: 'Бележка към собственика',
    approve: 'ОДОБРИ',
    reject: 'ОТХВЪРЛИ',
    changes: 'ВЪРНИ ЗА КОРЕКЦИЯ',
    removeText: 'ПРЕМАХНИ ОПИСАНИЕТО',
    removeTextTitle: 'Премахване на описание',
    removeTextMessage: 'Описание, което не е свързано с Cane Corso, ще бъде премахнато.',
    cancel: 'ОТКАЗ',
    confirm: 'ПРЕМАХНИ',
    loadError: 'Неуспешно зареждане на модерацията.',
    actionError: 'Действието не можа да бъде изпълнено.',
    noDescription: 'Няма описание.',
  },
  en: {
    title: 'CORSO MODERATION',
    subtitle: 'Public profiles must contain only Cane Corso content and relevant information.',
    pending: 'PENDING',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    needsChanges: 'NEEDS CHANGES',
    empty: 'No profiles with this status.',
    note: 'Note to the owner',
    approve: 'APPROVE',
    reject: 'REJECT',
    changes: 'REQUEST CHANGES',
    removeText: 'REMOVE DESCRIPTION',
    removeTextTitle: 'Remove description',
    removeTextMessage: 'A description unrelated to Cane Corso will be removed.',
    cancel: 'CANCEL',
    confirm: 'REMOVE',
    loadError: 'Unable to load moderation.',
    actionError: 'The action could not be completed.',
    noDescription: 'No description.',
  },
  it: {
    title: 'MODERAZIONE CORSO',
    subtitle: 'I profili pubblici devono contenere solo Cane Corso e informazioni pertinenti.',
    pending: 'IN ATTESA',
    approved: 'APPROVATO',
    rejected: 'RIFIUTATO',
    needsChanges: 'DA CORREGGERE',
    empty: 'Nessun profilo con questo stato.',
    note: 'Nota al proprietario',
    approve: 'APPROVA',
    reject: 'RIFIUTA',
    changes: 'RICHIEDI CORREZIONI',
    removeText: 'RIMUOVI DESCRIZIONE',
    removeTextTitle: 'Rimuovi descrizione',
    removeTextMessage: 'Una descrizione non pertinente al Cane Corso verrà rimossa.',
    cancel: 'ANNULLA',
    confirm: 'RIMUOVI',
    loadError: 'Impossibile caricare la moderazione.',
    actionError: 'Impossibile completare l’azione.',
    noDescription: 'Nessuna descrizione.',
  },
};

const statuses = ['pending', 'needs_changes', 'rejected', 'approved'];

export default function AdminDogModeration({ onChanged }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const copy = copyByLanguage[language] ?? copyByLanguage.en;

  const [status, setStatus] = useState('pending');
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState({});
  const [dialog, setDialog] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const result = await getAdminDogsByModeration(status);

    if (result.error) {
      setDogs([]);
      setError(copy.loadError);
      setLoading(false);
      return;
    }

    const hydrated = await Promise.all(
      (result.data ?? []).map(async (dog) => {
        if (!dog.photo_path) {
          return { ...dog, photo_url: null };
        }

        const photo = await getDogPhotoUrl(dog.photo_path);

        return {
          ...dog,
          photo_url: photo.data ?? null,
        };
      })
    );

    setDogs(hydrated);
    setLoading(false);
  }, [copy.loadError, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function moderate(dog, nextStatus) {
    setWorkingId(dog.id);
    setError('');

    const result = await setAdminDogModeration(
      dog.id,
      nextStatus,
      notes[dog.id] ?? ''
    );

    setWorkingId(null);

    if (result.error) {
      setError(copy.actionError);
      return;
    }

    setNotes((current) => ({ ...current, [dog.id]: '' }));
    await load();
    await onChanged?.();
  }

  function requestDescriptionRemoval(dog) {
    setDialog({
      dog,
      title: copy.removeTextTitle,
      message: copy.removeTextMessage,
    });
  }

  async function confirmDescriptionRemoval() {
    const dog = dialog?.dog;

    if (!dog) {
      setDialog(null);
      return;
    }

    setWorkingId(dog.id);
    setError('');

    const result = await clearAdminDogDescription(
      dog.id,
      notes[dog.id] ?? ''
    );

    setWorkingId(null);
    setDialog(null);

    if (result.error) {
      setError(copy.actionError);
      return;
    }

    setNotes((current) => ({ ...current, [dog.id]: '' }));
    await load();
    await onChanged?.();
  }

  function statusLabel(value) {
    if (value === 'approved') return copy.approved;
    if (value === 'rejected') return copy.rejected;
    if (value === 'needs_changes') return copy.needsChanges;
    return copy.pending;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>USG CORSO</Text>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.subtitle}>{copy.subtitle}</Text>

      <View style={styles.tabs}>
        {statuses.map((value) => (
          <Pressable
            key={value}
            style={[styles.tab, status === value && styles.tabActive]}
            onPress={() => setStatus(value)}
          >
            <Text style={[styles.tabText, status === value && styles.tabTextActive]}>
              {statusLabel(value)}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <USGProgressBar label={copy.title} />
      ) : dogs.length ? (
        <View style={styles.list}>
          {dogs.map((dog) => {
            const busy = workingId === dog.id;

            return (
              <View key={dog.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.dogName}>{dog.name}</Text>
                    <Text style={styles.meta}>
                      {[dog.city, dog.country].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                  <Text style={styles.status}>{statusLabel(dog.moderation_status)}</Text>
                </View>

                {dog.photo_url ? (
                  <Image source={{ uri: dog.photo_url }} style={styles.photo} />
                ) : null}

                <Text style={styles.description}>
                  {dog.description || copy.noDescription}
                </Text>

                {dog.moderation_note ? (
                  <Text style={styles.previousNote}>{dog.moderation_note}</Text>
                ) : null}

                <TextInput
                  value={notes[dog.id] ?? ''}
                  onChangeText={(value) =>
                    setNotes((current) => ({ ...current, [dog.id]: value }))
                  }
                  placeholder={copy.note}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  style={styles.input}
                />

                <View style={styles.actions}>
                  {dog.moderation_status !== 'approved' ? (
                    <Pressable
                      style={styles.primaryButton}
                      disabled={busy}
                      onPress={() => moderate(dog, 'approved')}
                    >
                      <Text style={styles.primaryText}>{copy.approve}</Text>
                    </Pressable>
                  ) : null}

                  {dog.moderation_status !== 'needs_changes' ? (
                    <Pressable
                      style={styles.secondaryButton}
                      disabled={busy}
                      onPress={() => moderate(dog, 'needs_changes')}
                    >
                      <Text style={styles.secondaryText}>{copy.changes}</Text>
                    </Pressable>
                  ) : null}

                  {dog.moderation_status !== 'rejected' ? (
                    <Pressable
                      style={styles.secondaryButton}
                      disabled={busy}
                      onPress={() => moderate(dog, 'rejected')}
                    >
                      <Text style={styles.secondaryText}>{copy.reject}</Text>
                    </Pressable>
                  ) : null}

                  {dog.description ? (
                    <Pressable
                      style={styles.secondaryButton}
                      disabled={busy}
                      onPress={() => requestDescriptionRemoval(dog)}
                    >
                      <Text style={styles.secondaryText}>{copy.removeText}</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.empty}>{copy.empty}</Text>
      )}

      <USGDialog
        visible={Boolean(dialog)}
        title={dialog?.title || ''}
        message={dialog?.message || ''}
        cancelText={copy.cancel}
        confirmText={copy.confirm}
        onCancel={() => setDialog(null)}
        onConfirm={confirmDescriptionRemoval}
        busy={Boolean(workingId)}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    wrap: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 14,
      marginBottom: 12,
    },
    eyebrow: {
      color: colors.gold,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.6,
    },
    title: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '900',
      marginTop: 5,
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 5,
    },
    tabs: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 12,
      marginBottom: 10,
    },
    tab: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 9,
      paddingVertical: 7,
    },
    tabActive: {
      borderColor: colors.gold,
      backgroundColor: colors.goldSoft,
    },
    tabText: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: '900',
    },
    tabTextActive: {
      color: colors.gold,
    },
    list: {
      gap: 10,
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      padding: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
    },
    cardTitleWrap: {
      flex: 1,
    },
    dogName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '900',
    },
    meta: {
      color: colors.textMuted,
      fontSize: 9,
      marginTop: 2,
    },
    status: {
      color: colors.gold,
      fontSize: 8,
      fontWeight: '900',
    },
    photo: {
      width: '100%',
      aspectRatio: 16 / 10,
      borderRadius: 12,
      marginTop: 10,
      backgroundColor: '#09090b',
    },
    description: {
      color: colors.textSoft,
      fontSize: 10,
      lineHeight: 16,
      marginTop: 10,
    },
    previousNote: {
      color: colors.goldSoft,
      fontSize: 9,
      lineHeight: 14,
      marginTop: 8,
    },
    input: {
      minHeight: 58,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
      color: colors.text,
      padding: 10,
      fontSize: 10,
      marginTop: 10,
      textAlignVertical: 'top',
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7,
      marginTop: 10,
    },
    primaryButton: {
      borderRadius: 999,
      backgroundColor: colors.gold,
      paddingHorizontal: 10,
      paddingVertical: 9,
    },
    primaryText: {
      color: '#070708',
      fontSize: 8,
      fontWeight: '900',
    },
    secondaryButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      paddingHorizontal: 10,
      paddingVertical: 9,
    },
    secondaryText: {
      color: colors.gold,
      fontSize: 8,
      fontWeight: '900',
    },
    empty: {
      color: colors.textSoft,
      fontSize: 10,
      textAlign: 'center',
      paddingVertical: 12,
    },
    error: {
      color: colors.danger || '#d66',
      fontSize: 10,
      marginBottom: 8,
    },
  });
}
