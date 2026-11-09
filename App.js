import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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
import AuthSoftUniDemoScreen from './src/auth/AuthSoftUniDemoScreen';
import USGDialog from './src/components/USGDialog';
import AuthLoadingScreen from './src/auth/AuthLoadingScreen';
import AuthResetPasswordScreen from './src/auth/AuthResetPasswordScreen';
import AuthSignedInBanner from './src/auth/AuthSignedInBanner';
import { LanguageProvider, useLanguage } from './src/i18n/LanguageContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function AppContent() {
  const [showIntro, setShowIntro] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const [demoGuest, setDemoGuest] = useState(false);
  const [demoDestination, setDemoDestination] = useState(null);
  const [demoNavigationReady, setDemoNavigationReady] = useState(false);
  const [demoPanel, setDemoPanel] = useState(false);
  const demoViewState = useRef({ expanded: null, scrollY: 0 });
  const [demoAuthPrompt, setDemoAuthPrompt] = useState(null);
  const [demoAuthTarget, setDemoAuthTarget] = useState(null);
  const [demoAuthBusy, setDemoAuthBusy] = useState(false);
  const demoNavigationRef = useRef(null);
  const recoveryUrl = Linking.useLinkingURL();
  const [completedRecoveryUrl, setCompletedRecoveryUrl] = useState(null);
  const { isDark, colors } = useTheme();
  const { session, loading, signOut } = useAuth();
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

  const navigateDemoFeature = useCallback((destination) => {
    const navigator = demoNavigationRef.current;
    if (!navigator?.isReady()) return false;
    if (destination === 'CorsoFriendly') {
      navigator.navigate('Main', { screen: 'Corso Friendly' });
    } else {
      navigator.navigate(destination);
    }
    return true;
  }, []);

  useEffect(() => {
    if (!session || !demoNavigationReady || !demoDestination) return;
    if (navigateDemoFeature(demoDestination)) setDemoDestination(null);
  }, [session, demoNavigationReady, demoDestination, navigateDemoFeature]);

  useEffect(() => {
    if (session && demoAuthTarget) setDemoAuthTarget(null);
  }, [session, demoAuthTarget]);

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
          initialScreen={demoAuthTarget || (demoGuest ? 'softuni-demo' : 'welcome')}
          onContinueGuest={() => { setDemoDestination(null); setDemoGuest(false); setGuestMode(true); }}
          onOpenDemoKnowledge={() => { setDemoDestination(null); setDemoGuest(true); setGuestMode(true); }}
          onDemoLogin={() => { setDemoDestination(null); setDemoGuest(false); }}
          onCancelDemoFeature={() => setDemoDestination(null)}
          onOpenDemoFeature={(destination) => { setDemoDestination(destination); setDemoGuest(false); setDemoNavigationReady(false); }}
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
        <NavigationContainer
          ref={demoNavigationRef}
          theme={navigationTheme}
          onReady={() => setDemoNavigationReady(true)}
        >
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <AuthSignedInBanner />
          <AppNavigator />
        </NavigationContainer>
        {!demoPanel ? (
          <View pointerEvents="box-none" style={demoReturnStyles.floatingLayer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={language === 'bg' ? 'Отвори менюто СофтУни' : language === 'it' ? 'Apri il menu SoftUni' : 'Open SoftUni menu'}
              onPress={() => {
                if (session) {
                  setDemoPanel(true);
                } else {
                  setDemoGuest(true);
                  setGuestMode(false);
                  setShowIntro(false);
                }
              }}
              style={({ pressed }) => [
                demoReturnStyles.floatingButton,
                { backgroundColor: colors.surface, borderColor: colors.gold, opacity: pressed ? 0.78 : 1 },
              ]}
            >
              <Text style={[demoReturnStyles.floatingLabel, { color: colors.gold }]}>
                {language === 'bg' ? '\u2190 \u0421\u041e\u0424\u0422\u0423\u041d\u0418' : language === 'it' ? '\u2190 SOFTUNI' : '\u2190 SOFTUNI'}
              </Text>
              <Text style={[demoReturnStyles.floatingSubLabel, { color: colors.textSoft }]}>01–06</Text>
            </Pressable>
          </View>
        ) : null}
        <Modal
          visible={Boolean(session && demoPanel && !demoAuthPrompt)}
          animationType="fade"
          onRequestClose={() => setDemoPanel(false)}
        >
          <AuthSoftUniDemoScreen
              initialDemoView={demoViewState.current}
              onDemoViewChange={(change) => {
                demoViewState.current = { ...demoViewState.current, ...change };
              }}
              onBack={() => setDemoPanel(false)}
              onLogin={() => setDemoPanel(false)}
              onOpenKnowledge={() => {
                setDemoPanel(false);
                demoNavigationRef.current?.navigate('Main', { screen: 'Knowledge' });
              }}
              onOpenFeature={(destination) => {
                setDemoPanel(false);
                navigateDemoFeature(destination);
              }}
              onOpenAuthLogin={() => { setDemoPanel(false); setDemoAuthPrompt('login'); }}
              onOpenAuthRegister={() => { setDemoPanel(false); setDemoAuthPrompt('register'); }}
          />
        </Modal>
        <USGDialog
          visible={Boolean(demoAuthPrompt)}
          title={language === 'bg' ? 'Потвърди излизане' : language === 'it' ? 'Conferma uscita' : 'Confirm sign out'}
          message={language === 'bg'
            ? 'За да провериш формите за вход и регистрация, първо трябва да излезеш от текущия акаунт. Продължаваме ли?'
            : language === 'it'
              ? 'Per provare accesso o registrazione devi prima uscire dall’account corrente. Continuare?'
              : 'To test login or registration, first sign out of the current account. Continue?'}
          cancelText={language === 'bg' ? 'ОТКАЗ' : language === 'it' ? 'ANNULLA' : 'CANCEL'}
          confirmText={language === 'bg' ? 'ИЗЛЕЗ' : language === 'it' ? 'ESCI' : 'SIGN OUT'}
          busy={demoAuthBusy}
          onCancel={() => { setDemoAuthPrompt(null); setDemoPanel(true); }}
          onConfirm={async () => {
            if (demoAuthBusy || !demoAuthPrompt) return;
            setDemoAuthBusy(true);
            const target = demoAuthPrompt;
            try {
              const { error } = await signOut();
              if (error) {
                setDemoPanel(true);
              } else {
                setDemoGuest(false);
                setDemoAuthTarget(target);
                setGuestMode(false);
              }
            } catch {
              setDemoPanel(true);
            } finally {
              setDemoAuthPrompt(null);
              setDemoAuthBusy(false);
            }
          }}
        />

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
  floatingLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 118,
    alignItems: 'center',
    zIndex: 12,
  },
  floatingButton: {
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 42,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 6,
  },
  floatingLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
  floatingSubLabel: {
    fontSize: 9,
    fontWeight: '700',
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
