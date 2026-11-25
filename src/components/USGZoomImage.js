import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../i18n/LanguageContext';
import USGZoomSurface from './USGZoomSurface';

const labels = {
  bg: { open: 'Отвори изображението', close: 'Затвори', error: 'Изображението не може да се зареди.' },
  en: { open: 'Open image', close: 'Close', error: 'The image could not be loaded.' },
  it: { open: 'Apri immagine', close: 'Chiudi', error: 'Impossibile caricare l’immagine.' },
};

export default function USGZoomImage({ source, style, resizeMode, ...imageProps }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const { language } = useLanguage();
  const copy = labels[language] ?? labels.en;
  const flat = StyleSheet.flatten(style) ?? {};
  const { resizeMode: styleResizeMode, ...frameStyle } = flat;
  const canOpen = typeof source === 'number' || Boolean(source?.uri);
  return (
    <>
      <Pressable style={[frameStyle, { overflow: 'hidden' }]} disabled={!canOpen} accessibilityRole="button" accessibilityLabel={copy.open} onPress={() => { setFailed(false); setOpen(true); }}>
        <Image {...imageProps} source={source} resizeMode={resizeMode ?? styleResizeMode} style={{ width: '100%', height: '100%', borderRadius: flat.borderRadius }} />
      </Pressable>
      {open && canOpen ? (
        <Modal visible animationType="fade" onRequestClose={() => setOpen(false)}>
          <GestureHandlerRootView style={styles.root}>
            <SafeAreaView style={styles.root}>
              <Pressable accessibilityRole="button" accessibilityLabel={copy.close} style={styles.close} onPress={() => setOpen(false)}><Text style={styles.closeText}>×</Text></Pressable>
              <USGZoomSurface source={source} maxScale={5} onImageError={() => setFailed(true)} />
              {failed ? <Text style={styles.error}>{copy.error}</Text> : null}
            </SafeAreaView>
          </GestureHandlerRootView>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  close: { alignSelf: 'flex-end', margin: 12, width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#D4AF37', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#D4AF37', fontSize: 30, lineHeight: 34 },
  error: { color: '#FFFFFF', textAlign: 'center', padding: 16 },
});
