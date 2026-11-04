import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import USGBackToTop from '../components/USGBackToTop';
import { getMyDogs } from '../dogs/dogService';
import { getDogPhotoUrl } from '../dogs/dogPhotoService';
import { getMyProfile } from '../profile/profileService';
import {
  createPersonalChallenge, getChallengeCatalog, getDogActivities,
  getArenaProgressSnapshot, getDogAchievements, getDogChallenges,
  getDogTimeline, joinChallenge, recordActivity,
} from '../challenges/challengeService';

const dictionary = {
  bg: {
    title: 'ПРЕДИЗВИКАТЕЛСТВА', intro: 'Твоето Cane Corso. Вашите общи постижения.', dog: 'ИЗБЕРИ CANE CORSO',
    none: 'Добави Cane Corso в „Моето Корсо“, за да започнеш.', dogXp: 'DOG XP', ownerXp: 'OWNER XP',
    level: 'Ниво', arena: 'ARENA ТОЧКИ', noArena: 'Публичната Arena ще бъде активирана на следващ етап.',
    missions: 'USG МИСИИ', join: 'ЗАПОЧНИ', joined: 'В ПРОЦЕС', done: 'ЗАВЪРШЕНА',
    missionHelp: 'Мисията е активна. Запиши завършена активност, за да увеличиш прогреса. Това не е GPS таймер.',
    recordMission: 'ЗАПИШИ ЗАВЪРШЕНА АКТИВНОСТ',
    personal: 'ЛИЧНА ЦЕЛ', personalName: 'Име на целта', target: 'Брой активности (1–30)', add: 'СЪЗДАЙ ЦЕЛ',
    gpsWalk: 'GPS РАЗХОДКА · ОТВОРИ КАРТАТА', gpsHelp: 'Проследи реална разходка с GPS на Samsung, после прегледай измерванията тук. GPS не начислява точки автоматично.', gpsDraft: 'GPS данните са прехвърлени. Прегледай ги и натисни „ЗАПИШИ“, ако са верни.',
    activity: 'ЗАПИШИ АКТИВНОСТ', minutes: 'Продължителност (минути)', km: 'Разстояние (км)',
    notes: 'Бележка (незадължително)', save: 'ЗАПИШИ', timeline: 'TIMELINE', empty: 'Още няма събития.',
    achievements: 'ЗНАЧКИ', error: 'Неуспешна операция. Провери връзката и данните.',
    saved: 'Активността е записана и точките са обновени.', created: 'Целта е добавена.', joinedText: 'Мисията е активирана.',
    invalidActivity: 'Въведи валидна продължителност от 5 до 120 минути (за игра/тренировка минимум 10). За разходка въведи от 0,10 до 5 км.',
    invalidGoal: 'Въведи име до 80 знака и цел от 1 до 30.', daily: 'Всяка категория се отчита веднъж дневно.',
    first_activity: 'Първа активност', first_challenge: 'Първа завършена мисия', challenge_completed: 'Мисия завършена',
    progressActivities: 'ДЕЙНОСТИ', progressMissions: 'МИСИИ', progressBadges: 'ЗНАЧКИ',
    walk: 'РАЗХОДКА', play: 'ИГРА', training: 'ОБУЧЕНИЕ', scent: 'ОБОНЯНИЕ', social: 'СОЦИАЛИЗАЦИЯ',
    'first-three-walks': '3 разходки', 'three-play-sessions': '3 игри',
    'three-training-sessions': '3 тренировки', 'three-scent-games': '3 игри с обоняние',
    'three-calm-social-sessions': '3 спокойни социални активности',
  },
  en: {
    title: 'CHALLENGES', intro: 'Your Cane Corso. Your shared achievements.', dog: 'CHOOSE CANE CORSO',
    none: 'Add a Cane Corso in My Corso to get started.', dogXp: 'DOG XP', ownerXp: 'OWNER XP',
    level: 'Level', arena: 'ARENA POINTS', noArena: 'The public Arena will be enabled in a later stage.',
    missions: 'USG MISSIONS', join: 'START', joined: 'IN PROGRESS', done: 'COMPLETED',
    missionHelp: 'Mission active. Record a completed activity to advance. This is not a GPS timer.',
    recordMission: 'RECORD COMPLETED ACTIVITY',
    personal: 'PERSONAL GOAL', personalName: 'Goal name', target: 'Activity count (1–30)', add: 'CREATE GOAL',
    gpsWalk: 'GPS WALK · OPEN LIVE MAP', gpsHelp: 'Track a real walk with Samsung GPS, then review the measurements here. GPS does not automatically award points.', gpsDraft: 'GPS measurements added. Review them and tap RECORD if accurate.',
    activity: 'RECORD ACTIVITY', minutes: 'Duration (minutes)', km: 'Distance (km)',
    notes: 'Notes (optional)', save: 'RECORD', timeline: 'TIMELINE', empty: 'No events yet.',
    achievements: 'BADGES', error: 'Action failed. Check connection and input.',
    saved: 'Activity recorded and points updated.', created: 'Goal created.', joinedText: 'Mission started.',
    invalidActivity: 'Enter 5–120 minutes (at least 10 for non-walks). For a walk enter 0.10–5 km.',
    invalidGoal: 'Enter a name up to 80 characters and a target of 1–30.', daily: 'Each activity type can be recorded once per day.',
    first_activity: 'First activity', first_challenge: 'First completed mission', challenge_completed: 'Mission completed',
    progressActivities: 'ACTIVITIES', progressMissions: 'MISSIONS', progressBadges: 'BADGES',
    walk: 'WALK', play: 'PLAY', training: 'TRAINING', scent: 'SCENT GAME', social: 'SOCIAL',
    'first-three-walks': '3 walks', 'three-play-sessions': '3 play sessions',
    'three-training-sessions': '3 training sessions', 'three-scent-games': '3 scent games',
    'three-calm-social-sessions': '3 calm social sessions',
  },
  it: {
    title: 'SFIDE', intro: 'Il tuo Cane Corso. I vostri traguardi insieme.', dog: 'SCEGLI IL CANE CORSO',
    none: 'Aggiungi un Cane Corso in My Corso per iniziare.', dogXp: 'DOG XP', ownerXp: 'OWNER XP',
    level: 'Livello', arena: 'PUNTI ARENA', noArena: 'La classifica pubblica arriverà in una fase successiva.',
    missions: 'MISSIONI USG', join: 'INIZIA', joined: 'IN CORSO', done: 'COMPLETATA',
    missionHelp: 'Missione attiva. Registra un’attività completata per avanzare. Non è un timer GPS.',
    recordMission: 'REGISTRA ATTIVITÀ COMPLETATA',
    personal: 'OBIETTIVO PERSONALE', personalName: 'Nome obiettivo', target: 'Numero attività (1–30)', add: 'CREA OBIETTIVO',
    gpsWalk: 'PASSEGGIATA GPS · APRI MAPPA', gpsHelp: 'Registra una passeggiata reale con GPS Samsung e controlla qui le misure. Nessun punto automatico.', gpsDraft: 'Misure GPS trasferite. Verificale e premi REGISTRA se corrette.',
    activity: 'REGISTRA ATTIVITÀ', minutes: 'Durata (minuti)', km: 'Distanza (km)',
    notes: 'Note (facoltative)', save: 'REGISTRA', timeline: 'CRONOLOGIA', empty: 'Nessun evento.',
    achievements: 'DISTINTIVI', error: 'Operazione non riuscita. Controlla connessione e dati.',
    saved: 'Attività registrata e punti aggiornati.', created: 'Obiettivo creato.', joinedText: 'Missione avviata.',
    invalidActivity: 'Inserisci 5–120 minuti (almeno 10 per attività diverse dalla passeggiata). Per passeggiata inserisci 0,10–5 km.',
    invalidGoal: 'Inserisci un nome fino a 80 caratteri e un obiettivo di 1–30.', daily: 'Ogni tipo di attività può essere registrato una volta al giorno.',
    first_activity: 'Prima attività', first_challenge: 'Prima missione completata', challenge_completed: 'Missione completata',
    progressActivities: 'ATTIVITÀ', progressMissions: 'MISSIONI', progressBadges: 'DISTINTIVI',
    walk: 'PASSEGGIATA', play: 'GIOCO', training: 'ADDESTRAMENTO', scent: 'OLFATTO', social: 'SOCIALIZZAZIONE',
    'first-three-walks': '3 passeggiate', 'three-play-sessions': '3 giochi',
    'three-training-sessions': '3 sessioni di addestramento', 'three-scent-games': '3 giochi olfattivi',
    'three-calm-social-sessions': '3 attività sociali tranquille',
  },
};

const kinds = ['walk', 'play', 'training', 'scent', 'social'];
const dateLabel = value => value ? new Date(value).toLocaleDateString() : '';
const levelFor = xp => Math.floor(xp / 250) + 1;


export default function MyCorsoChallengesScreen({ route, navigation }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const t = dictionary[language] ?? dictionary.en;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [dogs, setDogs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [missions, setMissions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [kind, setKind] = useState('walk');
  const [minutes, setMinutes] = useState('15');
  const [distance, setDistance] = useState('1');
  const [notes, setNotes] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalKind, setGoalKind] = useState('training');
  const [goalTarget, setGoalTarget] = useState('3');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const scrollRef = useRef(null);
  const activityY = useRef(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const draft = route?.params?.gpsDraft;
    if (!draft) return;
    if (draft.dogId && selectedId && draft.dogId !== selectedId) {
      navigation.setParams({ gpsDraft: undefined });
      return;
    }
    setKind('walk');
    setMinutes(draft.minutes);
    setDistance(draft.distance);
    setNotice(t.gpsDraft);
    navigation.setParams({ gpsDraft: undefined });
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: Math.max(0, activityY.current - 16), animated: true }));
  }, [route?.params?.gpsDraft, navigation, selectedId, t.gpsDraft]);

  const selectedDog = dogs.find(d => d.id === selectedId);
  const snapshot = progress?.dogId === selectedId ? progress.data : null;
  const dogXp = Number(snapshot?.dog_xp ?? 0);
  const ownerXp = Number(snapshot?.owner_xp ?? 0);
  const arenaPoints = Number(snapshot?.arena_points ?? 0);
  const level = levelFor(dogXp);
  const levelProgress = snapshot ? (dogXp % 250) / 250 : 0;
  const ownerName = profile?.display_name || profile?.username || user?.email?.split('@')[0] || '';

  const loadOverview = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [dogsResult, profileResult, catalogResult] = await Promise.all([
      getMyDogs(user.id), getMyProfile(user.id), getChallengeCatalog(),
    ]);
    setDogs(dogsResult.data ?? []);
    setSelectedId(current => (dogsResult.data ?? []).some(d => d.id === current) ? current : dogsResult.data?.[0]?.id ?? null);
    setProfile(profileResult.data ?? null);
    setCatalog(catalogResult.data ?? []);
    setError(dogsResult.error || profileResult.error || catalogResult.error ? dictionary[language]?.error ?? dictionary.en.error : '');
    setLoading(false);
  }, [user?.id, language]);

  const loadDog = useCallback(async () => {
    if (!user?.id || !selectedId) {
      setMissions([]); setProgress(null); setTimeline([]); setAchievements([]); setPhotoUri(null);
      return;
    }
    const [missionsResult, progressResult, timelineResult, achievementsResult] = await Promise.all([
      getDogChallenges(user.id, selectedId), getArenaProgressSnapshot(selectedId),
      getDogTimeline(user.id, selectedId), getDogAchievements(user.id, selectedId),
    ]);
    setMissions(missionsResult.data ?? []);
    setProgress(progressResult.error || !progressResult.data ? null : { dogId: selectedId, data: progressResult.data });
    setTimeline(timelineResult.data ?? []);
    setAchievements(achievementsResult.data ?? []);
    if (missionsResult.error || progressResult.error || !progressResult.data || timelineResult.error || achievementsResult.error) setError(t.error);
    const dog = dogs.find(item => item.id === selectedId);
    if (dog?.photo_path) {
      const response = await getDogPhotoUrl(dog.photo_path);
      setPhotoUri(response.data ?? null);
    } else setPhotoUri(null);
  }, [user?.id, selectedId, dogs, t.error]);

  useFocusEffect(useCallback(() => { loadOverview(); }, [loadOverview]));
  useFocusEffect(useCallback(() => { loadDog(); }, [loadDog]));

  async function refresh() {
    await loadDog();
  }

  async function doJoin(id) {
    if (busy || !selectedId) return;
    setBusy(true); setError(''); setNotice('');
    const result = await joinChallenge(selectedId, id);
    if (result.error) setError(t.error);
    else { await refresh(); setNotice(t.joinedText); }
    setBusy(false);
  }

  function moveToActivity(activityKind) {
    setKind(activityKind);
    scrollRef.current?.scrollTo({ y: Math.max(0, activityY.current - 16), animated: true });
  }

  async function doGoal() {
    if (busy || !selectedId) return;
    const target = Number(goalTarget);
    if (!goalTitle.trim() || goalTitle.trim().length > 80 || !Number.isInteger(target) || target < 1 || target > 30) {
      setError(t.invalidGoal); return;
    }
    setBusy(true); setError(''); setNotice('');
    const result = await createPersonalChallenge(selectedId, goalTitle.trim(), goalKind, target);
    if (result.error) setError(t.error);
    else { setGoalTitle(''); await refresh(); setNotice(t.created); }
    setBusy(false);
  }

  async function doActivity() {
    if (busy || !selectedId) return;
    const duration = Number(minutes);
    const km = Number(distance.replace(',', '.'));
    if (!Number.isInteger(duration) || duration < (kind === 'walk' ? 5 : 10) || duration > 120 ||
      (kind === 'walk' && (!Number.isFinite(km) || km < 0.1 || km > 5))) {
      setError(t.invalidActivity); return;
    }
    setBusy(true); setError(''); setNotice('');
    const result = await recordActivity(selectedId, kind, duration, kind === 'walk' ? km : null, notes.trim() || null);
    if (result.error) setError(t.error);
    else { setNotes(''); await refresh(); setNotice(t.saved); }
    setBusy(false);
  }

  return (
    <SafeAreaView style={styles.page} edges={['bottom']}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" onScroll={event => setShowBackToTop(event.nativeEvent.contentOffset.y > 220)} scrollEventThrottle={32}>
        <Text style={styles.kicker}>USG · UNICO SUO GENERE</Text>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.55}>{t.title}</Text>
        <Text style={styles.sub}>{t.intro}</Text>
        {loading ? <ActivityIndicator color={colors.gold} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {notice ? <Text style={styles.success}>{notice}</Text> : null}
        {!loading && !dogs.length ? <Text style={styles.empty}>{t.none}</Text> : null}
        {dogs.length ? <>
          <View style={styles.card}>
            <Text style={styles.heading}>{t.dog}</Text>
            <View style={styles.wrap}>{dogs.map(dog =>
              <Pressable key={dog.id} onPress={() => {setSelectedId(dog.id); setError(''); setNotice('');}}
                style={[styles.chip, selectedId === dog.id && styles.activeChip]}>
                <Text style={[styles.chipText, selectedId === dog.id && styles.gold]}>{dog.name}</Text>
              </Pressable>)}</View>
            <View style={styles.identity}>
              {photoUri ? <Image source={{uri: photoUri}} style={styles.avatar} /> :
                <View style={[styles.avatar, styles.placeholder]}><Text style={styles.avatarText}>USG</Text></View>}
              <View style={styles.identityText}>
                <Text style={styles.dogName}>{selectedDog?.name}</Text>
                <Text style={styles.sub}>{ownerName}</Text>
                <Text style={styles.sub}>{t.level} {snapshot ? level : '—'}</Text>
              </View>
            </View>
            <View style={styles.stats}>
              <View><Text style={styles.statValue}>{snapshot ? dogXp : '—'}</Text><Text style={styles.statLabel}>{t.dogXp}</Text></View>
              <View><Text style={styles.statValue}>{snapshot ? ownerXp : '—'}</Text><Text style={styles.statLabel}>{t.ownerXp}</Text></View>
              <View><Text style={styles.statValue}>{snapshot ? arenaPoints : '—'}</Text><Text style={styles.statLabel}>{t.arena}</Text></View>
            </View>
            <View style={styles.track}><View style={[styles.fill, {width: `${levelProgress * 100}%`}]} /></View>
            <View style={styles.progressSummary}>
              <View style={styles.progressItem}><Text style={styles.progressValue}>{snapshot ? Number(snapshot.activities_count) : '—'}</Text><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.55} style={styles.progressLabel}>{t.progressActivities}</Text></View>
              <View style={styles.progressItem}><Text style={styles.progressValue}>{snapshot ? Number(snapshot.completed_missions) : '—'}</Text><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.55} style={styles.progressLabel}>{t.progressMissions}</Text></View>
              <View style={styles.progressItem}><Text style={styles.progressValue}>{snapshot ? Number(snapshot.badges_count) : '—'}</Text><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.55} style={styles.progressLabel}>{t.progressBadges}</Text></View>
            </View>
            <Text style={styles.small}>{t.noArena}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.heading}>{t.missions}</Text>
            {catalog.map(item => {
              const entry = missions.find(m => m.challenge_id === item.id);
              return <View key={item.id} style={styles.mission}>
                <Text style={styles.body}>{t[item.slug] || item.slug}</Text>
                <Text style={styles.small}>{entry ? `${entry.progress_count}/${entry.target_count}` : `0/${item.target_count}`} · +{item.dog_xp_bonus} Dog XP · +{item.owner_xp_bonus} Owner XP</Text>
                {entry ? <>
                  <Text style={styles.gold}>{entry.status === 'completed' ? t.done : t.joined}</Text>
                  {entry.status !== 'completed' ? <>
                    <Text style={styles.small}>{t.missionHelp}</Text>
                    <Pressable accessibilityRole="button" onPress={() => moveToActivity(item.activity_kind)} style={styles.smallButton}><Text style={styles.buttonText}>{t.recordMission}</Text></Pressable>
                  </> : null}
                </> : <Pressable disabled={busy} onPress={() => doJoin(item.id)} style={styles.smallButton}><Text style={styles.buttonText}>{t.join}</Text></Pressable>}
              </View>;
            })}
            {missions.filter(m => !m.challenge_id).map(m => <View key={m.id} style={styles.mission}>
              <Text style={styles.body}>{m.custom_title}</Text>
              <Text style={styles.small}>{m.progress_count}/{m.target_count} · {m.status === 'completed' ? t.done : t.joined}</Text>
            </View>)}
          </View>
          <View style={styles.card}>
            <Text style={styles.heading}>{t.personal}</Text>
            <TextInput value={goalTitle} onChangeText={setGoalTitle} placeholder={t.personalName} placeholderTextColor={colors.textMuted} style={styles.input} maxLength={80}/>
            <View style={styles.wrap}>{kinds.map(value => <Pressable key={value} onPress={() => setGoalKind(value)} style={[styles.chip, goalKind === value && styles.activeChip]}><Text style={[styles.chipText, goalKind === value && styles.gold]}>{t[value]}</Text></Pressable>)}</View>
            <TextInput value={goalTarget} onChangeText={setGoalTarget} placeholder={t.target} placeholderTextColor={colors.textMuted} style={styles.input} keyboardType="numeric" />
            <Pressable disabled={busy} onPress={doGoal} style={styles.button}><Text style={styles.buttonText}>{t.add}</Text></Pressable>
          </View>
          <View style={styles.card} onLayout={event => { activityY.current = event.nativeEvent.layout.y; }}>
            <Text style={styles.heading}>{t.activity}</Text>
            <Text style={styles.small}>{t.gpsHelp}</Text>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('MyCorsoWalkTracker', { dog: { id: selectedDog.id, name: selectedDog.name }, ownerName, photoUri })} style={styles.button}>
              <Text style={styles.buttonText}>{t.gpsWalk}</Text>
            </Pressable>
            <View style={styles.wrap}>{kinds.map(value => <Pressable key={value} onPress={() => setKind(value)} style={[styles.chip, kind === value && styles.activeChip]}><Text style={[styles.chipText, kind === value && styles.gold]}>{t[value]}</Text></Pressable>)}</View>
            <Text style={styles.field}>{t.minutes}</Text>
            <TextInput value={minutes} onChangeText={setMinutes} keyboardType="numeric" style={styles.input} />
            {kind === 'walk' ? <><Text style={styles.field}>{t.km}</Text><TextInput value={distance} onChangeText={setDistance} keyboardType="decimal-pad" style={styles.input}/></> : null}
            <Text style={styles.field}>{t.notes}</Text>
            <TextInput value={notes} onChangeText={setNotes} style={styles.input} maxLength={240} placeholderTextColor={colors.textMuted}/>
            <Text style={styles.small}>{t.daily}</Text>
            <Pressable disabled={busy} onPress={doActivity} style={styles.button}><Text style={styles.buttonText}>{busy ? '…' : t.save}</Text></Pressable>
          </View>
          <View style={styles.card}>
            <Text style={styles.heading}>{t.achievements}</Text>
            {achievements.length ? achievements.map(a => <View key={a.id} style={styles.mission}><Text style={styles.gold}>★ {t[a.code] || a.code}</Text><Text style={styles.small}>{dateLabel(a.unlocked_at)}</Text></View>) : <Text style={styles.small}>{t.empty}</Text>}
          </View>
          <View style={styles.card}>
            <Text style={styles.heading}>{t.timeline}</Text>
            {timeline.length ? timeline.map(event => <View key={event.id} style={styles.timelineItem}><View style={styles.dot}/><View style={{flex: 1}}><Text style={styles.body}>{t[event.event_code] || t[event.event_code?.toLowerCase()] || event.event_code}</Text><Text style={styles.small}>{dateLabel(event.occurred_at)}</Text></View></View>) : <Text style={styles.small}>{t.empty}</Text>}
          </View>
        </> : null}
      </ScrollView>
      <USGBackToTop visible={showBackToTop} language={language} bottomOffset={22} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} />
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    page: {flex: 1, backgroundColor: colors.background},
    content: {padding: 18, paddingBottom: 48, gap: 14},
    kicker: {fontSize: 11, color: colors.gold, letterSpacing: 2, fontWeight: '700'},
    title: {color: colors.text, fontSize: 25, fontWeight: '800', flexShrink: 1},
    sub: {color: colors.textMuted, fontSize: 13, lineHeight: 19},
    card: {borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 15, gap: 12, backgroundColor: colors.surface},
    heading: {color: colors.gold, fontWeight: '800', fontSize: 15, letterSpacing: 0.7},
    wrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 7},
    chip: {borderRadius: 11, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 9},
    activeChip: {borderColor: colors.gold, backgroundColor: colors.activeSurface},
    chipText: {fontSize: 11, color: colors.text, fontWeight: '700'}, gold: {color: colors.gold, fontWeight: '700', fontSize: 12},
    identity: {flexDirection: 'row', alignItems: 'center', gap: 12},
    avatar: {height: 76, width: 76, borderRadius: 38, borderWidth: 2, borderColor: colors.gold},
    placeholder: {justifyContent: 'center', alignItems: 'center', backgroundColor: colors.activeSurface},
    avatarText: {fontWeight: '800', color: colors.gold, fontSize: 19}, identityText: {flex: 1, gap: 3},
    dogName: {color: colors.text, fontSize: 21, fontWeight: '800'},
    stats: {flexDirection: 'row', justifyContent: 'space-between'},
    progressSummary: {flexDirection: 'row', gap: 7},
    progressItem: {flex: 1, minWidth: 0, minHeight: 76, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 3, gap: 5},
    progressValue: {color: colors.gold, fontSize: 18, fontWeight: '800'},
    progressLabel: {width: '100%', color: colors.textMuted, fontSize: 10, lineHeight: 14, fontWeight: '700', textAlign: 'center'},
    statValue: {color: colors.gold, fontWeight: '800', fontSize: 22}, statLabel: {color: colors.textMuted, fontSize: 10},
    track: {height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden'},
    fill: {height: 8, borderRadius: 4, backgroundColor: colors.gold},
    mission: {borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 11, gap: 6},
    body: {color: colors.text, fontSize: 14}, small: {color: colors.textMuted, fontSize: 12, lineHeight: 19},
    field: {color: colors.textMuted, fontSize: 12}, input: {borderWidth: 1, borderColor: colors.border, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, backgroundColor: colors.background},
    button: {alignItems: 'center', borderRadius: 11, padding: 13, backgroundColor: colors.gold},
    smallButton: {alignSelf: 'flex-start', borderRadius: 9, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.gold},
    buttonText: {color: colors.background, fontWeight: '800', fontSize: 12},
    timelineItem: {flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: colors.border},
    dot: {width: 11, height: 11, borderRadius: 6, backgroundColor: colors.gold, marginTop: 5},
    empty: {color: colors.textMuted, padding: 15}, error: {color: '#f18c83'}, success: {color: '#82c6a7'},
  });
}
