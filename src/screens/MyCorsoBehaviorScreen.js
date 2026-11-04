import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import USGBackToTop from '../components/USGBackToTop';
import { getMyDogs } from '../dogs/dogService';
import { deleteDogBehaviorEntry, getDogBehaviorEntries, saveDogBehaviorEntry } from '../dogs/dogBehaviorService';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

const copy = {
  bg: {
    title: 'ПОВЕДЕНИЕ', intro: 'Личен дневник на наблюденията. Описвай ситуацията, без да поставяш оценки или диагнози.', dog: 'ИЗБЕРИ КУЧЕ', emptyDogs: 'Първо добави Cane Corso в „Моето Корсо“.', date: 'Дата (ГГГГ-ММ-ДД)', category: 'ТИП НАБЛЮДЕНИЕ', context: 'Ситуация / място (незадължително)', note: 'Какво се случи?', save: 'ЗАПАЗИ НАБЛЮДЕНИЕ', saveEdit: 'ЗАПАЗИ ПРОМЕНИТЕ', cancel: 'ОТКАЗ', entries: 'НАБЛЮДЕНИЯ', empty: 'Няма записани наблюдения.', edit: 'РЕДАКТИРАЙ', del: 'ИЗТРИЙ', question: 'Да изтрия ли този запис?', confirm: 'ПОТВЪРДИ', badDate: 'Въведи валидна дата, не по-късна от днес.', badNote: 'Напиши наблюдение от 1 до 600 знака.', badContext: 'Ситуацията може да е до 120 знака.', error: 'Действието не успя. Провери дали SQL миграцията е приложена.', saved: 'Наблюдението е запазено.', deleted: 'Наблюдението е изтрито.', private: 'Този дневник е личен и видим само за собственика.', calm: 'СПОКОЙНО', social: 'КОНТАКТИ', training: 'ОБУЧЕНИЕ', stress: 'НАПРЕЖЕНИЕ', other: 'ДРУГО',
  },
  en: {
    title: 'BEHAVIOR', intro: 'A private observation log. Describe situations without labels or diagnoses.', dog: 'CHOOSE A DOG', emptyDogs: 'Add a Cane Corso in My Corso first.', date: 'Date (YYYY-MM-DD)', category: 'OBSERVATION TYPE', context: 'Situation / place (optional)', note: 'What happened?', save: 'SAVE OBSERVATION', saveEdit: 'SAVE CHANGES', cancel: 'CANCEL', entries: 'OBSERVATIONS', empty: 'No observations recorded.', edit: 'EDIT', del: 'DELETE', question: 'Delete this observation?', confirm: 'CONFIRM', badDate: 'Enter a valid date, not later than today.', badNote: 'Enter an observation between 1 and 600 characters.', badContext: 'Situation can be up to 120 characters.', error: 'Action failed. Check that the SQL migration was applied.', saved: 'Observation saved.', deleted: 'Observation deleted.', private: 'This log is private and visible only to the owner.', calm: 'CALM', social: 'SOCIAL', training: 'TRAINING', stress: 'STRESS', other: 'OTHER',
  },
  it: {
    title: 'COMPORTAMENTO', intro: 'Diario privato delle osservazioni. Descrivi le situazioni senza etichette o diagnosi.', dog: 'SELEZIONA UN CANE', emptyDogs: 'Aggiungi prima un Cane Corso in My Corso.', date: 'Data (AAAA-MM-GG)', category: 'TIPO DI OSSERVAZIONE', context: 'Situazione / luogo (facoltativo)', note: 'Che cosa è successo?', save: 'SALVA OSSERVAZIONE', saveEdit: 'SALVA MODIFICHE', cancel: 'ANNULLA', entries: 'OSSERVAZIONI', empty: 'Nessuna osservazione registrata.', edit: 'MODIFICA', del: 'ELIMINA', question: 'Eliminare questa osservazione?', confirm: 'CONFERMA', badDate: 'Inserisci una data valida, non successiva a oggi.', badNote: 'Inserisci un’osservazione da 1 a 600 caratteri.', badContext: 'La situazione può contenere fino a 120 caratteri.', error: 'Operazione non riuscita. Verifica la migrazione SQL.', saved: 'Osservazione salvata.', deleted: 'Osservazione eliminata.', private: 'Questo diario è privato e visibile solo al proprietario.', calm: 'CALMO', social: 'SOCIALE', training: 'ADDESTRAMENTO', stress: 'TENSIONE', other: 'ALTRO',
  },
};

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value > today()) return false;
  const [y, m, d] = value.split('-').map(Number);
  const check = new Date(y, m - 1, d);
  return check.getFullYear() === y && check.getMonth() === m - 1 && check.getDate() === d;
}

export default function MyCorsoBehaviorScreen() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const t = copy[language] ?? copy.en;
  const s = useMemo(() => stylesFor(colors), [colors]);
  const scrollRef = useRef(null);
  const [dogs, setDogs] = useState([]);
  const [dogId, setDogId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(today());
  const [category, setCategory] = useState('calm');
  const [context, setContext] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loadingDogs, setLoadingDogs] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoadingDogs(true);
    getMyDogs(user?.id).then(({ data, error: failure }) => {
      if (!active) return;
      const result = data ?? [];
      setDogs(result);
      setDogId(previous => result.some(dog => dog.id === previous) ? previous : (result[0]?.id ?? null));
      if (failure) setError(t.error);
      setLoadingDogs(false);
    });
    const shown = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hidden = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { active = false; shown.remove(); hidden.remove(); };
  }, [user?.id, t.error]));

  useFocusEffect(useCallback(() => {
    let active = true;
    if (!user?.id || !dogId) { setEntries([]); return () => { active = false; }; }
    setLoadingEntries(true);
    getDogBehaviorEntries(user.id, dogId).then(({ data, error: failure }) => {
      if (!active) return;
      setEntries(data ?? []);
      if (failure) setError(t.error);
      setLoadingEntries(false);
    });
    return () => { active = false; };
  }, [user?.id, dogId, t.error]));

  function resetForm() {
    setEditingId(null);
    setDeleteId(null);
    setDate(today());
    setCategory('calm');
    setContext('');
    setNotes('');
  }

  function chooseDog(id) {
    if (busy) return;
    setDogId(id);
    resetForm();
    setError('');
    setMessage('');
  }

  function editEntry(item) {
    if (busy) return;
    setEditingId(item.id);
    setDeleteId(null);
    setDate(item.entry_date);
    setCategory(item.category);
    setContext(item.context ?? '');
    setNotes(item.notes);
    setError('');
    setMessage('');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  async function refresh(id) {
    const { data, error: failure } = await getDogBehaviorEntries(user.id, id);
    if (failure) { setError(t.error); return false; }
    setEntries(data ?? []);
    return true;
  }

  async function save() {
    if (busy || loadingEntries || !user?.id || !dogId) return;
    setError('');
    setMessage('');
    const day = date.trim();
    const situation = context.trim();
    const note = notes.trim();
    if (!validDate(day)) { setError(t.badDate); return; }
    if (!note || note.length > 600) { setError(t.badNote); return; }
    if (situation.length > 120) { setError(t.badContext); return; }
    setBusy(true);
    const selectedDog = dogId;
    const response = await saveDogBehaviorEntry(user.id, selectedDog, { entryDate: day, category, context: situation, notes: note }, editingId);
    if (response.error || !response.data) setError(t.error);
    else if (await refresh(selectedDog)) { resetForm(); setMessage(t.saved); Keyboard.dismiss(); }
    setBusy(false);
  }

  async function remove(id) {
    if (busy || deleteId !== id || !user?.id || !dogId) return;
    setBusy(true);
    const selectedDog = dogId;
    const response = await deleteDogBehaviorEntry(user.id, selectedDog, id);
    if (response.error || !response.data?.length) setError(t.error);
    else if (await refresh(selectedDog)) { if (editingId === id) resetForm(); setMessage(t.deleted); }
    setDeleteId(null);
    setBusy(false);
  }

  return (
    <SafeAreaView style={s.screen} edges={['bottom']}>
      <ScrollView ref={scrollRef} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" onScroll={event => setScrolled(event.nativeEvent.contentOffset.y > 220)} scrollEventThrottle={32}>
        <View style={s.hero}>
          <Text style={s.kicker}>USG CORSO · MY CORSO</Text>
          <Text style={s.title}>{t.title}</Text>
          <Text style={s.sub}>{t.intro}</Text>
        </View>
        {error ? <Text style={s.error}>{error}</Text> : null}
        {message ? <Text style={s.message}>{message}</Text> : null}
        {loadingDogs ? <ActivityIndicator color={colors.gold} /> : null}
        {!loadingDogs && !dogs.length ? <View style={s.card}><Text style={s.body}>{t.emptyDogs}</Text></View> : null}
        {dogs.length ? <>
          <View style={s.card}>
            <Text style={s.heading}>{t.dog}</Text>
            <View style={s.row}>{dogs.map(dog => <Pressable key={dog.id} accessibilityRole="button" accessibilityState={{ selected: dogId === dog.id }} disabled={busy} style={[s.option, dogId === dog.id && s.active]} onPress={() => chooseDog(dog.id)}><Text style={[s.body, dogId === dog.id && s.gold]}>{dog.name}</Text></Pressable>)}</View>
          </View>
          <View style={s.card}>
            <Text style={s.heading}>{t.category}</Text>
            <View style={s.row}>{['calm', 'social', 'training', 'stress', 'other'].map(key => <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: category === key }} disabled={busy} onPress={() => setCategory(key)} style={[s.option, category === key && s.active]}><Text style={[s.optionText, category === key && s.gold]}>{t[key]}</Text></Pressable>)}</View>
            <Text style={s.field}>{t.date}</Text>
            <TextInput style={s.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} keyboardType="numbers-and-punctuation" />
            <Text style={s.field}>{t.context}</Text>
            <TextInput style={s.input} value={context} onChangeText={setContext} maxLength={120} placeholderTextColor={colors.textMuted} />
            <Text style={s.field}>{t.note}</Text>
            <TextInput style={[s.input, s.multiline]} multiline value={notes} onChangeText={setNotes} maxLength={600} textAlignVertical="top" placeholderTextColor={colors.textMuted} />
            <Pressable accessibilityRole="button" disabled={busy || loadingEntries} style={[s.primary, (busy || loadingEntries) && s.disabled]} onPress={save}><Text style={s.primaryText}>{editingId ? t.saveEdit : t.save}</Text></Pressable>
            {editingId ? <Pressable accessibilityRole="button" disabled={busy} style={s.secondary} onPress={resetForm}><Text style={s.secondaryText}>{t.cancel}</Text></Pressable> : null}
          </View>
          <View style={s.card}>
            <Text style={s.heading}>{t.entries}</Text>
            {loadingEntries ? <ActivityIndicator color={colors.gold} /> : null}
            {!loadingEntries && !entries.length ? <Text style={s.body}>{t.empty}</Text> : null}
            {entries.map(item => <View key={item.id} style={s.entry}>
              <View style={s.rowSpread}><Text style={s.dateText}>{item.entry_date}</Text><Text style={s.categoryText}>{t[item.category] ?? t.other}</Text></View>
              {item.context ? <Text style={s.contextText}>{item.context}</Text> : null}
              <Text style={s.body}>{item.notes}</Text>
              <View style={s.row}>
                <Pressable accessibilityRole="button" style={s.action} disabled={busy} onPress={() => editEntry(item)}><Text style={s.actionText}>{t.edit}</Text></Pressable>
                <Pressable accessibilityRole="button" style={s.action} disabled={busy} onPress={() => setDeleteId(item.id)}><Text style={s.actionText}>{t.del}</Text></Pressable>
              </View>
              {deleteId === item.id ? <View style={s.confirm}><Text style={s.body}>{t.question}</Text><View style={s.row}><Pressable accessibilityRole="button" style={s.action} disabled={busy} onPress={() => setDeleteId(null)}><Text style={s.actionText}>{t.cancel}</Text></Pressable><Pressable accessibilityRole="button" style={s.action} disabled={busy} onPress={() => remove(item.id)}><Text style={s.danger}>{t.confirm}</Text></Pressable></View></View> : null}
            </View>)}
          </View>
        </> : null}
        <Text style={s.footer}>{t.private}</Text>
      </ScrollView>
      <USGBackToTop visible={scrolled && !keyboardVisible} language={language} bottomOffset={68} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} />
    </SafeAreaView>
  );
}

function stylesFor(colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 38 },
    hero: { padding: 20, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', marginBottom: 14 },
    kicker: { color: colors.goldSoft, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
    title: { color: colors.text, fontSize: 25, fontWeight: '800', marginTop: 10 },
    sub: { color: colors.textSoft, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
    card: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface, padding: 14, marginBottom: 12 },
    heading: { color: colors.gold, fontWeight: '800', fontSize: 16, marginBottom: 12 },
    body: { color: colors.textSoft, fontSize: 14, lineHeight: 21 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    rowSpread: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
    option: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
    optionText: { color: colors.textSoft, fontSize: 12, fontWeight: '700' },
    active: { backgroundColor: colors.activeSurface, borderColor: colors.gold },
    gold: { color: colors.gold },
    field: { color: colors.goldSoft, fontSize: 13, fontWeight: '700', marginTop: 14, marginBottom: 6 },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.background, color: colors.text, padding: 12, fontSize: 15 },
    multiline: { minHeight: 95 },
    primary: { backgroundColor: colors.gold, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
    primaryText: { color: '#111113', fontSize: 14, fontWeight: '800' },
    disabled: { opacity: 0.5 },
    secondary: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 10 },
    secondaryText: { color: colors.gold, fontSize: 13, fontWeight: '700' },
    entry: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
    dateText: { color: colors.textSoft, fontSize: 13 },
    categoryText: { color: colors.gold, fontSize: 12, fontWeight: '800' },
    contextText: { color: colors.goldSoft, fontSize: 13, marginBottom: 6 },
    action: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9 },
    actionText: { color: colors.gold, fontWeight: '700', fontSize: 12 },
    confirm: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.background, padding: 10, marginTop: 10 },
    danger: { color: '#e79a91', fontSize: 12, fontWeight: '800' },
    error: { color: '#e79a91', marginBottom: 10 },
    message: { color: colors.gold, marginBottom: 10 },
    footer: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 14 },
  });
}
