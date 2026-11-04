import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import USGBackToTop from '../components/USGBackToTop';
import { getMyDogs } from '../dogs/dogService';
import { getDogCareEntries, saveDogCareEntry, deleteDogCareEntry } from '../dogs/dogCareService';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

const words = {
  bg: { title: 'ХРАНЕНЕ И ГРИЖИ', subtitle: 'Личен дневник за храненето и ежедневните грижи.', dog: 'ИЗБЕРИ КУЧЕ', noDogs: 'Добави куче в „Моето Корсо“, за да започнеш.', feeding: 'ХРАНЕНЕ', care: 'ГРИЖА', date: 'Дата (ГГГГ-ММ-ДД)', food: 'Вид храна', grams: 'Количество (г)', careType: 'Вид грижа', note: 'Бележки (незадължително)', save: 'ЗАПАЗИ', saveEdit: 'ЗАПАЗИ ПРОМЕНИТЕ', cancel: 'ОТКАЗ', list: 'ИСТОРИЯ', empty: 'Няма записи за това куче.', edit: 'РЕДАКТИРАЙ', del: 'ИЗТРИЙ', question: 'Да изтрия ли този запис?', confirm: 'ПОТВЪРДИ ИЗТРИВАНЕТО', invalidDate: 'Въведи валидна дата, не по-късна от днес.', invalidFood: 'Въведи храна до 100 знака и количество от 0,1 до 10000 г.', invalidCare: 'Въведи вид грижа до 100 знака.', invalidNote: 'Бележките могат да са до 500 знака.', error: 'Действието не успя. Провери дали SQL миграцията е изпълнена.', saved: 'Записът е запазен.', deleted: 'Записът е изтрит.', private: 'Дневникът е личен — достъпен само за собственика.' },
  en: { title: 'FEEDING & DAILY CARE', subtitle: 'Your private feeding and daily care log.', dog: 'CHOOSE A DOG', noDogs: 'Add a dog in My Corso to begin.', feeding: 'FEEDING', care: 'CARE', date: 'Date (YYYY-MM-DD)', food: 'Food type', grams: 'Amount (g)', careType: 'Type of care', note: 'Notes (optional)', save: 'SAVE', saveEdit: 'SAVE CHANGES', cancel: 'CANCEL', list: 'HISTORY', empty: 'No entries for this dog.', edit: 'EDIT', del: 'DELETE', question: 'Delete this entry?', confirm: 'CONFIRM DELETE', invalidDate: 'Enter a valid date, not later than today.', invalidFood: 'Enter a food type up to 100 characters and an amount from 0.1 to 10000 g.', invalidCare: 'Enter a care type up to 100 characters.', invalidNote: 'Notes can be up to 500 characters.', error: 'Action failed. Check that the SQL migration was applied.', saved: 'Entry saved.', deleted: 'Entry deleted.', private: 'This log is private to the owner.' },
  it: { title: 'ALIMENTAZIONE E CURE', subtitle: 'Diario privato di alimentazione e cure quotidiane.', dog: 'SELEZIONA UN CANE', noDogs: 'Aggiungi un cane in My Corso per iniziare.', feeding: 'ALIMENTAZIONE', care: 'CURA', date: 'Data (AAAA-MM-GG)', food: 'Tipo di alimento', grams: 'Quantità (g)', careType: 'Tipo di cura', note: 'Note (facoltative)', save: 'SALVA', saveEdit: 'SALVA MODIFICHE', cancel: 'ANNULLA', list: 'STORICO', empty: 'Nessuna voce per questo cane.', edit: 'MODIFICA', del: 'ELIMINA', question: 'Eliminare questa voce?', confirm: 'CONFERMA ELIMINAZIONE', invalidDate: 'Inserisci una data valida, non successiva a oggi.', invalidFood: 'Inserisci un alimento fino a 100 caratteri e una quantità da 0,1 a 10000 g.', invalidCare: 'Inserisci un tipo di cura fino a 100 caratteri.', invalidNote: 'Le note possono contenere fino a 500 caratteri.', error: 'Operazione non riuscita. Verifica che la migrazione SQL sia stata eseguita.', saved: 'Voce salvata.', deleted: 'Voce eliminata.', private: 'Questo diario è privato e visibile solo al proprietario.' },
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

export default function MyCorsoCareScreen() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const w = words[language] ?? words.en;
  const s = useMemo(() => stylesFor(colors), [colors]);
  const scrollRef = useRef(null);
  const [dogs, setDogs] = useState([]);
  const [dogId, setDogId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [kind, setKind] = useState('feeding');
  const [date, setDate] = useState(today());
  const [foodName, setFoodName] = useState('');
  const [amount, setAmount] = useState('');
  const [careType, setCareType] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [keyboard, setKeyboard] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    getMyDogs(user?.id).then(({ data, error: loadError }) => {
      if (!active) return;
      const items = data ?? [];
      setDogs(items);
      setDogId(current => items.some(dog => dog.id === current) ? current : items[0]?.id ?? null);
      if (loadError) setError(w.error);
      setLoading(false);
    });
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false));
    return () => { active = false; show.remove(); hide.remove(); };
  }, [user?.id, w.error]));

  useFocusEffect(useCallback(() => {
    let active = true;
    if (!dogId || !user?.id) { setEntries([]); return () => { active = false; }; }
    setLoading(true);
    getDogCareEntries(user.id, dogId).then(({ data, error: loadError }) => {
      if (!active) return;
      setEntries(data ?? []);
      if (loadError) setError(w.error);
      setLoading(false);
    });
    return () => { active = false; };
  }, [user?.id, dogId, w.error]));

  function reset() {
    setEditingId(null);
    setDeleteId(null);
    setDate(today());
    setKind('feeding');
    setFoodName('');
    setAmount('');
    setCareType('');
    setNotes('');
  }

  function chooseDog(id) {
    if (busy) return;
    setDogId(id);
    reset();
    setError('');
    setMessage('');
  }

  function edit(item) {
    setEditingId(item.id);
    setDeleteId(null);
    setKind(item.kind);
    setDate(item.entry_date);
    setFoodName(item.food_name ?? '');
    setAmount(item.amount_g == null ? '' : String(item.amount_g));
    setCareType(item.care_type ?? '');
    setNotes(item.notes ?? '');
    setError('');
    setMessage('');
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  async function refresh(id) {
    const result = await getDogCareEntries(user.id, id);
    if (result.error) { setError(w.error); return false; }
    setEntries(result.data ?? []);
    return true;
  }

  async function save() {
    if (busy || !dogId || !user?.id) return;
    setError('');
    setMessage('');
    const day = date.trim();
    const food = foodName.trim();
    const care = careType.trim();
    const note = notes.trim();
    const grams = Number(amount.trim().replace(',', '.'));
    if (!validDate(day)) { setError(w.invalidDate); return; }
    if (kind === 'feeding' && (!food || food.length > 100 || !Number.isFinite(grams) || grams < 0.1 || grams > 10000)) { setError(w.invalidFood); return; }
    if (kind === 'care' && (!care || care.length > 100)) { setError(w.invalidCare); return; }
    if (note.length > 500) { setError(w.invalidNote); return; }
    setBusy(true);
    const targetDog = dogId;
    const result = await saveDogCareEntry(user.id, targetDog, { entryDate: day, kind, foodName: food, amountG: grams, careType: care, notes: note }, editingId);
    if (result.error || !result.data) setError(w.error);
    else if (await refresh(targetDog)) { reset(); setMessage(w.saved); Keyboard.dismiss(); }
    setBusy(false);
  }

  async function remove(id) {
    if (busy || deleteId !== id || !user?.id || !dogId) return;
    setBusy(true);
    const targetDog = dogId;
    const result = await deleteDogCareEntry(user.id, targetDog, id);
    if (result.error || !result.data?.length) setError(w.error);
    else if (await refresh(targetDog)) { if (editingId === id) reset(); setMessage(w.deleted); }
    setDeleteId(null);
    setBusy(false);
  }

  return (
    <SafeAreaView style={s.screen} edges={['bottom']}>
      <ScrollView ref={scrollRef} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" onScroll={event => setScrolled(event.nativeEvent.contentOffset.y > 220)} scrollEventThrottle={32}>
        <View style={s.hero}>
          <Text style={s.kicker}>USG CORSO · MY CORSO</Text>
          <Text style={s.title}>{w.title}</Text>
          <Text style={s.sub}>{w.subtitle}</Text>
        </View>
        {error ? <Text style={s.error}>{error}</Text> : null}
        {message ? <Text style={s.message}>{message}</Text> : null}
        {loading ? <ActivityIndicator color={colors.gold} /> : null}
        {!loading && dogs.length === 0 ? <View style={s.card}><Text style={s.body}>{w.noDogs}</Text></View> : null}
        {dogs.length ? <>
          <View style={s.card}>
            <Text style={s.heading}>{w.dog}</Text>
            <View style={s.row}>{dogs.map(dog => <Pressable key={dog.id} style={[s.option, dogId === dog.id && s.active]} disabled={busy} onPress={() => chooseDog(dog.id)}><Text style={[s.body, dogId === dog.id && s.gold]}>{dog.name}</Text></Pressable>)}</View>
          </View>
          <View style={s.card}>
            <View style={s.row}>
              {['feeding', 'care'].map(value => <Pressable key={value} disabled={busy} style={[s.option, kind === value && s.active]} onPress={() => setKind(value)}><Text style={[s.body, kind === value && s.gold]}>{w[value]}</Text></Pressable>)}
            </View>
            <Text style={s.field}>{w.date}</Text>
            <TextInput style={s.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} keyboardType="numbers-and-punctuation" />
            {kind === 'feeding' ? <>
              <Text style={s.field}>{w.food}</Text>
              <TextInput style={s.input} value={foodName} onChangeText={setFoodName} maxLength={100} placeholderTextColor={colors.textMuted} />
              <Text style={s.field}>{w.grams}</Text>
              <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={colors.textMuted} />
            </> : <>
              <Text style={s.field}>{w.careType}</Text>
              <TextInput style={s.input} value={careType} onChangeText={setCareType} maxLength={100} placeholderTextColor={colors.textMuted} />
            </>}
            <Text style={s.field}>{w.note}</Text>
            <TextInput style={[s.input, s.multiline]} multiline value={notes} onChangeText={setNotes} maxLength={500} textAlignVertical="top" placeholderTextColor={colors.textMuted} />
            <Pressable style={[s.primary, busy && s.disabled]} disabled={busy || loading} onPress={save}><Text style={s.primaryText}>{editingId ? w.saveEdit : w.save}</Text></Pressable>
            {editingId ? <Pressable style={s.option} disabled={busy} onPress={reset}><Text style={s.gold}>{w.cancel}</Text></Pressable> : null}
          </View>
          <View style={s.card}>
            <Text style={s.heading}>{w.list}</Text>
            {entries.length === 0 && !loading ? <Text style={s.body}>{w.empty}</Text> : null}
            {entries.map(item => <View key={item.id} style={s.entry}>
              <Text style={s.gold}>{item.entry_date} · {w[item.kind]}</Text>
              <Text style={s.body}>{item.kind === 'feeding' ? `${item.food_name} · ${item.amount_g} g` : item.care_type}</Text>
              {item.notes ? <Text style={s.body}>{item.notes}</Text> : null}
              <View style={s.row}>
                <Pressable style={s.option} disabled={busy} onPress={() => edit(item)}><Text style={s.gold}>{w.edit}</Text></Pressable>
                <Pressable style={s.option} disabled={busy} onPress={() => setDeleteId(item.id)}><Text style={s.danger}>{w.del}</Text></Pressable>
              </View>
              {deleteId === item.id ? <View style={s.confirm}><Text style={s.body}>{w.question}</Text><View style={s.row}><Pressable style={s.option} disabled={busy} onPress={() => setDeleteId(null)}><Text style={s.gold}>{w.cancel}</Text></Pressable><Pressable style={s.option} disabled={busy} onPress={() => remove(item.id)}><Text style={s.danger}>{w.confirm}</Text></Pressable></View></View> : null}
            </View>)}
          </View>
          <Text style={s.privacy}>{w.private}</Text>
        </> : null}
      </ScrollView>
      <USGBackToTop visible={scrolled && !keyboard} language={language} bottomOffset={68} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} />
    </SafeAreaView>
  );
}

function stylesFor(colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 42 },
    hero: { padding: 22, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', marginBottom: 16 },
    kicker: { fontSize: 11, color: colors.goldSoft, fontWeight: '700', letterSpacing: 2 },
    title: { fontSize: 25, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: 10 },
    sub: { color: colors.textSoft, fontSize: 14, textAlign: 'center', marginTop: 8 },
    card: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 18, padding: 16, marginBottom: 14, gap: 8 },
    heading: { color: colors.gold, fontWeight: '800', fontSize: 18, marginBottom: 8 },
    field: { color: colors.goldSoft, fontWeight: '700', marginTop: 8 },
    body: { color: colors.textSoft, fontSize: 14, lineHeight: 22 },
    gold: { color: colors.gold, fontWeight: '700' },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    option: { padding: 11, borderRadius: 11, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginVertical: 3 },
    active: { borderColor: colors.gold, backgroundColor: colors.activeSurface },
    input: { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: 11, color: colors.text, padding: 12, fontSize: 16 },
    multiline: { minHeight: 82 },
    primary: { backgroundColor: colors.gold, borderRadius: 11, padding: 15, alignItems: 'center', marginTop: 8 },
    primaryText: { color: '#111113', fontWeight: '800' },
    disabled: { opacity: 0.5 },
    entry: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14, paddingBottom: 12, gap: 8 },
    confirm: { backgroundColor: colors.background, borderRadius: 12, padding: 12, gap: 8 },
    error: { color: '#e58b83', marginBottom: 14 },
    message: { color: colors.gold, marginBottom: 14 },
    danger: { color: '#e58b83', fontWeight: '700' },
    privacy: { color: colors.textMuted, textAlign: 'center', fontSize: 12, marginBottom: 10 },
  });
}
