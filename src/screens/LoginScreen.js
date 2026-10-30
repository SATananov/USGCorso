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
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import { validateLogin } from '../auth/authValidation';
import USGProgress from '../components/USGProgress';
import { useLanguage } from '../i18n/LanguageContext';
import { getAuthText } from '../i18n/authText';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

function getAuthErrorKey(error) {
  const code = error?.code ?? '';
  const message = error?.message?.toLowerCase() ?? '';

  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return 'emailNotConfirmed';
  }

  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return 'invalidCredentials';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'networkError';
  }

  return 'unexpectedError';
}

export default function LoginScreen({ navigation }) {
  const { language } = useLanguage();
  const copy = getAuthText(language);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    const nextErrors = validateLogin(email, password);
    setErrors(nextErrors);
    setRequestError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setRequestError(getAuthErrorKey(error));
        return;
      }

      navigation.goBack();
    } catch {
      setRequestError('networkError');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <View style={styles.card}>
            <Text style={styles.kicker}>USG CORSO</Text>
            <Text style={styles.title}>{copy.loginTitle}</Text>
            <Text style={styles.subtitle}>{copy.loginSubtitle}</Text>

            <View style={styles.field}>
              <Text style={styles.label}>{copy.email}</Text>
              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setErrors((current) => ({ ...current, email: undefined }));
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                editable={!submitting}
                style={styles.input}
                placeholder={copy.email}
                placeholderTextColor={colors.textMuted}
              />
              {errors.email && <Text style={styles.error}>{copy[errors.email]}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{copy.password}</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setErrors((current) => ({ ...current, password: undefined }));
                  }}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  editable={!submitting}
                  style={styles.passwordInput}
                  placeholder={copy.password}
                  placeholderTextColor={colors.textMuted}
                />
                <Pressable
                  onPress={() => setShowPassword((value) => !value)}
                  disabled={submitting}
                  style={styles.showButton}
                >
                  <Text style={styles.showText}>{showPassword ? copy.hide : copy.show}</Text>
                </Pressable>
              </View>
              {errors.password && <Text style={styles.error}>{copy[errors.password]}</Text>}
            </View>

            {requestError && <Text style={styles.requestError}>{copy[requestError]}</Text>}

            {submitting ? (
              <USGProgress text={copy.loggingIn} />
            ) : (
              <Pressable style={styles.primaryButton} onPress={handleLogin}>
                <Text style={styles.primaryButtonText}>{copy.loginAction}</Text>
              </Pressable>
            )}

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>{copy.noAccount}</Text>
              <Pressable onPress={() => navigation.replace('Register')} disabled={submitting}>
                <Text style={styles.switchLink}>{copy.registerAction}</Text>
              </Pressable>
            </View>
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
      justifyContent: 'center',
      padding: spacing.md,
      paddingVertical: spacing.lg,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 24,
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 3,
      textAlign: 'center',
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 10,
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 20,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 22,
    },
    field: {
      marginBottom: 16,
    },
    label: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 7,
    },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceSoft,
      color: colors.text,
      paddingHorizontal: 14,
      fontSize: 14,
    },
    passwordRow: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceSoft,
    },
    passwordInput: {
      flex: 1,
      minHeight: 48,
      color: colors.text,
      paddingHorizontal: 14,
      fontSize: 14,
    },
    showButton: {
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    showText: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '700',
    },
    error: {
      color: '#d96565',
      fontSize: 12,
      lineHeight: 18,
      marginTop: 6,
    },
    requestError: {
      color: '#d96565',
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      marginBottom: 4,
    },
    primaryButton: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: colors.gold,
      marginTop: 14,
    },
    primaryButtonText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: '800',
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 22,
    },
    switchText: {
      color: colors.textSoft,
      fontSize: 13,
    },
    switchLink: {
      color: colors.gold,
      fontSize: 13,
      fontWeight: '700',
    },
  });
}
