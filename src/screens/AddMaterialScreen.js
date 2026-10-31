import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import {
  createContentItem,
  deleteMyContentItem,
} from '../governance/contentGovernanceService';
import { uploadMyContentImage } from '../governance/userContentMediaService';
import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';
import ScanTextButton from '../components/ScanTextButton';

const SECTION_TYPES = {
  knowledge: ['article', 'image'],
  community: ['post', 'image'],
  services: ['service_profile', 'image'],
  events: ['event', 'poster', 'image'],
  corso_match: ['match_profile', 'request', 'image'],
};

const SECTIONS = Object.keys(SECTION_TYPES);

export default function AddMaterialScreen({ navigation }) {
  const { session } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [section, setSection] = useState('knowledge');
  const [contentType, setContentType] = useState('article');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageAsset, setImageAsset] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function changeSection(nextSection) {
    setSection(nextSection);
    setContentType(SECTION_TYPES[nextSection][0]);
  }

  async function chooseImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError(t('addMaterial.photoPermission'));
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

    const selected = result.assets[0];

    if (selected.fileSize && selected.fileSize > 20 * 1024 * 1024) {
      setError(t('addMaterial.photoTooLarge'));
      return;
    }

    setImageAsset(selected);
    setError('');
  }

  async function submit() {
    if (!session?.user?.id || saving) {
      return;
    }

    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (!cleanTitle) {
      setError(t('addMaterial.titleRequired'));
      return;
    }

    if (cleanTitle.length > 180) {
      setError(t('addMaterial.titleTooLong'));
      return;
    }

    if (cleanBody.length > 20000) {
      setError(t('addMaterial.bodyTooLong'));
      return;
    }

    if (contentType === 'image' && !imageAsset) {
      setError(t('addMaterial.imageRequired'));
      return;
    }

    setSaving(true);
    setError('');

    let createdItem = null;

    try {
      const created = await createContentItem({
        section,
        contentType,
        title: cleanTitle,
        body: cleanBody,
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

      Alert.alert(
        t('addMaterial.successTitle'),
        t('addMaterial.successText'),
        [
          {
            text: t('addMaterial.done'),
            onPress: () => navigation.replace('MyMaterials'),
          },
        ]
      );
    } catch {
      if (createdItem?.id) {
        await deleteMyContentItem(createdItem.id);
      }

      setError(t('addMaterial.saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  const availableTypes = SECTION_TYPES[section];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>USG CORSO</Text>
          <Text style={styles.title}>{t('addMaterial.title')}</Text>
          <Text style={styles.subtitle}>{t('addMaterial.subtitle')}</Text>
        </View>

        <Text style={styles.label}>{t('addMaterial.section')}</Text>
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

        <Text style={styles.label}>{t('addMaterial.type')}</Text>
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
                onPress={() => setContentType(value)}
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

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>{t('addMaterial.materialTitle')}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('addMaterial.titlePlaceholder')}
            placeholderTextColor={colors.textMuted}
            maxLength={180}
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>{t('addMaterial.body')}</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder={t('addMaterial.bodyPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={20000}
            style={[styles.input, styles.bodyInput]}
          />

          <View style={styles.scanBlock}>
            <ScanTextButton
              colors={colors}
              currentText={body}
              onTextChange={setBody}
              disabled={saving}
              labels={{
                button: t('ocr.scanText'),
                permissionTitle: t('ocr.permissionTitle'),
                permissionText: t('ocr.permissionText'),
                noTextTitle: t('ocr.noTextTitle'),
                noTextText: t('ocr.noTextText'),
                resultTitle: t('ocr.resultTitle'),
                resultText: t('ocr.resultText'),
                cancel: t('ocr.cancel'),
                replace: t('ocr.replace'),
                append: t('ocr.append'),
                failedTitle: t('ocr.failedTitle'),
                failedText: t('ocr.failedText'),
              }}
            />
            <Text style={styles.scanHint}>{t('ocr.scanHint')}</Text>
          </View>

          <Text style={styles.fieldLabel}>{t('addMaterial.photo')}</Text>

          {imageAsset ? (
            <View style={styles.previewCard}>
              <Image
                source={{ uri: imageAsset.uri }}
                style={styles.preview}
                resizeMode="cover"
              />
              <Pressable
                onPress={() => setImageAsset(null)}
                style={styles.removeButton}
              >
                <Text style={styles.removeText}>
                  {t('addMaterial.removePhoto')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={chooseImage} style={styles.photoButton}>
              <Text style={styles.photoButtonText}>
                {t('addMaterial.choosePhoto')}
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t('addMaterial.moderationTitle')}</Text>
          <Text style={styles.infoText}>{t('addMaterial.moderationText')}</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

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
            <Text style={styles.submitText}>{t('addMaterial.submit')}</Text>
          )}
        </Pressable>
      </ScrollView>
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
      marginBottom: 18,
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 2.4,
      marginBottom: 7,
    },
    title: {
      color: colors.text,
      fontSize: 25,
      fontWeight: '900',
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      marginTop: 6,
    },
    label: {
      color: colors.textSoft,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 7,
    },
    chipRow: {
      gap: 8,
      paddingBottom: 16,
    },
    chip: {
      minHeight: 36,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    chipActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    chipText: {
      color: colors.textSoft,
      fontSize: 10,
      fontWeight: '800',
    },
    chipTextActive: {
      color: colors.gold,
    },
    formCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 16,
      marginBottom: 12,
    },
    fieldLabel: {
      color: colors.textSoft,
      fontSize: 10,
      fontWeight: '800',
      marginBottom: 7,
      marginTop: 3,
    },
    input: {
      minHeight: 46,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      color: colors.text,
      fontSize: 13,
      paddingHorizontal: 13,
      paddingVertical: 11,
      marginBottom: 15,
    },
    bodyInput: {
      minHeight: 150,
      textAlignVertical: 'top',
    },
    scanBlock: {
      marginTop: -3,
      marginBottom: 15,
    },
    scanHint: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 16,
      textAlign: 'center',
      marginTop: 7,
      paddingHorizontal: 8,
    },
    photoButton: {
      minHeight: 46,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoButtonText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    previewCard: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    preview: {
      width: '100%',
      height: 220,
      backgroundColor: colors.background,
    },
    removeButton: {
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    removeText: {
      color: colors.textSoft,
      fontSize: 10,
      fontWeight: '800',
    },
    infoCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.goldSoft,
      backgroundColor: colors.activeSurface,
      padding: 15,
      marginBottom: 12,
    },
    infoTitle: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '900',
    },
    infoText: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 18,
      marginTop: 5,
    },
    error: {
      color: colors.danger || '#d66',
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 12,
    },
    submitButton: {
      minHeight: 50,
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
  });
}
