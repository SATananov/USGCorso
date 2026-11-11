import { useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { communityQuestionsCopy } from '../community/communityQuestionsCopy';
import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

const categories = [
  { key: 'health', icon: require('../../assets/community/heart-pulse.png') },
  { key: 'clinics', icon: require('../../assets/community/stethoscope.png') },
  { key: 'corso', icon: require('../../assets/community/paw-print.png') },
  { key: 'support', icon: require('../../assets/community/circle-help.png') },
];

const arrowUpIcon = require('../../assets/community/arrow-up.png');

export default function CommunityQuestionsScreen() {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const copy = communityQuestionsCopy[language] ?? communityQuestionsCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scrollRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={64}
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
          {categories.map((category) => (
            <View key={category.key} style={styles.category}>
              <Image source={category.icon} style={styles.categoryIcon} resizeMode="contain" />
              <Text style={styles.categoryTitle}>{copy[category.key]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.status}>
          <Text style={styles.statusTitle}>{copy.statusTitle}</Text>
          <Text style={styles.statusText}>{copy.statusText}</Text>
        </View>
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
    intro: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: 20,
    },
    kicker: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
    title: { color: colors.text, fontSize: 25, fontWeight: '800', marginTop: 8 },
    subtitle: { color: colors.textSoft, fontSize: 13, lineHeight: 20, marginTop: 8 },
    sectionTitle: { color: colors.gold, fontSize: 17, fontWeight: '800', marginTop: 24, marginBottom: 12 },
    categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    category: {
      width: '48%',
      minHeight: 104,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
    },
    categoryIcon: { width: 36, height: 36, tintColor: colors.gold },
    categoryTitle: { color: colors.text, textAlign: 'center', fontSize: 13, fontWeight: '700', marginTop: 8 },
    status: {
      borderWidth: 1,
      borderColor: colors.goldDark,
      backgroundColor: colors.activeSurface,
      borderRadius: radius.md,
      padding: 17,
      marginTop: 24,
    },
    statusTitle: { color: colors.gold, fontSize: 16, fontWeight: '800' },
    statusText: { color: colors.textSoft, fontSize: 12, lineHeight: 19, marginTop: 7 },
    healthNote: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 20 },
    backToTop: {
      position: 'absolute',
      right: 18,
      bottom: 18,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5,
    },
    backToTopIcon: { width: 26, height: 26, tintColor: colors.gold },
  });
}
