import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';

import USGProgressBar from '../components/USGProgressBar';
import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from './AuthContext';
import AuthLanguageSelector from './AuthLanguageSelector';
import { isEmailValid } from './authValidation';

const copy = {
  bg: {
    back: '← НАЗАД',
    brand: 'USG CORSO',
    title: 'Забравена парола',
    text: 'Въведи имейла на акаунта си. Ще получиш линк за задаване на нова парола.',
    email: 'Имейл',
    emailRequired: 'Въведи имейл адрес.',
    emailInvalid: 'Въведи валиден имейл адрес.',
    send: 'ИЗПРАТИ ЛИНК',
    sending: 'Изпращаме recovery email…',
    sentTitle: 'Провери имейла си',
    sentText: 'Ако има акаунт с този имейл, ще получиш линк за възстановяване на паролата.',
    resend: 'ИЗПРАТИ ОТНОВО',
    error: 'Линкът не можа да бъде изпратен. Опитай отново.',
  },
  en: {
    back: '← BACK',
    brand: 'USG CORSO',
    title: 'Forgot password',
    text: 'Enter your account email. We will send you a link to set a new password.',
    email: 'Email',
    emailRequired: 'Enter your email address.',
    emailInvalid: 'Enter a valid email address.',
    send: 'SEND RESET LINK',
    sending: 'Sending recovery email…',
    sentTitle: 'Check your email',
    sentText: 'If an account exists for this email, you will receive a password recovery link.',
    resend: 'SEND AGAIN',
    error: 'The recovery link could not be sent. Try again.',
  },
  it: {
    back: '← INDIETRO',
    brand: 'USG CORSO',
    title: 'Password dimenticata',
    text: 'Inserisci l’email del tuo account. Riceverai un link per impostare una nuova password.',
    email: 'Email',
    emailRequired: 'Inserisci il tuo indirizzo email.',
    emailInvalid: 'Inserisci un indirizzo email valido.',
    send: 'INVIA LINK',
    sending: 'Invio email di recupero…',
    sentTitle: 'Controlla la tua email',
    sentText: 'Se esiste un account con questa email, riceverai un link per recuperare la password.',
    resend: 'INVIA DI NUOVO',
    error: 'Impossibile inviare il link di recupero. Riprova.',
  },
};

export default function AuthForgotPasswordScreen({ onBack }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const { requestPasswordReset } = useAuth();
  const labels = copy[language] ?? copy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setFieldError(labels.emailRequired);
      return;
    }

    if (!isEmailValid(cleanEmail)) {
      setFieldError(labels.emailInvalid);
      return;
    }

    setFieldError('');
    setRequestError('');
    setSubmitting(true);

    try {
      const redirectTo = Linking.createURL('reset-password');
      const { error } = await requestPasswordReset(cleanEmail, redirectTo);

      if (error) {
        setRequestError(labels.error);
        return;
      }

      setSent(true);
    } catch {
      setRequestError(labels.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <AuthLanguageSelector />

          <View style={styles.card}>
            <Pressable onPress={onBack} disabled={submitting}>
              <Text style={styles.back}>{labels.back}</Text>
            </Pressable>

            <Text style={styles.brand}>{labels.brand}</Text>
            <Text style={styles.title}>{labels.title}</Text>

            {sent ? (
              <>
                <Text style={styles.successTitle}>{labels.sentTitle}</Text>
                <Text style={styles.text}>{labels.sentText}</Text>
                {submitting ? (
                  <USGProgressBar label={labels.sending} />
                ) : (
                  <Pressable style={styles.primaryButton} onPress={handleSend}>
                    <Text style={styles.primaryText}>{labels.resend}</Text>
                  </Pressable>
                )}
                <Pressable style={styles.secondaryButton} onPress={onBack} disabled={submitting}>
                  <Text style={styles.secondaryText}>{labels.back}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.text}>{labels.text}</Text>

                <Text style={styles.label}>{labels.email}</Text>
                <TextInput
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setFieldError('');
                    setRequestError('');
                  }}
                  style={[styles.input, fieldError && styles.inputError]}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!submitting}
                />

                {fieldError ? (
                  <Text style={styles.error}>{fieldError}</Text>
                ) : null}

                {requestError ? (
                  <Text style={styles.error}>{requestError}</Text>
                ) : null}

                {submitting ? (
                  <USGProgressBar label={labels.sending} />
                ) : (
                  <Pressable style={styles.primaryButton} onPress={handleSend}>
                    <Text style={styles.primaryText}>{labels.send}</Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'flex-start',
      padding: spacing.md,
      paddingTop: 24,
      paddingBottom: 220,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 24,
    },
    back: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '700',
      marginBottom: 16,
    },
    brand: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 3,
      textAlign: 'center',
      marginBottom: 10,
    },
    title: {
      color: colors.text,
      fontSize: 27,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 16,
    },
    text: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 20,
      textAlign: 'center',
      marginBottom: 20,
    },
    successTitle: {
      color: colors.gold,
      fontSize: 17,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 10,
    },
    label: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 8,
    },
    input: {
      minHeight: 48,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      color: colors.text,
      paddingHorizontal: 14,
      fontSize: 14,
    },
    inputError: {
      borderColor: '#b85c5c',
    },
    error: {
      color: '#d97b7b',
      fontSize: 11,
      lineHeight: 16,
      marginTop: 7,
      textAlign: 'center',
    },
    primaryButton: {
      minHeight: 50,
      borderRadius: radius.md,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 22,
    },
    primaryText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
    },
    secondaryButton: {
      minHeight: 48,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    secondaryText: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '800',
    },
  });
}
