import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import USGBackToTop from '../components/USGBackToTop';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

const languageText = {
  bg: {
    title: 'GPS РАЗХОДКА', subtitle: 'Реална карта и златна следа от Samsung GPS.',
    ready: 'Готов за старт', running: 'Разходката е активна', paused: 'На пауза', finished: 'Разходката приключи',
    start: 'СТАРТ', pause: 'ПАУЗА', resume: 'ПРОДЪЛЖИ', finish: 'КРАЙ', discard: 'НОВА РАЗХОДКА',
    timer: 'ВРЕМЕ', distance: 'РАЗСТОЯНИЕ', fixes: 'GPS ТОЧКИ', gpsWaiting: 'Изчакване на точен GPS сигнал…',
    permission: 'Разреши точно местоположение, за да стартираш разходка.', gpsError: 'GPS сигналът не е достъпен. Провери местоположението на телефона.',
    background: 'Проследяването е спряно, защото приложението е преминало във фонов режим. Натисни „Продължи“ при връщане.',
    limitation: 'Този първи режим проследява само при отворено приложение. Не заключвай екрана по време на теста. Няма автоматични XP.',
    summary: 'Резултат от разходката', review: 'ИЗПРАТИ КЪМ ФОРМАТА', short: 'За запис с точки са необходими поне 5 минути и 0,10 км. Можеш да повториш теста.',
    accuracy: 'Измерването зависи от GPS сигнала. Скокове и неточни точки се пропускат.', back: 'НАЗАД КЪМ ARENA',
    photo: 'USG', owner: 'Собственик', current: 'Текуща позиция', noRoute: 'Маршрутът ще се появи след получаване на GPS координати.',
    territoryTitle: 'USG ТЕРИТОРИИ', territoryIntro: 'Откривай сектори по време на виртуалната експедиция.', territoryLocked: 'ЗАКЛЮЧЕНА', territoryOpen: 'ОТКРИТА', territoryNext: 'СЛЕДВАЩА ЗОНА', territoryAll: 'ВСИЧКИ ЗОНИ СА ОТКРИТИ', territoryProgress: 'ОТКРИТИ ЗОНИ', territoryTest: 'ВИРТУАЛНА ЕКСПЕДИЦИЯ · БЕЗ XP', territorySector: 'СЕКТОР', territoryMap: 'КАРТА НА ПРИКЛЮЧЕНИЕТО', territoryReward: 'ОТКЛЮЧЕН СЕКТОР', expeditionComplete: 'ЕКСПЕДИЦИЯТА Е ЗАВЪРШЕНА', expeditionSubtitle: 'Хера откри всички територии!', expeditionTerritories: 'ОТКРИТИ ТЕРИТОРИИ', expeditionBadges: 'ВИРТУАЛНИ ЗНАЧКИ', expeditionAward: 'МЕДАЛ НА ОТКРИВАТЕЛЯ', expeditionSafety: 'Демонстрационни награди · 0 XP · без запис в Supabase', expeditionNext: 'НОВО ПРИКЛЮЧЕНИЕ',
    simTitle: 'ТЕСТОВ GPS РЕЖИМ', realMode: 'РЕАЛЕН GPS', simMode: 'СИМУЛАЦИЯ', simHelp: 'Демонстрационен маршрут около текущата позиция. Без реални XP и запис в Supabase.', simStart: 'СТАРТ НА СИМУЛАЦИЯ', simComplete: 'Тестът приключи. Няма запис или точки.', simLocation: 'За да поставим тестовия маршрут на картата, разреши местоположение.', simCheckpoint: 'КОНТРОЛНА ТОЧКА', simNoRewards: 'ТЕСТ · 0 XP · БЕЗ ЗАПИС', simDistance: 'ВИРТУАЛНА ДИСТАНЦИЯ', simRestart: 'НОВ ТЕСТ', confirm: 'КРАЙ И ПРЕГЛЕД', resetHelp: 'Новата разходка изчиства само локалния тест, без да изтрива запис от Supabase.',
  },
  en: {
    title: 'GPS WALK', subtitle: 'Real map and gold Samsung GPS trail.', ready: 'Ready to start', running: 'Walk in progress', paused: 'Paused', finished: 'Walk finished',
    start: 'START', pause: 'PAUSE', resume: 'RESUME', finish: 'FINISH', discard: 'NEW WALK', timer: 'TIME', distance: 'DISTANCE', fixes: 'GPS POINTS',
    gpsWaiting: 'Waiting for an accurate GPS signal…', permission: 'Allow precise location to start tracking.', gpsError: 'GPS unavailable. Check phone location settings.',
    background: 'Tracking was paused while the app was in the background. Tap Resume on return.',
    limitation: 'This first version tracks only while the app is open. Keep the screen unlocked during testing. No automatic XP.',
    summary: 'Walk summary', review: 'SEND TO ACTIVITY FORM', short: 'At least 5 minutes and 0.10 km are needed to record points. Try another walk.',
    accuracy: 'GPS results depend on signal quality. Poor fixes and jumps are ignored.', back: 'BACK TO ARENA', photo: 'USG', owner: 'Owner', current: 'Current position', noRoute: 'The trail appears as GPS locations arrive.',
    territoryTitle: 'USG TERRITORIES', territoryIntro: 'Discover sectors on your virtual expedition.', territoryLocked: 'LOCKED', territoryOpen: 'DISCOVERED', territoryNext: 'NEXT ZONE', territoryAll: 'ALL ZONES DISCOVERED', territoryProgress: 'DISCOVERED ZONES', territoryTest: 'VIRTUAL EXPEDITION · NO XP', territorySector: 'SECTOR', territoryMap: 'ADVENTURE MAP', territoryReward: 'SECTOR DISCOVERED', expeditionComplete: 'EXPEDITION COMPLETE', expeditionSubtitle: 'All territories discovered!', expeditionTerritories: 'DISCOVERED TERRITORIES', expeditionBadges: 'VIRTUAL BADGES', expeditionAward: 'EXPLORER MEDAL', expeditionSafety: 'Demo rewards · 0 XP · no Supabase record', expeditionNext: 'NEW ADVENTURE',
    simTitle: 'GPS TEST MODE', realMode: 'REAL GPS', simMode: 'SIMULATION', simHelp: 'A demo route around the current position. No real XP or Supabase records.', simStart: 'START SIMULATION', simComplete: 'Test finished. No records or points awarded.', simLocation: 'Allow location to center the test route on the map.', simCheckpoint: 'CHECKPOINT', simNoRewards: 'TEST · 0 XP · NO RECORD', simDistance: 'VIRTUAL DISTANCE', simRestart: 'NEW TEST', confirm: 'FINISH AND REVIEW', resetHelp: 'New walk clears only this local test, not your Supabase records.',
  },
  it: {
    title: 'PASSEGGIATA GPS', subtitle: 'Mappa reale e traccia dorata del GPS Samsung.', ready: 'Pronto a partire', running: 'Passeggiata attiva', paused: 'In pausa', finished: 'Passeggiata terminata',
    start: 'INIZIA', pause: 'PAUSA', resume: 'RIPRENDI', finish: 'TERMINA', discard: 'NUOVA PASSEGGIATA', timer: 'TEMPO', distance: 'DISTANZA', fixes: 'PUNTI GPS',
    gpsWaiting: 'In attesa di un segnale GPS preciso…', permission: 'Autorizza la posizione precisa per iniziare.', gpsError: 'GPS non disponibile. Controlla la posizione del telefono.',
    background: 'Rilevamento sospeso mentre l’app era in background. Premi Riprendi al ritorno.',
    limitation: 'Questa prima versione registra solo con l’app aperta. Mantieni lo schermo sbloccato durante la prova. Nessun XP automatico.',
    summary: 'Riepilogo passeggiata', review: 'INVIA AL MODULO ATTIVITÀ', short: 'Per ottenere punti servono almeno 5 minuti e 0,10 km. Puoi riprovare.',
    accuracy: 'La precisione dipende dal GPS. I dati imprecisi e i salti vengono ignorati.', back: 'TORNA ALL’ARENA', photo: 'USG', owner: 'Proprietario', current: 'Posizione attuale', noRoute: 'La traccia apparirà con le coordinate GPS.',
    territoryTitle: 'TERRITORI USG', territoryIntro: 'Scopri i settori durante la spedizione virtuale.', territoryLocked: 'BLOCCATO', territoryOpen: 'SCOPERTO', territoryNext: 'PROSSIMA ZONA', territoryAll: 'TUTTE LE ZONE SCOPERTE', territoryProgress: 'ZONE SCOPERTE', territoryTest: 'SPEDIZIONE VIRTUALE · NESSUN XP', territorySector: 'SETTORE', territoryMap: 'MAPPA AVVENTURA', territoryReward: 'SETTORE SCOPERTO', expeditionComplete: 'SPEDIZIONE COMPLETATA', expeditionSubtitle: 'Tutti i territori sono stati scoperti!', expeditionTerritories: 'TERRITORI SCOPERTI', expeditionBadges: 'DISTINTIVI VIRTUALI', expeditionAward: 'MEDAGLIA ESPLORATORE', expeditionSafety: 'Premi dimostrativi · 0 XP · nessun dato Supabase', expeditionNext: 'NUOVA AVVENTURA',
    simTitle: 'MODALITÀ TEST GPS', realMode: 'GPS REALE', simMode: 'SIMULAZIONE', simHelp: 'Percorso dimostrativo intorno alla posizione attuale. Nessun XP reale o record Supabase.', simStart: 'AVVIA SIMULAZIONE', simComplete: 'Test terminato. Nessun dato o punto salvato.', simLocation: 'Consenti la posizione per centrare il percorso di prova sulla mappa.', simCheckpoint: 'CHECKPOINT', simNoRewards: 'TEST · 0 XP · NESSUN RECORD', simDistance: 'DISTANZA VIRTUALE', simRestart: 'NUOVO TEST', confirm: 'TERMINA E RIVEDI', resetHelp: 'Nuova passeggiata cancella solo il test locale, non i dati Supabase.',
  },
};

function metersBetween(a, b) {
  const r = 6371000;
  const p1 = a.latitude * Math.PI / 180;
  const p2 = b.latitude * Math.PI / 180;
  const dp = (b.latitude - a.latitude) * Math.PI / 180;
  const dl = (b.longitude - a.longitude) * Math.PI / 180;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function clock(ms) {
  const seconds = Math.floor(ms / 1000);
  return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}


const simulationCheckpoints = [250, 500, 1000];
const territoryIcons = ['◈', '✦', '◆'];
const territoryRadii = [65, 80, 95];


function simulationPosition(origin, distance) {
  const side = 220;
  const loop = side * 4;
  const step = distance % loop;
  const east = step < side ? step : step < side * 2 ? side : step < side * 3 ? side * 3 - step : 0;
  const north = step < side ? 0 : step < side * 2 ? step - side : step < side * 3 ? side : loop - step;
  const latitude = origin.latitude + north / 111320;
  const longitude = origin.longitude + east / (111320 * Math.max(0.2, Math.cos(origin.latitude * Math.PI / 180)));
  return { latitude, longitude, timestamp: Date.now() };
}

export default function MyCorsoWalkTrackerScreen({ navigation, route }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const words = languageText[language] ?? languageText.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [mode, setMode] = useState('ready');
  const [testMode, setTestMode] = useState('real');
  const [checkpoint, setCheckpoint] = useState(0);
  const [unlockNotice, setUnlockNotice] = useState(0);
  const unlockScale = useRef(new Animated.Value(0.85)).current;
  const unlockOpacity = useRef(new Animated.Value(0)).current;
  const unlockTimerRef = useRef(null);
  const expeditionScale = useRef(new Animated.Value(0.88)).current;
  const expeditionOpacity = useRef(new Animated.Value(0)).current;
  const lastCheckpointRef = useRef(0);
  const [simAnchor, setSimAnchor] = useState(null);
  const [trail, setTrail] = useState([]);
  const [meters, setMeters] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [position, setPosition] = useState(null);
  const [info, setInfo] = useState('');
  const [starting, setStarting] = useState(false);
  const modeRef = useRef('ready');
  const simAnchorRef = useRef(null);
  const simTimerRef = useRef(null);
  const simulationDistanceRef = useRef(0);
  const subscriptionRef = useRef(null);
  const locationPendingRef = useRef(false);
  const previousRef = useRef(null);
  const trailRef = useRef([]);
  const metersRef = useRef(0);
  const elapsedRef = useRef(0);
  const runningFromRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const mapRef = useRef(null);
  const scrollRef = useRef(null);
  const mapTopRef = useRef(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const aliveRef = useRef(true);
  const dog = route.params?.dog ?? {};
  const ownerName = route.params?.ownerName ?? '';
  const photoUri = route.params?.photoUri;
  const nextCheckpoint = simulationCheckpoints[checkpoint] ?? null;
  const territoryPercent = Math.round(checkpoint * 100 / simulationCheckpoints.length);
  const expeditionComplete = testMode === 'simulation' && mode === 'finished' && checkpoint === simulationCheckpoints.length;

  useEffect(() => {
    if (!expeditionComplete) return undefined;
    expeditionScale.setValue(0.88);
    expeditionOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(expeditionScale, { toValue: 1, friction: 5, tension: 75, useNativeDriver: true }),
      Animated.timing(expeditionOpacity, { toValue: 1, duration: 550, useNativeDriver: true }),
    ]).start();
    return () => { expeditionScale.stopAnimation(); expeditionOpacity.stopAnimation(); };
  }, [expeditionComplete, expeditionScale, expeditionOpacity]);

  useEffect(() => {
    if (testMode !== 'simulation' || mode === 'ready' || checkpoint <= lastCheckpointRef.current) {
      lastCheckpointRef.current = checkpoint;
      return undefined;
    }
    lastCheckpointRef.current = checkpoint;
    setUnlockNotice(checkpoint);
    unlockScale.stopAnimation();
    unlockOpacity.stopAnimation();
    unlockScale.setValue(0.82);
    unlockOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(unlockScale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
      Animated.timing(unlockOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = setTimeout(() => {
      Animated.timing(unlockOpacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setUnlockNotice(0);
      });
    }, 1900);
    return undefined;
  }, [checkpoint, mode, testMode, unlockOpacity, unlockScale]);

  useEffect(() => () => {
    if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    unlockOpacity.stopAnimation();
    unlockScale.stopAnimation();
  }, [unlockOpacity, unlockScale]);


  const stopWatcher = useCallback(() => {
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    simTimerRef.current = null;
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }, []);

  const pauseTracking = useCallback((message = '') => {
    if (modeRef.current !== 'running') return;
    const nextElapsed = elapsedRef.current + (Date.now() - (runningFromRef.current ?? Date.now()));
    elapsedRef.current = nextElapsed;
    runningFromRef.current = null;
    modeRef.current = 'paused';
    setElapsed(nextElapsed);
    setMode('paused');
    if (message) setInfo(message);
    stopWatcher();
    previousRef.current = null;
  }, [stopWatcher]);

  useEffect(() => {
    aliveRef.current = true;
    const listener = AppState.addEventListener('change', state => {
      if (appStateRef.current === 'active' && state !== 'active') pauseTracking(words.background);
      appStateRef.current = state;
    });
    return () => {
      aliveRef.current = false;
      listener.remove();
      stopWatcher();
    };
  }, [pauseTracking, stopWatcher, words.background]);

  useEffect(() => {
    if (mode !== 'running') return undefined;
    const id = setInterval(() => {
      setElapsed(elapsedRef.current + (Date.now() - (runningFromRef.current ?? Date.now())));
    }, 1000);
    return () => clearInterval(id);
  }, [mode]);

  function processLocation(fix) {
    if (modeRef.current !== 'running' || !aliveRef.current) return;
    const c = fix.coords;
    if (!Number.isFinite(c.latitude) || !Number.isFinite(c.longitude) || !Number.isFinite(c.accuracy) || c.accuracy > 35 || c.accuracy < 0) return;
    const item = { latitude: c.latitude, longitude: c.longitude, timestamp: fix.timestamp || Date.now() };
    const last = previousRef.current;
    setPosition(item);
    if (last) {
      const delta = metersBetween(last, item);
      const seconds = (item.timestamp - last.timestamp) / 1000;
      if (seconds <= 0 || delta > 80 || (seconds > 0 && delta / seconds > 3.5)) return;
      if (delta < 3) return;
      metersRef.current += delta;
      setMeters(metersRef.current);
    }
    previousRef.current = item;
    trailRef.current = [...trailRef.current.slice(-1499), item];
    setTrail(trailRef.current);
    mapRef.current?.animateToRegion({ latitude: c.latitude, longitude: c.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006 }, 500);
    setInfo('');
  }

  function scrollToMap() {
    requestAnimationFrame(() => {
      if (aliveRef.current) scrollRef.current?.scrollTo({ y: Math.max(0, mapTopRef.current - 12), animated: true });
    });
  }

  async function startTracking() {
    if (starting || locationPendingRef.current || modeRef.current === 'running') return;
    locationPendingRef.current = true;
    setStarting(true);
    setInfo(words.gpsWaiting);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        if (aliveRef.current) setInfo(words.permission);
        return;
      }
      const available = await Location.hasServicesEnabledAsync();
      if (!available) {
        if (aliveRef.current) setInfo(words.gpsError);
        return;
      }
      if (!aliveRef.current) return;
      previousRef.current = null;
      runningFromRef.current = Date.now();
      modeRef.current = 'running';
      setMode('running');
      scrollToMap();
      const watcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 3 },
        processLocation,
        () => { if (aliveRef.current) pauseTracking(words.gpsError); }
      );
      if (aliveRef.current && modeRef.current === 'running') subscriptionRef.current = watcher;
      else watcher.remove();
    } catch {
      if (aliveRef.current) {
        pauseTracking(words.gpsError);
        setInfo(words.gpsError);
      }
    } finally {
      locationPendingRef.current = false;
      if (aliveRef.current) setStarting(false);
    }
  }

  async function startSimulation() {
    if (starting || modeRef.current === 'running') return;
    setStarting(true);
    setInfo(words.simLocation);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setInfo(words.permission);
        return;
      }
      let anchor = simAnchorRef.current;
      if (!anchor) {
        const fix = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        anchor = { latitude: fix.coords.latitude, longitude: fix.coords.longitude };
        if (!aliveRef.current) return;
        simAnchorRef.current = anchor;
        setSimAnchor(anchor);
      }
      if (!aliveRef.current) return;
      previousRef.current = null;
      runningFromRef.current = Date.now();
      modeRef.current = 'running';
      setMode('running');
      scrollToMap();
      setInfo(words.simHelp);
      if (trailRef.current.length === 0) {
        const point = simulationPosition(anchor, 0);
        trailRef.current = [point];
        setTrail([point]);
        setPosition(point);
      }
      simTimerRef.current = setInterval(() => {
        if (modeRef.current !== 'running' || !aliveRef.current) return;
        const nextDistance = Math.min(1200, simulationDistanceRef.current + 20);
        simulationDistanceRef.current = nextDistance;
        metersRef.current = nextDistance;
        const point = simulationPosition(anchor, nextDistance);
        trailRef.current = [...trailRef.current, point];
        setTrail(trailRef.current);
        setPosition(point);
        setMeters(nextDistance);
        setCheckpoint(simulationCheckpoints.filter(v => nextDistance >= v).length);
        mapRef.current?.animateToRegion({ latitude: point.latitude, longitude: point.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006 }, 700);
        if (nextDistance >= 1200) {
          pauseTracking();
          modeRef.current = 'finished';
          setMode('finished');
          setInfo(words.simComplete);
        }
      }, 1000);
    } catch {
      if (aliveRef.current) setInfo(words.gpsError);
    } finally {
      if (aliveRef.current) setStarting(false);
    }
  }

  function focusTerritory(value) {
    const origin = simAnchorRef.current;
    if (!origin || !mapRef.current) return;
    const point = simulationPosition(origin, value);
    mapRef.current.animateToRegion({ ...point, latitudeDelta: 0.0035, longitudeDelta: 0.0035 }, 400);
  }

  function chooseMode(nextMode) {
    if (modeRef.current !== 'ready') return;
    setTestMode(nextMode);
    setInfo('');
  }

  function finish() {
    if (modeRef.current === 'running') pauseTracking();
    stopWatcher();
    modeRef.current = 'finished';
    setMode('finished');
  }

  function newWalk() {
    stopWatcher();
    modeRef.current = 'ready';
    elapsedRef.current = 0;
    runningFromRef.current = null;
    previousRef.current = null;
    trailRef.current = [];
    metersRef.current = 0;
    simulationDistanceRef.current = 0;
    simAnchorRef.current = null;
    setSimAnchor(null);
    setCheckpoint(0);
    setMode('ready');
    setTrail([]);
    setPosition(null);
    setMeters(0);
    setElapsed(0);
    setInfo('');
  }

  function sendToArena() {
    if (testMode === 'simulation') return;
    const finalMinutes = Math.floor(elapsedRef.current / 60000);
    const finalDistance = Math.round(metersRef.current / 10) / 100;
    if (finalMinutes < 5 || finalDistance < 0.1 || finalMinutes > 120 || finalDistance > 5) {
      setInfo(words.short);
      return;
    }
    navigation.navigate({ name: 'MyCorsoChallenges', params: { gpsDraft: { dogId: dog.id, minutes: String(finalMinutes), distance: finalDistance.toFixed(2) } }, merge: true });
  }

  const currentSeconds = mode === 'running' ? elapsed : elapsedRef.current;
  const status = words[mode] || words.ready;
  return (
    <SafeAreaView style={styles.page} edges={['bottom']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={event => setShowBackToTop(event.nativeEvent.contentOffset.y > 200)}
        scrollEventThrottle={32}
      >
        <Text style={styles.kicker}>USG · TERRITORY WALK</Text>
        <Text style={styles.title}>{words.title}</Text>
        <Text style={styles.sub}>{words.subtitle}</Text>
        <View style={styles.modeRow}>
          <Pressable disabled={mode !== 'ready'} onPress={() => chooseMode('real')} style={[styles.modeButton, testMode === 'real' && styles.selectedMode]}><Text style={[styles.modeLabel, testMode === 'real' && styles.selectedLabel]}>{words.realMode}</Text></Pressable>
          <Pressable disabled={mode !== 'ready'} onPress={() => chooseMode('simulation')} style={[styles.modeButton, testMode === 'simulation' && styles.selectedMode]}><Text style={[styles.modeLabel, testMode === 'simulation' && styles.selectedLabel]}>{words.simMode}</Text></Pressable>
        </View>
        {testMode === 'simulation' ? <View style={styles.simBanner}><Text style={styles.simBannerTitle}>{words.simTitle}</Text><Text style={styles.simBannerText}>{words.simHelp}</Text><Text style={styles.simBannerTitle}>{words.simNoRewards}</Text></View> : null}
        <View style={styles.identity}>
          {photoUri ? <Image source={{ uri: photoUri }} style={styles.avatar} /> : <View style={[styles.avatar, styles.emptyAvatar]}><Text style={styles.paw}>{words.photo}</Text></View>}
          <View style={{ flex: 1 }}>
            <Text style={styles.dog}>{dog.name || 'Cane Corso'}</Text>
            <Text style={styles.sub}>{ownerName}</Text>
            <Text style={styles.status}>{status}</Text>
          </View>
        </View>
        <View style={styles.mapFrame} onLayout={event => { mapTopRef.current = event.nativeEvent.layout.y; }}>
          {position ? <MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={styles.map}
            initialRegion={{ latitude: position.latitude, longitude: position.longitude, latitudeDelta: 0.006, longitudeDelta: 0.006 }}
            showsUserLocation={testMode === 'real'} showsMyLocationButton={false} mapType="standard">
            {trail.length > 1 ? <Polyline coordinates={trail} strokeColor="#D4AF37" strokeWidth={5} /> : null}
            {testMode === 'real' ? <Marker coordinate={position} title={words.current} /> : <Marker coordinate={position} title={dog.name || 'Cane Corso'} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
              <View style={styles.mapAvatarFrame}>{photoUri ? <Image source={{ uri: photoUri }} style={styles.mapAvatar} /> : <Text style={styles.mapAvatarFallback}>USG</Text>}</View>
            </Marker>}
            {testMode === 'simulation' && simAnchor ? <Marker coordinate={simAnchor} title="START" pinColor="#5B8E67" /> : null}
            {testMode === 'simulation' && simAnchor ? simulationCheckpoints.map((value, index) => {
              const zone = simulationPosition(simAnchor, value);
              const unlocked = checkpoint > index;
              return <Circle key={value} center={zone} radius={territoryRadii[index]} strokeWidth={2} strokeColor={unlocked ? '#D4AF37' : '#595C61'} fillColor={unlocked ? 'rgba(212,175,55,0.27)' : 'rgba(20,22,27,0.27)'} />;
            }) : null}
            {testMode === 'simulation' && simAnchor ? simulationCheckpoints.map((value, index) => {
              const zone = simulationPosition(simAnchor, value);
              const unlocked = checkpoint > index;
              return <Marker key={`sector-${value}`} coordinate={zone} onPress={() => focusTerritory(value)} tracksViewChanges={false}>
                <View style={[styles.zoneMapNode, unlocked && styles.zoneMapNodeOpen]}><Text style={[styles.zoneMapSymbol, unlocked && styles.zoneMapSymbolOpen]}>{unlocked ? territoryIcons[index] : '♢'}</Text></View>
              </Marker>;
            }) : null}
          </MapView> : <View style={styles.mapEmpty}>
            <Text style={styles.mapEmptyText}>{mode === 'running' ? words.gpsWaiting : words.noRoute}</Text>
          </View>}
        </View>
        {testMode === 'simulation' ? <View style={styles.territoryBanner}>
          <View style={styles.territoryBannerHeader}><Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.territoryBannerTitle}>{words.territoryMap}</Text><Text style={styles.territoryFraction}>{checkpoint}/{simulationCheckpoints.length}</Text></View>
          <Text style={styles.territoryBannerSub}>{nextCheckpoint === null ? words.territoryAll : `${words.territoryNext} · ${nextCheckpoint >= 1000 ? `${nextCheckpoint / 1000} km` : `${nextCheckpoint} m`}`}</Text>
          <View style={styles.territoryTrack}><View style={[styles.territoryTrackFill, { width: `${territoryPercent}%` }]} /></View>
        </View> : null}
        {testMode === 'simulation' && unlockNotice > 0 ? <Animated.View pointerEvents="none" style={[styles.unlockNotice, { opacity: unlockOpacity, transform: [{ scale: unlockScale }] }]}>
          <Text style={styles.unlockGlyph}>{territoryIcons[unlockNotice - 1]}</Text>
          <View style={styles.unlockCopy}>
            <Text style={styles.unlockHeading}>{words.territoryReward}</Text>
            <Text style={styles.unlockSub}>{words.territorySector} {unlockNotice} · {simulationCheckpoints[unlockNotice - 1] >= 1000 ? `${simulationCheckpoints[unlockNotice - 1] / 1000} km` : `${simulationCheckpoints[unlockNotice - 1]} m`}</Text>
          </View>
        </Animated.View> : null}
        <View style={styles.statistics}>
          <View style={styles.stat}><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65} style={[styles.value, styles.timerValue]}>{clock(currentSeconds)}</Text><Text numberOfLines={1} style={styles.label}>{words.timer}</Text></View>
          <View style={styles.stat}><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.value}>{(meters / 1000).toFixed(2)}</Text><Text numberOfLines={2} style={styles.label}>{words.distance} · KM</Text></View>
          <View style={styles.stat}><Text numberOfLines={1} style={styles.value}>{trail.length}</Text><Text numberOfLines={2} style={styles.label}>{words.fixes}</Text></View>
        </View>
        {testMode === 'simulation' ? <View style={styles.territoryPanel}>
          <View style={styles.territoryPanelHeader}><Text style={styles.territoryHeading}>{words.territoryTitle}</Text><Text style={styles.territoryCount}>{checkpoint}/{simulationCheckpoints.length}</Text></View>
          <Text style={styles.territoryDescription}>{words.territoryIntro}</Text>
          <View style={styles.sectorRow}>{simulationCheckpoints.map((value, i) => {
            const unlocked = checkpoint > i;
            return <Pressable accessibilityRole="button" key={value} onPress={() => focusTerritory(value)} style={[styles.sectorCard, unlocked && styles.sectorCardOpen]}>
              <View style={[styles.sectorIconFrame, unlocked && styles.sectorIconFrameOpen]}><Text style={[styles.sectorIcon, unlocked && styles.sectorIconOpen]}>{unlocked ? territoryIcons[i] : '♢'}</Text></View>
              <Text numberOfLines={1} style={[styles.sectorTitle, unlocked && styles.sectorTitleOpen]}>{words.territorySector} {i + 1}</Text>
              <Text style={styles.sectorDistance}>{value >= 1000 ? `${value / 1000} km` : `${value} m`}</Text>
              <Text style={[styles.sectorStatus, unlocked && styles.sectorStatusOpen]}>{unlocked ? words.territoryOpen : words.territoryLocked}</Text>
            </Pressable>;
          })}</View>
          <Text style={styles.territoryFootnote}>{words.territoryTest}</Text>
        </View> : null}
        {info ? <Text style={styles.message}>{info}</Text> : null}
        {mode === 'ready' ? <Pressable disabled={starting} style={styles.primary} onPress={testMode === 'simulation' ? startSimulation : startTracking}><Text style={styles.primaryText}>{starting ? '…' : testMode === 'simulation' ? words.simStart : words.start}</Text></Pressable> : null}
        {mode === 'running' ? <View style={styles.actions}><Pressable style={styles.secondary} onPress={() => pauseTracking()}><Text style={styles.secondaryText}>{words.pause}</Text></Pressable><Pressable style={styles.primaryHalf} onPress={finish}><Text style={styles.primaryText}>{words.finish}</Text></Pressable></View> : null}
        {mode === 'paused' ? <View style={styles.actions}><Pressable disabled={starting} style={styles.primaryHalf} onPress={testMode === 'simulation' ? startSimulation : startTracking}><Text style={styles.primaryText}>{words.resume}</Text></Pressable><Pressable style={styles.secondary} onPress={finish}><Text style={styles.secondaryText}>{words.finish}</Text></Pressable></View> : null}
        {expeditionComplete ? <Animated.View style={[styles.expeditionCard, { opacity: expeditionOpacity, transform: [{ scale: expeditionScale }] }]}>
          <Text style={styles.expeditionKicker}>USG · TERRITORY REWARDS</Text>
          <View style={styles.expeditionPortraitRow}>
            {photoUri ? <Image source={{ uri: photoUri }} style={styles.expeditionPortrait} /> : <View style={[styles.expeditionPortrait, styles.expeditionPortraitFallback]}><Text style={styles.expeditionMedal}>★</Text></View>}
            <View style={styles.expeditionIdentity}><Text numberOfLines={1} style={styles.expeditionDog}>{dog.name || 'Cane Corso'}</Text><Text numberOfLines={1} style={styles.expeditionOwner}>{ownerName}</Text></View>
            <Text style={styles.expeditionMedal}>✦</Text>
          </View>
          <Text style={styles.expeditionTitle}>{words.expeditionComplete}</Text>
          <Text style={styles.expeditionSubtitle}>{words.expeditionSubtitle}</Text>
          <View style={styles.expeditionMetrics}>
            <View style={styles.expeditionMetric}><Text style={styles.expeditionMetricValue}>{checkpoint}/{simulationCheckpoints.length}</Text><Text style={styles.expeditionMetricLabel}>{words.expeditionTerritories}</Text></View>
            <View style={styles.expeditionMetric}><Text style={styles.expeditionMetricValue}>{(meters / 1000).toFixed(2)} km</Text><Text style={styles.expeditionMetricLabel}>{words.simDistance}</Text></View>
          </View>
          <Text style={styles.expeditionBadgesLabel}>{words.expeditionBadges}</Text>
          <View style={styles.expeditionBadgeRow}>{simulationCheckpoints.map((point, index) => <View key={point} style={styles.expeditionBadge}><Text style={styles.expeditionBadgeIcon}>{territoryIcons[index]}</Text><Text style={styles.expeditionBadgeText}>{words.territorySector} {index + 1}</Text></View>)}</View>
          <View style={styles.expeditionAward}><Text style={styles.expeditionAwardStar}>★</Text><Text style={styles.expeditionAwardText}>{words.expeditionAward}</Text></View>
          <Text style={styles.expeditionSafety}>{words.expeditionSafety}</Text>
          <Pressable accessibilityRole="button" style={styles.expeditionRestart} onPress={newWalk}><Text style={styles.expeditionRestartText}>{words.expeditionNext}</Text></Pressable>
        </Animated.View> : null}
        {mode === 'finished' ? <View style={styles.summary}>
          <Text style={styles.heading}>{words.summary}</Text>
          <Text style={styles.sub}>{clock(elapsedRef.current)} · {(metersRef.current / 1000).toFixed(2)} km</Text>
          {testMode === 'real' ? <Pressable style={styles.primary} onPress={sendToArena}><Text style={styles.primaryText}>{words.review}</Text></Pressable> : <Text style={styles.simBannerTitle}>{words.simComplete}</Text>}
          <Pressable style={styles.secondary} onPress={newWalk}><Text style={styles.secondaryText}>{words.discard}</Text></Pressable>
          <Text style={styles.hint}>{testMode === 'simulation' ? words.simNoRewards : words.resetHelp}</Text>
        </View> : null}
        <Text style={styles.hint}>{testMode === 'simulation' ? words.simHelp : words.limitation}</Text>
        <Text style={styles.hint}>{words.accuracy}</Text>
        {mode !== 'running' ? <Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>{words.back}</Text></Pressable> : null}
      </ScrollView>
      <USGBackToTop
        visible={showBackToTop}
        language={language}
        bottomOffset={72}
        onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
      />
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 16, paddingTop: 22, paddingBottom: 60, gap: 12 },
    kicker: { color: colors.gold, letterSpacing: 2, fontSize: 11, fontWeight: '700' },
    title: { color: colors.text, fontSize: 27, fontWeight: '800' },
    sub: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
    identity: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 13 },
    avatar: { width: 62, height: 62, borderRadius: 31, borderWidth: 2, borderColor: colors.gold },
    emptyAvatar: { justifyContent: 'center', alignItems: 'center' },
    paw: { color: colors.gold, fontWeight: '800' },
    dog: { color: colors.text, fontSize: 21, fontWeight: '800' },
    status: { color: colors.gold, fontSize: 13, fontWeight: '700' },
    mapFrame: { height: 330, borderWidth: 1, borderColor: colors.gold, borderRadius: 18, overflow: 'hidden' },
    mapAvatarFrame: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: '#D4AF37', backgroundColor: '#151515', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    mapAvatar: { width: 38, height: 38, borderRadius: 19 },
    mapAvatarFallback: { color: '#D4AF37', fontWeight: '800', fontSize: 12 },
    zoneMapNode: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, backgroundColor: '#1B1C20', borderColor: '#6E7177', justifyContent: 'center', alignItems: 'center' },
    zoneMapNodeOpen: { backgroundColor: '#2F2816', borderColor: '#D4AF37' },
    zoneMapSymbol: { color: '#9399A0', fontSize: 19, fontWeight: '800' },
    zoneMapSymbolOpen: { color: '#F5D77A' },
    territoryBanner: { backgroundColor: '#16191D', borderWidth: 1, borderColor: '#9D7D2B', borderRadius: 13, paddingHorizontal: 12, paddingVertical: 10, gap: 7 },
    territoryBannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    territoryBannerTitle: { flex: 1, flexShrink: 1, fontSize: 12, color: '#E7C76C', letterSpacing: 0.5, fontWeight: '800' },
    territoryFraction: { color: '#E7C76C', fontWeight: '800', minWidth: 42, textAlign: 'right' },
    territoryBannerSub: { color: '#D2D0C8', fontSize: 12 },
    territoryTrack: { backgroundColor: '#343331', height: 7, borderRadius: 8, overflow: 'hidden' },
    territoryTrackFill: { height: '100%', backgroundColor: '#D4AF37', borderRadius: 8 },
    territoryPanel: { backgroundColor: '#151719', borderRadius: 18, borderWidth: 1, borderColor: '#7F662F', padding: 12, gap: 9 },
    territoryPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    territoryHeading: { fontSize: 17, fontWeight: '800', color: '#EBCB77' },
    territoryCount: { fontSize: 15, fontWeight: '800', color: '#EBCB77' },
    territoryDescription: { fontSize: 12, lineHeight: 18, color: '#BEBCAF' },
    sectorRow: { flexDirection: 'row', gap: 8 },
    sectorCard: { flex: 1, minWidth: 0, paddingHorizontal: 5, paddingVertical: 12, alignItems: 'center', gap: 5, borderRadius: 13, borderWidth: 1, borderColor: '#47494C', backgroundColor: '#202226' },
    sectorCardOpen: { borderColor: '#D4AF37', backgroundColor: '#342B17' },
    sectorIconFrame: { height: 38, width: 38, borderRadius: 19, borderColor: '#66696D', borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#17191D' },
    sectorIconFrameOpen: { borderColor: '#D4AF37', backgroundColor: '#4C3D1C' },
    sectorIcon: { fontSize: 24, fontWeight: '800', color: '#86898D' },
    sectorIconOpen: { color: '#F1D279' },
    sectorTitle: { color: '#DFDFDB', fontSize: 11, fontWeight: '800' },
    sectorTitleOpen: { color: '#F1D279' },
    sectorDistance: { fontSize: 12, color: '#BDB8A6', fontWeight: '700' },
    sectorStatus: { fontSize: 9, fontWeight: '800', color: '#96999A' },
    sectorStatusOpen: { color: '#EBD07F' },
    territoryFootnote: { fontSize: 10, color: '#B4A786', textAlign: 'center' },
    map: { flex: 1 },
    mapEmpty: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: 22 },
    mapEmptyText: { color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
    modeRow: { flexDirection: 'row', gap: 8 },
    modeButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 12, alignItems: 'center' },
    selectedMode: { borderColor: colors.gold, backgroundColor: colors.surface },
    modeLabel: { fontSize: 13, fontWeight: '800', color: colors.textMuted, textAlign: 'center' },
    selectedLabel: { color: colors.gold },
    simBanner: { borderColor: colors.gold, borderWidth: 1, borderRadius: 13, backgroundColor: colors.surface, padding: 12, gap: 8 },
    simBannerTitle: { color: colors.gold, fontWeight: '800', fontSize: 14 },
    simBannerText: { color: colors.textMuted, fontSize: 12, lineHeight: 19 },
    checkpointRow: { flexDirection: 'row', gap: 8 },
    checkpointCell: { flex: 1, borderWidth: 1, borderRadius: 10, borderColor: colors.border, paddingVertical: 8, alignItems: 'center' },
    checkpointReached: { borderColor: colors.gold, backgroundColor: '#342C14' },
    checkpointText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
    checkpointTextReached: { color: colors.gold },
    unlockNotice: { borderWidth: 1.5, borderColor: '#D4AF37', backgroundColor: '#332710', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 12 },
    unlockGlyph: { fontSize: 29, color: '#F2D378', fontWeight: '800' },
    unlockCopy: { flex: 1 },
    unlockHeading: { fontSize: 15, color: '#F2D378', fontWeight: '900' },
    unlockSub: { fontSize: 12, color: '#E6D8B5', marginTop: 2 },
    statistics: { flexDirection: 'row', justifyContent: 'space-between', gap: 7 },
    stat: { flex: 1, minWidth: 0, backgroundColor: colors.surface, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: 4 },
    value: { color: colors.gold, fontSize: 16, fontWeight: '800', textAlign: 'center', width: '100%' },
    timerValue: { fontSize: 14, fontVariant: ['tabular-nums'], letterSpacing: -0.6 },
    label: { color: colors.textMuted, fontSize: 10, fontWeight: '700', textAlign: 'center', lineHeight: 13 },
    actions: { flexDirection: 'row', gap: 9 },
    primary: { backgroundColor: '#D4AF37', padding: 15, alignItems: 'center', borderRadius: 12 },
    primaryHalf: { flex: 1, backgroundColor: '#D4AF37', padding: 15, alignItems: 'center', borderRadius: 12 },
    primaryText: { color: '#101010', fontSize: 14, fontWeight: '800', textAlign: 'center' },
    secondary: { flex: 1, borderWidth: 1, borderColor: colors.gold, padding: 15, alignItems: 'center', borderRadius: 12 },
    secondaryText: { color: colors.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
    message: { color: '#F2C17E', fontSize: 13, lineHeight: 20 },
    expeditionCard: { borderRadius: 20, borderWidth: 1.5, borderColor: '#D4AF37', backgroundColor: '#151615', padding: 15, gap: 12, alignItems: 'stretch' },
    expeditionKicker: { color: '#D4AF37', textAlign: 'center', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
    expeditionPortraitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    expeditionPortrait: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#D4AF37' },
    expeditionPortraitFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#302716' },
    expeditionIdentity: { flex: 1, minWidth: 0, gap: 3 },
    expeditionDog: { color: '#F8E5B9', fontSize: 20, fontWeight: '900' },
    expeditionOwner: { color: '#C8BDA9', fontSize: 12 },
    expeditionMedal: { color: '#F3CC6E', fontSize: 28 },
    expeditionTitle: { color: '#F3D485', textAlign: 'center', fontSize: 19, fontWeight: '900' },
    expeditionSubtitle: { color: '#DDD5C3', textAlign: 'center', fontSize: 13 },
    expeditionMetrics: { flexDirection: 'row', gap: 8 },
    expeditionMetric: { flex: 1, minWidth: 0, backgroundColor: '#24231E', padding: 11, gap: 5, borderRadius: 12, alignItems: 'center' },
    expeditionMetricValue: { color: '#F3D485', fontSize: 18, fontWeight: '900' },
    expeditionMetricLabel: { color: '#D3C8AC', fontSize: 10, textAlign: 'center', fontWeight: '700' },
    expeditionBadgesLabel: { color: '#E8CA78', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    expeditionBadgeRow: { flexDirection: 'row', gap: 8 },
    expeditionBadge: { flex: 1, minWidth: 0, backgroundColor: '#282519', borderWidth: 1, borderColor: '#806A32', borderRadius: 12, paddingVertical: 10, alignItems: 'center', gap: 5 },
    expeditionBadgeIcon: { color: '#F1CE73', fontSize: 27, fontWeight: '900' },
    expeditionBadgeText: { color: '#DFCB9D', fontSize: 10, fontWeight: '800' },
    expeditionAward: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, padding: 10, backgroundColor: '#372B12', borderRadius: 12 },
    expeditionAwardStar: { color: '#F3D485', fontSize: 24 },
    expeditionAwardText: { color: '#F3D485', fontSize: 12, fontWeight: '900', flexShrink: 1 },
    expeditionSafety: { color: '#C8B998', fontSize: 11, textAlign: 'center' },
    expeditionRestart: { backgroundColor: '#D4AF37', borderRadius: 12, padding: 13, alignItems: 'center' },
    expeditionRestartText: { color: '#111111', fontSize: 13, fontWeight: '900' },
    summary: { backgroundColor: colors.surface, borderRadius: 16, padding: 13, borderWidth: 1, borderColor: colors.border, gap: 12 },
    heading: { color: colors.gold, fontSize: 17, fontWeight: '800' },
    hint: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
    back: { paddingVertical: 12, alignItems: 'center' },
    backText: { color: colors.gold, fontWeight: '700' },
  });
}
