import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import USGScrollHint from '../components/USGScrollHint';
import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';
import AuthLanguageSelector from './AuthLanguageSelector';
import AuthWelcomeCarousel from './AuthWelcomeCarousel';
import { authAboutUSGCopy } from './authAboutUSGCopy';

export default function AuthAboutUSGScreen({
  onBack,
  onContinueGuest,
}) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const copy = authAboutUSGCopy[language] ?? authAboutUSGCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showScrollHint, setShowScrollHint] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 16) + 28 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          if (event.nativeEvent.contentOffset.y > 24 && showScrollHint) {
            setShowScrollHint(false);
          }
        }}
        scrollEventThrottle={16}
      >
        <AuthLanguageSelector />
        <AuthWelcomeCarousel colors={colors} />

        <View style={styles.card}>
          <Text style={styles.brand}>USG — UNICO SUO GENERE™</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.lead}>{copy.lead}</Text>

          {copy.sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionBody}>{section.body}</Text>
            </View>
          ))}

          <View style={styles.note}>
            <Text style={styles.noteText}>{copy.note}</Text>
          </View>

          <View style={styles.navigationRow}>
            <Pressable style={styles.backButton} onPress={onBack}>
              <Text style={styles.backText}>← {copy.back}</Text>
            </Pressable>

            <Pressable style={styles.continueButton} onPress={onContinueGuest}>
              <Text
                style={styles.continueText}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
              >
                {copy.continueGuest} →
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <USGScrollHint
        visible={showScrollHint}
        bottom={Math.max(insets.bottom, 16) + 8}
      />
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 24,
    },
    brand: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 2.4,
      textAlign: 'center',
      marginBottom: 12,
    },
    title: {
      color: colors.text,
      fontSize: 26,
      lineHeight: 32,
      fontWeight: '800',
      textAlign: 'center',
    },
    lead: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 22,
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
    section: {
      marginTop: 20,
    },
    sectionTitle: {
      color: colors.gold,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '800',
      letterSpacing: 0.4,
      marginBottom: 6,
    },
    sectionBody: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 21,
    },
    note: {
      marginTop: 22,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 16,
    },
    noteText: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
    },
    navigationRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 22,
    },
    backButton: {
      flex: 1,
      minHeight: 58,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    backText: {
      color: colors.gold,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '900',
      letterSpacing: 0.6,
      textAlign: 'center',
    },
    continueButton: {
      flex: 1,
      minHeight: 58,
      borderRadius: radius.md,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    continueText: {
      color: colors.background,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '900',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
  });
}
