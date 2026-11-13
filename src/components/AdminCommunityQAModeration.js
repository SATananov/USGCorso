import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing } from '../styles/usgTheme';
import USGDialog from './USGDialog';
import USGProgressBar from './USGProgressBar';
import {
  getAdminCommunityContent,
  hideCommunityAnswer,
  hideCommunityQuestion,
} from '../community/communityAdminService';

const COPY = {
  bg: {
    title: 'ВЪПРОСИ И ОТГОВОРИ', intro: 'Преглед и модерация на съдържанието в Общността.',
    refresh: 'ОБНОВИ', loading: 'Зареждане…', empty: 'Няма въпроси за преглед.',
    answers: 'ОТГОВОРИ', hide: 'СКРИЙ', question: 'ВЪПРОС', answer: 'ОТГОВОР', hidden: 'СКРИТО', deleted: 'ИЗТРИТО',
    confirmQ: 'Скриване на въпроса?', confirmA: 'Скриване на отговора?',
    confirmBody: 'Съдържанието ще бъде скрито от публичното четене. Продължаване?',
    cancel: 'ОТКАЗ', confirm: 'СКРИЙ', ok: 'РАЗБРАХ', success: 'Съдържанието е скрито.',
    error: 'Действието не бе изпълнено. Проверете администраторския достъп и опитайте отново.',
    loadError: 'Неуспешно зареждане на въпросите и отговорите.', status: 'Статус', noAnswers: 'Няма отговори.',
    resolved: 'РЕШЕН', statuses: { pending: 'ЧАКА', approved: 'ОДОБРЕНО', rejected: 'ОТХВЪРЛЕНО', hidden: 'СКРИТО' },
  },
  en: {
    title: 'QUESTIONS & ANSWERS', intro: 'Review and moderate Community content.',
    refresh: 'REFRESH', loading: 'Loading Q&A…', empty: 'No questions to review.',
    answers: 'ANSWERS', hide: 'HIDE', question: 'QUESTION', answer: 'ANSWER', hidden: 'HIDDEN', deleted: 'DELETED',
    confirmQ: 'Hide this question?', confirmA: 'Hide this answer?',
    confirmBody: 'This content will be hidden from public reading. Continue?',
    cancel: 'CANCEL', confirm: 'HIDE', ok: 'GOT IT', success: 'Content has been hidden.',
    error: 'The action failed. Check Admin access and try again.',
    loadError: 'Could not load Community Q&A.', status: 'Status', noAnswers: 'No answers.',
    resolved: 'RESOLVED', statuses: { pending: 'PENDING', approved: 'APPROVED', rejected: 'REJECTED', hidden: 'HIDDEN' },
  },
  it: {
    title: 'DOMANDE E RISPOSTE', intro: 'Rivedi e modera i contenuti della Community.',
    refresh: 'AGGIORNA', loading: 'Caricamento Q&A…', empty: 'Nessuna domanda da rivedere.',
    answers: 'RISPOSTE', hide: 'NASCONDI', question: 'DOMANDA', answer: 'RISPOSTA', hidden: 'NASCOSTO', deleted: 'ELIMINATO',
    confirmQ: 'Nascondere questa domanda?', confirmA: 'Nascondere questa risposta?',
    confirmBody: 'Il contenuto sarà nascosto dalla lettura pubblica. Continuare?',
    cancel: 'ANNULLA', confirm: 'NASCONDI', ok: 'HO CAPITO', success: 'Contenuto nascosto.',
    error: 'Operazione non riuscita. Verifica l’accesso Admin e riprova.',
    loadError: 'Impossibile caricare domande e risposte.', status: 'Stato', noAnswers: 'Nessuna risposta.',
    resolved: 'RISOLTA', statuses: { pending: 'IN ATTESA', approved: 'APPROVATO', rejected: 'RIFIUTATO', hidden: 'NASCOSTO' },
  },
};

function messageOf(error) {
  return error?.message || '';
}

export default function AdminCommunityQAModeration() {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const copy = COPY[language] || COPY.en;
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await getAdminCommunityContent();
    if (result.error) {
      setError(`${copy.loadError} ${messageOf(result.error)}`.trim());
      setQuestions([]);
      setAnswers([]);
    } else {
      setQuestions(result.data.questions);
      setAnswers(result.data.answers);
    }
    setLoading(false);
  }, [copy.loadError]);

  useEffect(() => { load(); }, [load]);

  async function confirmHide() {
    if (!pending) return;
    setBusy(true);
    setError('');
    const result = pending.kind === 'question'
      ? await hideCommunityQuestion(pending.id)
      : await hideCommunityAnswer(pending.id);
    setBusy(false);
    if (result.error) {
      setPending(null);
      setError(copy.error);
      return;
    }
    setPending(null);
    setNotice(copy.success);
    await load();
  }

  const answerGroups = useMemo(() => {
    const map = new Map();
    answers.forEach((answer) => {
      const items = map.get(answer.question_id) || [];
      items.push(answer);
      map.set(answer.question_id, items);
    });
    return map;
  }, [answers]);
  const statusLabel = (status) => copy.statuses[String(status || '').toLowerCase()] || String(status || '').toUpperCase();

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.intro}>{copy.intro}</Text>
        </View>
        <Pressable onPress={load} disabled={loading} style={styles.refresh}>
          <Text style={styles.refreshText}>{copy.refresh}</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {notice ? <Text accessibilityLiveRegion="polite" style={styles.success}>{notice}</Text> : null}
      {loading ? <USGProgressBar label={copy.loading} /> : null}
      {!loading && !error && questions.length === 0 ? <Text style={styles.empty}>{copy.empty}</Text> : null}
      <ScrollView nestedScrollEnabled style={styles.list} contentContainerStyle={styles.listContent}>
        {questions.map((question) => {
          const questionAnswers = answerGroups.get(question.id) || [];
          return (
            <View key={question.id} style={styles.card}>
              <View style={styles.statusRow}>
                <Text style={styles.category}>{String(question.category || '').replace(/_/g, ' ').toUpperCase()}</Text>
                <Text style={styles.status}>{copy.status}: {question.is_deleted ? copy.deleted : statusLabel(question.moderation_status)}</Text>
              </View>
              <Text style={styles.questionTitle}>{question.title}</Text>
              <Text selectable style={styles.body}>{question.body}</Text>
              {question.city ? <Text style={styles.city}>{question.city}</Text> : null}
              {question.is_resolved ? <Text style={styles.resolved}>{copy.resolved}</Text> : null}
              {!question.is_deleted && question.moderation_status !== 'hidden' ? (
                <Pressable style={styles.action} onPress={() => setPending({ kind: 'question', id: question.id })}>
                  <Text style={styles.actionText}>{copy.hide} {copy.question}</Text>
                </Pressable>
              ) : null}
              <View style={styles.answersHeader}>
                <Text style={styles.answersTitle}>{copy.answers} ({questionAnswers.length})</Text>
              </View>
              {questionAnswers.length === 0 ? <Text style={styles.noAnswers}>{copy.noAnswers}</Text> : null}
              {questionAnswers.map((answer) => (
                <View key={answer.id} style={styles.answer}>
                  <View style={styles.statusRow}>
                    <Text style={styles.status}>{copy.status}: {answer.is_deleted ? copy.deleted : statusLabel(answer.moderation_status)}</Text>
                  </View>
                  <Text selectable style={styles.body}>{answer.body}</Text>
                  {!answer.is_deleted && answer.moderation_status !== 'hidden' ? (
                    <Pressable style={styles.answerAction} onPress={() => setPending({ kind: 'answer', id: answer.id })}>
                      <Text style={styles.answerActionText}>{copy.hide} {copy.answer}</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
      <USGDialog
        visible={Boolean(pending)}
        title={pending?.kind === 'question' ? copy.confirmQ : copy.confirmA}
        message={copy.confirmBody}
        cancelText={copy.cancel}
        confirmText={copy.confirm}
        onCancel={() => setPending(null)}
        onConfirm={confirmHide}
        busy={busy}
      />
      <USGDialog
        visible={Boolean(notice)}
        title={copy.title}
        message={notice}
        singleText={copy.ok}
        onSingleAction={() => setNotice('')}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    wrap: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.surface },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
    headerText: { flex: 1 },
    title: { color: colors.gold, fontSize: 13, fontWeight: '900', letterSpacing: 0.8 },
    intro: { color: colors.textSoft, fontSize: 11, lineHeight: 16, marginTop: 5 },
    refresh: { borderWidth: 1, borderColor: colors.gold, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 9 },
    refreshText: { color: colors.gold, fontSize: 9, fontWeight: '900' },
    error: { color: colors.danger || '#d66', fontSize: 12, marginBottom: 10 },
    success: { color: colors.gold, fontSize: 12, marginBottom: 10 },
    empty: { color: colors.textSoft, textAlign: 'center', paddingVertical: spacing.lg },
    list: { maxHeight: 680 },
    listContent: { gap: spacing.sm },
    card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.background, padding: spacing.md },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
    category: { color: colors.gold, fontSize: 9, fontWeight: '900', letterSpacing: 0.6 },
    status: { color: colors.textMuted, fontSize: 9, fontWeight: '800' },
    questionTitle: { color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: '800', marginTop: 10 },
    body: { color: colors.textSoft, fontSize: 12, lineHeight: 18, marginTop: 7 },
    city: { color: colors.textMuted, fontSize: 10, marginTop: 6 },
    resolved: { color: colors.gold, fontSize: 9, fontWeight: '900', marginTop: 7 },
    action: { alignSelf: 'flex-start', marginTop: 11, borderRadius: 999, backgroundColor: colors.gold, paddingHorizontal: 13, paddingVertical: 9 },
    answerAction: { alignSelf: 'flex-start', marginTop: 8, borderWidth: 1, borderColor: colors.gold, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
    actionText: { color: '#070708', fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
    answerActionText: { color: colors.gold, fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
    answersHeader: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.sm },
    answersTitle: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 0.7 },
    noAnswers: { color: colors.textMuted, fontSize: 11, marginTop: 9 },
    answer: { borderLeftWidth: 2, borderLeftColor: colors.goldSoft, paddingLeft: 11, marginTop: 11 },
  });
}
