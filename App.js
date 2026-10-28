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
import { LanguageProvider } from './src/i18n/LanguageContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function AppContent() {
  const [showIntro, setShowIntro] = useState(true);
  const { isDark, colors } = useTheme();

  const replayIntro = useCallback(() => {
    setShowIntro(true);
  }, []);

  if (showIntro) {
    return (
      <AppControlProvider replayIntro={replayIntro}>
        <StatusBar style="light" />
        <USGIntro3DDirect
          onExplore={() => setShowIntro(false)}
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
    <AppControlProvider replayIntro={replayIntro}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </AppControlProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}
