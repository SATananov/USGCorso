import USGDialog from '../components/USGDialog';
import { useState as useUSGDialogState } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  adminDeleteSharedContentAsset,
  adminDeleteSharedContentItem,
  adminSetContentStatus,
  adminUpdateContentItem,
  getAdminSharedContentAssets,
  getAdminSharedContentItemDetails,
} from '../governance/contentGovernanceService';
import { useLanguage } from '../i18n/LanguageContext';
import USGBackToTop from '../components/USGBackToTop';
import { useTheme } from '../theme/ThemeContext';
import USGProgressBar from '../components/USGProgressBar';

const sectionLabels = {
  home: {
    bg: 'Начало',
    en: 'Home',
    it: 'Home',
  },
  knowledge: {
    bg: 'Знание',
    en: 'Knowledge',
    it: 'Conoscenza',
  },
  community: {
    bg: 'Общност',
    en: 'Community',
    it: 'Comunità',
  },
  services: {
    bg: 'Услуги',
    en: 'Services',
    it: 'Servizi',
  },
  events: {
    bg: 'Събития',
    en: 'Events',
    it: 'Eventi',
  },
  corso_match: {
    bg: 'Корсо съвпадение',
    en: 'Corso Match',
    it: 'Corso Match',
  },
  about: {
    bg: 'За USG',
    en: 'About USG',
    it: 'Su USG',
  },
};

const copy = {
  bg: {
    management: 'Управление',
    information: 'ИНФОРМАЦИЯ',
    author: 'АВТОР',
    assets: 'СВЪРЗАНИ МАТЕРИАЛИ',
    status: 'СТАТУС',
    edit: 'РЕДАКТИРАЙ',
    save: 'ЗАПАЗИ',
    cancel: 'ОТКАЗ',
    approve: 'ОДОБРИ',
    reject: 'ОТХВЪРЛИ',
    archive: 'АРХИВИРАЙ',
    review: 'ВЪРНИ ЗА ПРОВЕРКА',
    remove: 'ИЗТРИЙ ОКОНЧАТЕЛНО',
    removeTitle: 'Окончателно изтриване',
    removeMessage: 'Съдържанието и свързаните файлове ще бъдат премахнати окончателно. Продължаваме ли?',
    removeAsset: 'ИЗТРИЙ ФАЙЛ',
    removeAssetTitle: 'Изтриване на файл',
    removeAssetMessage: 'Файлът ще бъде премахнат окончателно. Продължаваме ли?',
    openFile: 'ОТВОРИ ФАЙЛ',
    loadError: 'Съдържанието не можа да се зареди.',
    actionError: 'Действието не можа да се изпълни.',
    titleField: 'Заглавие',
    bodyField: 'Съдържание',
    type: 'Тип',
    created: 'Създадено',
    updated: 'Обновено',
    user: 'Потребител',
    noAssets: 'Няма свързани снимки или документи.',
  },
  en: {
    management: 'Management',
    information: 'INFORMATION',
    author: 'AUTHOR',
    assets: 'RELATED MATERIALS',
    status: 'STATUS',
    edit: 'EDIT',
    save: 'SAVE',
    cancel: 'CANCEL',
    approve: 'APPROVE',
    reject: 'REJECT',
    archive: 'ARCHIVE',
    review: 'RETURN TO REVIEW',
    remove: 'DELETE PERMANENTLY',
    removeTitle: 'Permanent deletion',
    removeMessage: 'The content and related files will be permanently removed. Continue?',
    removeAsset: 'DELETE FILE',
    removeAssetTitle: 'Delete file',
    removeAssetMessage: 'The file will be permanently removed. Continue?',
    openFile: 'OPEN FILE',
    loadError: 'Content could not be loaded.',
    actionError: 'The action could not be completed.',
    titleField: 'Title',
    bodyField: 'Content',
    type: 'Type',
    created: 'Created',
    updated: 'Updated',
    user: 'User',
    noAssets: 'There are no related photos or documents.',
  },
  it: {
    management: 'Gestione',
    information: 'INFORMAZIONI',
    author: 'AUTORE',
    assets: 'MATERIALI COLLEGATI',
    status: 'STATO',
    edit: 'MODIFICA',
    save: 'SALVA',
    cancel: 'ANNULLA',
    approve: 'APPROVA',
    reject: 'RIFIUTA',
    archive: 'ARCHIVIA',
    review: 'RIMETTI IN REVISIONE',
    remove: 'ELIMINA DEFINITIVAMENTE',
    removeTitle: 'Eliminazione definitiva',
    removeMessage: 'Il contenuto e i file collegati saranno eliminati definitivamente. Continuare?',
    removeAsset: 'ELIMINA FILE',
    removeAssetTitle: 'Elimina file',
    removeAssetMessage: 'Il file sarà eliminato definitivamente. Continuare?',
    openFile: 'APRI FILE',
    loadError: 'Impossibile caricare il contenuto.',
    actionError: 'Impossibile completare l’azione.',
    titleField: 'Titolo',
    bodyField: 'Contenuto',
    type: 'Tipo',
    created: 'Creato',
    updated: 'Aggiornato',
    user: 'Utente',
    noAssets: 'Non ci sono foto o documenti collegati.',
  },
};

export default function AdminContentDetailsScreen({ route, navigation }) {
  const [usgDialog, setUsgDialog] = useUSGDialogState(null);
  const [usgDialogBusy, setUsgDialogBusy] = useUSGDialogState(false);

  async function handleUSGDialogConfirm() {
    const action = usgDialog?.onConfirm;

    if (!action || usgDialogBusy) {
      return;
    }

    setUsgDialogBusy(true);

    try {
      setUsgDialog(null);
      await action();
    } finally {
      setUsgDialogBusy(false);
    }
  }

  function closeUSGDialog() {
    if (!usgDialogBusy) {
      setUsgDialog(null);
    }
  }


  const { itemId, sectionKey } = route.params;
  const { language } = useLanguage();
  const scrollRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const shown = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hidden = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      shown.remove();
      hidden.remove();
    };
  }, []);
  const { colors } = useTheme();
  const labels = copy[language] ?? copy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const sectionTitle =
    sectionLabels[sectionKey]?.[language] ||
    sectionLabels[sectionKey]?.en ||
    sectionKey;

  const [item, setItem] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const [itemResult, assetResult] = await Promise.all([
      getAdminSharedContentItemDetails(itemId),
      getAdminSharedContentAssets(itemId),
    ]);

    if (itemResult.error || assetResult.error) {
      setError(labels.loadError);
      setLoading(false);
      return;
    }

    const detail = Array.isArray(itemResult.data)
      ? itemResult.data[0]
      : itemResult.data;

    if (!detail || detail.section_key !== sectionKey) {
      setItem(null);
      setAssets([]);
      setError(labels.loadError);
      setLoading(false);
      return;
    }

    setItem(detail);
    setAssets(assetResult.data ?? []);
    setLoading(false);
  }, [itemId, labels.loadError, sectionKey]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveEdit() {
    if (!item) {
      return;
    }

    setWorking(true);
    setError('');

    const result = await adminUpdateContentItem(item.id, {
      title,
      body,
      contentType: item.content_type,
    });

    if (result.error) {
      setError(labels.actionError);
      setWorking(false);
      return;
    }

    setEditing(false);
    await load();
    setWorking(false);
  }

  async function changeStatus(status) {
    if (!item) {
      return;
    }

    setWorking(true);
    setError('');

    const result = await adminSetContentStatus(item.id, status);

    if (result.error) {
      setError(labels.actionError);
      setWorking(false);
      return;
    }

    await load();
    setWorking(false);
  }

  function confirmDelete() {
    if (!item) {
      return;
    }

    setUsgDialog({
      title: labels.removeTitle,
      message: labels.removeMessage,
      cancelText: labels.cancel,
      confirmText: labels.remove,
      onConfirm: async () => {
        setWorking(true);
                  const result = await adminDeleteSharedContentItem(item.id);

                  if (result.error) {
                    setError(labels.actionError);
                    setWorking(false);
                    return;
                  }

                  navigation.goBack();
      },
    });
  }

  function confirmAssetDelete(asset) {
    setUsgDialog({
      title: labels.removeAssetTitle,
      message: labels.removeAssetMessage,
      cancelText: labels.cancel,
      confirmText: labels.removeAsset,
      onConfirm: async () => {
        setWorking(true);
                  const result = await adminDeleteSharedContentAsset(asset.id);

                  if (result.error) {
                    setError(labels.actionError);
                    setWorking(false);
                    return;
                  }

                  await load();
                  setWorking(false);
      },
    });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <USGProgressBar label={sectionTitle} />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={styles.error}>{error || labels.loadError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    (
        <>
          <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        ref={scrollRef}
        onScroll={(event) => {
          const visible = event.nativeEvent.contentOffset.y > 220;
          setShowBackToTop((previous) => previous === visible ? previous : visible);
        }}
        scrollEventThrottle={32}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.kicker}>USG CORSO ADMIN</Text>
          <Text style={styles.section}>{sectionTitle}</Text>
          <Text style={styles.title}>
            {item.title || item.content_type}
          </Text>
          <Text style={styles.status}>{item.status}</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{labels.information}</Text>

          {editing ? (
            <>
              <TextInput
                value={title}
                onChangeText={setTitle}
                maxLength={180}
                placeholder={labels.titleField}
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
              <TextInput
                value={body}
                onChangeText={setBody}
                maxLength={20000}
                multiline
                textAlignVertical="top"
                placeholder={labels.bodyField}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textarea]}
              />

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
                  onPress={saveEdit}
                >
                  <Text style={styles.primaryText}>{labels.save}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Info label={labels.type} value={item.content_type} styles={styles} />

              {item.body ? (
                <Text style={styles.body}>{item.body}</Text>
              ) : null}

              <Info
                label={labels.created}
                value={new Date(item.created_at).toLocaleString()}
                styles={styles}
              />
              <Info
                label={labels.updated}
                value={new Date(item.updated_at).toLocaleString()}
                styles={styles}
              />

              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  setTitle(item.title || '');
                  setBody(item.body || '');
                  setEditing(true);
                }}
              >
                <Text style={styles.primaryText}>{labels.edit}</Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{labels.author}</Text>
          <Info
            label={labels.user}
            value={
              item.owner_display_name ||
              item.owner_username ||
              'USG Member'
            }
            styles={styles}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{labels.assets}</Text>

          {assets.length === 0 ? (
            <Text style={styles.empty}>{labels.noAssets}</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.assetList}
            >
              {assets.map((asset) => {
                const isImage =
                  asset.mime_type?.startsWith('image/') ||
                  asset.asset_type === 'image';

                return (
                  <View key={asset.id} style={styles.assetCard}>
                    {isImage && asset.signed_url ? (
                      <Image
                        source={{ uri: asset.signed_url }}
                        style={styles.assetImage}
                      />
                    ) : (
                      <View style={styles.documentPreview}>
                        <Text style={styles.documentType}>
                          {asset.asset_type?.toUpperCase() || 'FILE'}
                        </Text>
                      </View>
                    )}

                    <View style={styles.assetBody}>
                      <Text numberOfLines={2} style={styles.assetName}>
                        {asset.file_name || asset.asset_type}
                      </Text>

                      {asset.signed_url ? (
                        <Pressable
                          style={styles.secondaryButton}
                          onPress={() => Linking.openURL(asset.signed_url)}
                        >
                          <Text style={styles.secondaryText}>
                            {labels.openFile}
                          </Text>
                        </Pressable>
                      ) : null}

                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => confirmAssetDelete(asset)}
                      >
                        <Text style={styles.deleteText}>
                          {labels.removeAsset}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{labels.status}</Text>

          <View style={styles.actions}>
            {item.status !== 'approved' ? (
              <Pressable
                style={styles.primaryButton}
                onPress={() => changeStatus('approved')}
              >
                <Text style={styles.primaryText}>{labels.approve}</Text>
              </Pressable>
            ) : null}

            {item.status !== 'rejected' ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => changeStatus('rejected')}
              >
                <Text style={styles.secondaryText}>{labels.reject}</Text>
              </Pressable>
            ) : null}

            {item.status !== 'archived' ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => changeStatus('archived')}
              >
                <Text style={styles.secondaryText}>{labels.archive}</Text>
              </Pressable>
            ) : null}

            {item.status !== 'pending' ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => changeStatus('pending')}
              >
                <Text style={styles.secondaryText}>{labels.review}</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={styles.deleteButton}
              onPress={confirmDelete}
            >
              <Text style={styles.deleteText}>{labels.remove}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <USGBackToTop
        visible={showBackToTop && !keyboardVisible && !usgDialog}
        language={language}
        bottomOffset={68}
        onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
      />
    </SafeAreaView>
          <USGDialog
          visible={Boolean(usgDialog)}
          title={usgDialog?.title || ''}
          message={usgDialog?.message || ''}
          cancelText={usgDialog?.cancelText}
          confirmText={usgDialog?.confirmText}
          onCancel={closeUSGDialog}
          onConfirm={handleUSGDialogConfirm}
          onSingleAction={closeUSGDialog}
          busy={usgDialogBusy}
        />
        </>
      )
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
    section: {
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: '800',
      marginTop: 8,
    },
    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '900',
      marginTop: 5,
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
    body: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 20,
      marginBottom: 12,
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
      minHeight: 180,
    },
    assetList: {
      gap: 12,
      paddingTop: 4,
    },
    assetCard: {
      width: 240,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      overflow: 'hidden',
    },
    assetImage: {
      width: 240,
      height: 165,
      backgroundColor: '#09090b',
    },
    documentPreview: {
      width: 240,
      height: 165,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    documentType: {
      color: colors.gold,
      fontSize: 20,
      fontWeight: '900',
      letterSpacing: 1.5,
    },
    assetBody: {
      padding: 12,
    },
    assetName: {
      color: colors.text,
      fontSize: 11,
      fontWeight: '800',
      marginBottom: 10,
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
      marginTop: 6,
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
      marginTop: 6,
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
      marginTop: 8,
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
