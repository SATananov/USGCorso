import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './src/navigation/AppNavigator';
import USGIntro3DDirect from './src/components/USGIntro3DDirect';
import { LanguageProvider } from './src/i18n/LanguageContext';

function AppContent() {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return (
      <>
        <StatusBar style="light" />
        <USGIntro3DDirect
          onExplore={() => setShowIntro(false)}
        />
      </>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
