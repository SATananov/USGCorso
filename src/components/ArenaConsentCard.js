import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getArenaDogConsent, getArenaOwnerConsent,
  setArenaDogConsent, setArenaOwnerConsent,
} from '../challenges/arenaConsentService';

const labels = {
  bg: {
    title: 'УЧАСТИЕ В USG ARENA',
    intro: 'Ти избираш дали да участваш. Настройките са лични и не публикуват профила ти.',
    owner: 'Участие на собственика', dog: 'Участие на Cane Corso',
    on: 'ВКЛЮЧЕНО', off: 'ИЗКЛЮЧЕНО',
    ready: 'Избрани са и двете разрешения. Публичната класация още не е активна.',
    waiting: 'За участие са необходими разрешения и за собственика, и за кучето.',
    privacy: 'Няма публична класация и няма нови Arena точки. Можеш да промениш избора си по всяко време.',
    error: 'Неуспешно зареждане или запис. Провери връзката и опитай отново.',
    retry: 'ОПИТАЙ ОТНОВО', saved: 'Настройката е запазена.',
  },
  en: {
    title: 'USG ARENA PARTICIPATION',
    intro: 'You choose whether to take part. These private settings do not publish your profile.',
    owner: 'Owner participation', dog: 'Cane Corso participation',
    on: 'ENABLED', off: 'DISABLED',
    ready: 'Both permissions are enabled. The public ranking is not active yet.',
    waiting: 'Both owner and dog permission are required to participate.',
    privacy: 'No public ranking or new Arena points. You can change your choice any time.',
    error: 'Unable to load or save. Check your connection and try again.',
    retry: 'TRY AGAIN', saved: 'Setting saved.',
  },
  it: {
    title: 'PARTECIPAZIONE USG ARENA',
    intro: 'Decidi tu se partecipare. Le impostazioni sono private e non pubblicano il tuo profilo.',
    owner: 'Partecipazione proprietario', dog: 'Partecipazione Cane Corso',
    on: 'ATTIVA', off: 'DISATTIVA',
    ready: 'Entrambi i consensi sono attivi. La classifica pubblica non è ancora disponibile.',
    waiting: 'Servono entrambi i consensi: proprietario e cane.',
    privacy: 'Nessuna classifica pubblica o nuovi punti Arena. Puoi cambiare scelta in qualsiasi momento.',
    error: 'Caricamento o salvataggio non riuscito. Controlla la connessione e riprova.',
    retry: 'RIPROVA', saved: 'Impostazione salvata.',
  },
};

export default function ArenaConsentCard({ userId, dogId, dogName, language, colors }) {
  const t = labels[language] ?? labels.en;
  const [ownerOn, setOwnerOn] = useState(false);
  const [dogOn, setDogOn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadedDogId, setLoadedDogId] = useState(null);
  const loadTokenRef = useRef(0);

  const load = useCallback(async () => {
    const token = ++loadTokenRef.current;
    setLoading(true);
    setError(false);
    setSaved(false);
    setOwnerOn(false);
    setDogOn(false);
    setLoadedDogId(null);
    if (!userId || !dogId) {
      setLoading(false);
      return;
    }
    const [ownerResult, dogResult] = await Promise.all([
      getArenaOwnerConsent(userId), getArenaDogConsent(userId, dogId),
    ]);
    if (token !== loadTokenRef.current) return;
    if (ownerResult.error || dogResult.error) {
      setError(true);
    } else {
      setOwnerOn(ownerResult.data);
      setDogOn(dogResult.data);
      setLoadedDogId(dogId);
    }
    setLoading(false);
  }, [userId, dogId]);

  useFocusEffect(useCallback(() => {
    load();
    return () => { loadTokenRef.current += 1; };
  }, [load]));

  useEffect(() => { setSaved(false); }, [dogId]);

  async function toggle(kind) {
    if (loading || busy || error || loadedDogId !== dogId) return;
    const next = kind === 'owner' ? !ownerOn : !dogOn;
    setBusy(true);
    setSaved(false);
    const result = kind === 'owner'
      ? await setArenaOwnerConsent(next)
      : await setArenaDogConsent(dogId, next);
    if (result.error || result.data !== next) {
      setError(true);
    } else {
      if (kind === 'owner') setOwnerOn(next);
      else setDogOn(next);
      setSaved(true);
    }
    setBusy(false);
  }

  const styles = makeStyles(colors);
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t.title}</Text>
      <Text style={styles.intro}>{t.intro}</Text>
      {loading ? <ActivityIndicator color={colors.gold} /> : null}
      {error ? <View style={styles.notice}>
        <Text style={styles.error}>{t.error}</Text>
        <Pressable onPress={load} disabled={busy} style={styles.retry}><Text style={styles.retryText}>{t.retry}</Text></Pressable>
      </View> : null}
      {!loading && !error && loadedDogId === dogId ? <>
        <View style={styles.setting}>
          <Text style={styles.settingText}>{t.owner}</Text>
          <Pressable accessibilityRole="switch" accessibilityState={{ checked: ownerOn, disabled: busy }} disabled={busy} onPress={() => toggle('owner')} style={[styles.choice, ownerOn && styles.choiceOn]}>
            <Text style={[styles.choiceText, ownerOn && styles.choiceTextOn]}>{ownerOn ? t.on : t.off}</Text>
          </Pressable>
        </View>
        <View style={styles.setting}>
          <View style={styles.settingName}><Text style={styles.settingText}>{t.dog}</Text><Text style={styles.dogName} numberOfLines={1}>{dogName || 'Cane Corso'}</Text></View>
          <Pressable accessibilityRole="switch" accessibilityState={{ checked: dogOn, disabled: busy }} disabled={busy} onPress={() => toggle('dog')} style={[styles.choice, dogOn && styles.choiceOn]}>
            <Text style={[styles.choiceText, dogOn && styles.choiceTextOn]}>{dogOn ? t.on : t.off}</Text>
          </Pressable>
        </View>
        {busy ? <ActivityIndicator color={colors.gold} /> : null}
        {saved && !busy ? <Text style={styles.saved}>{t.saved}</Text> : null}
        <Text style={styles.status}>{ownerOn && dogOn ? t.ready : t.waiting}</Text>
      </> : null}
      <Text style={styles.privacy}>{t.privacy}</Text>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    card: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface, padding: 15, gap: 12 },
    title: { color: colors.gold, fontSize: 15, fontWeight: '800', letterSpacing: 0.6 },
    intro: { color: colors.textMuted, fontSize: 12, lineHeight: 19 },
    setting: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 58, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 9 },
    settingName: { flex: 1, minWidth: 0, gap: 3 },
    settingText: { color: colors.text, fontWeight: '700', fontSize: 12, flexShrink: 1 },
    dogName: { color: colors.textMuted, fontSize: 11 },
    choice: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, minWidth: 108, alignItems: 'center' },
    choiceOn: { borderColor: colors.gold, backgroundColor: colors.activeSurface },
    choiceText: { color: colors.textMuted, fontWeight: '800', fontSize: 11 },
    choiceTextOn: { color: colors.gold },
    notice: { gap: 10 },
    error: { color: '#F18C83', fontSize: 12 },
    retry: { borderColor: colors.gold, borderWidth: 1, padding: 10, borderRadius: 10, alignSelf: 'flex-start' },
    retryText: { color: colors.gold, fontWeight: '800', fontSize: 11 },
    saved: { color: '#82C6A7', fontSize: 12 },
    status: { color: colors.gold, fontSize: 12, lineHeight: 18 },
    privacy: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  });
}
