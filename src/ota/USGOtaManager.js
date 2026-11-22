import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Updates from 'expo-updates';
import { clearOtaReloadIntent, markOtaReloadIntent } from './otaReloadIntent';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

const CHECK_INTERVAL_MS = 10 * 60 * 1000;

const copy = {
  bg: {
    title: 'Налична е актуализация',
    message: 'Новата версия е изтеглена и е готова за прилагане.',
    later: 'По-късно',
    apply: 'Актуализирай',
  },
  en: {
    title: 'Update available',
    message: 'A new update has been downloaded and is ready to apply.',
    later: 'Later',
    apply: 'Update now',
  },
  it: {
    title: 'Aggiornamento disponibile',
    message: 'Un aggiornamento è stato scaricato ed è pronto per essere applicato.',
    later: 'Più tardi',
    apply: 'Aggiorna',
  },
};

export default function USGOtaManager({ active }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const words = copy[language] ?? copy.en;
  const { isStartupProcedureRunning, isUpdatePending, downloadedUpdate } = Updates.useUpdates();
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [readyId, setReadyId] = useState(null);
  const [applying, setApplying] = useState(false);
  const lastCheckRef = useRef(0);
  const inFlightRef = useRef(false);
  const ignoredIdsRef = useRef(new Set());
  const offeredIdsRef = useRef(new Set());
  const reloadRef = useRef(false);

  const offer = useCallback((id) => {
    if (!id || id === Updates.updateId || ignoredIdsRef.current.has(id)) return;
    offeredIdsRef.current.add(id);
    setReadyId(id);
  }, []);

  useEffect(() => {
    if (Updates.isEnabled && isUpdatePending) offer(downloadedUpdate?.updateId);
  }, [downloadedUpdate?.updateId, isUpdatePending, offer]);

  const check = useCallback(async () => {
    if (!Updates.isEnabled || isStartupProcedureRunning || isUpdatePending || inFlightRef.current || offeredIdsRef.current.size > 0) return;
    const now = Date.now();
    if (now - lastCheckRef.current < CHECK_INTERVAL_MS) return;
    lastCheckRef.current = now;
    inFlightRef.current = true;
    try {
      const available = await Updates.checkForUpdateAsync();
      const id = available.isAvailable ? available.manifest?.id : null;
      if (!id || id === Updates.updateId || ignoredIdsRef.current.has(id)) return;
      const result = await Updates.fetchUpdateAsync();
      if (result.isNew) offer(result.manifest?.id ?? id);
    } catch {
    } finally {
      inFlightRef.current = false;
    }
  }, [isStartupProcedureRunning, isUpdatePending, offer]);

  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => {
      setForeground(state === 'active');
    });
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (active && foreground && !readyId) check();
  }, [active, foreground, readyId, check]);

  function defer() {
    if (!readyId || applying) return;
    ignoredIdsRef.current.add(readyId);
    setReadyId(null);
  }

  async function apply() {
    if (!readyId || applying || reloadRef.current || !offeredIdsRef.current.has(readyId)) return;
    reloadRef.current = true;
    setApplying(true);
    try {
      await markOtaReloadIntent(readyId).catch(() => {});
      await Updates.reloadAsync();
    } catch {
      await clearOtaReloadIntent().catch(() => {});
      reloadRef.current = false;
      setApplying(false);
    }
  }

  if (!Updates.isEnabled || !active || !foreground || !readyId) return null;

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.gold }]}>
        <Text style={[styles.title, { color: colors.gold }]}>{words.title}</Text>
        <Text style={[styles.message, { color: colors.textSoft }]}>{words.message}</Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={words.later}
            disabled={applying}
            onPress={defer}
            style={[styles.secondary, { borderColor: colors.gold }, applying && styles.disabled]}
          >
            <Text style={[styles.buttonText, { color: colors.gold }]}>{words.later}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={words.apply}
            accessibilityState={{ disabled: applying, busy: applying }}
            disabled={applying}
            onPress={apply}
            style={[styles.primary, { backgroundColor: colors.gold }, applying && styles.disabled]}
          >
            <Text style={[styles.buttonText, { color: '#070708' }]}>{words.apply}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 12, right: 12, bottom: 166, alignItems: 'center', zIndex: 20, elevation: 20 },
  card: { width: '100%', maxWidth: 520, borderWidth: 1, borderRadius: 18, padding: 14 },
  title: { fontSize: 15, fontWeight: '900' },
  message: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  secondary: { flex: 1, minHeight: 44, borderWidth: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  primary: { flex: 1, minHeight: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  buttonText: { fontSize: 12, fontWeight: '800', textAlign: 'center' },
  disabled: { opacity: 0.5 },
});
