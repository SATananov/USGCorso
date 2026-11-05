import { useRef, useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import { recognizeWithTesseract } from '../ocr/providers/tesseractProvider';
import { useTheme } from '../theme/ThemeContext';

const LANGUAGE_MODELS = { bg: 'bul', en: 'eng', it: 'ita' };
const LANGUAGES = ['bg', 'en', 'it'];
const TIMEOUT_MS = 25000;

const copy = {
  bg: {
    title: 'OCR тестова лаборатория',
    subtitle: 'Само локален тест. Нищо не се публикува.',
    selectLanguage: 'Език за разпознаване',
    camera: 'КАМЕРА',
    library: 'ОТ ГАЛЕРИЯТА',
    result: 'Разпознат текст',
    placeholder: 'След сканиране текстът ще се появи тук.',
    copy: 'ИЗБЕРИ ТЕКСТА',
    clear: 'ИЗЧИСТИ',
    empty: 'В изображението не е намерен текст.',
    error: 'Разпознаването не успя.',
    permission: 'Нужен е достъп до камерата или снимките.',
    copied: 'Маркирай и копирай от менюто на телефона.',
    duration: 'Време',
    chars: 'Знаци',
    provider: 'Двигател',
    running: 'Разпознаване...',
    source: 'Избрано изображение',
    timeout: 'Тестът надхвърли 25 секунди.',
  },
  en: {
    title: 'OCR Test Lab',
    subtitle: 'Local testing only. Nothing is published.',
    selectLanguage: 'Recognition language',
    camera: 'CAMERA',
    library: 'FROM GALLERY',
    result: 'Recognized text',
    placeholder: 'The recognized text will appear here.',
    copy: 'SELECT TEXT',
    clear: 'CLEAR',
    empty: 'No text was found in this image.',
    error: 'Recognition failed.',
    permission: 'Camera or photo permission is required.',
    copied: 'Use the phone menu to copy the selection.',
    duration: 'Time',
    chars: 'Characters',
    provider: 'Engine',
    running: 'Recognizing...',
    source: 'Selected image',
    timeout: 'The test exceeded 25 seconds.',
  },
  it: {
    title: 'Laboratorio OCR',
    subtitle: 'Solo test locale. Nessuna pubblicazione.',
    selectLanguage: 'Lingua di riconoscimento',
    camera: 'FOTOCAMERA',
    library: 'DALLA GALLERIA',
    result: 'Testo riconosciuto',
    placeholder: 'Il testo riconosciuto apparirà qui.',
    copy: 'SELEZIONA TESTO',
    clear: 'CANCELLA',
    empty: 'Nessun testo trovato nell’immagine.',
    error: 'Riconoscimento non riuscito.',
    permission: 'È necessario l’accesso alla fotocamera o alle foto.',
    copied: 'Usa il menu del telefono per copiare.',
    duration: 'Tempo',
    chars: 'Caratteri',
    provider: 'Motore',
    running: 'Riconoscimento...',
    source: 'Immagine selezionata',
    timeout: 'Il test ha superato 25 secondi.',
  },
};

async function recognizeWithDeadline(uri, model) {
  let timer;
  try {
    return await Promise.race([
      recognizeWithTesseract(uri, model),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('OCR_TEST_TIMEOUT')), TIMEOUT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export default function OcrTestLabScreen() {
  const editorRef = useRef(null);
  const { language } = useLanguage();
  const { colors } = useTheme();
  const labels = copy[language] || copy.en;
  const [modelLanguage, setModelLanguage] = useState(language in LANGUAGE_MODELS ? language : 'en');
  const [imageUri, setImageUri] = useState(null);
  const [resultText, setResultText] = useState('');
  const [durationMs, setDurationMs] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function scan(source) {
    if (busy) return;
    setMessage('');
    const permission = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage(labels.permission);
      return;
    }

    let selected;
    try {
      selected = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    } catch (error) {
      console.warn('[USG_OCR_LAB] picker failed', error?.message || 'unknown');
      setMessage(labels.error);
      return;
    }
    if (selected.canceled || !selected.assets?.[0]?.uri) return;

    const uri = selected.assets[0].uri;
    setImageUri(uri);
    setResultText('');
    setDurationMs(null);
    setBusy(true);
    const started = Date.now();
    const model = LANGUAGE_MODELS[modelLanguage];
    console.log('[USG_OCR_LAB] start', model);
    try {
      const result = await recognizeWithDeadline(uri, model);
      const text = result?.text || '';
      const elapsed = Date.now() - started;
      setDurationMs(elapsed);
      setResultText(text);
      if (!text.trim()) setMessage(labels.empty);
      console.log('[USG_OCR_LAB] success', model, 'characters', text.length, 'elapsedMs', elapsed);
    } catch (error) {
      const elapsed = Date.now() - started;
      setDurationMs(elapsed);
      const code = error?.message || 'unknown';
      console.warn('[USG_OCR_LAB] failed', model, code, 'elapsedMs', elapsed);
      setMessage(code === 'OCR_TEST_TIMEOUT' ? labels.timeout : `${labels.error} (${code})`);
    } finally {
      setBusy(false);
    }
  }

  function selectResult() {
    if (!resultText.trim()) return;
    editorRef.current?.focus();
    editorRef.current?.setNativeProps({ selection: { start: 0, end: resultText.length } });
    setMessage(labels.copied);
  }

  function clearResult() {
    if (busy) return;
    setImageUri(null);
    setResultText('');
    setDurationMs(null);
    setMessage('');
  }

  return (
    <SafeAreaView edges={['bottom']} style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={[styles.brand, { color: colors.gold }]}>USG — UNICO SUO GENERE</Text>
        <Text style={[styles.title, { color: colors.text }]}>{labels.title}</Text>
        <Text style={[styles.subtitle, { color: colors.textSoft }]}>{labels.subtitle}</Text>

        <Text style={[styles.label, { color: colors.text }]}>{labels.selectLanguage}</Text>
        <View style={styles.languageRow}>
          {LANGUAGES.map((item) => {
            const active = item === modelLanguage;
            return (
              <Pressable
                key={item}
                disabled={busy}
                onPress={() => { setModelLanguage(item); clearResult(); }}
                style={[styles.languageButton, { borderColor: colors.gold, backgroundColor: active ? colors.gold : colors.surface }]}
              >
                <Text style={[styles.languageText, { color: active ? '#090909' : colors.text }]}>{item.toUpperCase()}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <Pressable disabled={busy} onPress={() => scan('camera')} style={[styles.primaryButton, { backgroundColor: colors.gold }, busy && styles.disabled]}>
            <Text style={styles.primaryText}>{labels.camera}</Text>
          </Pressable>
          <Pressable disabled={busy} onPress={() => scan('library')} style={[styles.outlineButton, { borderColor: colors.gold }, busy && styles.disabled]}>
            <Text style={[styles.outlineText, { color: colors.gold }]}>{labels.library}</Text>
          </Pressable>
        </View>

        {imageUri ? (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={[styles.label, { color: colors.text }]}>{labels.source}</Text>
            <Image source={{ uri: imageUri }} resizeMode="contain" style={styles.preview} />
          </View>
        ) : null}

        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.label, { color: colors.gold }]}>{labels.result}</Text>
          {busy ? <View style={styles.busy}><ActivityIndicator color={colors.gold}/><Text style={{ color: colors.textSoft }}>{labels.running}</Text></View> : null}
          <TextInput
            ref={editorRef}
            multiline
            value={resultText}
            onChangeText={setResultText}
            placeholder={labels.placeholder}
            placeholderTextColor={colors.textMuted}
            textAlignVertical="top"
            style={[styles.editor, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          />
          <Text style={[styles.metrics, { color: colors.textSoft }]}>
            {labels.provider}: Tesseract · {LANGUAGE_MODELS[modelLanguage]} · {labels.chars}: {resultText.length}
            {durationMs == null ? '' : ` · ${labels.duration}: ${(durationMs / 1000).toFixed(1)} s`}
          </Text>
          {message ? <Text selectable style={[styles.message, { color: colors.gold }]}>{message}</Text> : null}
        </View>

        <Pressable onPress={selectResult} disabled={!resultText.trim()} style={[styles.primaryButton, { backgroundColor: colors.gold }, !resultText.trim() && styles.disabled]}>
          <Text style={styles.primaryText}>{labels.copy}</Text>
        </Pressable>
        <Pressable onPress={clearResult} disabled={busy} style={[styles.outlineButton, { borderColor: colors.gold }, busy && styles.disabled]}>
          <Text style={[styles.outlineText, { color: colors.gold }]}>{labels.clear}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 36, gap: 14 },
  brand: { fontSize: 11, fontWeight: '800', letterSpacing: 2, textAlign: 'center' },
  title: { fontSize: 27, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 8 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  languageRow: { flexDirection: 'row', gap: 10 },
  languageButton: { flex: 1, borderWidth: 1, borderRadius: 20, paddingVertical: 12, alignItems: 'center' },
  languageText: { fontSize: 16, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10 },
  primaryButton: { minHeight: 52, borderRadius: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, flex: 1 },
  primaryText: { color: '#090909', fontSize: 13, fontWeight: '900', textAlign: 'center' },
  outlineButton: { minHeight: 52, borderWidth: 1, borderRadius: 24, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12, flex: 1 },
  outlineText: { fontSize: 13, fontWeight: '900', textAlign: 'center' },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 },
  preview: { height: 160, width: '100%' },
  editor: { borderWidth: 1, borderRadius: 14, minHeight: 220, fontSize: 17, lineHeight: 25, paddingHorizontal: 12, paddingVertical: 12 },
  busy: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  metrics: { fontSize: 12, lineHeight: 20 },
  message: { fontSize: 13, lineHeight: 20 },
  disabled: { opacity: 0.45 },
});
