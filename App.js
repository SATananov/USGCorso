import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
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
import AuthSignedInBanner from './src/auth/AuthSignedInBanner';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function AppContent() {
  const [showIntro, setShowIntro] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const { isDark, colors } = useTheme();
  const { session, loading } = useAuth();

  const replayIntro = useCallback(() => {
    setShowIntro(true);
  }, []);

  if (showIntro) {
    return (
      <AppControlProvider replayIntro={replayIntro}>
        <StatusBar style="light" />
        <USGIntro3DDirect onExplore={() => setShowIntro(false)} />
      </AppControlProvider>
    );
  }

  if (loading) {
    return (
      <AppControlProvider replayIntro={replayIntro}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AuthLoadingScreen />
      </AppControlProvider>
    );
  }

  if (!session && !guestMode) {
    return (
      <AppControlProvider replayIntro={replayIntro}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AuthGateway onContinueGuest={() => setGuestMode(true)} />
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
    <AppControlProvider replayIntro={replayIntro}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AuthSignedInBanner />
        <AppNavigator />
      </NavigationContainer>
    </AppControlProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
