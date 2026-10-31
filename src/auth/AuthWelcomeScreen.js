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
import { authCopy } from './authCopy';
import AuthLanguageSelector from './AuthLanguageSelector';
import AuthWelcomeCarousel from './AuthWelcomeCarousel';

export default function AuthWelcomeScreen({
  onLogin,
  onRegister,
  onContinueGuest,
  onAboutUSG,
}) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const copy = authCopy[language] ?? authCopy.en;
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
          <Text style={styles.brand}>{copy.brand}</Text>
          <Text style={styles.title}>{copy.welcomeTitle}</Text>
          <Text style={styles.body}>{copy.welcomeText}</Text>

          <Pressable style={styles.primaryButton} onPress={onLogin}>
            <View style={styles.primaryIconRing}>
              <View style={styles.loginArrowLine} />
              <View style={styles.loginArrowHead} />
            </View>
            <Text style={styles.primaryText}>{copy.signIn}</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onRegister}>
            <View style={styles.secondaryIconRing}>
              <View style={styles.plusHorizontal} />
              <View style={styles.plusVertical} />
            </View>
            <Text style={styles.secondaryText}>
              {copy.createAccount}
            </Text>
          </Pressable>

          <Pressable style={styles.aboutButton} onPress={onAboutUSG}>
            <Text style={styles.aboutButtonText}>
              {language === 'bg'
                ? 'КАКВО Е USG?'
                : language === 'it'
                  ? 'CHE COS’È USG?'
                  : 'WHAT IS USG?'}
            </Text>
            <Text style={styles.aboutArrow}>→</Text>
          </Pressable>

          <Text style={styles.aboutHint}>
            {language === 'bg'
              ? 'Научи идеята зад Unico Suo Genere™ преди да разгледаш платформата.'
              : language === 'it'
                ? 'Scopri l’idea dietro Unico Suo Genere™ prima di esplorare la piattaforma.'
                : 'Learn the idea behind Unico Suo Genere™ before exploring the platform.'}
          </Text>

          <Pressable style={styles.guestButton} onPress={onContinueGuest}>
            <View style={styles.guestIconRing}>
              <View style={styles.guestIconDiamond} />
            </View>
            <Text
              style={styles.guestButtonText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
            >
              {copy.continueGuest}
            </Text>
          </Pressable>

          <Text style={styles.guestHint}>{copy.guestHint}</Text>
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
  const iconRing = {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.md,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 28,
    },
    brand: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 3,
      textAlign: 'center',
      marginBottom: 12,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '700',
      textAlign: 'center',
    },
    body: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 21,
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 26,
    },
    primaryButton: {
      minHeight: 50,
      borderRadius: radius.md,
      backgroundColor: colors.gold,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      gap: 10,
    },
    primaryIconRing: {
      ...iconRing,
      borderColor: colors.background,
    },
    loginArrowLine: {
      width: 9,
      height: 2,
      borderRadius: 1,
      backgroundColor: colors.background,
      marginLeft: -2,
    },
    loginArrowHead: {
      position: 'absolute',
      right: 5,
      width: 6,
      height: 6,
      borderTopWidth: 2,
      borderRightWidth: 2,
      borderColor: colors.background,
      transform: [{ rotate: '45deg' }],
    },
    primaryText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
    },
    secondaryButton: {
      minHeight: 50,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.gold,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      marginTop: 12,
      gap: 10,
    },
    secondaryIconRing: {
      ...iconRing,
      borderColor: colors.gold,
    },
    plusHorizontal: {
      width: 9,
      height: 1,
      backgroundColor: colors.gold,
    },
    plusVertical: {
      position: 'absolute',
      width: 1,
      height: 9,
      backgroundColor: colors.gold,
    },
    secondaryText: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
    },
    guestButton: {
      minHeight: 52,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.goldSoft,
      backgroundColor: colors.surfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 54,
      marginTop: 12,
    },
    guestIconRing: {
      ...iconRing,
      position: 'absolute',
      left: 14,
      borderColor: colors.gold,
    },
    guestIconDiamond: {
      width: 7,
      height: 7,
      borderWidth: 1,
      borderColor: colors.gold,
      transform: [{ rotate: '45deg' }],
    },
    guestButtonText: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.7,
      textAlign: 'center',
      width: '100%',
    },
    aboutButton: {
      minHeight: 50,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      marginTop: 18,
      gap: 10,
    },
    aboutButtonText: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 0.9,
      textAlign: 'center',
    },
    aboutArrow: {
      color: colors.gold,
      fontSize: 18,
      fontWeight: '700',
    },
    aboutHint: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 16,
      textAlign: 'center',
      marginTop: 8,
    },
    guestHint: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 17,
      textAlign: 'center',
      marginTop: 9,
    },
  });
}
