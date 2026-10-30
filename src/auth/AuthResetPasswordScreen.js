import { useEffect, useMemo, useState } from 'react';
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
import {
  isEmailValid,
  isPasswordValid,
} from './authValidation';

const copy = {
  bg: {
    back: '← НАЗАД',
    brand: 'USG CORSO',
    title: 'Нова парола',
    preparing: 'Проверяваме recovery линка…',
    invalid: 'Recovery линкът е невалиден или е изтекъл. Поискай нов линк директно оттук.',
    email: 'Имейл',
    emailRequired: 'Въведи имейл адрес.',
    emailInvalid: 'Въведи валиден имейл адрес.',
    resend: 'ИЗПРАТИ НОВ ЛИНК',
    resending: 'Изпращаме нов recovery email…',
    resent: 'Нов recovery линк е изпратен. Провери Inbox и Junk/Spam.',
    resendError: 'Новият recovery линк не можа да бъде изпратен. Опитай отново.',
    password: 'Нова парола',
    confirm: 'Потвърди новата парола',
    mismatch: 'Паролите не съвпадат.',
    invalidPassword: 'Новата парола не изпълнява всички изисквания.',
    save: 'ЗАПАЗИ НОВАТА ПАРОЛА',
    saving: 'Запазваме новата парола…',
    success: 'Паролата е променена успешно.',
    error: 'Паролата не можа да бъде променена. Опитай отново.',
    done: 'КЪМ ВХОД',
    rules: 'Използвай поне 6 символа, главна и малка буква, цифра и специален символ.',
  },
  en: {
    back: '← BACK',
    brand: 'USG CORSO',
    title: 'New password',
    preparing: 'Checking the recovery link…',
    invalid: 'The recovery link is invalid or expired. Request a new link directly from this screen.',
    email: 'Email',
    emailRequired: 'Enter your email address.',
    emailInvalid: 'Enter a valid email address.',
    resend: 'SEND NEW LINK',
    resending: 'Sending a new recovery email…',
    resent: 'A new recovery link was sent. Check Inbox and Junk/Spam.',
    resendError: 'The new recovery link could not be sent. Try again.',
    password: 'New password',
    confirm: 'Confirm new password',
    mismatch: 'The passwords do not match.',
    invalidPassword: 'The new password does not meet all requirements.',
    save: 'SAVE NEW PASSWORD',
    saving: 'Saving your new password…',
    success: 'Your password was changed successfully.',
    error: 'The password could not be changed. Try again.',
    done: 'GO TO SIGN IN',
    rules: 'Use at least 6 characters with uppercase, lowercase, number and special character.',
  },
  it: {
    back: '← INDIETRO',
    brand: 'USG CORSO',
    title: 'Nuova password',
    preparing: 'Verifica del link di recupero…',
    invalid: 'Il link di recupero non è valido o è scaduto. Richiedi un nuovo link direttamente da questa schermata.',
    email: 'Email',
    emailRequired: 'Inserisci il tuo indirizzo email.',
    emailInvalid: 'Inserisci un indirizzo email valido.',
    resend: 'INVIA NUOVO LINK',
    resending: 'Invio di una nuova email di recupero…',
    resent: 'È stato inviato un nuovo link di recupero. Controlla Posta in arrivo e Spam.',
    resendError: 'Impossibile inviare il nuovo link di recupero. Riprova.',
    password: 'Nuova password',
    confirm: 'Conferma nuova password',
    mismatch: 'Le password non corrispondono.',
    invalidPassword: 'La nuova password non soddisfa tutti i requisiti.',
    save: 'SALVA NUOVA PASSWORD',
    saving: 'Salvataggio della nuova password…',
    success: 'La password è stata modificata con successo.',
    error: 'Impossibile modificare la password. Riprova.',
    done: 'VAI ALL’ACCESSO',
    rules: 'Usa almeno 6 caratteri con maiuscola, minuscola, numero e carattere speciale.',
  },
};

export default function AuthResetPasswordScreen({ recoveryUrl, onBack, onComplete }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const {
    recoverSessionFromUrl,
    requestPasswordReset,
    updatePassword,
    signOut,
  } = useAuth();
  const labels = copy[language] ?? copy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [preparing, setPreparing] = useState(true);
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [resendError, setResendError] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function prepare() {
      const { error } = await recoverSessionFromUrl(recoveryUrl);

      if (!active) {
        return;
      }

      if (error) {
        setLinkError(labels.invalid);
        setPreparing(false);
        return;
      }

      setReady(true);
      setPreparing(false);
    }

    prepare();

    return () => {
      active = false;
    };
  }, [labels.invalid, recoverSessionFromUrl, recoveryUrl]);

  async function handleResend() {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setEmailError(labels.emailRequired);
      return;
    }

    if (!isEmailValid(cleanEmail)) {
      setEmailError(labels.emailInvalid);
      return;
    }

    setEmailError('');
    setResendError('');
    setResent(false);
    setResending(true);

    try {
      const redirectTo = Linking.createURL('reset-password');
      const { error } = await requestPasswordReset(cleanEmail, redirectTo);

      if (error) {
        setResendError(labels.resendError);
        return;
      }

      setResent(true);
    } catch {
      setResendError(labels.resendError);
    } finally {
      setResending(false);
    }
  }

  async function handleSave() {
    setFormError('');

    if (!isPasswordValid(password)) {
      setFormError(labels.invalidPassword);
      return;
    }

    if (password !== confirmPassword) {
      setFormError(labels.mismatch);
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await updatePassword(password);

      if (error) {
        setFormError(labels.error);
        return;
      }

      setSuccess(true);
    } catch {
      setFormError(labels.error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBack() {
    await signOut();
    onBack();
  }

  async function handleDone() {
    await signOut();
    onComplete();
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
            <Pressable onPress={handleBack} disabled={submitting || resending}>
              <Text style={styles.back}>{labels.back}</Text>
            </Pressable>

            <Text style={styles.brand}>{labels.brand}</Text>
            <Text style={styles.title}>{labels.title}</Text>

            {preparing ? (
              <USGProgressBar label={labels.preparing} />
            ) : null}

            {linkError ? (
              <>
                <Text style={styles.error}>{linkError}</Text>
                <Text style={styles.label}>{labels.email}</Text>
                <TextInput
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setEmailError('');
                    setResendError('');
                    setResent(false);
                  }}
                  style={[styles.input, emailError && styles.inputError]}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!resending}
                />

                {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
                {resendError ? <Text style={styles.error}>{resendError}</Text> : null}
                {resent ? <Text style={styles.success}>{labels.resent}</Text> : null}

                {resending ? (
                  <USGProgressBar label={labels.resending} />
                ) : (
                  <Pressable style={styles.primaryButton} onPress={handleResend}>
                    <Text style={styles.primaryText}>{labels.resend}</Text>
                  </Pressable>
                )}
              </>
            ) : null}

            {ready && !success ? (
              <>
                <Text style={styles.rules}>{labels.rules}</Text>

                <Text style={styles.label}>{labels.password}</Text>
                <TextInput
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setFormError('');
                  }}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                />

                <Text style={styles.label}>{labels.confirm}</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    setFormError('');
                  }}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                />

                {formError ? <Text style={styles.error}>{formError}</Text> : null}

                {submitting ? (
                  <USGProgressBar label={labels.saving} />
                ) : (
                  <Pressable style={styles.primaryButton} onPress={handleSave}>
                    <Text style={styles.primaryText}>{labels.save}</Text>
                  </Pressable>
                )}
              </>
            ) : null}

            {success ? (
              <>
                <Text style={styles.success}>{labels.success}</Text>
                <Pressable style={styles.primaryButton} onPress={handleDone}>
                  <Text style={styles.primaryText}>{labels.done}</Text>
                </Pressable>
              </>
            ) : null}
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
      marginBottom: 18,
    },
    rules: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 17,
      textAlign: 'center',
      marginBottom: 10,
    },
    label: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 14,
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
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      marginTop: 12,
    },
    success: {
      color: colors.gold,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 20,
      textAlign: 'center',
      marginTop: 14,
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
  });
}
