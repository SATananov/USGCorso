import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  deleteMyContentItemWithAssets,
  updateMyContentItem,
} from '../governance/contentGovernanceService';
import { useLanguage } from '../i18n/LanguageContext';
import { useRef as useBackToTopRef, useState as useBackToTopState, useEffect as useBackToTopEffect } from 'react';
import USGBackToTop from '../components/USGBackToTop';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';
import { formatTimestamp } from '../utils/dateTime';

function formatDate(value, language) {
  return formatTimestamp(value, ({ bg: 'bg-BG', en: 'en-GB', it: 'it-IT' }[language] || 'en-GB'), { dateStyle: 'medium', timeStyle: 'short' });
}

const editCopy = {
  bg: {
    edit: 'ПОПРАВИ',
    save: 'ЗАПАЗИ',
    saveRejected: 'ЗАПАЗИ И ИЗПРАТИ',
    cancel: 'ОТКАЗ',
    title: 'Заглавие',
    body: 'Съдържание',
    failedTitle: 'Неуспешно записване',
    failedText: 'Промените не можаха да бъдат записани.',
    pendingInfo: 'След записване материалът ще бъде изпратен за нов преглед.',
  },
  en: {
    edit: 'EDIT',
    save: 'SAVE',
    saveRejected: 'SAVE & RESUBMIT',
    cancel: 'CANCEL',
    title: 'Title',
    body: 'Content',
    failedTitle: 'Save failed',
    failedText: 'The changes could not be saved.',
    pendingInfo: 'After saving, the material will be returned for review.',
  },
  it: {
    edit: 'MODIFICA',
    save: 'SALVA',
    saveRejected: 'SALVA E REINVIA',
    cancel: 'ANNULLA',
    title: 'Titolo',
    body: 'Contenuto',
    failedTitle: 'Salvataggio non riuscito',
    failedText: 'Impossibile salvare le modifiche.',
    pendingInfo: 'Dopo il salvataggio, il materiale tornerà in revisione.',
  },
};

const deleteCopy = {
  bg: {
    button: 'ИЗТРИЙ',
    title: 'Изтриване на материал',
    message: 'Материалът и свързаните с него файлове ще бъдат изтрити окончателно. Продължаваме ли?',
    cancel: 'Отказ',
    confirm: 'Изтрий',
    failedTitle: 'Неуспешно изтриване',
    failedText: 'Материалът не можа да бъде изтрит.',
    cleanupTitle: 'Материалът е изтрит',
    cleanupText: 'Материалът е изтрит, но част от свързаните файлове не можаха да бъдат почистени.',
  },
  en: {
    button: 'DELETE',
    title: 'Delete material',
    message: 'The material and its related files will be permanently deleted. Continue?',
    cancel: 'Cancel',
    confirm: 'Delete',
    failedTitle: 'Delete failed',
    failedText: 'The material could not be deleted.',
    cleanupTitle: 'Material deleted',
    cleanupText: 'The material was deleted, but some related files could not be cleaned up.',
  },
  it: {
    button: 'ELIMINA',
    title: 'Elimina materiale',
    message: 'Il materiale e i file collegati saranno eliminati definitivamente. Continuare?',
    cancel: 'Annulla',
    confirm: 'Elimina',
    failedTitle: 'Eliminazione non riuscita',
    failedText: 'Impossibile eliminare il materiale.',
    cleanupTitle: 'Materiale eliminato',
    cleanupText: 'Il materiale è stato eliminato, ma alcuni file collegati non sono stati rimossi.',
  },
};

export default function MyMaterialDetailsScreen({ route, navigation }) {
  const backToTopRef = useBackToTopRef(null);
  const [backToTopVisible, setBackToTopVisible] = useBackToTopState(false);
  const { language: backToTopLanguage } = useLanguage();
  const [backToTopKeyboardVisible, setBackToTopKeyboardVisible] = useBackToTopState(false);
  useBackToTopEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setBackToTopKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setBackToTopKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  const item = route.params?.item;
  const { language, t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(null);

  function showFeedback(title, message, onClose = null) {
    setFeedbackModal({
      title,
      message,
      onClose,
    });
  }

  function closeFeedback() {
    const onClose = feedbackModal?.onClose;
    setFeedbackModal(null);

    if (onClose) {
      onClose();
    }
  }
  const labels = deleteCopy[language] ?? deleteCopy.en;
  const editLabels = editCopy[language] ?? editCopy.en;
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(item?.title ?? '');
  const [body, setBody] = useState(item?.body ?? '');

  function startEdit() {
    setTitle(item?.title ?? '');
    setBody(item?.body ?? '');
    setEditing(true);
  }

  function cancelEdit() {
    setTitle(item?.title ?? '');
    setBody(item?.body ?? '');
    setEditing(false);
  }

  async function saveEdit() {
    if (!item?.id || saving) {
      return;
    }

    setSaving(true);

    try {
      const result = await updateMyContentItem(item.id, {
        title,
        body,
        contentType: item.content_type,
      });

      if (result.error) {
        showFeedback(editLabels.failedTitle, editLabels.failedText);
        return;
      }

      navigation.goBack();
    } catch {
      showFeedback(editLabels.failedTitle, editLabels.failedText);
    } finally {
      setSaving(false);
    }
  }

  async function removeItem() {
    if (!item?.id || deleting) {
      return;
    }

    setDeleting(true);

    try {
      const result = await deleteMyContentItemWithAssets(item.id);

      if (result.error && !result.deleted) {
        showFeedback(labels.failedTitle, labels.failedText);
        return;
      }

      if (result.error && result.deleted) {
        showFeedback(
          labels.cleanupTitle,
          labels.cleanupText,
          () => navigation.goBack()
        );
        return;
      }

      navigation.goBack();
    } catch {
      showFeedback(labels.failedTitle, labels.failedText);
    } finally {
      setDeleting(false);
    }
  }

  function confirmDelete() {
    setDeleteConfirmVisible(true);
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>{t('myMaterials.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        ref={backToTopRef}
        onScroll={(event) => {
          const visible = event.nativeEvent.contentOffset.y > 220;
          setBackToTopVisible((current) => current === visible ? current : visible);
        }}
        scrollEventThrottle={32} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>
            {t(`myMaterials.sections.${item.section_key}`)}
          </Text>
          <Text style={styles.title}>
            {item.title || t('myMaterials.untitled')}
          </Text>

          <View style={styles.statusRow}>
            <Text style={styles.typeText}>
              {t(`myMaterials.types.${item.content_type}`)}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {t(`myMaterials.status.${item.status}`)}
              </Text>
            </View>
          </View>
        </View>

        {editing ? (
          <View style={styles.card}>
            <Text style={styles.label}>{editLabels.title}</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              editable={!saving}
              maxLength={180}
              style={styles.input}
            />

            <Text style={[styles.label, styles.bodyLabel]}>{editLabels.body}</Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              editable={!saving}
              maxLength={20000}
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.bodyInput]}
            />

            <Text style={styles.pendingInfo}>{editLabels.pendingInfo}</Text>

            <View style={styles.editActions}>
              <Pressable
                disabled={saving}
                onPress={cancelEdit}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.secondaryButtonPressed,
                  saving && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.secondaryButtonText}>{editLabels.cancel}</Text>
              </Pressable>

              <Pressable
                disabled={saving}
                onPress={saveEdit}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                  saving && styles.buttonDisabled,
                ]}
              >
                {saving ? (
                  <ActivityIndicator color="#070708" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {item.status === 'rejected'
                      ? editLabels.saveRejected
                      : editLabels.save}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>{t('myMaterials.content')}</Text>
            <Text style={styles.body}>
              {item.body || t('myMaterials.noContent')}
            </Text>
          </View>
        )}

        {item.moderation_note ? (
          <View style={styles.noteCard}>
            <Text style={styles.noteLabel}>
              {t('myMaterials.moderationNote')}
            </Text>
            <Text style={styles.noteText}>{item.moderation_note}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.metaItem}>
            <Text style={styles.label}>{t('myMaterials.created')}</Text>
            <Text style={styles.metaValue}>
              {formatDate(item.created_at, language)}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.metaItem}>
            <Text style={styles.label}>{t('myMaterials.updated')}</Text>
            <Text style={styles.metaValue}>
              {formatDate(item.updated_at, language)}
            </Text>
          </View>

          {item.approved_at ? (
            <>
              <View style={styles.separator} />
              <View style={styles.metaItem}>
                <Text style={styles.label}>{t('myMaterials.approvedAt')}</Text>
                <Text style={styles.metaValue}>
                  {formatDate(item.approved_at, language)}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {!editing ? (
          <Pressable
            disabled={deleting}
            onPress={startEdit}
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.editButtonPressed,
              deleting && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.editButtonText}>{editLabels.edit}</Text>
          </Pressable>
        ) : null}

        <Pressable
          disabled={deleting || editing}
          onPress={confirmDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
            deleting && styles.deleteButtonDisabled,
          ]}
        >
          {deleting ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.deleteButtonText}>{labels.button}</Text>
          )}
        </Pressable>
      </ScrollView>
      <USGBackToTop
        visible={backToTopVisible && !backToTopKeyboardVisible}
        language={backToTopLanguage}
        bottomOffset={68}
        onPress={() => backToTopRef.current?.scrollTo({ y: 0, animated: true })}
      />
      <Modal
        animationType="fade"
        transparent
        visible={deleteConfirmVisible}
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.usgModalOverlay}>
          <View style={styles.usgModalCard}>
            <Text style={styles.usgModalEyebrow}>USG CORSO</Text>
            <Text style={styles.usgModalTitle}>{labels.title}</Text>
            <Text style={styles.usgModalMessage}>{labels.message}</Text>

            <View style={styles.usgModalActions}>
              <Pressable
                onPress={() => setDeleteConfirmVisible(false)}
                style={({ pressed }) => [
                  styles.usgModalSecondary,
                  pressed && styles.usgModalPressed,
                ]}
              >
                <Text style={styles.usgModalSecondaryText}>
                  {labels.cancel}
                </Text>
              </Pressable>

              <Pressable
                disabled={deleting}
                onPress={() => {
                  setDeleteConfirmVisible(false);
                  removeItem();
                }}
                style={({ pressed }) => [
                  styles.usgModalPrimary,
                  pressed && styles.usgModalPressed,
                  deleting && styles.buttonDisabled,
                ]}
              >
                {deleting ? (
                  <ActivityIndicator color="#070708" />
                ) : (
                  <Text style={styles.usgModalPrimaryText}>
                    {labels.confirm}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(feedbackModal)}
        onRequestClose={closeFeedback}
      >
        <View style={styles.usgModalOverlay}>
          <View style={styles.usgModalCard}>
            <Text style={styles.usgModalEyebrow}>USG CORSO</Text>
            <Text style={styles.usgModalTitle}>
              {feedbackModal?.title || ''}
            </Text>
            <Text style={styles.usgModalMessage}>
              {feedbackModal?.message || ''}
            </Text>

            <Pressable
              onPress={closeFeedback}
              style={({ pressed }) => [
                styles.usgModalSingleAction,
                pressed && styles.usgModalPressed,
              ]}
            >
              <Text style={styles.usgModalPrimaryText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.md,
      paddingBottom: 36,
    },
    hero: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 20,
      marginBottom: 12,
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 7,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '900',
      lineHeight: 30,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginTop: 14,
    },
    typeText: {
      flex: 1,
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: '700',
    },
    statusBadge: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.goldSoft,
      backgroundColor: colors.activeSurface,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    statusText: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: '900',
    },
    card: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 17,
      marginBottom: 10,
    },
    label: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    body: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 21,
      marginTop: 9,
    },
    noteCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.goldSoft,
      backgroundColor: colors.activeSurface,
      padding: 17,
      marginBottom: 10,
    },
    noteLabel: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    noteText: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 8,
    },
    metaItem: {
      paddingVertical: 3,
    },
    metaValue: {
      color: colors.text,
      fontSize: 12,
      marginTop: 5,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 13,
    },
    infoCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 15,
    },
    infoText: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 18,
      textAlign: 'center',
    },
    input: {
      minHeight: 46,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      color: colors.text,
      paddingHorizontal: 13,
      paddingVertical: 11,
      fontSize: 13,
      marginTop: 8,
    },
    bodyLabel: {
      marginTop: 16,
    },
    bodyInput: {
      minHeight: 160,
      lineHeight: 20,
    },
    pendingInfo: {
      color: colors.textSoft,
      fontSize: 10,
      lineHeight: 16,
      marginTop: 12,
    },
    editActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 14,
    },
    primaryButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: 999,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    primaryButtonPressed: {
      opacity: 0.78,
    },
    primaryButtonText: {
      color: '#070708',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    secondaryButton: {
      flex: 1,
      minHeight: 46,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    secondaryButtonPressed: {
      opacity: 0.75,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    editButton: {
      minHeight: 48,
      borderRadius: 999,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      paddingHorizontal: 16,
    },
    editButtonPressed: {
      opacity: 0.78,
    },
    editButtonText: {
      color: '#070708',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    deleteButton: {
      minHeight: 48,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.danger || '#b14b42',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      paddingHorizontal: 16,
    },
    deleteButtonPressed: {
      opacity: 0.76,
    },
    deleteButtonDisabled: {
      opacity: 0.5,
    },
    deleteButtonText: {
      color: colors.danger || '#b14b42',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    usgModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.86)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    usgModalCard: {
      width: '100%',
      maxWidth: 520,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surface,
      padding: 24,
    },
    usgModalEyebrow: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.2,
      marginBottom: 10,
    },
    usgModalTitle: {
      color: colors.text,
      fontSize: 22,
      lineHeight: 29,
      fontWeight: '900',
    },
    usgModalMessage: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 22,
      marginTop: 12,
    },
    usgModalActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 24,
    },
    usgModalSecondary: {
      flex: 1,
      minHeight: 48,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    usgModalSecondaryText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    usgModalPrimary: {
      flex: 1,
      minHeight: 48,
      borderRadius: 999,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    usgModalSingleAction: {
      minHeight: 48,
      borderRadius: 999,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      marginTop: 24,
    },
    usgModalPrimaryText: {
      color: '#070708',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    usgModalPressed: {
      opacity: 0.74,
    },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
      textAlign: 'center',
    },
  });
}
