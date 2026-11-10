import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import USGBackToTop from '../components/USGBackToTop';
import { getMyDogs } from '../dogs/dogService';
import { deleteDogCareEntry, getDogCareEntries, saveDogCareEntry } from '../dogs/dogCareService';
import { getCareHistoryExtensions, saveCareHistoryExtension, deleteCareHistoryExtension, getCareHistorySelectedDog, setCareHistorySelectedDog } from '../dogs/dogCareHistoryLocalStore';
import { isValidCareHistoryDate, isValidCareQuantity, isValidCareWeight, isValidCareDuration } from '../dogs/careHistoryValidation';
import { getCareHistoryEntryDetails, mergeCareHistoryRows, saveRemoteCareEntryWithExtension, switchCareHistorySection } from '../dogs/careHistoryOperations';
import { getCareHistoryOptions, getActiveCareHistoryType, resolveCareHistoryType, getCareHistoryTimeOptions } from '../dogs/careHistoryUiState';
import { isCareHistoryDateInRange } from '../dogs/careHistoryDate';
import { formatDateOnly, formatMonthYear, formatTime } from '../utils/dateTime';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
const copy = {
  en: {
    title: 'CARE HISTORY',
    sub: 'A simple record of your Corso’s everyday care.',
    dog: 'YOUR CANE CORSO',
    addDog: '+ ADD CORSO',
    emptyDogs: 'Add a Cane Corso to start a care history.',
    loading: 'Loading…',
    feed: 'FEEDING',
    care: 'CARE',
    health: 'HEALTH',
    history: 'HISTORY',
    date: 'DATE',
    time: 'TIME',
    foodType: 'FOOD TYPE',
    quantity: 'QUANTITY',
    unit: 'UNIT',
    custom: 'Describe the food',
    notes: 'NOTES (OPTIONAL)',
    duration: 'DURATION (MIN, OPTIONAL)',
    careType: 'CARE TYPE',
    healthType: 'HEALTH RECORD',
    description: 'DESCRIPTION',
    weight: 'WEIGHT (KG)',
    save: 'SAVE ENTRY',
    update: 'SAVE CHANGES',
    cancel: 'CANCEL',
    all: 'ALL',
    days30: '30 DAYS',
    year: '1 YEAR',
    empty: 'No entries in this history yet.',
    edit: 'EDIT',
    remove: 'DELETE',
    confirm: 'CONFIRM DELETE',
    question: 'Delete this entry?',
    back: 'CANCEL',
    chooseDate: 'CHOOSE DATE',
    previous: 'Previous month',
    next: 'Next month',
    today: 'Today',
    close: 'Close',
    invalidDate: 'Choose a valid date no later than today.',
    invalidQty: 'Enter a quantity greater than zero and up to 10000.',
    invalidFood: 'Choose a food type and describe Other.',
    invalidCare: 'Choose a care type.',
    invalidWeight: 'Enter a weight from 0.1 to 250 kg.',
    invalidDuration: 'Duration must be between 1 and 1440 minutes.',
    failed: 'Could not save this entry. Your existing records were kept.',
    saved: 'Entry saved.',
    savedLocal: 'Saved on this device for this account.',
    removed: 'Entry deleted.',
    localOnly: 'Health entries and non-gram quantities are stored on this device for this account.',
    extensionFailed: 'Entry saved, but additional time or unit details could not be saved on this device.',
    storageChangeBlocked: 'This entry cannot move from cloud storage to this device-only format. Keep its current type and unit.',
    refreshFailed: 'Entry saved, but its history could not be refreshed. It will load again when you return.',
    discardEditTitle: 'Discard this edit?',
    discardEditMessage: 'Switching sections will discard the unsaved changes to this entry.',
    keepEditing: 'KEEP EDITING',
    discardChanges: 'DISCARD CHANGES',
    hour: 'HOUR',
    minutes: 'MINUTES',
    invalidHealth: 'Choose a health record type.',
    dry: 'Dry food',
    wet: 'Wet food',
    barf: 'BARF / raw',
    home: 'Home-cooked',
    canned: 'Canned food',
    supplement: 'Supplement',
    treat: 'Treat',
    other: 'Other',
    walking: 'Walking',
    bathing: 'Bathing',
    brushing: 'Brushing',
    training: 'Training',
    nails: 'Nail trimming',
    ears: 'Ear cleaning',
    eyes: 'Eye cleaning',
    deworm: 'Deworming',
    weightType: 'Weight',
    vet: 'Veterinary visit',
    vaccine: 'Vaccination',
    medication: 'Medication record',
    symptom: 'Symptom / observation',
    titleCare: 'Care history',
    detailWeight: 'Weight',
    deleteFailed: 'Could not delete this entry. It remains in your history.',
    feeding: 'Feeding',
    careLabel: 'Care',
    healthLabel: 'Health',
    filter: 'DATE RANGE',
    from: 'From',
    to: 'To',
    select: 'SELECT',
    customFood: 'Food description',
    chooseDog: 'Choose a dog'
  },
  bg: {
    title: 'ИСТОРИЯ НА ГРИЖИТЕ',
    sub: 'Лесен дневник за ежедневните грижи за твоето Корсо.',
    dog: 'ТВОЕТО КАНЕ КОРСО',
    addDog: '+ ДОБАВИ КОРСО',
    emptyDogs: 'Добави Кане Корсо, за да започнеш историята.',
    loading: 'Зареждане…',
    feed: 'ХРАНЕНЕ',
    care: 'ГРИЖА',
    health: 'ЗДРАВЕ',
    history: 'ИСТОРИЯ',
    date: 'ДАТА',
    time: 'ЧАС',
    foodType: 'ВИД ХРАНА',
    quantity: 'КОЛИЧЕСТВО',
    unit: 'ЕДИНИЦА',
    custom: 'Опиши храната',
    notes: 'БЕЛЕЖКИ (НЕЗАДЪЛЖИТЕЛНО)',
    duration: 'ПРОДЪЛЖИТЕЛНОСТ (МИН, НЕЗАДЪЛЖИТЕЛНО)',
    careType: 'ВИД ГРИЖА',
    healthType: 'ЗДРАВЕН ЗАПИС',
    description: 'ОПИСАНИЕ',
    weight: 'ТЕГЛО (КГ)',
    save: 'ЗАПАЗИ ЗАПИСА',
    update: 'ЗАПАЗИ ПРОМЕНИТЕ',
    cancel: 'ОТКАЗ',
    all: 'ВСИЧКИ',
    days30: '30 ДНИ',
    year: '1 ГОДИНА',
    empty: 'Все още няма записи.',
    edit: 'РЕДАКТИРАЙ',
    remove: 'ИЗТРИЙ',
    confirm: 'ПОТВЪРДИ ИЗТРИВАНЕ',
    question: 'Да изтрия ли този запис?',
    back: 'ОТКАЗ',
    chooseDate: 'ИЗБЕРИ ДАТА',
    previous: 'Предишен месец',
    next: 'Следващ месец',
    today: 'Днес',
    close: 'Затвори',
    invalidDate: 'Избери валидна дата до днес.',
    invalidQty: 'Въведи количество над нула и до 10000.',
    invalidFood: 'Избери вид храна и опиши Друг.',
    invalidCare: 'Избери вид грижа.',
    invalidWeight: 'Въведи тегло от 0,1 до 250 кг.',
    invalidDuration: 'Продължителността трябва да е от 1 до 1440 минути.',
    failed: 'Записът не се запази. Съществуващите данни са запазени.',
    saved: 'Записът е запазен.',
    savedLocal: 'Запазено на това устройство за този профил.',
    removed: 'Записът е изтрит.',
    localOnly: 'Здравните записи и количествата извън грамове се пазят на устройството за този профил.',
    extensionFailed: 'Записът е запазен, но допълнителният час или мерна единица не се запазиха на устройството.',
    storageChangeBlocked: 'Този запис не може да се премести от облачното съхранение във формат само на устройството. Запази текущия тип и единица.',
    refreshFailed: 'Записът е запазен, но историята не се обнови. Ще се зареди отново при следващото отваряне.',
    discardEditTitle: 'Да отхвърля ли промените?',
    discardEditMessage: 'При смяна на раздела незапазените промени към този запис ще бъдат отхвърлени.',
    keepEditing: 'ПРОДЪЛЖИ РЕДАКЦИЯТА',
    discardChanges: 'ОТХВЪРЛИ ПРОМЕНИТЕ',
    hour: 'ЧАС',
    minutes: 'МИНУТИ',
    invalidHealth: 'Избери вид здравен запис.',
    dry: 'Суха храна',
    wet: 'Мокра храна',
    barf: 'BARF / сурова',
    home: 'Домашно приготвена',
    canned: 'Консерва',
    supplement: 'Добавка',
    treat: 'Лакомство',
    other: 'Друго',
    walking: 'Разходка',
    bathing: 'Къпане',
    brushing: 'Разресване',
    training: 'Тренировка',
    nails: 'Подрязване на нокти',
    ears: 'Почистване на уши',
    eyes: 'Почистване на очи',
    deworm: 'Обезпаразитяване',
    weightType: 'Тегло',
    vet: 'Ветеринарен преглед',
    vaccine: 'Ваксинация',
    medication: 'Лекарство',
    symptom: 'Симптом / наблюдение',
    titleCare: 'История на грижите',
    detailWeight: 'Тегло',
    deleteFailed: 'Записът не се изтри. Остава в историята.',
    feeding: 'Хранене',
    careLabel: 'Грижа',
    healthLabel: 'Здраве',
    filter: 'ПЕРИОД',
    from: 'От',
    to: 'До',
    select: 'ИЗБЕРИ',
    customFood: 'Описание на храната',
    chooseDog: 'Избери куче'
  },
  it: {
    title: 'STORICO DELLE CURE',
    sub: 'Un diario semplice per le cure quotidiane del tuo Corso.',
    dog: 'IL TUO CANE CORSO',
    addDog: '+ AGGIUNGI CORSO',
    emptyDogs: 'Aggiungi un Cane Corso per iniziare lo storico.',
    loading: 'Caricamento…',
    feed: 'ALIMENTAZIONE',
    care: 'CURA',
    health: 'SALUTE',
    history: 'STORICO',
    date: 'DATA',
    time: 'ORA',
    foodType: 'TIPO DI ALIMENTO',
    quantity: 'QUANTITÀ',
    unit: 'UNITÀ',
    custom: 'Descrivi l’alimento',
    notes: 'NOTE (FACOLTATIVE)',
    duration: 'DURATA (MIN, FACOLTATIVA)',
    careType: 'TIPO DI CURA',
    healthType: 'RECORD SANITARIO',
    description: 'DESCRIZIONE',
    weight: 'PESO (KG)',
    save: 'SALVA VOCE',
    update: 'SALVA MODIFICHE',
    cancel: 'ANNULLA',
    all: 'TUTTI',
    days30: '30 GIORNI',
    year: '1 ANNO',
    empty: 'Nessuna voce nello storico.',
    edit: 'MODIFICA',
    remove: 'ELIMINA',
    confirm: 'CONFERMA ELIMINAZIONE',
    question: 'Eliminare questa voce?',
    back: 'ANNULLA',
    chooseDate: 'SCEGLI DATA',
    previous: 'Mese precedente',
    next: 'Mese successivo',
    today: 'Oggi',
    close: 'Chiudi',
    invalidDate: 'Scegli una data valida non successiva a oggi.',
    invalidQty: 'Inserisci una quantità maggiore di zero e fino a 10000.',
    invalidFood: 'Scegli il tipo di alimento e descrivi Altro.',
    invalidCare: 'Scegli il tipo di cura.',
    invalidWeight: 'Inserisci un peso da 0,1 a 250 kg.',
    invalidDuration: 'La durata deve essere da 1 a 1440 minuti.',
    failed: 'Salvataggio non riuscito. I dati esistenti sono stati conservati.',
    saved: 'Voce salvata.',
    savedLocal: 'Salvato su questo dispositivo per questo account.',
    removed: 'Voce eliminata.',
    localOnly: 'I record sanitari e le quantità non in grammi restano su questo dispositivo per questo account.',
    extensionFailed: 'Voce salvata, ma i dettagli aggiuntivi di ora o unità non sono stati salvati sul dispositivo.',
    storageChangeBlocked: 'Questa voce non può passare dal cloud al formato solo sul dispositivo. Mantieni il tipo e l’unità attuali.',
    refreshFailed: 'Voce salvata, ma lo storico non si è aggiornato. Verrà ricaricato alla prossima apertura.',
    discardEditTitle: 'Annullare questa modifica?',
    discardEditMessage: 'Cambiando sezione perderai le modifiche non salvate a questa voce.',
    keepEditing: 'CONTINUA A MODIFICARE',
    discardChanges: 'SCARTA MODIFICHE',
    hour: 'ORA',
    minutes: 'MINUTI',
    invalidHealth: 'Scegli un tipo di record sanitario.',
    dry: 'Cibo secco',
    wet: 'Cibo umido',
    barf: 'BARF / crudo',
    home: 'Fatto in casa',
    canned: 'In scatola',
    supplement: 'Integratore',
    treat: 'Premio',
    other: 'Altro',
    walking: 'Passeggiata',
    bathing: 'Bagno',
    brushing: 'Spazzolatura',
    training: 'Addestramento',
    nails: 'Taglio unghie',
    ears: 'Pulizia orecchie',
    eyes: 'Pulizia occhi',
    deworm: 'Sverminazione',
    weightType: 'Peso',
    vet: 'Visita veterinaria',
    vaccine: 'Vaccinazione',
    medication: 'Farmaco',
    symptom: 'Sintomo / osservazione',
    titleCare: 'Storico delle cure',
    detailWeight: 'Peso',
    deleteFailed: 'Impossibile eliminare la voce. Rimane nello storico.',
    feeding: 'Alimentazione',
    careLabel: 'Cura',
    healthLabel: 'Salute',
    filter: 'INTERVALLO',
    from: 'Da',
    to: 'A',
    select: 'SCEGLI',
    customFood: 'Descrizione alimento',
    chooseDog: 'Seleziona un cane'
  }
};
const weekDays = {
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  bg: ['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'],
  it: ['L', 'M', 'M', 'G', 'V', 'S', 'D']
};
const units = ['g', 'kg', 'ml', 'pieces', 'portions'];
const pad = n => String(n).padStart(2, '0');
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
function parseDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] ? d : null;
}
function dateString(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function validDate(v) {
  return isValidCareHistoryDate(v);
}
export default function MyCorsoCareScreen({
  navigation
}) {
  const {
    user
  } = useAuth();
  const {
    language
  } = useLanguage();
  useEffect(() => {
    if (!__DEV__) return;
    let resolved = null;
    try {
      if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
        resolved = Intl.DateTimeFormat().resolvedOptions();
      }
    } catch {}
    const locale = resolved?.locale || undefined;
    console.info('[USG CORSO][DEV ONLY][DATE LOCALE]', {
      locale: resolved?.locale ?? null,
      timeZone: resolved?.timeZone ?? null,
      sampleDate: formatDateOnly('2026-11-10', locale),
      sampleTime: formatTime('17:05', locale),
      appLanguage: language,
      localeStatus: resolved?.locale
        ? 'Intl runtime result; compare with Samsung Settings to verify device locale'
        : 'en-GB formatter fallback; device locale is not verified'
    });
  }, [language]);
  const {
    colors
  } = useTheme();
  const w = copy[language] || copy.en;
  const s = useMemo(() => stylesFor(colors), [colors]);
  const scrollRef = useRef(null);
  const [dogs, setDogs] = useState([]),
    [dogId, setDogId] = useState(null),
    [entries, setEntries] = useState([]);
  const [section, setSection] = useState('feeding'),
    [dogOpen, setDogOpen] = useState(false),
    [choicesOpen, setChoicesOpen] = useState(false),
    [timePicker, setTimePicker] = useState(null),
    [unitOpen, setUnitOpen] = useState(false),
    [loadingDogs, setLoadingDogs] = useState(true),
    [loadingEntries, setLoadingEntries] = useState(false),
    [busy, setBusy] = useState(false);
  const [date, setDate] = useState(today()),
    [hour, setHour] = useState('09'),
    [minute, setMinute] = useState('00'),
    [dateOpen, setDateOpen] = useState(false),
    [month, setMonth] = useState(new Date());
  const [foodType, setFoodType] = useState('dry'),
    [careType, setCareType] = useState('walking'),
    [quantity, setQuantity] = useState(''),
    [unit, setUnit] = useState('g'),
    [foodDescription, setFoodDescription] = useState(''),
    [careDescription, setCareDescription] = useState(''),
    [duration, setDuration] = useState(''),
    [healthType, setHealthType] = useState('weightType'),
    [weight, setWeight] = useState(''),
    [description, setDescription] = useState(''),
    [notes, setNotes] = useState('');
  const category = section === 'feeding' ? foodType : careType;
  const activeType = getActiveCareHistoryType(section, { foodType, careType, healthType });
  const [editing, setEditing] = useState(null),
    [deleteId, setDeleteId] = useState(null),
    [categoryFilter, setCategoryFilter] = useState('all'),
    [range, setRange] = useState('all'),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [scrolled, setScrolled] = useState(false),
    [keyboard, setKeyboard] = useState(false);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoadingDogs(true);
    getMyDogs(user?.id).then(async ({
      data,
      error: failure
    }) => {
      if (!active) return;
      const list = data || [];
      setDogs(list);
      const stored = await getCareHistorySelectedDog(user?.id).catch(() => null);
      if (!active) return;
      const chosen = list.some(d => d.id === stored) ? stored : list[0]?.id || null;
      setDogId(chosen);
      if (chosen && stored !== chosen) setCareHistorySelectedDog(user?.id, chosen).catch(() => {});
      if (failure) setError(w.failed);
      setLoadingDogs(false);
    }).catch(() => {
      if (active) {
        setDogs([]);
        setLoadingDogs(false);
        setError(w.failed);
      }
    });
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false));
    return () => {
      active = false;
      show.remove();
      hide.remove();
    };
  }, [user?.id, w.failed]));
  useFocusEffect(useCallback(() => {
    let active = true;
    if (!user?.id || !dogId) {
      setEntries([]);
      return () => {
        active = false;
      };
    }
    setEntries([]);
    setLoadingEntries(true);
    Promise.all([getDogCareEntries(user.id, dogId), getCareHistoryExtensions(user.id, dogId)]).then(([remote, local]) => {
      if (!active) return;
      if (remote.error) throw remote.error;
      setEntries(mergeCareHistoryRows(remote.data || [], local || [], dogs.find(d => d.id === dogId)?.name));
      setError('');
      setLoadingEntries(false);
    }).catch(() => {
      if (active) {
        setError(w.failed);
        setLoadingEntries(false);
      }
    });
    return () => {
      active = false;
    };
  }, [user?.id, dogId, dogs, w.failed]));
  function reset() {
    setEditing(null);
    setDeleteId(null);
    setDate(today());
    setHour('09');
    setMinute('00');
    setFoodType('dry');
    setCareType('walking');
    setQuantity('');
    setUnit('g');
    setFoodDescription('');
    setCareDescription('');
    setDuration('');
    setHealthType('weightType');
    setChoicesOpen(false);
    setTimePicker(null);
    setUnitOpen(false);
    setWeight('');
    setDescription('');
    setNotes('');
  }
  function chooseDog(id) {
    if (busy) return;
    setDogId(id);
    setDogOpen(false);
    setCareHistorySelectedDog(user?.id, id).catch(() => setError(w.failed));
    reset();
    setEntries([]);
    setError('');
    setMessage('');
  }
  function changeSection(nextSection) {
    switchCareHistorySection({
      editing,
      currentSection: section,
      nextSection,
      confirmDiscard: onDiscard => Alert.alert(w.discardEditTitle, w.discardEditMessage, [{
        text: w.keepEditing,
        style: 'cancel'
      }, {
        text: w.discardChanges,
        style: 'destructive',
        onPress: onDiscard
      }]),
      discard: () => {
        reset();
        setDeleteId(null);
      },
      switchTo: next => {
        setSection(next);
        setChoicesOpen(false);
        setTimePicker(null);
        setUnitOpen(false);
        setError('');
        setMessage('');
      }
    });
  }
  function quickAdd() {
    navigation.navigate('MyCorsoQuickAdd', {
      openAddDog: true,
      quickAddForCare: true
    });
  }
  function edit(item) {
    setEditing(item);
    setDeleteId(null);
    const entrySection = item.kind === 'health' ? 'health' : item.kind === 'care' ? 'care' : 'feeding';
    setSection(entrySection);
    setChoicesOpen(false);
    setTimePicker(null);
    setDate(item.entry_date || item.date || today());
    setHour((item.time || '09:00').slice(0, 2));
    setMinute((item.time || '09:00').slice(3, 5));
    const savedCategory = item.kind === 'feeding'
      ? item.source === 'remote'
        ? resolveCareHistoryType('feeding', item.food_name, copy) || 'other'
        : resolveCareHistoryType('feeding', item.category, copy)
      : item.kind === 'care'
        ? resolveCareHistoryType('care', item.source === 'remote' ? item.care_type : item.category || item.care_type, copy)
        : null;
    if (entrySection === 'feeding') setFoodType(savedCategory);
    if (entrySection === 'care') setCareType(savedCategory);
    setQuantity(String(item.source === 'remote' ? item.amount_g ?? '' : item.quantity ?? item.amount_g ?? ''));
    setUnit(item.source === 'remote' ? 'g' : item.unit || 'g');
    setFoodDescription(item.kind === 'feeding' && (item.source === 'remote' ? savedCategory === 'other' : savedCategory === null || savedCategory === 'other') ? item.source === 'remote' ? item.food_name || '' : item.customDescription || '' : '');
    setCareDescription(item.kind === 'care' && (savedCategory === null || savedCategory === 'other') ? item.source === 'remote' ? item.care_type || '' : item.customDescription || '' : '');
    setDuration(item.duration || '');
    setHealthType(item.kind === 'health' ? resolveCareHistoryType('health', item.healthType || 'weightType', copy) : 'weightType');
    setWeight(String(item.weightKg ?? ''));
    setDescription(item.description || '');
    setNotes(item.notes || '');
    setError('');
    setMessage('');
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true
    });
  }
  async function load(id) {
    const [remote, local] = await Promise.all([getDogCareEntries(user.id, id), getCareHistoryExtensions(user.id, id)]);
    if (remote.error) throw remote.error;
    setEntries(mergeCareHistoryRows(remote.data || [], local || [], dogs.find(d => d.id === id)?.name));
  }
  async function save() {
    if (busy || !user?.id || !dogId) return;
    setError('');
    setMessage('');
    const day = date.trim(),
      qty = Number(quantity.trim().replace(',', '.')),
      kg = Number(weight.trim().replace(',', '.')),
      mins = duration.trim() === '' ? null : Number(duration);
    if (!validDate(day)) {
      setError(w.invalidDate);
      return;
    }
    if (editing?.source === 'remote' && (section === 'health' || section === 'feeding' && unit !== 'g')) {
      setError(w.storageChangeBlocked);
      return;
    }
    if (section === 'feeding' && !getCareHistoryOptions('feeding').includes(foodType)) {
      setError(w.invalidFood);
      return;
    }
    if (section === 'care' && !getCareHistoryOptions('care').includes(careType)) {
      setError(w.invalidCare);
      return;
    }
    if (section === 'health' && !getCareHistoryOptions('health').includes(healthType)) {
      setError(w.invalidHealth);
      return;
    }
    if (section === 'feeding' && !isValidCareQuantity(quantity, unit)) {
      setError(w.invalidQty);
      return;
    }
    if (section === 'feeding' && foodType === 'other' && !foodDescription.trim()) {
      setError(w.invalidFood);
      return;
    }
    if (section === 'care' && careType === 'other' && !careDescription.trim()) {
      setError(w.invalidCare);
      return;
    }
    if (section === 'health' && healthType === 'weightType' && !isValidCareWeight(weight)) {
      setError(w.invalidWeight);
      return;
    }
    if (section === 'care' && duration.trim() && !isValidCareDuration(duration)) {
      setError(w.invalidDuration);
      return;
    }
    const target = dogId;
    setBusy(true);
    try {
      const extra = {
        time: `${hour}:${minute}`,
        category: section === 'feeding' ? foodType : section === 'care' ? careType : null,
        quantity: qty,
        unit,
        customDescription: section === 'feeding' ? foodType === 'other' ? foodDescription.trim() : '' : section === 'care' && careType === 'other' ? careDescription.trim() : '',
        duration: duration.trim() ? mins : null,
        healthType,
        weightKg: healthType === 'weightType' ? kg : null,
        description: description.trim(),
        notes: notes.trim()
      };
      const staysRemote = section !== 'health' && (section === 'care' || unit === 'g') && editing?.source !== 'local';
      if (staysRemote) {
        const kind = section;
        const name = section === 'feeding' ? foodType === 'other' ? foodDescription.trim() : sLabel(foodType) : careType === 'other' ? careDescription.trim() : sLabel(careType);
        const cloudSave = await saveRemoteCareEntryWithExtension({
          saveRemote: () => saveDogCareEntry(user.id, target, {
            entryDate: day,
            kind,
            foodName: section === 'feeding' ? name : '',
            amountG: section === 'feeding' ? qty : null,
            careType: section === 'care' ? name : '',
            notes: notes.trim()
          }, editing?.source === 'remote' ? editing.id : null),
          saveExtension: remoteId => saveCareHistoryExtension(user.id, target, {
            ...extra,
            entry_date: day,
            kind
          }, {
            linkedEntryId: remoteId
          })
        });
        if (!cloudSave.extensionSaved) {
          setMessage(w.saved);
          setError(w.extensionFailed);
        }
        try {
          await load(target);
        } catch {
          setError(cloudSave.extensionSaved ? w.refreshFailed : w.extensionFailed);
        }
      } else {
        await saveCareHistoryExtension(user.id, target, {
          ...extra,
          kind: section,
          entry_date: day,
          food_name: section === 'feeding' ? foodType === 'other' ? foodDescription.trim() : sLabel(foodType) : null,
          amount_g: section === 'feeding' && unit === 'g' ? qty : null,
          care_type: section === 'care' ? careType : null,
          notes: notes.trim()
        }, editing?.source === 'local' ? {
          recordId: editing.id
        } : {});
        try {
          await load(target);
        } catch {
          setError(w.refreshFailed);
        }
        setMessage(w.savedLocal);
      }
      reset();
      Keyboard.dismiss();
      if (!message) setMessage(staysRemote ? w.saved : w.savedLocal);
    } catch {
      setError(w.failed);
    } finally {
      setBusy(false);
    }
  }
  async function remove(item) {
    if (busy || deleteId !== item.id) return;
    setBusy(true);
    setError('');
    try {
      if (item.source === 'remote') {
        const result = await deleteDogCareEntry(user.id, dogId, item.id);
        if (result.error || !result.data?.length) throw result.error || new Error('Delete failed');
      }
      await deleteCareHistoryExtension(user.id, item.id);
      await load(dogId);
      setMessage(w.removed);
    } catch {
      setError(w.deleteFailed);
    } finally {
      setDeleteId(null);
      setBusy(false);
    }
  }
  function chooseDate(d) {
    setDate(dateString(d));
    setDateOpen(false);
  }
  const historyToday = new Date();
  const filtered = entries.filter(item => {
    if (categoryFilter !== 'all' && item.kind !== categoryFilter) return false;
    if (range !== 'all' && !isCareHistoryDateInRange(item.entry_date || item.date, historyToday, range)) return false;
    return true;
  }).sort((a, b) => `${b.entry_date || b.date}T${b.time || '00:00'}`.localeCompare(`${a.entry_date || a.date}T${a.time || '00:00'}`) || (b.created_at || b.updatedAt || '').localeCompare(a.created_at || a.updatedAt || ''));
  const options = getCareHistoryOptions(section);
  const sLabel = value => w[value] || String(value || '');
  const monthTitle = formatMonthYear(month);
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const days = Array.from({
    length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1));
  return <SafeAreaView style={s.screen} edges={['bottom']}><ScrollView ref={scrollRef} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" onScroll={e => setScrolled(e.nativeEvent.contentOffset.y > 220)} scrollEventThrottle={32}>
    <View style={s.header}><Text style={s.kicker}>USG CORSO · MY CORSO</Text><Text style={s.title}>{w.title}</Text><Text style={s.subtitle}>{w.sub}</Text></View>
    {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}{message ? <Text accessibilityRole="status" style={s.message}>{message}</Text> : null}
    {loadingDogs ? <ActivityIndicator accessibilityLabel={w.loading} color={colors.gold} /> : dogs.length === 0 ? <View style={s.card}><Text style={s.body}>{w.emptyDogs}</Text><Action label={w.addDog} onPress={quickAdd} styles={s} /></View> : <>
      <View style={s.card}><Text style={s.label}>{w.dog}</Text><Pressable accessibilityRole="button" accessibilityLabel={w.chooseDog} accessibilityState={{
            expanded: dogOpen
          }} style={s.inputButton} onPress={() => setDogOpen(!dogOpen)}><Text style={s.inputText}>{dogs.find(d => d.id === dogId)?.name || w.chooseDog}</Text><Text style={s.inputHint}>⌄</Text></Pressable>{dogOpen ? <View style={s.grid}>{dogs.map(d => <Pressable key={d.id} accessibilityRole="button" accessibilityState={{
              selected: dogId === d.id
            }} style={[s.chip, dogId === d.id && s.selected]} onPress={() => {
              chooseDog(d.id);
              setDogOpen(false);
            }}><Text style={[s.chipText, dogId === d.id && s.selectedText]}>{d.name}</Text></Pressable>)}<Action label={w.addDog} onPress={quickAdd} styles={s} /></View> : null}</View>
      <View style={s.tabs}>{[['feeding', 'feeding'], ['care', 'care'], ['health', 'health'], ['history', 'history']].map(([key, mark]) => <Pressable key={key} accessibilityRole="tab" accessibilityState={{
            selected: section === key
          }} onPress={() => {
            changeSection(key);
            setChoicesOpen(false);
            setUnitOpen(false);
            setError('');
            setMessage('');
          }} style={[s.tab, section === key && s.tabActive]}><CareHistoryIcon name={mark} size={20} color={section === key ? colors.gold : colors.textMuted} /><Text numberOfLines={1} style={[s.tabText, section === key && s.selectedText]}>{w[key]}</Text></Pressable>)}</View>
      {section === 'history' ? <View style={s.card}><Text style={s.sectionTitle}>{w.history}</Text><Text style={s.label}>{w.filter}</Text><View style={s.row}>{[['all', w.all], ['30', w.days30], ['365', w.year]].map(([v, label]) => <Chip key={v} label={label} active={range === v} onPress={() => setRange(v)} styles={s} />)}</View><View style={s.row}>{[['all', w.all], ['feeding', w.feed], ['care', w.care], ['health', w.health]].map(([v, label]) => <Chip key={v} label={label} active={categoryFilter === v} onPress={() => setCategoryFilter(v)} styles={s} />)}</View>{loadingEntries ? <ActivityIndicator color={colors.gold} /> : filtered.length === 0 ? <Text style={s.body}>{w.empty}</Text> : filtered.map(item => <View key={`${item.source}-${item.id}`} style={s.entry}><View style={s.entryTop}><View style={s.badge}><CareHistoryIcon name={item.kind === 'feeding' ? 'feeding' : item.kind === 'care' ? 'care' : 'health'} size={18} color={colors.gold} /></View><View style={s.flex}><Text style={s.entryTitle}>{item.kind === 'feeding' ? w.feeding : item.kind === 'care' ? w.careLabel : w.healthLabel}</Text><Text style={s.meta}>{item.dogName || dogs.find(d => d.id === dogId)?.name} · {formatDateOnly(item.entry_date || item.date)}{item.time ? ` · ${formatTime(item.time)}` : ''}</Text></View></View><Text style={s.body}>{getCareHistoryEntryDetails(item, {
                label: sLabel,
                weightLabel: w.detailWeight
              })}</Text>{item.notes ? <Text style={s.noteText}>{item.notes}</Text> : null}<View style={s.row}><Chip label={w.edit} onPress={() => edit(item)} styles={s} /><Chip label={w.remove} danger onPress={() => setDeleteId(item.id)} styles={s} /></View>{deleteId === item.id ? <View style={s.confirm}><Text style={s.body}>{w.question}</Text><View style={s.row}><Chip label={w.back} onPress={() => setDeleteId(null)} styles={s} /><Chip label={w.confirm} danger onPress={() => remove(item)} styles={s} /></View></View> : null}</View>)}</View> : <View style={s.card}>
        <Text style={s.sectionTitle}>{w[section === 'feeding' ? 'feed' : section === 'care' ? 'care' : 'health']}</Text>
        <Text style={s.label}>{w.date}</Text><Pressable accessibilityRole="button" accessibilityLabel={`${w.chooseDate}: ${formatDateOnly(date)}`} style={s.inputButton} onPress={() => {
            setMonth(parseDate(date) || new Date());
            setDateOpen(true);
          }}><Text style={s.inputText}>{formatDateOnly(date)}</Text><Text style={s.inputHint}>▦</Text></Pressable>
        <View style={s.timeRow}><View style={s.timeCol}><Text style={s.smallLabel}>{w.hour}</Text><Pressable accessibilityRole="button" accessibilityLabel={w.hour + ': ' + hour} accessibilityState={{ expanded: timePicker === 'hour' }} style={s.timeButton} onPress={() => setTimePicker(timePicker === 'hour' ? null : 'hour')}><Text style={s.inputText}>{hour}</Text><Text style={s.inputHint}>⌄</Text></Pressable>{timePicker === 'hour' ? <ScrollView style={s.timeMenu} nestedScrollEnabled keyboardShouldPersistTaps="handled"><View style={s.timeOptions}>{getCareHistoryTimeOptions().hours.map(v => <Pressable key={v} accessibilityRole="button" accessibilityState={{ selected: hour === v }} style={[s.timeOption, hour === v && s.selected]} onPress={() => { setHour(v); setTimePicker(null); }}><Text style={[s.chipText, hour === v && s.selectedText]}>{v}</Text></Pressable>)}</View></ScrollView> : null}</View><Text style={s.colon}>:</Text><View style={s.timeCol}><Text style={s.smallLabel}>{w.minutes}</Text><Pressable accessibilityRole="button" accessibilityLabel={w.minutes + ': ' + minute} accessibilityState={{ expanded: timePicker === 'minute' }} style={s.timeButton} onPress={() => setTimePicker(timePicker === 'minute' ? null : 'minute')}><Text style={s.inputText}>{minute}</Text><Text style={s.inputHint}>⌄</Text></Pressable>{timePicker === 'minute' ? <ScrollView style={s.timeMenu} nestedScrollEnabled keyboardShouldPersistTaps="handled"><View style={s.timeOptions}>{getCareHistoryTimeOptions().minutes.map(v => <Pressable key={v} accessibilityRole="button" accessibilityState={{ selected: minute === v }} style={[s.timeOption, minute === v && s.selected]} onPress={() => { setMinute(v); setTimePicker(null); }}><Text style={[s.chipText, minute === v && s.selectedText]}>{v}</Text></Pressable>)}</View></ScrollView> : null}</View></View>
        <Text style={s.label}>{section === 'feeding' ? w.foodType : section === 'care' ? w.careType : w.healthType}</Text><Pressable accessibilityRole="button" accessibilityLabel={section === 'feeding' ? w.foodType : section === 'care' ? w.careType : w.healthType} accessibilityState={{
            expanded: choicesOpen
          }} style={s.inputButton} onPress={() => setChoicesOpen(!choicesOpen)}><Text style={s.inputText}>{sLabel(activeType) || w.select}</Text><Text style={s.inputHint}>⌄</Text></Pressable>{choicesOpen ? <View style={s.grid}>{options.map(v => <Chip key={v} label={sLabel(v)} active={activeType === v} onPress={() => {
              if (section === 'feeding') { setFoodType(v); if (v !== 'other') setFoodDescription(''); }
              else if (section === 'care') { setCareType(v); if (v !== 'other') setCareDescription(''); }
              else setHealthType(v);
              setChoicesOpen(false);
            }} styles={s} />)}</View> : null}
        {section === 'feeding' ? <>{foodType === 'other' ? <Field label={w.customFood} value={foodDescription} onChangeText={setFoodDescription} styles={s} /> : null}<Text style={s.label}>{w.quantity}</Text><View style={s.row}>{['1', '5', '10', '25', '50'].map(v => <Chip key={v} label={v} active={quantity === v} onPress={() => setQuantity(v)} styles={s} />)}</View><TextInput accessibilityLabel={w.quantity} style={s.input} value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.textMuted} /><Text style={s.label}>{w.unit}</Text><Pressable accessibilityRole="button" accessibilityState={{
              expanded: unitOpen
            }} style={s.inputButton} onPress={() => setUnitOpen(!unitOpen)}><Text style={s.inputText}>{unit}</Text><Text style={s.inputHint}>⌄</Text></Pressable>{unitOpen ? <View style={s.grid}>{units.map(v => <Chip key={v} label={v} active={unit === v} onPress={() => {
                setUnit(v);
                setUnitOpen(false);
              }} styles={s} />)}</View> : null}</> : section === 'care' ? <>{careType === 'other' ? <Field label={w.description} value={careDescription} onChangeText={setCareDescription} styles={s} /> : null}<Field label={w.duration} value={duration} onChangeText={setDuration} keyboardType="number-pad" styles={s} /></> : <>{healthType === 'weightType' ? <Field label={w.weight} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" styles={s} /> : <Field label={w.description} value={description} onChangeText={setDescription} styles={s} />}</>}
        <Field label={w.notes} value={notes} onChangeText={setNotes} multiline styles={s} /><Action label={editing ? w.update : w.save} disabled={busy || loadingEntries} onPress={save} styles={s} />{editing ? <Action label={w.cancel} disabled={busy} secondary onPress={reset} styles={s} /> : null}
      </View>}
      <Text style={s.privacy}>{w.localOnly}</Text>
    </>}
  </ScrollView><USGBackToTop visible={scrolled && !keyboard} language={language} bottomOffset={68} onPress={() => scrollRef.current?.scrollTo({
      y: 0,
      animated: true
    })} />
  <Modal transparent visible={dateOpen} animationType="fade" onRequestClose={() => setDateOpen(false)}><View style={s.modalShade}><View style={s.calendar}><Text style={s.sectionTitle}>{w.chooseDate}</Text><View style={s.monthRow}><Pressable accessibilityLabel={w.previous} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><Text style={s.monthButton}>‹</Text></Pressable><Text style={s.monthTitle}>{monthTitle}</Text><Pressable accessibilityLabel={w.next} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><Text style={s.monthButton}>›</Text></Pressable></View><View style={s.calendarGrid}>{(weekDays[language] || weekDays.en).map((day, i) => <Text key={`weekday-${i}`} style={s.weekday}>{day}</Text>)}{Array.from({
              length: offset
            }, (_, i) => <View key={`blank-${i}`} style={s.day} />)}{days.map(d => {
              const value = dateString(d);
              const disabled = value > today();
              return <Pressable key={value} accessibilityRole="button" accessibilityState={{
                selected: value === date,
                disabled
              }} disabled={disabled} onPress={() => chooseDate(d)} style={[s.day, value === date && s.daySelected, disabled && s.dayDisabled]}><Text style={[s.dayText, value === date && s.selectedText]}>{d.getDate()}</Text></Pressable>;
            })}</View><Action label={w.close} secondary onPress={() => setDateOpen(false)} styles={s} /></View></View></Modal></SafeAreaView>;
}
function CareHistoryIcon({
  name,
  size = 20,
  color
}) {
  const wrap = {
    width: size,
    height: size,
    position: 'relative'
  };
  const line = {
    position: 'absolute',
    borderColor: color,
    borderWidth: 1.7
  };
  const dot = (left, top, width = size * 0.16, height = size * 0.16) => ({
    position: 'absolute',
    left,
    top,
    width,
    height,
    borderRadius: size,
    backgroundColor: color
  });
  if (name === 'feeding') return <View accessible={false} style={wrap}><View style={[line, {
      left: size * 0.2,
      right: size * 0.2,
      bottom: size * 0.12,
      height: size * 0.38,
      borderTopWidth: 0,
      borderBottomLeftRadius: size * 0.35,
      borderBottomRightRadius: size * 0.35
    }]} /><View style={[line, {
      left: size * 0.12,
      right: size * 0.12,
      top: size * 0.48,
      borderTopWidth: 1.7
    }]} /><View style={dot(size * 0.36, size * 0.2)} /><View style={dot(size * 0.57, size * 0.13)} /><View style={dot(size * 0.7, size * 0.25)} /></View>;
  if (name === 'care') return <View accessible={false} style={wrap}><View style={[line, {
      left: size * 0.31,
      top: size * 0.52,
      width: size * 0.4,
      height: size * 0.31,
      borderRadius: size,
      backgroundColor: color
    }]} /><View style={[line, {
      left: size * 0.12,
      top: size * 0.31,
      width: size * 0.2,
      height: size * 0.2,
      borderRadius: size,
      backgroundColor: color
    }]} /><View style={[line, {
      left: size * 0.35,
      top: size * 0.13,
      width: size * 0.19,
      height: size * 0.2,
      borderRadius: size,
      backgroundColor: color
    }]} /><View style={[line, {
      left: size * 0.62,
      top: size * 0.18,
      width: size * 0.19,
      height: size * 0.2,
      borderRadius: size,
      backgroundColor: color
    }]} /><View style={[line, {
      left: size * 0.78,
      top: size * 0.38,
      width: size * 0.16,
      height: size * 0.18,
      borderRadius: size,
      backgroundColor: color
    }]} /></View>;
  if (name === 'health') return <View accessible={false} style={wrap}><View style={[line, {
      left: size * 0.12,
      top: size * 0.12,
      width: size * 0.76,
      height: size * 0.76,
      borderRadius: size
    }]} /><View style={{
      position: 'absolute',
      left: size * 0.44,
      top: size * 0.25,
      width: size * 0.12,
      height: size * 0.5,
      backgroundColor: color,
      borderRadius: 2
    }} /><View style={{
      position: 'absolute',
      left: size * 0.25,
      top: size * 0.44,
      width: size * 0.5,
      height: size * 0.12,
      backgroundColor: color,
      borderRadius: 2
    }} /></View>;
  return <View accessible={false} style={wrap}><View style={[line, {
      left: size * 0.12,
      top: size * 0.12,
      width: size * 0.76,
      height: size * 0.76,
      borderRadius: size
    }]} /><View style={{
      position: 'absolute',
      left: size * 0.48,
      top: size * 0.28,
      width: 1.7,
      height: size * 0.25,
      backgroundColor: color
    }} /><View style={{
      position: 'absolute',
      left: size * 0.48,
      top: size * 0.48,
      width: size * 0.22,
      height: 1.7,
      backgroundColor: color
    }} /></View>;
}
function Field({
  label,
  value,
  onChangeText,
  styles,
  keyboardType,
  multiline
}) {
  return <><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} keyboardType={keyboardType} multiline={multiline} maxLength={multiline ? 500 : 100} textAlignVertical={multiline ? 'top' : 'center'} style={[styles.input, multiline && styles.multiline]} placeholderTextColor="#777" /></>;
}
function Action({
  label,
  onPress,
  styles,
  disabled,
  secondary
}) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.action, secondary && styles.actionSecondary, disabled && styles.disabled]}><Text style={[styles.actionText, secondary && styles.actionSecondaryText]}>{label}</Text></Pressable>;
}
function Chip({
  label,
  onPress,
  styles,
  active,
  danger
}) {
  return <Pressable accessibilityRole="button" accessibilityState={active ? {
    selected: true
  } : undefined} onPress={onPress} style={[styles.chip, active && styles.selected, danger && styles.dangerChip]}><Text style={[styles.chipText, active && styles.selectedText, danger && styles.dangerText]}>{label}</Text></Pressable>;
}
function stylesFor(c) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: c.background
    },
    content: {
      padding: 14,
      paddingBottom: 36,
      gap: 12
    },
    header: {
      alignItems: 'center',
      paddingVertical: 10
    },
    kicker: {
      color: c.goldSoft,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 2
    },
    title: {
      color: c.text,
      fontSize: 24,
      fontWeight: '900',
      textAlign: 'center',
      marginTop: 7
    },
    subtitle: {
      color: c.textSoft,
      fontSize: 13,
      textAlign: 'center',
      marginTop: 4
    },
    card: {
      backgroundColor: c.surface,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: 14,
      gap: 10
    },
    label: {
      color: c.goldSoft,
      fontSize: 12,
      fontWeight: '800',
      marginTop: 3
    },
    sectionTitle: {
      color: c.gold,
      fontSize: 16,
      fontWeight: '900'
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 7
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7
    },
    chip: {
      minHeight: 44,
      paddingHorizontal: 12,
      paddingVertical: 9,
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background
    },
    chipText: {
      color: c.textSoft,
      fontSize: 12,
      fontWeight: '700'
    },
    selected: {
      borderColor: c.gold,
      backgroundColor: c.activeSurface
    },
    selectedText: {
      color: c.gold,
      fontWeight: '800'
    },
    addChip: {
      minHeight: 40,
      paddingHorizontal: 12,
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.gold
    },
    tabs: {
      flexDirection: 'row',
      gap: 5
    },
    tab: {
      flex: 1,
      minHeight: 58,
      paddingHorizontal: 4,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3
    },
    tabActive: {
      borderColor: c.gold,
      backgroundColor: c.activeSurface
    },
    tabMark: {
      fontSize: 16,
      fontWeight: '900',
      color: c.textMuted
    },
    tabText: {
      fontSize: 9,
      fontWeight: '800',
      color: c.textSoft,
      textAlign: 'center'
    },
    input: {
      minHeight: 46,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background,
      color: c.text,
      fontSize: 15
    },
    inputButton: {
      minHeight: 46,
      paddingHorizontal: 12,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    inputText: {
      color: c.text,
      fontSize: 15
    },
    inputHint: {
      color: c.gold,
      fontSize: 20
    },
    multiline: {
      minHeight: 78
    },
    action: {
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: c.gold,
      paddingHorizontal: 14,
      marginTop: 4
    },
    actionText: {
      color: '#111113',
      fontWeight: '900',
      fontSize: 13
    },
    actionSecondary: {
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.border
    },
    actionSecondaryText: {
      color: c.textSoft
    },
    disabled: {
      opacity: .5
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8
    },
    timeCol: {
      flex: 1,
      minWidth: 0,
      gap: 5
    },
    timeButton: {
      minHeight: 44,
      paddingHorizontal: 12,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    timeMenu: {
      maxHeight: 216,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface
    },
    timeOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      gap: 4,
      padding: 6
    },
    timeOption: {
      width: '30%',
      minWidth: 42,
      minHeight: 44,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border
    },
    smallLabel: {
      fontSize: 9,
      color: c.textMuted
    },
    colon: {
      color: c.gold,
      fontWeight: '900'
    },
    entry: {
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 12,
      gap: 8
    },
    entryTop: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center'
    },
    badge: {
      width: 32,
      height: 32,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.gold,
      alignItems: 'center',
      justifyContent: 'center'
    },
    flex: {
      flex: 1
    },
    entryTitle: {
      color: c.text,
      fontWeight: '800',
      fontSize: 14
    },
    meta: {
      color: c.textMuted,
      fontSize: 11,
      marginTop: 3
    },
    body: {
      color: c.textSoft,
      fontSize: 13,
      lineHeight: 19
    },
    noteText: {
      color: c.textMuted,
      fontSize: 12,
      lineHeight: 18
    },
    confirm: {
      backgroundColor: c.background,
      borderRadius: 12,
      padding: 10,
      gap: 8
    },
    dangerChip: {
      borderColor: '#a54b43'
    },
    dangerText: {
      color: '#e58b83'
    },
    privacy: {
      color: c.textMuted,
      fontSize: 10,
      textAlign: 'center',
      paddingHorizontal: 8
    },
    error: {
      color: '#e58b83',
      fontSize: 13,
      textAlign: 'center'
    },
    message: {
      color: c.gold,
      fontSize: 12,
      textAlign: 'center'
    },
    modalShade: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,.76)',
      justifyContent: 'center',
      padding: 18
    },
    calendar: {
      backgroundColor: c.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      gap: 12
    },
    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    monthTitle: {
      color: c.text,
      fontSize: 16,
      fontWeight: '800',
      textTransform: 'capitalize'
    },
    monthButton: {
      color: c.gold,
      fontSize: 30,
      paddingHorizontal: 10
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start'
    },
    weekday: {
      width: '14.285%',
      height: 26,
      textAlign: 'center',
      textAlignVertical: 'center',
      color: c.textMuted,
      fontSize: 11,
      fontWeight: '700'
    },
    day: {
      width: '14.285%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12
    },
    daySelected: {
      backgroundColor: c.activeSurface,
      borderWidth: 1,
      borderColor: c.gold
    },
    dayDisabled: {
      opacity: .25
    },
    dayText: {
      color: c.text,
      fontSize: 14
    },
    dayDisabledText: {
      color: c.textMuted
    }
  });
}
