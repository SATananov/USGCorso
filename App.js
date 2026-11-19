import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import { recordCareNotification } from './src/care/corsoCareInbox';
import { getMyDogs } from './src/dogs/dogService';
import { activateCareReminderSession, clearInactiveCareReminders, reconcileCareReminders } from './src/care/corsoCareReminderSync';
import * as Linking from 'expo-linking';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';

import AppNavigator, { getMainTabBarHeight, MAIN_TAB_ROUTES } from './src/navigation/AppNavigator';
import { CommunityProvider } from './src/community/CommunityContext';
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
  const [currentRouteName, setCurrentRouteName] = useState(null);
  const [isAppForeground, setIsAppForeground] = useState(AppState.currentState === 'active');
  const [readyUpdateId, setReadyUpdateId] = useState(null);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);
  const appStateRef = useRef(AppState.currentState || 'active');
  const updateCheckRef = useRef({ inFlight: false, lastCheckedAt: 0 });
  const readyUpdateIdsRef = useRef(new Set());
  const dismissedUpdateIdsRef = useRef(new Set());
  const reloadRequestedRef = useRef(false);
  const recoveryUrl = Linking.useLinkingURL();
  const [completedRecoveryUrl, setCompletedRecoveryUrl] = useState(null);
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { session, loading, signOut } = useAuth();
  const demoFloatingBottom = MAIN_TAB_ROUTES.includes(currentRouteName)
    ? getMainTabBarHeight(insets.bottom) + 8
    : Math.max(insets.bottom, 8) + 12;
  const isSoftUniDemoUser = ['softuniadmin@demo.com', 'softuniuser@demo.com'].includes(
    (session?.user?.email || '').trim().toLowerCase()
  );
  const wasSignedInRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (session?.user?.id) {
      wasSignedInRef.current = true;
      return;
    }
    if (!wasSignedInRef.current) return;
    wasSignedInRef.current = false;
    setDemoGuest(false);
    setDemoDestination(null);
    setDemoPanel(false);
    demoViewState.current = { expanded: null, scrollY: 0 };
  }, [loading, session?.user?.id]);
  const { language, t } = useLanguage();
  const { isStartupProcedureRunning, isUpdatePending, downloadedUpdate } = Updates.useUpdates();

  const offerDownloadedUpdate = useCallback((updateId) => {
    if (!updateId || updateId === Updates.updateId) return;
    readyUpdateIdsRef.current.add(updateId);
    if (!dismissedUpdateIdsRef.current.has(updateId)) setReadyUpdateId(updateId);
  }, []);

  useEffect(() => {
    if (Updates.isEnabled && isUpdatePending) offerDownloadedUpdate(downloadedUpdate?.updateId);
  }, [downloadedUpdate?.updateId, isUpdatePending, offerDownloadedUpdate]);

  const checkForForegroundUpdate = useCallback(async () => {
    const now = Date.now();
    if (!Updates.isEnabled || isStartupProcedureRunning || isUpdatePending || updateCheckRef.current.inFlight) return;
    if (now - updateCheckRef.current.lastCheckedAt < 10 * 60 * 1000) return;
    updateCheckRef.current.inFlight = true;
    updateCheckRef.current.lastCheckedAt = now;
    try {
      const check = await Updates.checkForUpdateAsync();
      const updateId = check.isAvailable ? check.manifest?.id : null;
      if (!updateId || updateId === Updates.updateId || readyUpdateIdsRef.current.has(updateId) || dismissedUpdateIdsRef.current.has(updateId)) return;
      const result = await Updates.fetchUpdateAsync();
      if (result.isNew) offerDownloadedUpdate(result.manifest?.id);
    } catch {} finally {
      updateCheckRef.current.inFlight = false;
    }
  }, [isStartupProcedureRunning, isUpdatePending, offerDownloadedUpdate]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;
      setIsAppForeground(nextState === 'active');
      if (nextState === 'active' && previousState !== 'active') checkForForegroundUpdate();
    });
    return () => subscription.remove();
  }, [checkForForegroundUpdate]);

  function deferReadyUpdate() {
    if (!readyUpdateId || isApplyingUpdate) return;
    dismissedUpdateIdsRef.current.add(readyUpdateId);
    setReadyUpdateId((current) => current === readyUpdateId ? null : current);
  }

  async function applyReadyUpdate() {
    if (!readyUpdateId || isApplyingUpdate || reloadRequestedRef.current || !readyUpdateIdsRef.current.has(readyUpdateId)) return;
    reloadRequestedRef.current = true;
    setIsApplyingUpdate(true);
    try {
      await Updates.reloadAsync();
    } catch {
      reloadRequestedRef.current = false;
      setIsApplyingUpdate(false);
    }
  }

  useEffect(() => {
    if (loading) return undefined;
    let active = true;
    const userId = session?.user?.id || null;
    activateCareReminderSession(userId);
    async function synchronize() {
      try {
        await clearInactiveCareReminders(userId);
        if (!active || !userId) return;
        const { data, error } = await getMyDogs(userId);
        if (!active || error) return;
        await reconcileCareReminders({ userId, dogs: data || [], language });
      } catch {}
    }
    synchronize();
    return () => { active = false; };
  }, [loading, session?.user?.id, language]);

  useEffect(() => {
    if (!session?.user?.id) return undefined;
    const userId = session.user.id;
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      recordCareNotification(notification, userId).catch(() => {});
    });
    return () => subscription.remove();
  }, [session?.user?.id]);

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
          onDemoLogin={() => { setDemoDestination(null); setDemoGuest(true); }}
          onCancelDemoFeature={() => setDemoDestination(null)}
          onSetDemoContext={(active) => {
            setDemoGuest(Boolean(active));
            if (!active) setDemoDestination(null);
          }}
          onOpenDemoFeature={(destination) => { setDemoDestination(destination); setDemoGuest(true); setDemoNavigationReady(false); }}
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
        <CommunityProvider>
          <NavigationContainer
            ref={demoNavigationRef}
            theme={navigationTheme}
            onReady={() => {
              setDemoNavigationReady(true);
              setCurrentRouteName(demoNavigationRef.current?.getCurrentRoute()?.name ?? null);
            }}
            onStateChange={() => {
              const nextRouteName = demoNavigationRef.current?.getCurrentRoute()?.name ?? null;
              setCurrentRouteName((current) => current === nextRouteName ? current : nextRouteName);
            }}
          >
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <AuthSignedInBanner />
            <AppNavigator />
          </NavigationContainer>
        </CommunityProvider>
        {readyUpdateId && currentRouteName === 'Home' && isAppForeground && !demoAuthPrompt && !demoPanel ? (
          <View pointerEvents="box-none" style={otaNotificationStyles.layer}>
            <View style={[otaNotificationStyles.card, { backgroundColor: colors.surface, borderColor: colors.gold }]}>
              <Text style={[otaNotificationStyles.title, { color: colors.gold }]}>{t('otaUpdate.title')}</Text>
              <Text style={[otaNotificationStyles.message, { color: colors.textSoft }]}>{t('otaUpdate.message')}</Text>
              <View style={otaNotificationStyles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('otaUpdate.later')}
                  accessibilityState={{ disabled: isApplyingUpdate }}
                  disabled={isApplyingUpdate}
                  onPress={deferReadyUpdate}
                  style={({ pressed }) => [otaNotificationStyles.secondaryButton, { borderColor: colors.gold }, pressed && otaNotificationStyles.pressed, isApplyingUpdate && otaNotificationStyles.disabled]}
                >
                  <Text style={[otaNotificationStyles.secondaryText, { color: colors.gold }]}>{t('otaUpdate.later')}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('otaUpdate.updateNow')}
                  accessibilityState={{ busy: isApplyingUpdate, disabled: isApplyingUpdate }}
                  disabled={isApplyingUpdate}
                  onPress={applyReadyUpdate}
                  style={({ pressed }) => [otaNotificationStyles.primaryButton, { backgroundColor: colors.gold }, pressed && otaNotificationStyles.pressed, isApplyingUpdate && otaNotificationStyles.disabled]}
                >
                  <Text style={otaNotificationStyles.primaryText}>{t('otaUpdate.updateNow')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
        {(isSoftUniDemoUser || (demoGuest && (guestMode || Boolean(session)))) && !demoPanel ? (
          <View pointerEvents="box-none" style={[demoReturnStyles.floatingLayer, { bottom: demoFloatingBottom }]}>
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
          visible={Boolean(isSoftUniDemoUser && demoPanel && !demoAuthPrompt)}
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

const otaNotificationStyles = StyleSheet.create({
  layer: { position: 'absolute', left: 12, right: 12, bottom: 166, alignItems: 'center', zIndex: 20, elevation: 20 },
  card: { width: '100%', maxWidth: 520, borderWidth: 1, borderRadius: 18, padding: 14 },
  title: { fontSize: 15, fontWeight: '900' },
  message: { fontSize: 12, lineHeight: 17, marginTop: 5 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  primaryButton: { flex: 1, minHeight: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  secondaryButton: { flex: 1, minHeight: 44, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  primaryText: { color: '#070708', fontSize: 11, fontWeight: '900' },
  secondaryText: { fontSize: 11, fontWeight: '900' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
});
