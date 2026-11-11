import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import { communityQuestionsCopy } from '../community/communityQuestionsCopy';
import { createCommunityQuestion } from '../community/communityQuestionsService';
import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

const categories = [
  { value: 'health_care', label: 'health' },
  { value: 'clinics_services', label: 'clinics' },
  { value: 'cane_corso', label: 'corso' },
  { value: 'app_help', label: 'support' },
];

export default function CommunityNewQuestionScreen({ navigation, route }) {
  const { session } = useAuth();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const copy = communityQuestionsCopy[language] ?? communityQuestionsCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const validInitialCategory = categories.some((item) => item.value === route?.params?.category)
    ? route.params.category : null;
  const [category, setCategory] = useState(validInitialCategory);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function submitQuestion() {
    if (saving) return;
    if (!session?.user?.id) {
      setError(copy.authRequired);
      return;
    }
    if (!categories.some((item) => item.value === category)) {
      setError(copy.invalidCategory);
      return;
    }
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    const cleanCity = city.trim();
    if (cleanTitle.length < 8 || cleanTitle.length > 160) {
      setError(copy.invalidTitle);
      return;
    }
    if (cleanBody.length < 20 || cleanBody.length > 5000) {
      setError(copy.invalidBody);
      return;
    }
    if (cleanCity && (cleanCity.length < 2 || cleanCity.length > 100)) {
      setError(copy.invalidCity);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const { error: saveError } = await createCommunityQuestion({
        authorId: session.user.id,
        category,
        title: cleanTitle,
        body: cleanBody,
        city: cleanCity,
      });
      if (saveError) throw saveError;
      setSuccess(true);
    } catch {
      setError(copy.submitFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.kicker}>USG COMMUNITY</Text>
          <Text style={styles.title}>{copy.newQuestionTitle}</Text>
          <Text style={styles.notice}>{copy.pendingNotice}</Text>
        </View>

        <Text style={styles.label}>{copy.chooseCategory}</Text>
        <View style={styles.categories}>
          {categories.map((item) => (
            <Pressable
              key={item.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: category === item.value }}
              disabled={saving}
              onPress={() => { setCategory(item.value); setError(''); }}
              style={[styles.category, category === item.value && styles.selected]}
            >
              <Text style={styles.categoryText}>{copy[item.label]}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>{copy.questionTitleLabel}</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          editable={!saving}
          maxLength={160}
          placeholder={copy.questionTitlePlaceholder}
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.label}>{copy.questionBodyLabel}</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={body}
          onChangeText={setBody}
          editable={!saving}
          multiline
          textAlignVertical="top"
          maxLength={5000}
          placeholder={copy.questionBodyPlaceholder}
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.label}>{copy.questionCityLabel}</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          editable={!saving}
          maxLength={100}
          placeholder={copy.questionCityPlaceholder}
          placeholderTextColor={colors.textMuted}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          accessibilityRole="button"
          disabled={saving || !session?.user?.id}
          onPress={submitQuestion}
          style={[styles.submit, (saving || !session?.user?.id) && styles.submitDisabled]}
        >
          {saving ? <ActivityIndicator color={colors.background} /> : <Text style={styles.submitText}>{copy.submitQuestion}</Text>}
        </Pressable>
        {!session?.user?.id ? <Text style={styles.error}>{copy.authRequired}</Text> : null}
      </ScrollView>
      <Modal visible={success} transparent animationType="fade" onRequestClose={() => { setSuccess(false); navigation.goBack(); }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{copy.submittedTitle}</Text>
            <Text style={styles.modalText}>{copy.submittedText}</Text>
            <Pressable style={styles.submit} onPress={() => { setSuccess(false); navigation.goBack(); }}>
              <Text style={styles.submitText}>{copy.submittedDone}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: 56 },
    hero: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 20 },
    kicker: { color: colors.gold, fontWeight: '800', letterSpacing: 2, fontSize: 10 },
    title: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 10 },
    notice: { color: colors.textSoft, fontSize: 13, lineHeight: 19, marginTop: 12 },
    label: { color: colors.gold, fontSize: 15, fontWeight: '800', marginTop: 23, marginBottom: 10 },
    categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    category: { width: '48%', minHeight: 64, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: 10, justifyContent: 'center' },
    selected: { borderColor: colors.gold, borderWidth: 2, backgroundColor: colors.activeSurface },
    categoryText: { color: colors.text, fontSize: 13, fontWeight: '700', textAlign: 'center' },
    input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.md, color: colors.text, padding: 13, fontSize: 15 },
    multiline: { minHeight: 170 },
    error: { color: colors.gold, fontSize: 13, lineHeight: 19, marginTop: 14 },
    submit: { backgroundColor: colors.gold, borderRadius: radius.md, minHeight: 50, padding: 14, alignItems: 'center', justifyContent: 'center', marginTop: 25 },
    submitDisabled: { opacity: 0.5 },
    submitText: { color: colors.background, fontSize: 14, fontWeight: '800', textAlign: 'center' },
    modalBackdrop: { flex: 1, backgroundColor: '#000000CC', alignItems: 'center', justifyContent: 'center', padding: 24 },
    modalCard: { width: '100%', backgroundColor: colors.surface, borderColor: colors.gold, borderWidth: 1, borderRadius: radius.lg, padding: 22 },
    modalTitle: { color: colors.gold, fontWeight: '800', fontSize: 19 },
    modalText: { color: colors.text, fontSize: 14, lineHeight: 21, marginTop: 12 },
  });
}
