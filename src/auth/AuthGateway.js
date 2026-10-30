import { useState } from 'react';

import AuthCheckEmailScreen from './AuthCheckEmailScreen';
import AuthForgotPasswordScreen from './AuthForgotPasswordScreen';
import AuthFormScreen from './AuthFormScreen';
import AuthWelcomeScreen from './AuthWelcomeScreen';

export default function AuthGateway({ onContinueGuest }) {
  const [screen, setScreen] = useState('welcome');

  if (screen === 'login') {
    return (
      <AuthFormScreen
        mode="login"
        onBack={() => setScreen('welcome')}
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
        onBack={() => setScreen('welcome')}
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
      onLogin={() => setScreen('login')}
      onRegister={() => setScreen('register')}
      onContinueGuest={onContinueGuest}
    />
  );
}
