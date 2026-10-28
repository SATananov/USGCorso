import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './src/navigation/AppNavigator';
import USGIntro3DDirect from './src/components/USGIntro3DDirect';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return (
      <>
        <StatusBar style="light" />
        <USGIntro3DDirect onExplore={() => setShowIntro(false)} />
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
