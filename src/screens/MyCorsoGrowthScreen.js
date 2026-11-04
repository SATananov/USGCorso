import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import USGBackToTop from '../components/USGBackToTop';
import { getMyDogs } from '../dogs/dogService';
import { addDogWeight, deleteDogWeight, getDogWeightHistory, updateDogWeight } from '../dogs/dogGrowthService';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

const copy = {
  bg: {
    title: 'РАСТЕЖ И ГРИЖИ', intro: 'Лична история на измерванията за твоето Кане Корсо.',
    select: 'Избери куче', noDogs: 'Първо добави Кане Корсо в „Моето Корсо“.', addDog: 'ДОБАВИ КОРСО',
    measurement: 'НОВО ИЗМЕРВАНЕ', date: 'Дата (ГГГГ-ММ-ДД)', weight: 'Тегло (кг)',
    save: 'ЗАПАЗИ ИЗМЕРВАНЕ', saving: 'ЗАПАЗВАНЕ...', history: 'ИСТОРИЯ НА ТЕГЛОТО',
    empty: 'Все още няма записани измервания.', invalidDate: 'Въведи валидна дата, не по-късна от днес.',
    invalidWeight: 'Въведи тегло между 0,10 и 150 кг.', duplicate: 'За тази дата вече има измерване.',
    loadError: 'Не успяхме да заредим данните. Провери дали SQL миграцията е приложена.',
    saveError: 'Не успяхме да запазим измерването.', saved: 'Измерването е запазено.',
    private: 'Само собственикът има достъп до тези измервания.',
    chart: 'РАЗВИТИЕ НА ТЕГЛОТО', chartEmpty: 'Добави поне едно измерване за графика.',
    edit: 'РЕДАКТИРАЙ', remove: 'ИЗТРИЙ', confirmRemove: 'Да изтрия ли това измерване?',
    confirm: 'ПОТВЪРДИ ИЗТРИВАНЕТО', cancel: 'ОТКАЗ', saveEdit: 'ЗАПАЗИ ПРОМЕНИТЕ',
    updated: 'Измерването е променено.', deleted: 'Измерването е изтрито.',
    updateError: 'Не успяхме да променим измерването.', deleteError: 'Не успяхме да изтрием измерването.',
  },
  en: {
    title: 'GROWTH & CARE', intro: 'A private record of measurements for your Cane Corso.',
    select: 'Choose a dog', noDogs: 'Add a Cane Corso in My Corso first.', addDog: 'ADD CORSO',
    measurement: 'NEW MEASUREMENT', date: 'Date (YYYY-MM-DD)', weight: 'Weight (kg)',
    save: 'SAVE MEASUREMENT', saving: 'SAVING...', history: 'WEIGHT HISTORY',
    empty: 'No measurements recorded yet.', invalidDate: 'Enter a valid date, not later than today.',
    invalidWeight: 'Enter a weight between 0.10 and 150 kg.', duplicate: 'A measurement already exists for this date.',
    loadError: 'Could not load data. Check that the SQL migration was applied.',
    saveError: 'Could not save the measurement.', saved: 'Measurement saved.',
    private: 'Only the owner can access these measurements.',
    chart: 'WEIGHT PROGRESS', chartEmpty: 'Add at least one measurement to see a chart.',
    edit: 'EDIT', remove: 'DELETE', confirmRemove: 'Delete this measurement?',
    confirm: 'CONFIRM DELETE', cancel: 'CANCEL', saveEdit: 'SAVE CHANGES',
    updated: 'Measurement updated.', deleted: 'Measurement deleted.',
    updateError: 'Could not update measurement.', deleteError: 'Could not delete measurement.',
  },
  it: {
    title: 'CRESCITA E CURA', intro: 'Uno storico privato delle misurazioni del tuo Cane Corso.',
    select: 'Seleziona un cane', noDogs: 'Aggiungi prima un Cane Corso in My Corso.', addDog: 'AGGIUNGI CORSO',
    measurement: 'NUOVA MISURAZIONE', date: 'Data (AAAA-MM-GG)', weight: 'Peso (kg)',
    save: 'SALVA MISURAZIONE', saving: 'SALVATAGGIO...', history: 'STORICO DEL PESO',
    empty: 'Nessuna misurazione registrata.', invalidDate: 'Inserisci una data valida, non successiva a oggi.',
    invalidWeight: 'Inserisci un peso tra 0,10 e 150 kg.', duplicate: 'Esiste già una misurazione per questa data.',
    loadError: 'Impossibile caricare i dati. Verifica la migrazione SQL.',
    saveError: 'Impossibile salvare la misurazione.', saved: 'Misurazione salvata.',
    private: 'Solo il proprietario può accedere a queste misurazioni.',
    chart: 'ANDAMENTO DEL PESO', chartEmpty: 'Aggiungi almeno una misurazione per vedere il grafico.',
    edit: 'MODIFICA', remove: 'ELIMINA', confirmRemove: 'Eliminare questa misurazione?',
    confirm: 'CONFERMA ELIMINAZIONE', cancel: 'ANNULLA', saveEdit: 'SALVA MODIFICHE',
    updated: 'Misurazione aggiornata.', deleted: 'Misurazione eliminata.',
    updateError: 'Impossibile modificare la misurazione.', deleteError: 'Impossibile eliminare la misurazione.',
  },
};

function todayLocal() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value > todayLocal()) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export default function MyCorsoGrowthScreen({ navigation }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const labels = copy[language] ?? copy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scrollRef = useRef(null);
  const measurementTopRef = useRef(0);
  const [dogs, setDogs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [date, setDate] = useState(todayLocal());
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError('');
    async function load() {
      if (!user?.id) {
        if (active) { setDogs([]); setSelectedId(null); setLoading(false); }
        return;
      }
      const { data, error: loadError } = await getMyDogs(user.id);
      if (!active) return;
      if (loadError) setError(labels.loadError);
      const items = data ?? [];
      setDogs(items);
      setSelectedId((previous) => items.some((dog) => dog.id === previous) ? previous : (items[0]?.id ?? null));
      setLoading(false);
    }
    load();
    const shown = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hidden = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { active = false; shown.remove(); hidden.remove(); };
  }, [user?.id, labels.loadError]));

  useFocusEffect(useCallback(() => {
    let active = true;
    async function loadHistory() {
      if (!user?.id || !selectedId) { setHistory([]); return; }
      setLoadingHistory(true);
      const { data, error: loadError } = await getDogWeightHistory(user.id, selectedId);
      if (!active) return;
      setHistory(data ?? []);
      if (loadError) setError(labels.loadError);
      setLoadingHistory(false);
    }
    loadHistory();
    return () => { active = false; };
  }, [user?.id, selectedId, labels.loadError]));

  function cancelEdit() {
    setEditingId(null);
    setDate(todayLocal());
    setWeight('');
    setError('');
  }

  function selectDog(dogId) {
    setSelectedId(dogId);
    setEditingId(null);
    setDeleteTarget(null);
    setDate(todayLocal());
    setWeight('');
    setError('');
    setMessage('');
  }

  function editMeasurement(item) {
    if (saving) return;
    setEditingId(item.id);
    setDeleteTarget(null);
    setDate(item.measured_on);
    setWeight(String(item.weight_kg));
    setError('');
    setMessage('');
    scrollRef.current?.scrollTo({ y: measurementTopRef.current, animated: true });
  }

  async function refreshHistory(dogId) {
    const { data, error: refreshError } = await getDogWeightHistory(user.id, dogId);
    if (refreshError) {
      setError(labels.loadError);
      return false;
    }
    setHistory(data ?? []);
    return true;
  }

  async function confirmDelete(item) {
    if (saving || !user?.id || !selectedId || deleteTarget !== item.id) return;
    setSaving(true);
    setError('');
    setMessage('');
    const dogId = selectedId;
    const result = await deleteDogWeight(user.id, dogId, item.id);
    if (result.error || !result.data?.length) {
      setError(labels.deleteError);
    } else {
      if (editingId === item.id) cancelEdit();
      if (await refreshHistory(dogId)) setMessage(labels.deleted);
    }
    setDeleteTarget(null);
    setSaving(false);
  }

  const chartData = history.slice(0, 10).reverse();
  const maxChartWeight = Math.max(1, ...chartData.map((item) => Number(item.weight_kg) || 0));
  const numberLocale = language === 'bg' ? 'bg-BG' : language === 'it' ? 'it-IT' : 'en-GB';

  async function saveMeasurement() {
    if (saving || !user?.id || !selectedId) return;
    setError('');
    setMessage('');
    const normalized = Number(weight.trim().replace(',', '.'));
    if (!validDate(date.trim())) { setError(labels.invalidDate); return; }
    if (!Number.isFinite(normalized) || normalized < 0.1 || normalized > 150) {
      setError(labels.invalidWeight);
      return;
    }
    setSaving(true);
    const dogId = selectedId;
    const result = editingId
      ? await updateDogWeight(user.id, dogId, editingId, date.trim(), normalized)
      : await addDogWeight(user.id, dogId, date.trim(), normalized);
    const saveError = result.error || (editingId && !result.data ? { code: 'PGRST116' } : null);
    if (saveError) {
      setError(saveError.code === '23505' ? labels.duplicate : (editingId ? labels.updateError : labels.saveError));
      setSaving(false);
      return;
    }
    const wasEditing = Boolean(editingId);
    if (await refreshHistory(dogId)) {
      setMessage(wasEditing ? labels.updated : labels.saved);
      setEditingId(null);
      setDate(todayLocal());
      setWeight('');
      Keyboard.dismiss();
    }
    setSaving(false);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        onScroll={(event) => setShowBackToTop(event.nativeEvent.contentOffset.y > 220)}
        scrollEventThrottle={32}
      >
        <View style={styles.hero}>
          <Text style={styles.kicker}>USG CORSO · MY CORSO</Text>
          <Text style={styles.title}>{labels.title}</Text>
          <Text style={styles.subtitle}>{labels.intro}</Text>
        </View>

        {loading ? <ActivityIndicator color={colors.gold} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}

        {!loading && dogs.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.body}>{labels.noDogs}</Text>
            <Pressable style={styles.primary} onPress={() => navigation.navigate('Main', { screen: 'My Corso', params: { openAddDog: true } })}>
              <Text style={styles.primaryText}>{labels.addDog}</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && dogs.length > 0 ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{labels.select}</Text>
              <View style={styles.dogs}>
                {dogs.map((dog) => (
                  <Pressable
                    key={dog.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedId === dog.id }}
                    style={[styles.dogButton, selectedId === dog.id && styles.dogButtonActive]}
                    onPress={() => selectDog(dog.id)}
                  >
                    <Text style={[styles.dogName, selectedId === dog.id && styles.dogNameActive]}>{dog.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.card} onLayout={(event) => { measurementTopRef.current = event.nativeEvent.layout.y; }}>
              <Text style={styles.cardTitle}>{editingId ? labels.edit : labels.measurement}</Text>
              <Text style={styles.fieldLabel}>{labels.date}</Text>
              <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} autoCapitalize="none" keyboardType="numbers-and-punctuation" />
              <Text style={styles.fieldLabel}>{labels.weight}</Text>
              <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder="0.00" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" />
              <Pressable style={[styles.primary, saving && styles.disabled]} disabled={saving || loadingHistory} onPress={saveMeasurement}>
                <Text style={styles.primaryText}>{saving ? labels.saving : (editingId ? labels.saveEdit : labels.save)}</Text>
              </Pressable>
              {editingId ? (
                <Pressable accessibilityRole="button" style={styles.outline} disabled={saving} onPress={cancelEdit}>
                  <Text style={styles.outlineText}>{labels.cancel}</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{labels.chart}</Text>
              {chartData.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartRow}>
                  {chartData.map((item) => (
                    <View key={item.id} style={styles.chartColumn}>
                      <Text style={styles.chartNumber}>{Number(item.weight_kg).toLocaleString(numberLocale, { maximumFractionDigits: 2 })}</Text>
                      <View style={[styles.chartBar, { height: Math.max(10, Math.round(Number(item.weight_kg) / maxChartWeight * 130)) }]} />
                      <Text style={styles.chartDate}>{item.measured_on.slice(5)}</Text>
                    </View>
                  ))}
                </ScrollView>
              ) : <Text style={styles.body}>{labels.chartEmpty}</Text>}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{labels.history}</Text>
              {loadingHistory ? <ActivityIndicator color={colors.gold} /> : null}
              {!loadingHistory && history.length === 0 ? <Text style={styles.body}>{labels.empty}</Text> : null}
              {history.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyRow}>
                    <Text style={styles.historyDate}>{item.measured_on}</Text>
                    <Text style={styles.historyWeight}>{Number(item.weight_kg).toLocaleString(numberLocale, { maximumFractionDigits: 2 })} kg</Text>
                  </View>
                  <View style={styles.actions}>
                    <Pressable accessibilityRole="button" disabled={saving} onPress={() => editMeasurement(item)} style={styles.actionButton}>
                      <Text style={styles.actionText}>{labels.edit}</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" disabled={saving} onPress={() => setDeleteTarget(item.id)} style={styles.actionButton}>
                      <Text style={styles.actionText}>{labels.remove}</Text>
                    </Pressable>
                  </View>
                  {deleteTarget === item.id ? (
                    <View style={styles.confirmBox}>
                      <Text style={styles.body}>{labels.confirmRemove}</Text>
                      <View style={styles.actions}>
                        <Pressable accessibilityRole="button" disabled={saving} onPress={() => setDeleteTarget(null)} style={styles.actionButton}>
                          <Text style={styles.actionText}>{labels.cancel}</Text>
                        </Pressable>
                        <Pressable accessibilityRole="button" disabled={saving} onPress={() => confirmDelete(item)} style={styles.actionButton}>
                          <Text style={styles.dangerText}>{labels.confirm}</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
            <Text style={styles.privacy}>{labels.private}</Text>
          </>
        ) : null}
      </ScrollView>
      <USGBackToTop visible={showBackToTop && !keyboardVisible} language={language} bottomOffset={68} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} />
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 38 },
    hero: { padding: 22, marginBottom: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
    kicker: { color: colors.goldSoft, fontWeight: '700', letterSpacing: 2.5, fontSize: 11 },
    title: { color: colors.text, fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 12 },
    subtitle: { color: colors.textSoft, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 12 },
    card: { borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 16, marginBottom: 14 },
    cardTitle: { color: colors.gold, fontSize: 18, fontWeight: '800', marginBottom: 14 },
    body: { color: colors.textSoft, fontSize: 15, lineHeight: 23 },
    dogs: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
    dogButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
    dogButtonActive: { borderColor: colors.gold, backgroundColor: colors.activeSurface },
    dogName: { color: colors.textSoft, fontSize: 15 },
    dogNameActive: { color: colors.gold, fontWeight: '800' },
    fieldLabel: { color: colors.goldSoft, fontWeight: '700', fontSize: 14, marginTop: 8, marginBottom: 8 },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, color: colors.text, backgroundColor: colors.background, fontSize: 16, marginBottom: 14 },
    primary: { backgroundColor: colors.gold, borderRadius: 12, padding: 15, marginTop: 8, alignItems: 'center' },
    primaryText: { color: '#111113', fontWeight: '800', fontSize: 14 },
    disabled: { opacity: 0.55 },
    historyItem: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 10 },
    historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, gap: 12 },
    actions: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', paddingVertical: 6 },
    actionButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, minHeight: 40 },
    actionText: { color: colors.gold, fontWeight: '700', fontSize: 12 },
    dangerText: { color: '#e58b83', fontWeight: '700', fontSize: 12 },
    outline: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: 14, marginTop: 8, alignItems: 'center' },
    outlineText: { color: colors.gold, fontWeight: '700' },
    confirmBox: { backgroundColor: colors.background, padding: 12, borderRadius: 12, marginTop: 8, gap: 8 },
    chartRow: { minWidth: '100%', alignItems: 'flex-end', gap: 11, paddingTop: 12, paddingBottom: 6 },
    chartColumn: { width: 56, height: 185, justifyContent: 'flex-end', alignItems: 'center', gap: 8 },
    chartNumber: { color: colors.textSoft, fontWeight: '700', fontSize: 11 },
    chartBar: { width: 32, borderRadius: 6, backgroundColor: colors.gold, minHeight: 10 },
    chartDate: { color: colors.textMuted, fontSize: 11 },
    historyDate: { color: colors.textSoft, fontSize: 14 },
    historyWeight: { color: colors.gold, fontWeight: '800', fontSize: 15 },
    error: { color: '#d77970', fontSize: 14, marginBottom: 12 },
    success: { color: colors.gold, fontSize: 14, marginBottom: 12 },
    privacy: { color: colors.textMuted, textAlign: 'center', fontSize: 12, paddingBottom: 10 },
  });
}
