import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import {
  adminSetContentStatus,
  createContentItem,
  deleteMyContentItem,
  getIsAdmin,
} from '../governance/contentGovernanceService';
import { uploadMyContentImage } from '../governance/userContentMediaService';
import { useLanguage } from '../i18n/LanguageContext';
import { useRef as useBackToTopRef, useState as useBackToTopState, useEffect as useBackToTopEffect } from 'react';
import USGBackToTop from '../components/USGBackToTop';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';
import ScanTextButton from '../components/ScanTextButton';
import { KNOWLEDGE_CATEGORY_KEYS, getKnowledgeCategoryHeading, getKnowledgeCategoryLabel } from '../knowledge/knowledgeCategories';

const SECTION_TYPES = {
  knowledge: ['article', 'image'],
  community: ['post', 'image'],
  services: ['service_profile', 'image'],
  events: ['event', 'poster', 'image'],
  corso_match: ['match_profile', 'request', 'image'],
};

const SECTIONS = Object.keys(SECTION_TYPES);

const copy = {
  bg: {
    articleTitle: 'Заглавие',
    articleTitlePlaceholder: 'Заглавие на материала',
    articleBody: 'Текст / описание',
    articleBodyPlaceholder: 'Напиши съдържанието или кратко описание...',
    photoName: 'Име на снимката',
    photoNamePlaceholder: 'Незадължително име на снимката',
    photoDescription: 'Описание към снимката',
    photoDescriptionPlaceholder: 'Незадължително описание към снимката...',
    photo: 'Снимка',
    addPhoto: 'ДОБАВИ СНИМКА',
    addPhotoToArticle: 'ДОБАВИ СНИМКА КЪМ МАТЕРИАЛА',
    changePhoto: 'ПРОМЕНИ СНИМКАТА',
    remove: 'ПРЕМАХНИ',
    clearMaterial: 'ИЗЧИСТИ МАТЕРИАЛА',
    camera: 'НАПРАВИ СНИМКА',
    fromPhone: 'ОТ ТЕЛЕФОНА',
    cancel: 'ОТКАЗ',
    sourceTitle: 'Добави снимка',
    sourceText: 'Направи снимка сега или избери вече запазена снимка от телефона.',
    cameraPermission: 'Разреши достъп до камерата, за да направиш снимка през USG Corso.',
    photoPermission: 'Разреши достъп до снимките, за да избереш изображение от телефона.',
    photoTooLarge: 'Снимката е твърде голяма. Максималният размер е 20 MB.',
    titleRequired: 'Добави заглавие на материала.',
    titleTooLong: 'Заглавието е твърде дълго.',
    bodyTooLong: 'Текстът е твърде дълъг.',
    imageRequired: 'Добави снимка, преди да изпратиш материала.',
    saveFailed: 'Материалът не можа да бъде запазен.',
    moderationTitle: 'Модерация',
    moderationText: 'След подаване материалът ще бъде със статус Чакащ. Администратор може да го одобри, отхвърли или върне за преглед.',
    adminModerationTitle: 'Директно публикуване',
    adminModerationText: 'Влизаш като администратор. Твоят материал ще бъде публикуван директно и няма да чака собствено одобрение.',
    submit: 'ИЗПРАТИ ЗА ПРЕГЛЕД',
    publish: 'ПУБЛИКУВАЙ',
    successTitle: 'Материалът е подаден',
    successText: 'Материалът е изпратен за преглед и вече се вижда в Моите материали.',
    publishSuccessTitle: 'Материалът е публикуван',
    publishSuccessText: 'Материалът е публикуван директно като одобрен администраторски материал.',
    done: 'OK',
    sourceLanguage: 'Език на оригиналния материал',
    sourceLanguageHint: 'Избери езика на текста, не езика на менюто.',
    scanButton: 'СКАНИРАЙ ТЕКСТ',
    scanResultTitle: 'Разпознат текст',
    scanResultText: 'Провери текста и го редактирай преди добавяне.',
    append: 'ДОБАВИ',
    replace: 'ЗАМЕНИ',
    scanHint: 'Снимай текст сега или избери изображение от телефона. USG Corso ще го разпознае и ще ти позволи да го поправиш.',
    optionalPhotoHint: 'По желание можеш да добавиш снимка към текста. Име и описание към допълнителната снимка ще бъдат добавени в следващата стъпка.',
  },
  en: {
    articleTitle: 'Title',
    articleTitlePlaceholder: 'Material title',
    articleBody: 'Text / description',
    articleBodyPlaceholder: 'Write the content or a short description...',
    photoName: 'Photo name',
    photoNamePlaceholder: 'Optional photo name',
    photoDescription: 'Photo description',
    photoDescriptionPlaceholder: 'Optional photo description...',
    photo: 'Photo',
    addPhoto: 'ADD PHOTO',
    addPhotoToArticle: 'ADD PHOTO TO MATERIAL',
    changePhoto: 'CHANGE PHOTO',
    remove: 'REMOVE',
    clearMaterial: 'CLEAR MATERIAL',
    camera: 'TAKE PHOTO',
    fromPhone: 'FROM PHONE',
    cancel: 'CANCEL',
    sourceTitle: 'Add photo',
    sourceText: 'Take a photo now or choose one already saved on your phone.',
    cameraPermission: 'Allow camera access to take a photo in USG Corso.',
    photoPermission: 'Allow photo access to choose an image from your phone.',
    photoTooLarge: 'The photo is too large. Maximum size is 20 MB.',
    titleRequired: 'Add a material title.',
    titleTooLong: 'The title is too long.',
    bodyTooLong: 'The text is too long.',
    imageRequired: 'Add a photo before submitting the material.',
    saveFailed: 'The material could not be saved.',
    moderationTitle: 'Moderation',
    moderationText: 'After submission the material will be Pending. An administrator can approve, reject, or return it for review.',
    adminModerationTitle: 'Direct publishing',
    adminModerationText: 'You are signed in as an administrator. Your material will be published directly without requiring your own approval.',
    submit: 'SUBMIT FOR REVIEW',
    publish: 'PUBLISH',
    successTitle: 'Material submitted',
    successText: 'The material was sent for review and is now visible in My Materials.',
    publishSuccessTitle: 'Material published',
    publishSuccessText: 'The material was published directly as approved administrator content.',
    done: 'OK',
    sourceLanguage: 'Original material language',
    sourceLanguageHint: 'Choose the text language, not the menu language.',
    scanButton: 'SCAN TEXT',
    scanResultTitle: 'Recognized text',
    scanResultText: 'Review and edit the text before adding it.',
    append: 'ADD',
    replace: 'REPLACE',
    scanHint: 'Take a photo of text now or choose an image from your phone. USG Corso will recognize it and let you edit it.',
    optionalPhotoHint: 'You can optionally add a photo to the text. Per-photo name and caption will be added in the next step.',
  },
  it: {
    articleTitle: 'Titolo',
    articleTitlePlaceholder: 'Titolo del materiale',
    articleBody: 'Testo / descrizione',
    articleBodyPlaceholder: 'Scrivi il contenuto o una breve descrizione...',
    photoName: 'Nome della foto',
    photoNamePlaceholder: 'Nome facoltativo della foto',
    photoDescription: 'Descrizione della foto',
    photoDescriptionPlaceholder: 'Descrizione facoltativa della foto...',
    photo: 'Foto',
    addPhoto: 'AGGIUNGI FOTO',
    addPhotoToArticle: 'AGGIUNGI FOTO AL MATERIALE',
    changePhoto: 'CAMBIA FOTO',
    remove: 'RIMUOVI',
    clearMaterial: 'CANCELLA MATERIALE',
    camera: 'SCATTA FOTO',
    fromPhone: 'DAL TELEFONO',
    cancel: 'ANNULLA',
    sourceTitle: 'Aggiungi foto',
    sourceText: 'Scatta una foto ora oppure scegline una già salvata sul telefono.',
    cameraPermission: 'Consenti l’accesso alla fotocamera per scattare una foto in USG Corso.',
    photoPermission: 'Consenti l’accesso alle foto per scegliere un’immagine dal telefono.',
    photoTooLarge: 'La foto è troppo grande. La dimensione massima è 20 MB.',
    titleRequired: 'Aggiungi un titolo al materiale.',
    titleTooLong: 'Il titolo è troppo lungo.',
    bodyTooLong: 'Il testo è troppo lungo.',
    imageRequired: 'Aggiungi una foto prima di inviare il materiale.',
    saveFailed: 'Impossibile salvare il materiale.',
    moderationTitle: 'Moderazione',
    moderationText: 'Dopo l’invio il materiale avrà stato In attesa. Un amministratore potrà approvarlo, rifiutarlo o rimandarlo in revisione.',
    adminModerationTitle: 'Pubblicazione diretta',
    adminModerationText: 'Hai effettuato l’accesso come amministratore. Il tuo materiale sarà pubblicato direttamente senza richiedere la tua approvazione.',
    submit: 'INVIA PER REVISIONE',
    publish: 'PUBBLICA',
    successTitle: 'Materiale inviato',
    successText: 'Il materiale è stato inviato per la revisione ed è ora visibile in I miei materiali.',
    publishSuccessTitle: 'Materiale pubblicato',
    publishSuccessText: 'Il materiale è stato pubblicato direttamente come contenuto amministrativo approvato.',
    done: 'OK',
    sourceLanguage: 'Lingua del contenuto originale',
    sourceLanguageHint: 'Seleziona la lingua del testo, non quella del menu.',
    scanButton: 'SCANSIONA TESTO',
    scanResultTitle: 'Testo riconosciuto',
    scanResultText: 'Controlla e modifica il testo prima di aggiungerlo.',
    append: 'AGGIUNGI',
    replace: 'SOSTITUISCI',
    scanHint: 'Fotografa il testo ora oppure scegli un’immagine dal telefono. USG Corso lo riconoscerà e potrai modificarlo.',
    optionalPhotoHint: 'Puoi aggiungere facoltativamente una foto al testo. Nome e descrizione della singola foto saranno aggiunti nel passaggio successivo.',
  },
};

export default function AddMaterialScreen({ navigation }) {
  const backToTopRef = useBackToTopRef(null);
  const [backToTopVisible, setBackToTopVisible] = useBackToTopState(false);
  const { language: backToTopLanguage } = useLanguage();
  const [backToTopKeyboardVisible, setBackToTopKeyboardVisible] = useBackToTopState(false);
  useBackToTopEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setBackToTopKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setBackToTopKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  const { session } = useAuth();
  const { language, t } = useLanguage();
  const { colors } = useTheme();
  const labels = copy[language] ?? copy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [section, setSection] = useState('knowledge');
  const [contentType, setContentType] = useState('article');
  const [knowledgeCategory, setKnowledgeCategory] = useState('basics');
  const [sourceLanguage, setSourceLanguage] = useState(language);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageAsset, setImageAsset] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);
  const [photoSourceVisible, setPhotoSourceVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [publishedDirectly, setPublishedDirectly] = useState(false);

  const isImageType = contentType === 'image';

  useEffect(() => {
    let active = true;

    async function loadAdminCapability() {
      const result = await getIsAdmin();

      if (active) {
        setIsAdmin(Boolean(result.data) && !result.error);
      }
    }

    loadAdminCapability();

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  function changeSection(nextSection) {
    setSection(nextSection);
    setContentType(SECTION_TYPES[nextSection][0]);

    if (nextSection === 'knowledge') {
      setKnowledgeCategory('basics');
    }

    setError('');
  }

  function changeContentType(nextType) {
    setContentType(nextType);
    setError('');
  }

  function chooseImage() {
    setPhotoSourceVisible(true);
  }

  function acceptSelectedImage(selected) {
    if (selected.fileSize && selected.fileSize > 20 * 1024 * 1024) {
      setError(labels.photoTooLarge);
      return;
    }

    setImageAsset(selected);
    setError('');
  }

  async function chooseImageFromLibrary() {
    setPhotoSourceVisible(false);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError(labels.photoPermission);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    acceptSelectedImage(result.assets[0]);
  }

  async function takeImageWithCamera() {
    setPhotoSourceVisible(false);

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setError(labels.cameraPermission);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    acceptSelectedImage(result.assets[0]);
  }

  function clearMaterial() {
    setTitle('');
    setBody('');
    setError('');
  }

  async function submit() {
    if (!session?.user?.id || saving) {
      return;
    }

    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (!isImageType && !cleanTitle) {
      setError(labels.titleRequired);
      return;
    }

    if (cleanTitle.length > 180) {
      setError(labels.titleTooLong);
      return;
    }

    if (cleanBody.length > 20000) {
      setError(labels.bodyTooLong);
      return;
    }

    if (isImageType && !imageAsset) {
      setError(labels.imageRequired);
      return;
    }

    setSaving(true);
    setError('');

    let createdItem = null;

    try {
      const adminCheck = await getIsAdmin();
      const shouldPublishDirectly = Boolean(adminCheck.data) && !adminCheck.error;
      setIsAdmin(shouldPublishDirectly);

      const created = await createContentItem({
        section,
        contentType,
        title: cleanTitle,
        body: cleanBody,
        contextType: section === 'knowledge' ? knowledgeCategory : null,
        sourceLanguage,
      });

      if (created.error) {
        throw created.error;
      }

      createdItem = Array.isArray(created.data)
        ? created.data[0]
        : created.data;

      if (!createdItem?.id) {
        throw new Error('Missing created material id');
      }

      if (imageAsset) {
        const uploaded = await uploadMyContentImage(
          session.user.id,
          createdItem.id,
          imageAsset
        );

        if (uploaded.error) {
          throw uploaded.error;
        }
      }

      const alreadyApproved = createdItem.status === 'approved';

      if (shouldPublishDirectly && !alreadyApproved) {
        const published = await adminSetContentStatus(
          createdItem.id,
          'approved'
        );

        if (published.error) {
          throw published.error;
        }
      }

      setPublishedDirectly(shouldPublishDirectly || alreadyApproved);

      setSuccessVisible(true);
    } catch {
      if (createdItem?.id) {
        await deleteMyContentItem(createdItem.id);
      }

      setError(labels.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  const availableTypes = SECTION_TYPES[section];
  const hasTextContent = Boolean(title.trim() || body.trim());

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        ref={backToTopRef}
        onScroll={(event) => {
          const visible = event.nativeEvent.contentOffset.y > 220;
          setBackToTopVisible((current) => current === visible ? current : visible);
        }}
        scrollEventThrottle={32}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={styles.kicker}>USG CORSO</Text>
          <Text style={styles.title}>{t('addMaterial.title')}</Text>
          <Text style={styles.subtitle}>{t('addMaterial.subtitle')}</Text>
        </View>

        <Text style={styles.sectionLabel}>{labels.sourceLanguage}</Text>
        <Text style={{ color: colors.textSoft, fontSize: 12, marginBottom: 8 }}>
          {labels.sourceLanguageHint}
        </Text>
        <View style={[styles.chipRow, { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }]}>
          {['bg', 'en', 'it'].map((code) => (
            <Pressable
              key={code}
              onPress={() => setSourceLanguage(code)}
              disabled={saving}
              accessibilityRole="radio"
              accessibilityState={{ selected: sourceLanguage === code }}
              style={[styles.chip, sourceLanguage === code && styles.chipActive]}
            >
              <Text style={[styles.chipText, sourceLanguage === code && styles.chipTextActive]}>
                {code.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>{t('addMaterial.section')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {SECTIONS.map((value) => {
            const active = section === value;

            return (
              <Pressable
                key={value}
                onPress={() => changeSection(value)}
                style={[
                  styles.chip,
                  active && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active && styles.chipTextActive,
                  ]}
                >
                  {t(`myMaterials.sections.${value}`)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {section === 'knowledge' ? (
          <>
            <Text style={styles.sectionLabel}>{getKnowledgeCategoryHeading(language)}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {KNOWLEDGE_CATEGORY_KEYS.map((value) => {
                const active = knowledgeCategory === value;

                return (
                  <Pressable
                    key={value}
                    onPress={() => setKnowledgeCategory(value)}
                    style={[
                      styles.chip,
                      active && styles.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}
                    >
                      {getKnowledgeCategoryLabel(value, language)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        ) : null}
        <Text style={styles.sectionLabel}>{t('addMaterial.type')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {availableTypes.map((value) => {
            const active = contentType === value;

            return (
              <Pressable
                key={value}
                onPress={() => changeContentType(value)}
                style={[
                  styles.chip,
                  active && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active && styles.chipTextActive,
                  ]}
                >
                  {t(`myMaterials.types.${value}`)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {isImageType ? (
          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>{labels.photoName}</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={labels.photoNamePlaceholder}
              placeholderTextColor={colors.textMuted}
              maxLength={180}
              style={styles.input}
            />

            <View style={styles.keyboardFieldHeader}>
              <Text style={styles.keyboardFieldLabel}>{labels.photoDescription}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={language === 'bg' ? 'Готово' : language === 'it' ? 'Fatto' : 'Done'}
                onPress={() => Keyboard.dismiss()}
                style={styles.keyboardDoneButton}
              >
                <Text style={styles.keyboardDoneText}>
                  {language === 'bg' ? 'ГОТОВО' : language === 'it' ? 'FATTO' : 'DONE'}
                </Text>
              </Pressable>
            </View>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder={labels.photoDescriptionPlaceholder}
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              maxLength={20000}
              style={[styles.input, styles.bodyInput]}
            />

            {hasTextContent ? (
              <Pressable
                onPress={clearMaterial}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.clearButtonText}>
                  {labels.clearMaterial}
                </Text>
              </Pressable>
            ) : null}

            <Text style={styles.fieldLabel}>{labels.photo}</Text>
            {imageAsset ? (
              <PhotoPreview
                asset={imageAsset}
                labels={labels}
                styles={styles}
                onChange={chooseImage}
                onRemove={() => setImageAsset(null)}
              />
            ) : (
              <Pressable
                onPress={chooseImage}
                style={({ pressed }) => [
                  styles.photoAddButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.photoAddButtonText}>
                  {labels.addPhoto}
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>{labels.articleTitle}</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={labels.articleTitlePlaceholder}
              placeholderTextColor={colors.textMuted}
              maxLength={180}
              style={styles.input}
            />

            <View style={styles.keyboardFieldHeader}>
              <Text style={styles.keyboardFieldLabel}>{labels.articleBody}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={language === 'bg' ? 'Готово' : language === 'it' ? 'Fatto' : 'Done'}
                onPress={() => Keyboard.dismiss()}
                style={styles.keyboardDoneButton}
              >
                <Text style={styles.keyboardDoneText}>
                  {language === 'bg' ? 'ГОТОВО' : language === 'it' ? 'FATTO' : 'DONE'}
                </Text>
              </Pressable>
            </View>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder={labels.articleBodyPlaceholder}
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              maxLength={20000}
              style={[styles.input, styles.bodyInput]}
            />

            <ScanTextButton
              colors={colors}
              labels={{
                button: labels.scanButton,
                resultTitle: labels.scanResultTitle,
                resultText: labels.scanResultText,
                append: labels.append,
                replace: labels.replace,
                cancel: labels.cancel,
              }}
              currentText={body}
              onTextChange={setBody}
              disabled={saving}
            />

            <Text style={styles.helperText}>{labels.scanHint}</Text>

            {hasTextContent ? (
              <Pressable
                onPress={clearMaterial}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.clearButtonText}>
                  {labels.clearMaterial}
                </Text>
              </Pressable>
            ) : null}

            <View style={styles.attachmentDivider} />

            <Text style={styles.attachmentTitle}>{labels.photo}</Text>
            <Text style={styles.attachmentHint}>
              {labels.optionalPhotoHint}
            </Text>

            {imageAsset ? (
              <PhotoPreview
                asset={imageAsset}
                labels={labels}
                styles={styles}
                onChange={chooseImage}
                onRemove={() => setImageAsset(null)}
              />
            ) : (
              <Pressable
                onPress={chooseImage}
                style={({ pressed }) => [
                  styles.photoAddSecondary,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.photoAddSecondaryText}>
                  {labels.addPhotoToArticle}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.moderationCard}>
          <Text style={styles.moderationTitle}>
            {isAdmin
              ? labels.adminModerationTitle
              : labels.moderationTitle}
          </Text>
          <Text style={styles.moderationText}>
            {isAdmin
              ? labels.adminModerationText
              : labels.moderationText}
          </Text>
        </View>

        <Pressable
          disabled={saving}
          onPress={submit}
          style={[
            styles.submitButton,
            saving && styles.submitButtonDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#070708" />
          ) : (
            <Text style={styles.submitText}>
              {isAdmin ? labels.publish : labels.submit}
            </Text>
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
        visible={photoSourceVisible}
        onRequestClose={() => setPhotoSourceVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{labels.sourceTitle}</Text>
            <Text style={styles.modalText}>{labels.sourceText}</Text>

            <Pressable
              onPress={takeImageWithCamera}
              style={({ pressed }) => [
                styles.modalPrimary,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalPrimaryText}>{labels.camera}</Text>
            </Pressable>

            <Pressable
              onPress={chooseImageFromLibrary}
              style={({ pressed }) => [
                styles.modalSecondary,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalSecondaryText}>
                {labels.fromPhone}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setPhotoSourceVisible(false)}
              style={({ pressed }) => [
                styles.modalCancel,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalCancelText}>{labels.cancel}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={successVisible}
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {publishedDirectly
                ? labels.publishSuccessTitle
                : labels.successTitle}
            </Text>
            <Text style={styles.modalText}>
              {publishedDirectly
                ? labels.publishSuccessText
                : labels.successText}
            </Text>

            <Pressable
              onPress={() => {
                setSuccessVisible(false);
                navigation.replace('MyMaterials');
              }}
              style={({ pressed }) => [
                styles.modalPrimary,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.modalPrimaryText}>{labels.done}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function PhotoPreview({
  asset,
  labels,
  styles,
  onChange,
  onRemove,
}) {
  return (
    <View style={styles.photoCard}>
      <Image
        source={{ uri: asset.uri }}
        style={styles.photoPreview}
        resizeMode="cover"
      />

      <View style={styles.photoActionRow}>
        <Pressable
          onPress={onChange}
          style={({ pressed }) => [
            styles.photoActionPrimary,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.photoActionPrimaryText}>
            {labels.changePhoto}
          </Text>
        </Pressable>

        <Pressable
          onPress={onRemove}
          style={({ pressed }) => [
            styles.photoActionSecondary,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.photoActionSecondaryText}>
            {labels.remove}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardFieldHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 4,
      marginBottom: 9,
    },
    keyboardFieldLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
      flexShrink: 1,
    },
    keyboardDoneButton: {
      minWidth: 108,
      minHeight: 40,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    keyboardDoneText: {
      color: colors.gold,
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    content: {
      padding: spacing.md,
      paddingBottom: 40,
    },
    hero: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 20,
      marginBottom: 20,
    },
    kicker: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.2,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '900',
      marginTop: 8,
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 8,
    },
    sectionLabel: {
      color: colors.textSoft,
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: 0.8,
      marginBottom: 10,
      marginTop: 4,
    },
    chipRow: {
      gap: 10,
      paddingBottom: 18,
    },
    chip: {
      minHeight: 44,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
    },
    chipActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    chipText: {
      color: colors.textSoft,
      fontSize: 13,
      fontWeight: '800',
    },
    chipTextActive: {
      color: colors.gold,
    },
    formCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 18,
      marginBottom: 16,
    },
    fieldLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 9,
      marginTop: 4,
    },
    input: {
      minHeight: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      color: colors.text,
      fontSize: 15,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 18,
    },
    bodyInput: {
      minHeight: 160,
      lineHeight: 22,
    },
    helperText: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 12,
    },
    clearButton: {
      minHeight: 44,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 14,
      paddingHorizontal: 16,
    },
    clearButtonText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    attachmentDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 22,
    },
    attachmentTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
    },
    attachmentHint: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 19,
      marginTop: 6,
      marginBottom: 14,
    },
    photoAddButton: {
      minHeight: 50,
      borderRadius: 999,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
    },
    photoAddButtonText: {
      color: '#070708',
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    photoAddSecondary: {
      minHeight: 48,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
    },
    photoAddSecondaryText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.6,
      textAlign: 'center',
    },
    photoCard: {
      overflow: 'hidden',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    photoPreview: {
      width: '100%',
      aspectRatio: 1.18,
      backgroundColor: colors.background,
    },
    photoActionRow: {
      flexDirection: 'row',
      gap: 10,
      padding: 14,
      backgroundColor: colors.surface,
    },
    photoActionPrimary: {
      flex: 1,
      minHeight: 46,
      borderRadius: 999,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    photoActionPrimaryText: {
      color: '#070708',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.6,
      textAlign: 'center',
    },
    photoActionSecondary: {
      minWidth: 110,
      minHeight: 46,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    photoActionSecondaryText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.6,
      textAlign: 'center',
    },
    moderationCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.goldSoft,
      backgroundColor: colors.activeSurface,
      padding: 18,
      marginBottom: 16,
    },
    moderationTitle: {
      color: colors.gold,
      fontSize: 16,
      fontWeight: '900',
    },
    moderationText: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 21,
      marginTop: 9,
    },
    error: {
      color: colors.danger || '#d66',
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 12,
    },
    submitButton: {
      minHeight: 52,
      borderRadius: 999,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButtonDisabled: {
      opacity: 0.55,
    },
    submitText: {
      color: '#070708',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.84)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    modalCard: {
      width: '100%',
      maxWidth: 520,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surface,
      padding: 24,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '900',
      lineHeight: 30,
    },
    modalText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 22,
      marginTop: 10,
      marginBottom: 20,
    },
    modalPrimary: {
      minHeight: 50,
      borderRadius: 999,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
    },
    modalPrimaryText: {
      color: '#070708',
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    modalSecondary: {
      minHeight: 48,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      paddingHorizontal: 18,
    },
    modalSecondaryText: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 0.7,
    },
    modalCancel: {
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
    },
    modalCancelText: {
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    pressed: {
      opacity: 0.72,
    },
  });
}
