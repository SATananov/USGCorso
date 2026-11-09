import { useState } from 'react';

import AuthAboutUSGScreen from './AuthAboutUSGScreen';
import AuthCheckEmailScreen from './AuthCheckEmailScreen';
import AuthForgotPasswordScreen from './AuthForgotPasswordScreen';
import AuthFormScreen from './AuthFormScreen';
import AuthWelcomeScreen from './AuthWelcomeScreen';
import AuthSoftUniDemoScreen from './AuthSoftUniDemoScreen';

export default function AuthGateway({ onContinueGuest, onOpenDemoKnowledge, initialScreen = 'welcome', onDemoLogin }) {
  const [screen, setScreen] = useState(initialScreen);
  const [demoAuthFlow, setDemoAuthFlow] = useState(false);

  if (screen === 'softuni-demo') {
    return (
      <AuthSoftUniDemoScreen
        onBack={() => setScreen('welcome')}
        onLogin={() => { onDemoLogin?.(); setScreen('login'); }}
        onOpenKnowledge={onOpenDemoKnowledge}
        onOpenAuthLogin={() => { setDemoAuthFlow(true); setScreen('login'); }}
        onOpenAuthRegister={() => { setDemoAuthFlow(true); setScreen('register'); }}
      />
    );
  }

  if (screen === 'about-usg') {
    return (
      <AuthAboutUSGScreen
        onBack={() => setScreen('welcome')}
        onContinueGuest={onContinueGuest}
      />
    );
  }

  if (screen === 'login') {
    return (
      <AuthFormScreen
        mode="login"
        onBack={() => setScreen(demoAuthFlow ? 'softuni-demo' : 'welcome')}
        onSwitch={() => setScreen('register')}
        onForgotPassword={() => setScreen('forgot-password')}
        onRegistered={() => setScreen('check-email')}
      />
    );
  }

  if (screen === 'forgot-password') {
    return (
      <AuthForgotPasswordScreen
        onBack={() => setScreen('login')}
      />
    );
  }

  if (screen === 'register') {
    return (
      <AuthFormScreen
        mode="register"
        onBack={() => setScreen(demoAuthFlow ? 'softuni-demo' : 'welcome')}
        onSwitch={() => setScreen('login')}
        onRegistered={() => setScreen('check-email')}
      />
    );
  }

  if (screen === 'check-email') {
    return <AuthCheckEmailScreen onLogin={() => setScreen('login')} />;
  }

  return (
    <AuthWelcomeScreen
      onLogin={() => { setDemoAuthFlow(false); setScreen('login'); }}
      onRegister={() => { setDemoAuthFlow(false); setScreen('register'); }}
      onContinueGuest={onContinueGuest}
      onAboutUSG={() => setScreen('about-usg')}
      onSoftUniDemo={() => setScreen('softuni-demo')}
    />
  );
}
