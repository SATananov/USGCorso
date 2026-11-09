import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { getMyDogs } from '../dogs/dogService';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import USGBackToTop from '../components/USGBackToTop';
import { requestCareNotificationPermission } from '../care/corsoCareNotifications';
import { reconcileCareReminders } from '../care/corsoCareReminderSync';

const typeKeys = ['vaccine', 'deworming', 'vet', 'training', 'other'];
const translations = {
  bg: {
    title: 'КАЛЕНДАР ЗА ГРИЖИ', subtitle: 'Лични планирани грижи за всяко Кане Корсо.', dog: 'ИЗБЕРИ КАНЕ КОРСО', dogEmpty: 'Нямаш добавено Кане Корсо. Отвори списъка и избери „+ ДОБАВИ КОРСО“.', addDog: '+ ДОБАВИ КОРСО',
    month: 'МЕСЕЦ', year: 'ГОДИНА', selected: 'ИЗБРАН ДЕН', add: 'ДОБАВИ ГРИЖА', close: 'ЗАТВОРИ ФОРМУЛЯРА',
    kind: 'ВИД ГРИЖА', hour: 'ЧАС', minute: 'МИНУТИ', note: 'БЕЛЕЖКА', noteHint: 'Незадължителна бележка', save: 'ЗАПАЗИ', update: 'ЗАПАЗИ ПРОМЕНИТЕ', cancel: 'ОТКАЗ', edit: 'РЕДАКТИРАЙ', remove: 'ИЗТРИЙ', confirmDelete: 'ПОТВЪРДИ ИЗТРИВАНЕ',
    empty: 'Няма записи за този ден.', noDog: 'Избери куче, за да добавяш записи.', today: 'ДНЕС', prior: 'Предишен месец', next: 'Следващ месец',
    invalid: 'Избери бъдеща дата и час. Бележката трябва да е до 200 знака.', saved: 'Записът е запазен на телефона.', removed: 'Записът е изтрит.', failed: 'Грешка при локалното записване.', loading: 'ЗАРЕЖДАНЕ...',
    storage: 'Записите и напомнянията са лични за това устройство.', reminder: 'НАПОМНИ МИ', reminderOptions: ['БЕЗ НАПОМНЯНЕ', 'В ЧАСА НА СЪБИТИЕТО', '2 ЧАСА ПРЕДИ', '1 ДЕН ПРЕДИ'], reminderDenied: 'Записът е запазен, но Android известията са изключени. Разреши ги от настройките на телефона.', reminderFailed: 'Записът е запазен, но напомнянето не можа да се планира.', reminderPast: 'Избраното време за напомняне вече е минало. Избери по-късен час или друга опция.',
    types: ['ВАКСИНА', 'ОБЕЗПАРАЗИТЯВАНЕ', 'ВЕТЕРИНАР', 'ТРЕНИРОВКА', 'ДРУГО'],
    weekdays: ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'НД'],
    months: ['Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни', 'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'],
  },
  en: {
    title: 'CARE CALENDAR', subtitle: 'Private scheduled care for each Cane Corso.', dog: 'CHOOSE CANE CORSO', dogEmpty: 'No Cane Corso added yet. Open the list and choose “+ ADD CORSO”.', addDog: '+ ADD CORSO',
    month: 'MONTH', year: 'YEAR', selected: 'SELECTED DAY', add: 'ADD CARE', close: 'CLOSE FORM', kind: 'CARE TYPE', hour: 'HOUR', minute: 'MINUTES', note: 'NOTE', noteHint: 'Optional note', save: 'SAVE', update: 'SAVE CHANGES', cancel: 'CANCEL', edit: 'EDIT', remove: 'DELETE', confirmDelete: 'CONFIRM DELETE',
    empty: 'No entries on this day.', noDog: 'Choose a dog to add entries.', today: 'TODAY', prior: 'Previous month', next: 'Next month',
    invalid: 'Choose a future date and time. Notes must be 200 characters or fewer.', saved: 'Saved on this phone.', removed: 'Entry deleted.', failed: 'Local storage failed.', loading: 'LOADING...',
    storage: 'Entries and reminders are private to this device.', reminder: 'REMIND ME', reminderOptions: ['NO REMINDER', 'AT EVENT TIME', '2 HOURS BEFORE', '1 DAY BEFORE'], reminderDenied: 'Saved, but Android notifications are disabled. Enable them in phone settings.', reminderFailed: 'Saved, but the reminder could not be scheduled.', reminderPast: 'That reminder time has already passed. Choose a later time or another option.',
    types: ['VACCINE', 'DEWORMING', 'VET VISIT', 'TRAINING', 'OTHER'],
    weekdays: ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
  it: {
    title: 'CALENDARIO DELLE CURE', subtitle: 'Cure programmate private per ogni Cane Corso.', dog: 'SELEZIONA CANE CORSO', dogEmpty: 'Non hai ancora aggiunto un Cane Corso. Apri l’elenco e scegli “+ AGGIUNGI CORSO”.', addDog: '+ AGGIUNGI CORSO',
    month: 'MESE', year: 'ANNO', selected: 'GIORNO SELEZIONATO', add: 'AGGIUNGI CURA', close: 'CHIUDI MODULO', kind: 'TIPO DI CURA', hour: 'ORA', minute: 'MINUTI', note: 'NOTA', noteHint: 'Nota facoltativa', save: 'SALVA', update: 'SALVA MODIFICHE', cancel: 'ANNULLA', edit: 'MODIFICA', remove: 'ELIMINA', confirmDelete: 'CONFERMA ELIMINAZIONE',
    empty: 'Nessuna voce per questo giorno.', noDog: 'Seleziona un cane per aggiungere voci.', today: 'OGGI', prior: 'Mese precedente', next: 'Mese successivo',
    invalid: 'Seleziona una data e un orario futuri. Le note non devono superare 200 caratteri.', saved: 'Salvato su questo telefono.', removed: 'Voce eliminata.', failed: 'Salvataggio locale non riuscito.', loading: 'CARICAMENTO...',
    storage: 'Voci e promemoria restano privati su questo dispositivo.', reminder: 'RICORDAMI', reminderOptions: ['NESSUN PROMEMORIA', 'ALL’ORA DELL’EVENTO', '2 ORE PRIMA', '1 GIORNO PRIMA'], reminderDenied: 'Voce salvata, ma le notifiche Android sono disattivate. Abilitale nelle impostazioni del telefono.', reminderFailed: 'Voce salvata, ma il promemoria non è stato programmato.', reminderPast: 'L’orario del promemoria è già passato. Scegli un orario successivo o un’altra opzione.',
    types: ['VACCINO', 'VERMIFUGO', 'VETERINARIO', 'ADDESTRAMENTO', 'ALTRO'],
    weekdays: ['LU', 'MA', 'ME', 'GI', 'VE', 'SA', 'DO'],
    months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  },
};

const pad = value => String(value).padStart(2, '0');
const formatDay = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;
const parseDay = value => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const test = new Date(year, month, day);
  return test.getFullYear() === year && test.getMonth() === month && test.getDate() === day ? { year, month, day } : null;
};
const todayString = () => {
  const date = new Date();
  return formatDay(date.getFullYear(), date.getMonth(), date.getDate());
};
const storeKey = userId => `usg:corso-care:01:${userId}`;
const reminderKeys = ['none', 'at_time', '2h', '1d'];
const emptyForm = () => ({ id: null, kind: 'vaccine', hour: '09', minute: '00', note: '', reminder: 'none' });
const reminderTimestamp = (day, hour, minute, reminder) => {
  const parsed = parseDay(day);
  if (!parsed) return NaN;
  const timestamp = new Date(parsed.year, parsed.month, parsed.day, Number(hour), Number(minute)).getTime();
  return timestamp - (reminder === '2h' ? 7200000 : reminder === '1d' ? 86400000 : 0);
};
const validSchedule = (day, hour, minute) => {
  const parsed = parseDay(day);
  if (!parsed || !/^(0\d|1\d|2[0-3])$/.test(hour) || !/^[0-5]\d$/.test(minute)) return false;
  return new Date(parsed.year, parsed.month, parsed.day, Number(hour), Number(minute)).getTime() > Date.now();
};

function Dropdown({ label, value, options, expanded, onToggle, onSelect, styles, disabled = false, addLabel, onAdd }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded, disabled }} disabled={disabled} onPress={onToggle} style={styles.dropdown}>
        <Text style={styles.dropdownText} numberOfLines={1}>{value}</Text>
        <Text style={styles.arrow}>{expanded ? '▴' : '▾'}</Text>
      </Pressable>
      {expanded ? (
        <ScrollView nestedScrollEnabled style={styles.options} keyboardShouldPersistTaps="always">
          {options.map(option => (
            <Pressable key={String(option.key)} onPress={() => onSelect(option.key)} style={styles.option}>
              <Text style={styles.optionText}>{option.label}</Text>
            </Pressable>
          ))}
          {onAdd ? <Pressable accessibilityRole="button" onPress={onAdd} style={styles.option}><Text style={styles.addDogOption}>{addLabel}</Text></Pressable> : null}
        </ScrollView>
      ) : null}
    </View>
  );
}

export default function CorsoCareRemindersScreen({ navigation, route }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const scrollRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const w = translations[language] || translations.en;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [dogs, setDogs] = useState([]);
  const pendingQuickAddIds = useRef(null);
  const [dogId, setDogId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedDay, setSelectedDay] = useState(todayString);
  const initial = useMemo(() => parseDay(todayString()), []);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [expanded, setExpanded] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const parsed = parseDay(route?.params?.careDate);
    if (!parsed) return;
    setViewYear(parsed.year);
    setViewMonth(parsed.month);
    setSelectedDay(route.params.careDate);
    if (route.params.careDogId) setDogId(route.params.careDogId);
    setFormOpen(false);
    setExpanded(null);
    navigation.setParams({ careDate: undefined, careDogId: undefined });
  }, [navigation, route?.params?.careDate, route?.params?.careDogId]);

  useFocusEffect(useCallback(() => {
    let active = true;
    if (!user?.id) { setDogs([]); setDogId(null); setItems([]); return () => { active = false; }; }
    getMyDogs(user.id).then(({ data }) => {
      if (!active) return;
      const list = data || [];
      setDogs(list);
      reconcileCareReminders({ userId: user.id, dogs: list, language }).catch(() => {});
      const previousIds = pendingQuickAddIds.current;
      const added = previousIds ? list.find(d => !previousIds.has(d.id)) : null;
      pendingQuickAddIds.current = null;
      setDogId(prev => added?.id || (list.some(d => d.id === prev) ? prev : (list[0]?.id || null)));
    }).catch(() => { if (active) setDogs([]); });
    return () => { active = false; };
  }, [user?.id, language]));

  useFocusEffect(useCallback(() => {
    let active = true;
    setExpanded(null);
    setMessage('');
    if (!user?.id || !dogId) { setItems([]); return () => { active = false; }; }
    setLoading(true);
    AsyncStorage.getItem(storeKey(user.id)).then(raw => {
      if (!active) return;
      let all = [];
      try { all = raw ? JSON.parse(raw) : []; } catch { setMessage(w.failed); }
      setItems(Array.isArray(all) ? all.filter(x => x.dogId === dogId) : []);
    }).catch(() => { if (active) setMessage(w.failed); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id, dogId, w.failed]));

  const days = useMemo(() => {
    const offset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    const length = new Date(viewYear, viewMonth + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length }, (_, i) => i + 1)];
  }, [viewYear, viewMonth]);
  const dayCounts = useMemo(() => items.reduce((acc, item) => {
    if (typeof item.date === 'string') acc[item.date] = (acc[item.date] || 0) + 1;
    return acc;
  }, {}), [items]);
  const selectedItems = useMemo(() => items.filter(item => item.date === selectedDay).sort((a, b) => (a.time || '').localeCompare(b.time || '')), [items, selectedDay]);
  const yearOptions = useMemo(() => Array.from({ length: 31 }, (_, i) => ({ key: 2020 + i, label: String(2020 + i) })), []);
  const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, i) => ({ key: pad(i), label: pad(i) })), []);
  const minuteOptions = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ key: pad(i), label: pad(i) })), []);

  function toggle(name) { Keyboard.dismiss(); setExpanded(value => value === name ? null : name); }
  function chooseDay(day) {
    setSelectedDay(formatDay(viewYear, viewMonth, day));
    setFormOpen(false);
    setForm(emptyForm());
    setExpanded(null);
    setDeleteId(null);
    setMessage('');
  }
  function changeMonth(delta) {
    const date = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
    chooseDateInMonth(date.getFullYear(), date.getMonth());
  }
  function chooseDateInMonth(year, month) {
    setSelectedDay(formatDay(year, month, 1));
    setForm(emptyForm());
    setFormOpen(false);
    setExpanded(null);
    setDeleteId(null);
    setMessage('');
  }
  function selectMonth(month) { setViewMonth(month); chooseDateInMonth(viewYear, month); }
  function selectYear(year) { setViewYear(year); chooseDateInMonth(year, viewMonth); }
  function quickAddDog() {
    pendingQuickAddIds.current = new Set(dogs.map(dog => dog.id));
    setExpanded(null);
    Keyboard.dismiss();
    navigation.navigate('MyCorsoQuickAdd', { openAddDog: true, quickAddForCare: true });
  }
  function selectDog(id) {
    setDogId(id);
    setForm(emptyForm());
    setFormOpen(false);
    setDeleteId(null);
    setExpanded(null);
    setMessage('');
  }
  async function persist(next, successText) {
    if (!user?.id || !dogId || busy) return;
    setBusy(true);
    try {
      const raw = await AsyncStorage.getItem(storeKey(user.id));
      const all = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(all)) throw new Error('Invalid records');
      const updated = [...all.filter(item => item.dogId !== dogId), ...next];
      await AsyncStorage.setItem(storeKey(user.id), JSON.stringify(updated));
      setItems(next);
      setForm(emptyForm());
      setFormOpen(false);
      setDeleteId(null);
      setExpanded(null);
      Keyboard.dismiss();
      setMessage(successText);
      try {
        const outcome = await reconcileCareReminders({ userId: user.id, dogs, language, records: updated });
        if (outcome.failed) setMessage(w.reminderFailed);
      } catch {
        setMessage(w.reminderFailed);
      }
    } catch {
      setMessage(w.failed);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!dogId || busy) return;
    const note = form.note.trim();
    if (!validSchedule(selectedDay, form.hour, form.minute) || note.length > 200) { setMessage(w.invalid); return; }
    if (form.reminder !== 'none' && reminderTimestamp(selectedDay, form.hour, form.minute, form.reminder) <= Date.now()) {
      setMessage(w.reminderPast);
      return;
    }
    let permissionDenied = false;
    if (form.reminder !== 'none') {
      try { permissionDenied = !(await requestCareNotificationPermission()); }
      catch { permissionDenied = true; }
    }
    const time = `${form.hour}:${form.minute}`;
    const item = { id: form.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`, dogId, kind: form.kind, date: selectedDay, time, note, reminder: form.reminder };
    await persist([...items.filter(x => x.id !== item.id), item], permissionDenied ? w.reminderDenied : w.saved);
  }
  function edit(item) {
    setSelectedDay(item.date);
    setDeleteId(null);
    const parsed = parseDay(item.date);
    if (parsed) { setViewYear(parsed.year); setViewMonth(parsed.month); }
    setForm({ id: item.id, kind: typeKeys.includes(item.kind) ? item.kind : 'other', hour: (item.time || '09:00').slice(0, 2), minute: (item.time || '09:00').slice(3, 5), note: item.note || '', reminder: reminderKeys.includes(item.reminder) ? item.reminder : 'none' });
    setFormOpen(true);
    setExpanded(null);
    setMessage('');
  }
  const dogName = dogs.find(d => d.id === dogId)?.name || w.dog;

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <ScrollView ref={scrollRef} onScroll={event => setShowBackToTop(event.nativeEvent.contentOffset.y > 220)} scrollEventThrottle={32} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>USG CORSO</Text>
        <Text style={styles.title}>{w.title}</Text>
        <Text style={styles.subtitle}>{w.subtitle}</Text>
        <Dropdown label={w.dog} value={dogName} options={dogs.map(d => ({ key: d.id, label: d.name }))} expanded={expanded === 'dog'} onToggle={() => toggle('dog')} onSelect={selectDog} styles={styles} addLabel={w.addDog} onAdd={quickAddDog} />
        {!dogs.length ? <Text style={styles.muted}>{w.dogEmpty}</Text> : null}
        <View style={styles.calendar}>
          <View style={styles.calendarHeader}>
            <Pressable accessibilityLabel={w.prior} onPress={() => changeMonth(-1)} style={styles.monthArrow}><Text style={styles.monthArrowText}>‹</Text></Pressable>
            <View style={styles.monthDropdowns}>
              <View style={styles.monthField}><Dropdown label={w.month} value={w.months[viewMonth]} options={w.months.map((label, key) => ({ key, label }))} expanded={expanded === 'month'} onToggle={() => toggle('month')} onSelect={selectMonth} styles={styles} /></View>
              <View style={styles.yearField}><Dropdown label={w.year} value={String(viewYear)} options={yearOptions} expanded={expanded === 'year'} onToggle={() => toggle('year')} onSelect={selectYear} styles={styles} /></View>
            </View>
            <Pressable accessibilityLabel={w.next} onPress={() => changeMonth(1)} style={styles.monthArrow}><Text style={styles.monthArrowText}>›</Text></Pressable>
          </View>
          <View style={styles.weekRow}>{w.weekdays.map(weekday => <View key={weekday} style={styles.dayCell}><Text style={styles.weekText}>{weekday}</Text></View>)}</View>
          <View style={styles.days}>{days.map((day, index) => {
            const date = day ? formatDay(viewYear, viewMonth, day) : '';
            const isSelected = date === selectedDay;
            const isToday = date === todayString();
            const count = dayCounts[date] || 0;
            return <View key={`day-${index}`} style={styles.dayCell}>
              {day ? <Pressable accessibilityRole="button" accessibilityLabel={`${date} ${count}`} onPress={() => chooseDay(day)} style={[styles.dayButton, count > 0 && styles.dayHasEvents, isSelected && styles.daySelected, isToday && !isSelected && styles.dayToday]}>
                <Text style={[styles.dayText, isSelected && styles.daySelectedText]}>{day}</Text>
                {count === 1 ? <View style={[styles.dot, isSelected && styles.dotSelected]} /> : null}
                {count > 1 ? <View style={[styles.countBadge, isSelected && styles.countBadgeSelected]}><Text style={[styles.countBadgeText, isSelected && styles.countBadgeTextSelected]}>{count > 9 ? '9+' : count}</Text></View> : null}
              </Pressable> : null}
            </View>;
          })}</View>
          <Pressable onPress={() => {
            const parsed = parseDay(todayString());
            setViewYear(parsed.year); setViewMonth(parsed.month); setSelectedDay(todayString()); setForm(emptyForm()); setFormOpen(false); setExpanded(null);
          }} style={styles.today}><Text style={styles.todayText}>{w.today}</Text></Pressable>
        </View>
        <View style={styles.dateHeader}>
          <Text style={styles.dateTitle}>{w.selected}: {selectedDay.split('-').reverse().join('.')}</Text>
          {dogId ? <Pressable style={styles.addButton} onPress={() => { setForm(emptyForm()); setFormOpen(old => !old); setExpanded(null); setMessage(''); }}><Text style={styles.addText}>{formOpen ? w.close : `+ ${w.add}`}</Text></Pressable> : null}
        </View>
        {formOpen && dogId ? <View style={styles.form}>
          <Dropdown label={w.kind} value={w.types[Math.max(typeKeys.indexOf(form.kind), 0)]} options={typeKeys.map((key, index) => ({ key, label: w.types[index] }))} expanded={expanded === 'kind'} onToggle={() => toggle('kind')} onSelect={kind => { setForm(old => ({ ...old, kind })); setExpanded(null); }} styles={styles} />
          <View style={styles.timeRow}>
            <View style={styles.timeColumn}><Dropdown label={w.hour} value={form.hour} options={hourOptions} expanded={expanded === 'hour'} onToggle={() => toggle('hour')} onSelect={hour => { setForm(old => ({ ...old, hour })); setExpanded(null); }} styles={styles} /></View>
            <View style={styles.timeColumn}><Dropdown label={w.minute} value={form.minute} options={minuteOptions} expanded={expanded === 'minute'} onToggle={() => toggle('minute')} onSelect={minute => { setForm(old => ({ ...old, minute })); setExpanded(null); }} styles={styles} /></View>
          </View>
          <Dropdown label={w.reminder} value={w.reminderOptions[reminderKeys.indexOf(form.reminder)] || w.reminderOptions[0]} options={reminderKeys.map((key, index) => ({ key, label: w.reminderOptions[index] }))} expanded={expanded === 'reminder'} onToggle={() => toggle('reminder')} onSelect={reminder => { setForm(old => ({ ...old, reminder })); setExpanded(null); setMessage(''); }} styles={styles} />
          <Text style={styles.fieldLabel}>{w.note}</Text>
          <TextInput style={styles.input} placeholder={w.noteHint} placeholderTextColor={colors.textMuted} value={form.note} onChangeText={note => setForm(old => ({ ...old, note }))} maxLength={200} multiline />
          <Pressable disabled={busy} onPress={save} style={styles.saveButton}><Text style={styles.saveText}>{form.id ? w.update : w.save}</Text></Pressable>
          {form.id ? <Pressable onPress={() => { setForm(emptyForm()); setFormOpen(false); setExpanded(null); }}><Text style={styles.link}>{w.cancel}</Text></Pressable> : null}
        </View> : null}
        {loading ? <Text style={styles.muted}>{w.loading}</Text> : !dogId ? <Text style={styles.muted}>{w.noDog}</Text> : selectedItems.length ? selectedItems.map(item => <View key={item.id} style={styles.entry}>
          <Text style={styles.entryTitle}>{item.time} · {w.types[Math.max(0, typeKeys.indexOf(item.kind))]}</Text>
          {item.note ? <Text style={styles.entryNote}>{item.note}</Text> : null}
          <View style={styles.entryActions}>
            <Pressable accessibilityRole="button" onPress={() => edit(item)} style={[styles.entryActionButton, styles.entryActionPrimary]}>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={styles.entryActionPrimaryText}>{w.edit}</Text>
            </Pressable>
            {deleteId !== item.id ? <Pressable accessibilityRole="button" disabled={busy} onPress={() => setDeleteId(item.id)} style={styles.entryActionButton}>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={styles.entryActionText}>{w.remove}</Text>
            </Pressable> : null}
          </View>
          {deleteId === item.id ? <View style={styles.entryConfirmActions}>
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => persist(items.filter(x => x.id !== item.id), w.removed)} style={[styles.entryActionButton, styles.entryConfirmButton]}>
              <Text style={styles.entryActionText}>{w.confirmDelete}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => setDeleteId(null)} style={styles.entryCancelButton}>
              <Text style={styles.entryCancelText}>{w.cancel}</Text>
            </Pressable>
          </View> : null}
        </View>) : <Text style={styles.muted}>{w.empty}</Text>}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Text style={styles.footer}>{w.storage}</Text>
      </ScrollView>
      <USGBackToTop visible={showBackToTop} language={language} bottomOffset={88} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} />
    </SafeAreaView>
  );
}

function makeStyles(c) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    content: { padding: 18, paddingBottom: 44, gap: 14 },
    kicker: { color: c.goldSoft, textAlign: 'center', letterSpacing: 3, fontWeight: '800', fontSize: 11 },
    title: { color: c.text, textAlign: 'center', fontSize: 23, fontWeight: '800' },
    subtitle: { color: c.textSoft, textAlign: 'center', fontSize: 13, lineHeight: 20 },
    field: { flex: 1, minWidth: 0, gap: 5 },
    fieldLabel: { color: c.gold, fontSize: 12, fontWeight: '800' },
    dropdown: { minHeight: 42, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: c.border, borderRadius: 12, backgroundColor: c.surface, paddingHorizontal: 12, gap: 5 },
    dropdownText: { color: c.text, fontSize: 13, fontWeight: '700', flexShrink: 1 },
    arrow: { color: c.gold, fontSize: 19, fontWeight: '800' },
    options: { maxHeight: 172, borderWidth: 1, borderColor: c.border, borderRadius: 10, backgroundColor: c.surface, marginTop: 2 },
    option: { padding: 12, borderBottomWidth: 1, borderBottomColor: c.border },
    optionText: { color: c.text, fontSize: 13 },
    addDogOption: { color: c.gold, fontSize: 13, fontWeight: '800' },
    calendar: { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: 18, padding: 10, gap: 9 },
    calendarHeader: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    monthDropdowns: { flex: 1, minWidth: 0, flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
    monthField: { flex: 1.6, minWidth: 0 },
    yearField: { flex: 1, minWidth: 0 },
    monthArrow: { paddingHorizontal: 2, paddingVertical: 14 },
    monthArrowText: { color: c.gold, fontSize: 27 },
    weekRow: { flexDirection: 'row' },
    weekText: { color: c.goldSoft, fontWeight: '800', fontSize: 11, textAlign: 'center' },
    days: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 3 },
    dayCell: { width: '14.285714%', alignItems: 'center', justifyContent: 'center' },
    dayButton: { width: 39, height: 43, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 3 },
    dayHasEvents: { borderWidth: 2, borderColor: c.gold },
    daySelected: { backgroundColor: c.gold },
    dayToday: { borderWidth: 1, borderColor: c.gold },
    dayText: { color: c.text, fontWeight: '700', fontSize: 13 },
    daySelectedText: { color: c.background },
    dot: { width: 8, height: 8, backgroundColor: c.gold, borderRadius: 4, marginTop: 2 },
    dotSelected: { backgroundColor: c.background },
    countBadge: { position: 'absolute', right: 2, bottom: 2, minWidth: 15, height: 15, paddingHorizontal: 2, borderRadius: 8, backgroundColor: c.gold, justifyContent: 'center', alignItems: 'center' },
    countBadgeSelected: { backgroundColor: c.background },
    countBadgeText: { color: c.background, fontSize: 9, fontWeight: '900', textAlign: 'center' },
    countBadgeTextSelected: { color: c.gold, fontSize: 9 },
    today: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 5 },
    todayText: { color: c.gold, fontWeight: '800', fontSize: 12 },
    dateHeader: { gap: 10 },
    dateTitle: { color: c.text, fontWeight: '700', fontSize: 14 },
    addButton: { alignSelf: 'flex-start', borderRadius: 11, backgroundColor: c.gold, paddingHorizontal: 15, paddingVertical: 11 },
    addText: { color: c.background, fontWeight: '900', fontSize: 12 },
    form: { borderWidth: 1, borderColor: c.border, borderRadius: 16, backgroundColor: c.surface, padding: 14, gap: 12 },
    timeRow: { flexDirection: 'row', gap: 10 },
    timeColumn: { flex: 1 },
    input: { minHeight: 46, borderWidth: 1, borderColor: c.border, borderRadius: 10, color: c.text, paddingHorizontal: 12, paddingVertical: 9, textAlignVertical: 'top' },
    saveButton: { backgroundColor: c.gold, padding: 13, borderRadius: 11, alignItems: 'center' },
    saveText: { color: c.background, fontWeight: '900' },
    link: { color: c.gold, fontWeight: '800', fontSize: 12 },
    entry: { borderWidth: 1, borderColor: c.border, borderRadius: 13, padding: 13, gap: 12 },
    entryTitle: { color: c.gold, fontWeight: '800' },
    entryNote: { color: c.textSoft },
    entryActions: { flexDirection: 'column', gap: 8 },
    entryActionButton: { flex: 1, minWidth: 0, minHeight: 42, borderWidth: 1, borderColor: c.gold, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 10 },
    entryActionPrimary: { backgroundColor: c.gold },
    entryActionPrimaryText: { color: c.background, fontSize: 12, fontWeight: '900', textAlign: 'center' },
    entryActionText: { color: c.gold, fontSize: 12, fontWeight: '900', textAlign: 'center', flexShrink: 1 },
    entryConfirmActions: { gap: 8, alignItems: 'stretch' },
    entryConfirmButton: { flex: 0, width: '100%', minHeight: 46 },
    entryCancelButton: { minHeight: 40, justifyContent: 'center', alignItems: 'center', paddingVertical: 9 },
    entryCancelText: { color: c.textSoft, fontSize: 12, fontWeight: '800', textAlign: 'center' },
    muted: { color: c.textSoft, textAlign: 'center', fontSize: 13, lineHeight: 20 },
    message: { color: c.gold, textAlign: 'center', fontWeight: '700' },
    footer: { color: c.textMuted, fontSize: 11, textAlign: 'center', marginTop: 14 },
  });
}
