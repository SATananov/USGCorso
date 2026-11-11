import { useState } from 'react';

import AuthAboutUSGScreen from './AuthAboutUSGScreen';
import AuthCheckEmailScreen from './AuthCheckEmailScreen';
import AuthForgotPasswordScreen from './AuthForgotPasswordScreen';
import AuthFormScreen from './AuthFormScreen';
import AuthWelcomeScreen from './AuthWelcomeScreen';
import AuthSoftUniDemoScreen from './AuthSoftUniDemoScreen';

export default function AuthGateway({ onContinueGuest, onOpenDemoKnowledge, initialScreen = 'welcome', onDemoLogin, onOpenDemoFeature, onCancelDemoFeature, onSetDemoContext }) {
  const [screen, setScreen] = useState(initialScreen);
  const [demoAuthFlow, setDemoAuthFlow] = useState(false);

  if (screen === 'softuni-demo') {
    return (
      <AuthSoftUniDemoScreen
        onBack={() => { onCancelDemoFeature?.(); onSetDemoContext?.(false); setScreen('welcome'); }}
        onLogin={() => { onCancelDemoFeature?.(); onDemoLogin?.(); setDemoAuthFlow(true); setScreen('login'); }}
        onOpenKnowledge={onOpenDemoKnowledge}
        onOpenFeature={(destination) => {
          onOpenDemoFeature?.(destination);
          setDemoAuthFlow(true);
          setScreen('login');
        }}
        onOpenAuthLogin={() => { onCancelDemoFeature?.(); setDemoAuthFlow(true); setScreen('login'); }}
        onOpenAuthRegister={() => { onCancelDemoFeature?.(); setDemoAuthFlow(true); setScreen('register'); }}
      />
    );
  }

  if (screen === 'about-usg') {
    return (
      <AuthAboutUSGScreen
        onBack={() => setScreen('welcome')}
        onContinueGuest={() => { onCancelDemoFeature?.(); onContinueGuest?.(); }}
      />
    );
  }

  if (screen === 'login') {
    return (
      <AuthFormScreen
        mode="login"
        onBack={() => { onCancelDemoFeature?.(); setScreen(demoAuthFlow ? 'softuni-demo' : 'welcome'); }}
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
        onBack={() => { onCancelDemoFeature?.(); setScreen(demoAuthFlow ? 'softuni-demo' : 'welcome'); }}
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
      onLogin={() => { onCancelDemoFeature?.(); onSetDemoContext?.(false); setDemoAuthFlow(false); setScreen('login'); }}
      onRegister={() => { onCancelDemoFeature?.(); onSetDemoContext?.(false); setDemoAuthFlow(false); setScreen('register'); }}
      onContinueGuest={() => { onCancelDemoFeature?.(); onContinueGuest?.(); }}
      onAboutUSG={() => setScreen('about-usg')}
      onSoftUniDemo={() => { onSetDemoContext?.(true); setScreen('softuni-demo'); }}
    />
  );
}
