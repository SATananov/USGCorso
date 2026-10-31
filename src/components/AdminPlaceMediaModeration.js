import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  deleteAdminPlaceMedia,
  getAdminPlaceMediaByStatus,
  reviewAdminPlaceMedia,
  setAdminPlaceMediaCover,
  updateAdminPlaceMediaCaption,
} from '../admin/adminService';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import USGProgressBar from './USGProgressBar';

const copy = {
  bg: {
    title: 'Снимки на Корсо места',
    pending: 'ЧАКАЩИ',
    approved: 'ОДОБРЕНИ',
    rejected: 'ОТХВЪРЛЕНИ',
    emptyPending: 'Няма чакащи снимки.',
    emptyApproved: 'Няма одобрени снимки.',
    emptyRejected: 'Няма отхвърлени снимки.',
    loadError: 'Снимките не можаха да се заредят.',
    actionError: 'Промяната не можа да се запише.',
    approve: 'ОДОБРИ',
    reject: 'ОТХВЪРЛИ',
    restore: 'ОДОБРИ ОТНОВО',
    setCover: 'НАПРАВИ ОСНОВНА',
    cover: 'ОСНОВНА',
    uploader: 'Качил',
    submitted: 'Качено',
    edit: 'РЕДАКТИРАЙ НАДПИС',
    save: 'ЗАПАЗИ',
    cancel: 'ОТКАЗ',
    remove: 'ИЗТРИЙ',
    removeTitle: 'Изтриване на снимка',
    removeMessage: 'Снимката ще бъде премахната окончателно. Продължаваме ли?',
  },
  en: {
    title: 'Corso Place Photos',
    pending: 'PENDING',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    emptyPending: 'There are no pending photos.',
    emptyApproved: 'There are no approved photos.',
    emptyRejected: 'There are no rejected photos.',
    loadError: 'Photos could not be loaded.',
    actionError: 'The action could not be saved.',
    approve: 'APPROVE',
    reject: 'REJECT',
    restore: 'APPROVE AGAIN',
    setCover: 'SET AS COVER',
    cover: 'COVER',
    uploader: 'Uploaded by',
    submitted: 'Uploaded',
    edit: 'EDIT CAPTION',
    save: 'SAVE',
    cancel: 'CANCEL',
    remove: 'DELETE',
    removeTitle: 'Delete photo',
    removeMessage: 'The photo will be permanently removed. Continue?',
  },
  it: {
    title: 'Foto dei luoghi Corso',
    pending: 'IN ATTESA',
    approved: 'APPROVATE',
    rejected: 'RIFIUTATE',
    emptyPending: 'Non ci sono foto in attesa.',
    emptyApproved: 'Non ci sono foto approvate.',
    emptyRejected: 'Non ci sono foto rifiutate.',
    loadError: 'Impossibile caricare le foto.',
    actionError: 'Impossibile salvare la modifica.',
    approve: 'APPROVA',
    reject: 'RIFIUTA',
    restore: 'APPROVA DI NUOVO',
    setCover: 'IMPOSTA COPERTINA',
    cover: 'COPERTINA',
    uploader: 'Caricata da',
    submitted: 'Caricata',
    edit: 'MODIFICA DIDASCALIA',
    save: 'SALVA',
    cancel: 'ANNULLA',
    remove: 'ELIMINA',
    removeTitle: 'Elimina foto',
    removeMessage: 'La foto sarà eliminata definitivamente. Continuare?',
  },
};

const STATUSES = ['pending', 'approved', 'rejected'];

export default function AdminPlaceMediaModeration({ onChanged }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const labels = copy[language] ?? copy.en;

  const [activeStatus, setActiveStatus] = useState('pending');
  const [itemsByStatus, setItemsByStatus] = useState({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [captionDraft, setCaptionDraft] = useState('');
  const [error, setError] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');

    const [pending, approved, rejected] = await Promise.all(
      STATUSES.map((status) => getAdminPlaceMediaByStatus(status))
    );

    if (pending.error || approved.error || rejected.error) {
      setError(labels.loadError);
    }

    setItemsByStatus({
      pending: pending.data ?? [],
      approved: approved.data ?? [],
      rejected: rejected.data ?? [],
    });

    setLoading(false);
  }, [labels.loadError]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function changeStatus(item, status) {
    if (workingId) {
      return;
    }

    setWorkingId(item.id);
    setError('');

    const result = await reviewAdminPlaceMedia(item.id, status);

    if (result.error) {
      setError(labels.actionError);
      setWorkingId(null);
      return;
    }

    await loadItems();
    setWorkingId(null);
    onChanged?.();
  }

  async function setCover(item) {
    if (workingId) {
      return;
    }

    setWorkingId(item.id);
    setError('');

    const result = await setAdminPlaceMediaCover(item.id);

    if (result.error) {
      setError(labels.actionError);
      setWorkingId(null);
      return;
    }

    await loadItems();
    setWorkingId(null);
    onChanged?.();
  }

  async function saveCaption(item) {
    setWorkingId(item.id);
    setError('');

    const result = await updateAdminPlaceMediaCaption(
      item.id,
      captionDraft
    );

    if (result.error) {
      setError(labels.actionError);
      setWorkingId(null);
      return;
    }

    setEditingId(null);
    setCaptionDraft('');
    await loadItems();
    setWorkingId(null);
    onChanged?.();
  }

  function confirmDelete(item) {
    Alert.alert(labels.removeTitle, labels.removeMessage, [
      { text: labels.cancel, style: 'cancel' },
      {
        text: labels.remove,
        style: 'destructive',
        onPress: async () => {
          setWorkingId(item.id);
          setError('');

          const result = await deleteAdminPlaceMedia(item.id);

          if (result.error) {
            setError(labels.actionError);
            setWorkingId(null);
            return;
          }

          await loadItems();
          setWorkingId(null);
          onChanged?.();
        },
      },
    ]);
  }

  const items = itemsByStatus[activeStatus] ?? [];
  const emptyText =
    activeStatus === 'pending'
      ? labels.emptyPending
      : activeStatus === 'approved'
        ? labels.emptyApproved
        : labels.emptyRejected;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{labels.title}</Text>

        <Pressable style={styles.refresh} onPress={loadItems}>
          <Text style={styles.refreshText}>↻</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        <StatusTab
          label={labels.pending}
          count={itemsByStatus.pending.length}
          active={activeStatus === 'pending'}
          onPress={() => setActiveStatus('pending')}
          styles={styles}
        />
        <StatusTab
          label={labels.approved}
          count={itemsByStatus.approved.length}
          active={activeStatus === 'approved'}
          onPress={() => setActiveStatus('approved')}
          styles={styles}
        />
        <StatusTab
          label={labels.rejected}
          count={itemsByStatus.rejected.length}
          active={activeStatus === 'rejected'}
          onPress={() => setActiveStatus('rejected')}
          styles={styles}
        />
      </ScrollView>

      {loading ? <USGProgressBar label={labels.title} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && !error && items.length === 0 ? (
        <Text style={styles.empty}>{emptyText}</Text>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.imageWrap}>
              {item.signed_url ? (
                <Image source={{ uri: item.signed_url }} style={styles.image} />
              ) : (
                <View style={styles.image} />
              )}

              {item.is_cover ? (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeText}>{labels.cover}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.body}>
              <Text style={styles.placeName}>{item.place_name}</Text>

              <Text style={styles.metaLabel}>{labels.uploader}</Text>
              <Text style={styles.metaValue}>
                {item.uploader_name || item.uploader_username || 'USG Member'}
              </Text>

              {editingId === item.id ? (
                <>
                  <TextInput
                    value={captionDraft}
                    onChangeText={setCaptionDraft}
                    maxLength={160}
                    multiline
                    style={styles.captionInput}
                    placeholderTextColor={colors.textMuted}
                  />
                  <View style={styles.actions}>
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => {
                        setEditingId(null);
                        setCaptionDraft('');
                      }}
                    >
                      <Text style={styles.secondaryText}>{labels.cancel}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.primaryButton}
                      onPress={() => saveCaption(item)}
                    >
                      <Text style={styles.primaryText}>{labels.save}</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                                {item.caption ? (
                <Text numberOfLines={3} style={styles.caption}>
                  {item.caption}
                </Text>
              ) : null}
                  <Pressable
                    style={styles.captionEditButton}
                    onPress={() => {
                      setEditingId(item.id);
                      setCaptionDraft(item.caption || '');
                    }}
                  >
                    <Text style={styles.captionEditText}>{labels.edit}</Text>
                  </Pressable>
                </>
              )}

              <Text style={styles.metaLabel}>{labels.submitted}</Text>
              <Text style={styles.metaValue}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>

              <View style={styles.actions}>
                {activeStatus === 'pending' ? (
                  <>
                    <Pressable
                      style={styles.primaryButton}
                      disabled={workingId === item.id}
                      onPress={() => changeStatus(item, 'approved')}
                    >
                      <Text style={styles.primaryText}>{labels.approve}</Text>
                    </Pressable>

                    <Pressable
                      style={styles.secondaryButton}
                      disabled={workingId === item.id}
                      onPress={() => changeStatus(item, 'rejected')}
                    >
                      <Text style={styles.secondaryText}>{labels.reject}</Text>
                    </Pressable>
                  </>
                ) : null}

                {activeStatus === 'approved' ? (
                  <>
                    {!item.is_cover ? (
                      <Pressable
                        style={styles.primaryButton}
                        disabled={workingId === item.id}
                        onPress={() => setCover(item)}
                      >
                        <Text style={styles.primaryText}>{labels.setCover}</Text>
                      </Pressable>
                    ) : null}

                    <Pressable
                      style={styles.secondaryButton}
                      disabled={workingId === item.id}
                      onPress={() => changeStatus(item, 'rejected')}
                    >
                      <Text style={styles.secondaryText}>{labels.reject}</Text>
                    </Pressable>
                  </>
                ) : null}

                {activeStatus === 'rejected' ? (
                  <Pressable
                    style={styles.primaryButton}
                    disabled={workingId === item.id}
                    onPress={() => changeStatus(item, 'approved')}
                  >
                    <Text style={styles.primaryText}>{labels.restore}</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  style={styles.deleteButton}
                  disabled={workingId === item.id}
                  onPress={() => confirmDelete(item)}
                >
                  <Text style={styles.deleteText}>{labels.remove}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function StatusTab({ label, count, active, onPress, styles }) {
  return (
    <Pressable
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
      <View style={[styles.tabCount, active && styles.tabCountActive]}>
        <Text style={[styles.tabCountText, active && styles.tabCountTextActive]}>
          {count}
        </Text>
      </View>
    </Pressable>
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
      gap: 12,
    },
    title: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
    },
    refresh: {
      width: 34,
      height: 34,
      borderRadius: 17,
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
      paddingBottom: 2,
    },
    tab: {
      minHeight: 38,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
    tabCount: {
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSoft,
    },
    tabCountActive: {
      backgroundColor: colors.gold,
    },
    tabCountText: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '900',
    },
    tabCountTextActive: {
      color: '#070708',
    },
    list: {
      gap: 12,
      paddingTop: 12,
    },
    card: {
      width: 250,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    imageWrap: {
      width: 250,
      height: 170,
      backgroundColor: '#09090b',
    },
    image: {
      width: 250,
      height: 170,
      backgroundColor: '#09090b',
      resizeMode: 'cover',
    },
    coverBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: 'rgba(7, 7, 8, 0.9)',
      paddingHorizontal: 9,
      paddingVertical: 5,
    },
    coverBadgeText: {
      color: colors.gold,
      fontSize: 8,
      fontWeight: '900',
    },
    body: {
      padding: 12,
    },
    placeName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '900',
    },
    metaLabel: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: '900',
      textTransform: 'uppercase',
      marginTop: 8,
    },
    metaValue: {
      color: colors.textSoft,
      fontSize: 10,
      marginTop: 2,
    },
    caption: {
      color: colors.text,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 9,
    },
    captionInput: {
      minHeight: 70,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surfaceSoft,
      color: colors.text,
      paddingHorizontal: 10,
      paddingVertical: 9,
      fontSize: 10,
      marginTop: 9,
    },
    captionEditButton: {
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    captionEditText: {
      color: colors.gold,
      fontSize: 8,
      fontWeight: '900',
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
      paddingHorizontal: 10,
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
      paddingHorizontal: 10,
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
      paddingHorizontal: 10,
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
