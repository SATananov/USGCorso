import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  adminSetContentStatus,
  adminUpdateContentItem,
  getAdminContentItems,
} from '../governance/contentGovernanceService';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import USGProgressBar from './USGProgressBar';

const sectionTypeMap = {
  home: ['banner', 'news', 'text'],
  my_corso: ['dog_profile', 'image', 'document'],
  places: ['document'],
  knowledge: ['article', 'image', 'document', 'brochure'],
  community: ['post', 'image', 'comment', 'report'],
  services: ['service_profile', 'image', 'document'],
  events: ['event', 'poster', 'image', 'brochure'],
  corso_match: ['match_profile', 'request', 'image'],
  about: ['text', 'image', 'document'],
};

const copy = {
  bg: {
    title: 'Съдържание',
    pending: 'ЧАКАЩИ',
    approved: 'ОДОБРЕНИ',
    rejected: 'ОТХВЪРЛЕНИ',
    archived: 'АРХИВ',
    empty: 'Няма съдържание в този статус.',
    loadError: 'Съдържанието не можа да се зареди.',
    actionError: 'Действието не можа да се изпълни.',
    open: 'ОТВОРИ',
    edit: 'РЕДАКТИРАЙ',
    save: 'ЗАПАЗИ',
    cancel: 'ОТКАЗ',
    approve: 'ОДОБРИ',
    reject: 'ОТХВЪРЛИ',
    archive: 'АРХИВИРАЙ',
    pendingAgain: 'ВЪРНИ ЗА ПРОВЕРКА',
    owner: 'Автор',
    type: 'Тип',
    updated: 'Обновено',
    titleField: 'Заглавие',
    bodyField: 'Съдържание',
    all: 'ВСИЧКИ',
    typeLabels: {
      banner: 'Банери',
      news: 'Новини',
      text: 'Текстове',
      dog_profile: 'Кучета',
      image: 'Снимки',
      document: 'Документи',
      place_description: 'Описания',
      article: 'Статии',
      brochure: 'Брошури / PDF',
      post: 'Публикации',
      comment: 'Коментари',
      report: 'Сигнали',
      service_profile: 'Профили',
      event: 'Събития',
      poster: 'Плакати',
      match_profile: 'Профили',
      request: 'Заявки',
    },
  },
  en: {
    title: 'Content',
    pending: 'PENDING',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    archived: 'ARCHIVE',
    empty: 'There is no content with this status.',
    loadError: 'Content could not be loaded.',
    actionError: 'The action could not be completed.',
    open: 'OPEN',
    edit: 'EDIT',
    save: 'SAVE',
    cancel: 'CANCEL',
    approve: 'APPROVE',
    reject: 'REJECT',
    archive: 'ARCHIVE',
    pendingAgain: 'RETURN TO REVIEW',
    owner: 'Author',
    type: 'Type',
    updated: 'Updated',
    titleField: 'Title',
    bodyField: 'Content',
    all: 'ALL',
    typeLabels: {
      banner: 'Banners',
      news: 'News',
      text: 'Texts',
      dog_profile: 'Dogs',
      image: 'Photos',
      document: 'Documents',
      place_description: 'Descriptions',
      article: 'Articles',
      brochure: 'Brochures / PDF',
      post: 'Posts',
      comment: 'Comments',
      report: 'Reports',
      service_profile: 'Profiles',
      event: 'Events',
      poster: 'Posters',
      match_profile: 'Profiles',
      request: 'Requests',
    },
  },
  it: {
    title: 'Contenuti',
    pending: 'IN ATTESA',
    approved: 'APPROVATI',
    rejected: 'RIFIUTATI',
    archived: 'ARCHIVIO',
    empty: 'Nessun contenuto con questo stato.',
    loadError: 'Impossibile caricare i contenuti.',
    actionError: 'Impossibile completare l’azione.',
    open: 'APRI',
    edit: 'MODIFICA',
    save: 'SALVA',
    cancel: 'ANNULLA',
    approve: 'APPROVA',
    reject: 'RIFIUTA',
    archive: 'ARCHIVIA',
    pendingAgain: 'RIMETTI IN REVISIONE',
    owner: 'Autore',
    type: 'Tipo',
    updated: 'Aggiornato',
    titleField: 'Titolo',
    bodyField: 'Contenuto',
    all: 'TUTTI',
    typeLabels: {
      banner: 'Banner',
      news: 'Notizie',
      text: 'Testi',
      dog_profile: 'Cani',
      image: 'Foto',
      document: 'Documenti',
      place_description: 'Descrizioni',
      article: 'Articoli',
      brochure: 'Brochure / PDF',
      post: 'Post',
      comment: 'Commenti',
      report: 'Segnalazioni',
      service_profile: 'Profili',
      event: 'Eventi',
      poster: 'Locandine',
      match_profile: 'Profili',
      request: 'Richieste',
    },
  },
};

const STATUSES = ['pending', 'approved', 'rejected', 'archived'];

export default function AdminContentGovernance({
  sectionKey,
  onChanged,
}) {
  const navigation = useNavigation();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const labels = copy[language] ?? copy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const typeKeys = sectionTypeMap[sectionKey] ?? [];
  const [activeType, setActiveType] = useState('all');
  const [activeStatus, setActiveStatus] = useState('pending');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    title: '',
    body: '',
    contentType: 'text',
  });
  const [error, setError] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');

    const result = await getAdminContentItems({
      section: sectionKey,
      status: activeStatus,
    });

    if (result.error) {
      setItems([]);
      setError(labels.loadError);
    } else {
      const allItems = result.data ?? [];
      setItems(
        activeType === 'all'
          ? allItems
          : allItems.filter((item) => item.content_type === activeType)
      );
    }

    setLoading(false);
  }, [activeStatus, activeType, labels.loadError, sectionKey]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function changeStatus(itemId, status) {
    if (workingId) {
      return;
    }

    setWorkingId(itemId);
    setError('');

    const result = await adminSetContentStatus(itemId, status);

    if (result.error) {
      setError(labels.actionError);
      setWorkingId(null);
      return;
    }

    await loadItems();
    setWorkingId(null);
    onChanged?.();
  }

  function beginEdit(item) {
    setEditingId(item.id);
    setEditValues({
      title: item.title ?? '',
      body: item.body ?? '',
      contentType: item.content_type ?? 'text',
    });
    setError('');
  }

  async function saveEdit(itemId) {
    if (workingId) {
      return;
    }

    setWorkingId(itemId);
    setError('');

    const result = await adminUpdateContentItem(itemId, editValues);

    if (result.error) {
      setError(labels.actionError);
      setWorkingId(null);
      return;
    }

    setEditingId(null);
    await loadItems();
    setWorkingId(null);
    onChanged?.();
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{labels.title}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeTabs}
      >
        <Pressable
          style={[styles.typeTab, activeType === 'all' && styles.typeTabActive]}
          onPress={() => {
            setActiveType('all');
            setEditingId(null);
          }}
        >
          <Text
            style={[
              styles.typeTabText,
              activeType === 'all' && styles.typeTabTextActive,
            ]}
          >
            {labels.all}
          </Text>
        </Pressable>

        {typeKeys.map((typeKey) => (
          <Pressable
            key={typeKey}
            style={[
              styles.typeTab,
              activeType === typeKey && styles.typeTabActive,
            ]}
            onPress={() => {
              setActiveType(typeKey);
              setEditingId(null);
            }}
          >
            <Text
              style={[
                styles.typeTabText,
                activeType === typeKey && styles.typeTabTextActive,
              ]}
            >
              {labels.typeLabels[typeKey] || typeKey}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusTabs}
      >
        {STATUSES.map((status) => (
          <Pressable
            key={status}
            style={[
              styles.statusTab,
              activeStatus === status && styles.statusTabActive,
            ]}
            onPress={() => {
              setActiveStatus(status);
              setEditingId(null);
            }}
          >
            <Text
              style={[
                styles.statusTabText,
                activeStatus === status && styles.statusTabTextActive,
              ]}
            >
              {labels[status]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? <USGProgressBar label={labels.title} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && !error && items.length === 0 ? (
        <Text style={styles.empty}>{labels.empty}</Text>
      ) : null}

      {items.map((item) => {
        const editing = editingId === item.id;

        return (
          <View key={item.id} style={styles.card}>
            {editing ? (
              <>
                <Text style={styles.fieldLabel}>{labels.titleField}</Text>
                <TextInput
                  value={editValues.title}
                  onChangeText={(value) =>
                    setEditValues((current) => ({
                      ...current,
                      title: value,
                    }))
                  }
                  maxLength={180}
                  style={styles.input}
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={styles.fieldLabel}>{labels.bodyField}</Text>
                <TextInput
                  value={editValues.body}
                  onChangeText={(value) =>
                    setEditValues((current) => ({
                      ...current,
                      body: value,
                    }))
                  }
                  maxLength={20000}
                  multiline
                  textAlignVertical="top"
                  style={[styles.input, styles.textarea]}
                  placeholderTextColor={colors.textMuted}
                />

                <View style={styles.actions}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => setEditingId(null)}
                  >
                    <Text style={styles.secondaryText}>{labels.cancel}</Text>
                  </Pressable>

                  <Pressable
                    style={styles.primaryButton}
                    disabled={workingId === item.id}
                    onPress={() => saveEdit(item.id)}
                  >
                    <Text style={styles.primaryText}>{labels.save}</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.itemTitle}>
                  {item.title || labels.typeLabels[item.content_type] || item.content_type}
                </Text>

                <Text style={styles.typeBadge}>
                  {labels.typeLabels[item.content_type] || item.content_type}
                </Text>

                {item.body ? (
                  <Text numberOfLines={6} style={styles.body}>
                    {item.body}
                  </Text>
                ) : null}

                <Text style={styles.metaLabel}>{labels.owner}</Text>
                <Text style={styles.metaValue}>
                  {item.owner_display_name ||
                    item.owner_username ||
                    'USG Member'}
                </Text>

                <Text style={styles.metaLabel}>{labels.updated}</Text>
                <Text style={styles.metaValue}>
                  {new Date(item.updated_at).toLocaleDateString()}
                </Text>

                <View style={styles.actions}>
                  {['home', 'knowledge', 'community', 'services', 'events', 'corso_match', 'about'].includes(sectionKey) ? (
                    <Pressable
                      style={styles.primaryButton}
                      onPress={() =>
                        navigation.navigate('AdminContentDetails', {
                          itemId: item.id,
                          sectionKey,
                        })
                      }
                    >
                      <Text style={styles.primaryText}>{labels.open}</Text>
                    </Pressable>
                  ) : null}

                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => beginEdit(item)}
                  >
                    <Text style={styles.secondaryText}>{labels.edit}</Text>
                  </Pressable>

                  {activeStatus !== 'approved' ? (
                    <Pressable
                      style={styles.primaryButton}
                      disabled={workingId === item.id}
                      onPress={() => changeStatus(item.id, 'approved')}
                    >
                      <Text style={styles.primaryText}>{labels.approve}</Text>
                    </Pressable>
                  ) : null}

                  {activeStatus !== 'rejected' ? (
                    <Pressable
                      style={styles.secondaryButton}
                      disabled={workingId === item.id}
                      onPress={() => changeStatus(item.id, 'rejected')}
                    >
                      <Text style={styles.secondaryText}>{labels.reject}</Text>
                    </Pressable>
                  ) : null}

                  {activeStatus !== 'archived' ? (
                    <Pressable
                      style={styles.secondaryButton}
                      disabled={workingId === item.id}
                      onPress={() => changeStatus(item.id, 'archived')}
                    >
                      <Text style={styles.secondaryText}>{labels.archive}</Text>
                    </Pressable>
                  ) : null}

                  {activeStatus !== 'pending' ? (
                    <Pressable
                      style={styles.secondaryButton}
                      disabled={workingId === item.id}
                      onPress={() => changeStatus(item.id, 'pending')}
                    >
                      <Text style={styles.secondaryText}>
                        {labels.pendingAgain}
                      </Text>
                    </Pressable>
                  ) : null}
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
    title: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
    },
    typeTabs: {
      gap: 8,
      paddingTop: 12,
      paddingBottom: 4,
    },
    typeTab: {
      minHeight: 38,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    typeTabActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    typeTabText: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '900',
    },
    typeTabTextActive: {
      color: colors.gold,
    },
    statusTabs: {
      gap: 8,
      paddingTop: 6,
      paddingBottom: 8,
    },
    statusTab: {
      minHeight: 34,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSoft,
    },
    statusTabActive: {
      borderColor: colors.gold,
    },
    statusTabText: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: '900',
    },
    statusTabTextActive: {
      color: colors.gold,
    },
    card: {
      marginTop: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      padding: 13,
    },
    itemTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '900',
    },
    typeBadge: {
      alignSelf: 'flex-start',
      color: colors.gold,
      fontSize: 8,
      fontWeight: '900',
      marginTop: 5,
    },
    body: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 7,
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
    fieldLabel: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '900',
      marginBottom: 5,
      marginTop: 7,
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
    },
    textarea: {
      minHeight: 130,
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
