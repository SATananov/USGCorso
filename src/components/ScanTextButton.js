import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { useLanguage } from '../i18n/LanguageContext';
import { recognizeTextFromImage } from '../ocr/ocrService';
import { scanQrFromImage } from '../qr/qrService';

const sourceCopy = {
  bg: {
    title: 'Избери източник',
    text: 'Снимай текста сега или избери изображение от телефона.',
    camera: 'КАМЕРА',
    library: 'ОТ ТЕЛЕФОНА',
    cancel: 'ОТКАЗ',
    permissionTitle: 'Нужен е достъп',
    cameraPermission:
      'Разреши достъп до камерата, за да снимаш текст директно през USG Corso.',
    libraryPermission:
      'Разреши достъп до снимките, за да избереш изображение от телефона.',
    noTextTitle: 'Не е открит текст',
    noTextText:
      'Не успяхме да разпознаем текст в изображението. Опитай отново с по-ясна снимка.',
    failedTitle: 'Разпознаването не успя',
    failedText:
      'Не успяхме да обработим изображението. Опитай отново.',
    ok: 'OK',
    qrFound: 'Открит QR код',
  },
  en: {
    title: 'Choose source',
    text: 'Take a photo now or choose an image from your phone.',
    camera: 'CAMERA',
    library: 'FROM PHONE',
    cancel: 'CANCEL',
    permissionTitle: 'Access required',
    cameraPermission:
      'Allow camera access to scan text directly in USG Corso.',
    libraryPermission:
      'Allow photo access to choose an image from your phone.',
    noTextTitle: 'No text found',
    noTextText:
      'We could not detect text in this image. Try again with a clearer photo.',
    failedTitle: 'Recognition failed',
    failedText:
      'We could not process this image. Please try again.',
    ok: 'OK',
    qrFound: 'QR code detected',
  },
  it: {
    title: 'Scegli la fonte',
    text: 'Scatta una foto ora oppure scegli un’immagine dal telefono.',
    camera: 'FOTOCAMERA',
    library: 'DAL TELEFONO',
    cancel: 'ANNULLA',
    permissionTitle: 'Accesso necessario',
    cameraPermission:
      'Consenti l’accesso alla fotocamera per scansionare il testo direttamente in USG Corso.',
    libraryPermission:
      'Consenti l’accesso alle foto per scegliere un’immagine dal telefono.',
    noTextTitle: 'Nessun testo trovato',
    noTextText:
      'Non siamo riusciti a rilevare testo nell’immagine. Prova con una foto più nitida.',
    failedTitle: 'Riconoscimento non riuscito',
    failedText:
      'Non siamo riusciti a elaborare l’immagine. Riprova.',
    ok: 'OK',
    qrFound: 'Codice QR rilevato',
  },
};

export default function ScanTextButton({
  colors,
  labels,
  currentText = '',
  onTextChange,
  disabled = false,
}) {
  const { language } = useLanguage();
  const copy = sourceCopy[language] || sourceCopy.en;
  const [scanning, setScanning] = useState(false);
  const [sourceVisible, setSourceVisible] = useState(false);
  const [resultText, setResultText] = useState('');
  const [resultVisible, setResultVisible] = useState(false);
  const [qrCodes, setQrCodes] = useState([]);
  const [info, setInfo] = useState(null);

  function closeResult() {
    setResultVisible(false);
    setResultText('');
    setQrCodes([]);
  }

  function appendResult() {
    const next = currentText.trim()
      ? `${currentText.trim()}\n\n${resultText.trim()}`
      : resultText.trim();

    onTextChange(next);
    closeResult();
  }

  function replaceResult() {
    onTextChange(resultText.trim());
    closeResult();
  }

  async function recognizeAsset(asset) {
    if (!asset?.uri) {
      return;
    }

    setScanning(true);

    try {
      const [ocrResult, qrResult] = await Promise.allSettled([
        recognizeTextFromImage(asset.uri, language),
        scanQrFromImage(asset.uri),
      ]);

      const recognizedText =
        ocrResult.status === 'fulfilled' ? ocrResult.value?.text?.trim() ?? '' : '';
      const detectedQrCodes =
        qrResult.status === 'fulfilled' ? qrResult.value?.codes ?? [] : [];

      if (!recognizedText && !detectedQrCodes.length) {
        setInfo({
          title:
            ocrResult.status === 'rejected'
              ? copy.failedTitle
              : copy.noTextTitle,
          text:
            ocrResult.status === 'rejected'
              ? copy.failedText
              : copy.noTextText,
        });
        return;
      }

      setQrCodes(detectedQrCodes);

      const qrText = detectedQrCodes
        .map((code, index) =>
          detectedQrCodes.length === 1
            ? `QR: ${code}`
            : `QR ${index + 1}: ${code}`
        )
        .join('\n');

      const normalizedOcr = recognizedText
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

      const missingQrCodes = detectedQrCodes.filter(
        (code) =>
          !normalizedOcr.includes(
            code.toLowerCase().replace(/\s+/g, ' ').trim()
          )
      );

      const missingQrText = missingQrCodes
        .map((code, index) =>
          missingQrCodes.length === 1
            ? `QR: ${code}`
            : `QR ${index + 1}: ${code}`
        )
        .join('\n');

      setResultText(
        recognizedText && missingQrText
          ? `${recognizedText}\n\n${missingQrText}`
          : recognizedText || qrText
      );

      setResultVisible(true);
    } finally {
      setScanning(false);
    }
  }

  async function scanFromLibrary() {
    setSourceVisible(false);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setInfo({
        title: copy.permissionTitle,
        text: copy.libraryPermission,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    await recognizeAsset(result.assets[0]);
  }

  async function scanFromCamera() {
    setSourceVisible(false);

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setInfo({
        title: copy.permissionTitle,
        text: copy.cameraPermission,
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    await recognizeAsset(result.assets[0]);
  }

  return (
    <>
      <Pressable
        disabled={disabled || scanning}
        onPress={() => setSourceVisible(true)}
        style={({ pressed }) => [
          styles.button,
          { borderColor: colors.gold },
          pressed && styles.pressed,
          (disabled || scanning) && styles.disabled,
        ]}
      >
        {scanning ? (
          <ActivityIndicator color={colors.gold} />
        ) : (
          <Text style={[styles.text, { color: colors.gold }]}>
            {labels.button}
          </Text>
        )}
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={sourceVisible}
        onRequestClose={() => setSourceVisible(false)}
      >
        <View style={styles.overlayCenter}>
          <View
            style={[
              styles.choiceCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.gold,
              },
            ]}
          >
            <Text style={[styles.choiceTitle, { color: colors.text }]}>
              {copy.title}
            </Text>
            <Text style={[styles.choiceText, { color: colors.textSoft }]}>
              {copy.text}
            </Text>

            <Pressable
              onPress={scanFromCamera}
              style={({ pressed }) => [
                styles.primaryAction,
                { backgroundColor: colors.gold },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryActionText}>{copy.camera}</Text>
            </Pressable>

            <Pressable
              onPress={scanFromLibrary}
              style={({ pressed }) => [
                styles.secondaryAction,
                { borderColor: colors.gold },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.secondaryActionText, { color: colors.gold }]}>
                {copy.library}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSourceVisible(false)}
              style={({ pressed }) => [
                styles.cancelAction,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.cancelActionText, { color: colors.textSoft }]}>
                {copy.cancel}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(info)}
        onRequestClose={() => setInfo(null)}
      >
        <View style={styles.overlayCenter}>
          <View
            style={[
              styles.choiceCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.gold,
              },
            ]}
          >
            <Text style={[styles.choiceTitle, { color: colors.text }]}>
              {info?.title}
            </Text>
            <Text style={[styles.choiceText, { color: colors.textSoft }]}>
              {info?.text}
            </Text>
            <Pressable
              onPress={() => setInfo(null)}
              style={({ pressed }) => [
                styles.primaryAction,
                { backgroundColor: colors.gold },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryActionText}>{copy.ok}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={resultVisible}
        onRequestClose={closeResult}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlayBottom}
        >
          <View
            style={[
              styles.editorShell,
              {
                backgroundColor: colors.surface,
                borderColor: colors.gold,
              },
            ]}
          >
            <View style={styles.editorHeader}>
              <View style={styles.editorHeaderText}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {labels.resultTitle}
                </Text>
                <Text style={[styles.modalText, { color: colors.textSoft }]}>
                  {labels.resultText}
                </Text>
              </View>

              <Pressable
                onPress={closeResult}
                style={({ pressed }) => [
                  styles.closeButton,
                  { borderColor: colors.border },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.closeButtonText, { color: colors.text }]}>
                  ×
                </Text>
              </Pressable>
            </View>

            {qrCodes.length ? (
              <View
                style={[
                  styles.qrCard,
                  {
                    borderColor: colors.gold,
                    backgroundColor: colors.background,
                  },
                ]}
              >
                <Text style={[styles.qrTitle, { color: colors.gold }]}>
                  {copy.qrFound}
                </Text>

                {qrCodes.map((code, index) => (
                  <Text
                    key={`${code}-${index}`}
                    selectable
                    style={[styles.qrValue, { color: colors.text }]}
                  >
                    {code}
                  </Text>
                ))}


              </View>
            ) : null}

            <ScrollView
              contentContainerStyle={styles.editorScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                value={resultText}
                onChangeText={setResultText}
                multiline
                scrollEnabled
                textAlignVertical="top"
                autoCorrect
                style={[
                  styles.editor,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
              />
            </ScrollView>

            <View style={styles.actions}>
              <Pressable
                onPress={appendResult}
                style={({ pressed }) => [
                  styles.primaryAction,
                  { backgroundColor: colors.gold },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.primaryActionText}>{labels.append}</Text>
              </Pressable>

              <Pressable
                onPress={replaceResult}
                style={({ pressed }) => [
                  styles.secondaryAction,
                  { borderColor: colors.gold },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.secondaryActionText, { color: colors.gold }]}>
                  {labels.replace}
                </Text>
              </Pressable>

              <Pressable
                onPress={closeResult}
                style={({ pressed }) => [
                  styles.cancelAction,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.cancelActionText, { color: colors.textSoft }]}>
                  {labels.cancel}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  text: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.5,
  },
  overlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.84)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'flex-end',
  },
  choiceCard: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
  },
  choiceTitle: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  choiceText: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 18,
  },
  editorShell: {
    height: '92%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  editorHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  modalText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '400',
  },
  qrCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  qrTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  qrValue: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  editorScrollContent: {
    flexGrow: 1,
  },
  editor: {
    minHeight: 430,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    gap: 10,
    marginTop: 14,
  },
  primaryAction: {
    minHeight: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryActionText: {
    color: '#070708',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  secondaryAction: {
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  cancelAction: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  cancelActionText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
