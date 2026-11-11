import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { communityQuestionsCopy } from '../community/communityQuestionsCopy';
import { getCommunityQuestions } from '../community/communityQuestionsService';
import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

const categories = [
  { key: 'health', value: 'health_care', icon: require('../../assets/community/heart-pulse.png') },
  { key: 'clinics', value: 'clinics_services', icon: require('../../assets/community/stethoscope.png') },
  { key: 'corso', value: 'cane_corso', icon: require('../../assets/community/paw-print.png') },
  { key: 'support', value: 'app_help', icon: require('../../assets/community/circle-help.png') },
];

const arrowUpIcon = require('../../assets/community/arrow-up.png');

export default function CommunityQuestionsScreen() {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const copy = communityQuestionsCopy[language] ?? communityQuestionsCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scrollRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [category, setCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setLoadError(false);

      getCommunityQuestions(category)
        .then(({ data, error }) => {
          if (!active) return;
          setQuestions(error ? [] : data ?? []);
          setLoadError(Boolean(error));
        })
        .catch(() => {
          if (!active) return;
          setQuestions([]);
          setLoadError(true);
        })
        .finally(() => {
          if (!active) return;
          setLoading(false);
          setRefreshing(false);
        });

      return () => { active = false; };
    }, [category, reload])
  );

  const refresh = () => {
    setRefreshing(true);
    setReload((value) => value + 1);
  };

  const changeCategory = (nextCategory) => {
    setCategory((previous) => previous === nextCategory ? null : nextCategory);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={64}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.gold} />}
        onScroll={(event) => {
          const offset = event.nativeEvent.contentOffset.y;
          setShowBackToTop((visible) => offset > 240 ? true : offset < 160 ? false : visible);
        }}
      >
        <View style={styles.intro}>
          <Text style={styles.kicker}>USG COMMUNITY</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>

        <Text style={styles.sectionTitle}>{copy.categoriesTitle}</Text>
        <View style={styles.categories}>
          {categories.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected: category === item.value }}
              onPress={() => changeCategory(item.value)}
              style={[styles.category, category === item.value && styles.categorySelected]}
            >
              <Image source={item.icon} style={styles.categoryIcon} resizeMode="contain" />
              <Text style={styles.categoryTitle}>{copy[item.key]}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.questionsHeader}>
          <Text style={styles.questionsSectionTitle}>{copy.questionsTitle}</Text>
          {category ? (
            <Pressable accessibilityRole="button" onPress={() => setCategory(null)} style={styles.allButton}>
              <Text style={styles.allButtonText}>{copy.allQuestions}</Text>
            </Pressable>
          ) : null}
        </View>
        {loading ? (
          <View style={styles.status}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.statusText}>{copy.loadingQuestions}</Text>
          </View>
        ) : loadError ? (
          <View style={styles.status}>
            <Text style={styles.statusText}>{copy.loadFailed}</Text>
            <Pressable accessibilityRole="button" onPress={refresh} style={styles.retryButton}>
              <Text style={styles.retryText}>{copy.retry}</Text>
            </Pressable>
          </View>
        ) : questions.length === 0 ? (
          <View style={styles.status}>
            <Text style={styles.statusText}>{copy.emptyQuestions}</Text>
          </View>
        ) : (
          <View style={styles.questions}>
            {questions.map((question) => (
              <View key={question.id} style={styles.questionCard}>
                <Text style={styles.questionTitle}>{question.title}</Text>
                <Text style={styles.questionBody} numberOfLines={4}>{question.body}</Text>
                <View style={styles.meta}>
                  <Text style={styles.metaText}>{categories.find((item) => item.value === question.category) ? copy[categories.find((item) => item.value === question.category).key] : question.category}</Text>
                  <Text style={styles.metaText}>{question.is_resolved ? copy.resolved : copy.openQuestion}</Text>
                </View>
                {question.city ? <Text style={styles.metaText}>{question.city}</Text> : null}
              </View>
            ))}
            <Text style={styles.note}>{copy.questionCount}: {questions.length}</Text>
          </View>
        )}
        <Text style={styles.note}>{copy.refreshHint}</Text>
        <Text style={styles.healthNote}>{copy.healthNote}</Text>
      </ScrollView>
      {showBackToTop ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.backToTop}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          style={styles.backToTop}
        >
          <Image source={arrowUpIcon} style={styles.backToTopIcon} resizeMode="contain" />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: 96 },
    intro: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 20 },
    kicker: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
    title: { color: colors.text, fontSize: 25, fontWeight: '800', marginTop: 8 },
    subtitle: { color: colors.textSoft, fontSize: 13, lineHeight: 20, marginTop: 8 },
    sectionTitle: { color: colors.gold, fontSize: 17, fontWeight: '800', marginTop: 24, marginBottom: 12 },
    categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    category: { width: '48%', minHeight: 104, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', padding: 12 },
    categorySelected: { borderColor: colors.gold, borderWidth: 2, backgroundColor: colors.activeSurface },
    categoryIcon: { width: 36, height: 36, tintColor: colors.gold },
    categoryTitle: { color: colors.text, textAlign: 'center', fontSize: 13, fontWeight: '700', marginTop: 8 },
    questionsHeader: { alignItems: 'stretch', marginTop: 24, gap: 12 },
    questionsSectionTitle: { color: colors.gold, fontSize: 17, fontWeight: '800', flexShrink: 1 },
    allButton: { alignSelf: 'flex-end', maxWidth: '100%', borderColor: colors.goldDark, borderWidth: 1, borderRadius: radius.md, paddingVertical: 7, paddingHorizontal: 12 },
    allButtonText: { color: colors.gold, fontSize: 12, fontWeight: '700' },
    questions: { gap: 10 },
    questionCard: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: 15, gap: 8 },
    questionTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
    questionBody: { color: colors.textSoft, fontSize: 13, lineHeight: 20 },
    meta: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    metaText: { color: colors.gold, fontSize: 11 },
    status: { borderWidth: 1, borderColor: colors.goldDark, backgroundColor: colors.activeSurface, borderRadius: radius.md, padding: 17, marginTop: 12, gap: 10 },
    statusText: { color: colors.textSoft, fontSize: 12, lineHeight: 19 },
    retryButton: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.gold, borderRadius: radius.md },
    retryText: { color: colors.gold, fontWeight: '700' },
    note: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 15 },
    healthNote: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 20 },
    backToTop: { position: 'absolute', right: 18, bottom: 18, width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', elevation: 5 },
    backToTopIcon: { width: 26, height: 26, tintColor: colors.gold },
  });
}
