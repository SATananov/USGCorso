import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';

import AppNavigator from './src/navigation/AppNavigator';
import USGIntro3DDirect from './src/components/USGIntro3DDirect';
import { AppControlProvider } from './src/app/AppControlContext';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import AuthGateway from './src/auth/AuthGateway';
import AuthLoadingScreen from './src/auth/AuthLoadingScreen';
import AuthResetPasswordScreen from './src/auth/AuthResetPasswordScreen';
import AuthSignedInBanner from './src/auth/AuthSignedInBanner';
import { LanguageProvider, useLanguage } from './src/i18n/LanguageContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function AppContent() {
  const [showIntro, setShowIntro] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const [demoGuest, setDemoGuest] = useState(false);
  const recoveryUrl = Linking.useLinkingURL();
  const [completedRecoveryUrl, setCompletedRecoveryUrl] = useState(null);
  const { isDark, colors } = useTheme();
  const { session, loading } = useAuth();
  const { language } = useLanguage();

  const replayIntro = useCallback(() => {
    setShowIntro(true);
  }, []);

  const leaveGuestMode = useCallback(() => {
    setGuestMode(false);
    setShowIntro(false);
  }, []);

  const isPasswordRecovery =
    recoveryUrl?.includes('reset-password') &&
    recoveryUrl !== completedRecoveryUrl;

  if (isPasswordRecovery) {
    return (
      <AppControlProvider replayIntro={replayIntro} leaveGuestMode={leaveGuestMode}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AuthResetPasswordScreen
          recoveryUrl={recoveryUrl}
          onBack={() => {
            setCompletedRecoveryUrl(recoveryUrl);
            setShowIntro(false);
            setGuestMode(false);
          }}
          onComplete={() => {
            setCompletedRecoveryUrl(recoveryUrl);
            setShowIntro(false);
            setGuestMode(false);
          }}
        />
      </AppControlProvider>
    );
  }
  if (showIntro) {
    return (
      <AppControlProvider replayIntro={replayIntro} leaveGuestMode={leaveGuestMode}>
        <StatusBar style="light" />
        <USGIntro3DDirect onExplore={() => setShowIntro(false)} />
      </AppControlProvider>
    );
  }

  if (loading) {
    return (
      <AppControlProvider replayIntro={replayIntro} leaveGuestMode={leaveGuestMode}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AuthLoadingScreen />
      </AppControlProvider>
    );
  }

  if (!session && !guestMode) {
    return (
      <AppControlProvider replayIntro={replayIntro} leaveGuestMode={leaveGuestMode}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AuthGateway
          initialScreen={demoGuest ? 'softuni-demo' : 'welcome'}
          onContinueGuest={() => { setDemoGuest(false); setGuestMode(true); }}
          onOpenDemoKnowledge={() => { setDemoGuest(true); setGuestMode(true); }}
          onDemoLogin={() => setDemoGuest(false)}
        />
      </AppControlProvider>
    );
  }

  const baseNavigationTheme = isDark ? DarkTheme : DefaultTheme;

  const navigationTheme = {
    ...baseNavigationTheme,
    dark: isDark,
    colors: {
      ...baseNavigationTheme.colors,
      primary: colors.gold,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.gold,
    },
  };

  return (
    <AppControlProvider replayIntro={replayIntro} leaveGuestMode={leaveGuestMode}>
      <View style={demoReturnStyles.container}>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <AuthSignedInBanner />
          <AppNavigator />
        </NavigationContainer>
        {demoGuest && !session && (
          <View pointerEvents="box-none" style={demoReturnStyles.bar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={language === 'bg' ? 'Към СофтУни' : language === 'it' ? 'Torna a SoftUni' : 'Back to SoftUni'}
              onPress={() => {
                setGuestMode(false);
                setShowIntro(false);
              }}
              style={[demoReturnStyles.button, { backgroundColor: colors.surface, borderColor: colors.gold }]}
            >
              <Text style={[demoReturnStyles.label, { color: colors.gold }]}>
                {language === 'bg' ? '← КЪМ СОФТУНИ' : language === 'it' ? '← TORNA A SOFTUNI' : '← BACK TO SOFTUNI'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </AppControlProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const demoReturnStyles = StyleSheet.create({
  container: { flex: 1 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderWidth: 1,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 16,
    elevation: 8,
    maxWidth: '76%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
});
