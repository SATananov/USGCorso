import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
}) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const copy = authCopy[language] ?? authCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
      paddingBottom: 28,
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
    guestHint: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 17,
      textAlign: 'center',
      marginTop: 9,
    },
  });
}
