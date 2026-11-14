import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getDogPhotoUrl } from '../dogs/dogPhotoService';
import { useLanguage } from '../i18n/LanguageContext';
import { getRecognitionAdminNominations, decideRecognitionNomination } from '../recognition/recognitionAdminService';
import { useTheme } from '../theme/ThemeContext';
import USGDialog from './USGDialog';
import USGProgressBar from './USGProgressBar';

const translations = {
  bg: {
    title: 'USG RECOGNITION', subtitle: 'Номинации за признание от USG общността',
    refresh: 'ОБНОВИ', empty: 'Все още няма номинирани Cane Corso.',
    votes: 'Гласове', owner: 'Собственик', unknown: 'Не е посочен',
    note: 'Бележка от Admin (по избор)', approve: 'ОДОБРИ', reject: 'ОТХВЪРЛИ',
    confirmApprove: 'Одобряване на номинация', confirmReject: 'Отхвърляне на номинация',
    messageApprove: 'Потвърждаваш ли одобрението? Това НЕ издава сертификат.',
    messageReject: 'Потвърждаваш ли отказа на номинацията?',
    cancel: 'ОТКАЗ', loadError: 'Неуспешно зареждане на номинациите.',
    actionError: 'Решението не можа да бъде записано.',
    pending: 'ЧАКА', paused: 'ПАУЗА', approved: 'ОДОБРЕНО', rejected: 'ОТКАЗАНО', review_required: 'НОВ ПРЕГЛЕД',
    issued: 'Одобрението не издава сертификат.',
  },
  en: {
    title: 'USG RECOGNITION', subtitle: 'Nominations for recognition by the USG Community',
    refresh: 'REFRESH', empty: 'No Cane Corso nominations yet.',
    votes: 'Votes', owner: 'Owner', unknown: 'Not provided',
    note: 'Admin review note (optional)', approve: 'APPROVE', reject: 'REJECT',
    confirmApprove: 'Approve nomination', confirmReject: 'Reject nomination',
    messageApprove: 'Confirm approval? This does NOT issue a certificate.',
    messageReject: 'Confirm rejection of this nomination?',
    cancel: 'CANCEL', loadError: 'Could not load nominations.',
    actionError: 'Could not save the decision.',
    pending: 'PENDING', paused: 'PAUSED', approved: 'APPROVED', rejected: 'REJECTED', review_required: 'REVIEW REQUIRED',
    issued: 'Approval does not issue a certificate.',
  },
  it: {
    title: 'USG RECOGNITION', subtitle: 'Candidature per il riconoscimento della Community USG',
    refresh: 'AGGIORNA', empty: 'Nessuna candidatura Cane Corso al momento.',
    votes: 'Voti', owner: 'Proprietario', unknown: 'Non indicato',
    note: 'Nota dell’amministratore (facoltativa)', approve: 'APPROVA', reject: 'RIFIUTA',
    confirmApprove: 'Approva candidatura', confirmReject: 'Rifiuta candidatura',
    messageApprove: 'Confermi l’approvazione? Questo NON emette un certificato.',
    messageReject: 'Confermi il rifiuto della candidatura?',
    cancel: 'ANNULLA', loadError: 'Impossibile caricare le candidature.',
    actionError: 'Impossibile salvare la decisione.',
    pending: 'IN ATTESA', paused: 'IN PAUSA', approved: 'APPROVATA', rejected: 'RIFIUTATA', review_required: 'NUOVA REVISIONE',
    issued: 'L’approvazione non emette un certificato.',
  },
};

export default function AdminRecognitionNominations() {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const copy = translations[language] ?? translations.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState({});
  const [dialog, setDialog] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await getRecognitionAdminNominations();
    if (result.error) {
      setItems([]);
      setError(copy.loadError);
      setLoading(false);
      return;
    }
    const rows = Array.isArray(result.data) ? result.data : [];
    const hydrated = await Promise.all(rows.map(async (item) => {
      if (!item.dog_photo_path) return { ...item, imageUrl: null };
      const photo = await getDogPhotoUrl(item.dog_photo_path);
      return { ...item, imageUrl: photo.data ?? null };
    }));
    setItems(hydrated);
    setLoading(false);
  }, [copy.loadError]);

  useEffect(() => { load(); }, [load]);

  async function confirmDecision() {
    if (!dialog || working) return;
    setWorking(true);
    setError('');
    const result = await decideRecognitionNomination(dialog.id, dialog.approve, notes[dialog.id] ?? '');
    setWorking(false);
    setDialog(null);
    if (result.error) {
      setError(copy.actionError);
      return;
    }
    setNotes((current) => ({ ...current, [dialog.id]: '' }));
    await load();
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>USG · UNICO SUO GENERE</Text>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.subtitle}>{copy.subtitle}</Text>
      <Pressable style={styles.refresh} onPress={load} disabled={loading || working}>
        <Text style={styles.refreshLabel}>{copy.refresh}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <USGProgressBar label={copy.title} /> : items.length === 0 ? (
        <Text style={styles.empty}>{copy.empty}</Text>
      ) : items.map((item) => {
        const actionable = item.nomination_status === 'pending' || item.nomination_status === 'review_required';
        return (
          <View key={item.nomination_id} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.name}>{item.dog_name}</Text>
              <Text style={styles.status}>{copy[item.nomination_status] ?? item.nomination_status}</Text>
            </View>
            {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" /> : null}
            <Text style={styles.meta}>{copy.owner}: {item.owner_display_name || copy.unknown}</Text>
            <Text style={styles.meta}>{copy.votes}: {item.vote_count}</Text>
            {item.review_note ? <Text style={styles.meta}>{item.review_note}</Text> : null}
            {actionable ? (
              <>
                <TextInput
                  value={notes[item.nomination_id] ?? ''}
                  onChangeText={(value) => setNotes((current) => ({ ...current, [item.nomination_id]: value }))}
                  placeholder={copy.note}
                  placeholderTextColor={colors.textMuted}
                  maxLength={500}
                  multiline
                  style={styles.input}
                />
                <View style={styles.actions}>
                  <Pressable disabled={working} style={styles.primary} onPress={() => setDialog({ id: item.nomination_id, approve: true })}>
                    <Text style={styles.primaryLabel}>{copy.approve}</Text>
                  </Pressable>
                  <Pressable disabled={working} style={styles.secondary} onPress={() => setDialog({ id: item.nomination_id, approve: false })}>
                    <Text style={styles.secondaryLabel}>{copy.reject}</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        );
      })}
      <Text style={styles.footnote}>{copy.issued}</Text>
      <USGDialog
        visible={Boolean(dialog)}
        title={dialog?.approve ? copy.confirmApprove : copy.confirmReject}
        message={dialog?.approve ? copy.messageApprove : copy.messageReject}
        cancelText={copy.cancel}
        confirmText={dialog?.approve ? copy.approve : copy.reject}
        busy={working}
        onCancel={() => { if (!working) setDialog(null); }}
        onConfirm={confirmDecision}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    wrap: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 14 },
    kicker: { color: colors.gold, fontWeight: '900', fontSize: 8, letterSpacing: 1.4 },
    title: { color: colors.text, fontWeight: '900', fontSize: 16, marginTop: 6 },
    subtitle: { color: colors.textSoft, fontSize: 11, marginTop: 4, lineHeight: 16 },
    refresh: { borderColor: colors.gold, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start', marginTop: 12 },
    refreshLabel: { color: colors.gold, fontSize: 10, fontWeight: '900' },
    error: { color: colors.danger || '#d66', fontSize: 11, marginTop: 10 },
    empty: { color: colors.textSoft, textAlign: 'center', fontSize: 11, paddingVertical: 18 },
    card: { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 12 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
    name: { color: colors.text, fontWeight: '900', fontSize: 17, flex: 1 },
    status: { color: colors.gold, fontSize: 9, fontWeight: '900' },
    image: { width: '100%', aspectRatio: 16 / 10, borderRadius: 12, marginTop: 10 },
    meta: { color: colors.textSoft, fontSize: 11, marginTop: 7 },
    input: { borderColor: colors.border, borderWidth: 1, borderRadius: 10, marginTop: 10, padding: 10, minHeight: 54, textAlignVertical: 'top', color: colors.text, fontSize: 11 },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    primary: { backgroundColor: colors.gold, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 20 },
    primaryLabel: { color: '#070708', fontSize: 10, fontWeight: '900' },
    secondary: { borderColor: colors.gold, borderWidth: 1, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20 },
    secondaryLabel: { color: colors.gold, fontSize: 10, fontWeight: '900' },
    footnote: { color: colors.textMuted, fontSize: 10, marginTop: 12 },
  });
}
