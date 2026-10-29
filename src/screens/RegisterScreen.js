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
import { getPasswordRules, validateRegister } from '../auth/authValidation';
import USGProgress from '../components/USGProgress';
import { useLanguage } from '../i18n/LanguageContext';
import { getAuthText } from '../i18n/authText';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

function getAuthErrorKey(error) {
  const code = error?.code ?? '';
  const message = error?.message?.toLowerCase() ?? '';

  if (code === 'email_exists' || message.includes('already registered') || message.includes('already exists')) {
    return 'emailExists';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'networkError';
  }

  return 'unexpectedError';
}

export default function RegisterScreen({ navigation }) {
  const { language } = useLanguage();
  const copy = getAuthText(language);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const rules = getPasswordRules(password);

  async function handleRegister() {
    const nextErrors = validateRegister(email, password, confirmPassword);
    setErrors(nextErrors);
    setRequestError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        setRequestError(getAuthErrorKey(error));
        return;
      }

      setSuccess(data?.session ? 'created' : 'confirm');
    } catch {
      setRequestError('networkError');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.successContent}>
          <View style={styles.card}>
            <Text style={styles.kicker}>USG CORSO</Text>
            <Text style={styles.title}>
              {success === 'confirm' ? copy.checkEmailTitle : copy.accountCreatedTitle}
            </Text>
            <Text style={styles.subtitle}>
              {success === 'confirm' ? copy.checkEmailText : copy.accountCreatedText}
            </Text>
            <Pressable style={styles.primaryButton} onPress={() => navigation.replace('Login')}>
              <Text style={styles.primaryButtonText}>{copy.backToLogin}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
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
        >
          <View style={styles.card}>
            <Text style={styles.kicker}>USG CORSO</Text>
            <Text style={styles.title}>{copy.registerTitle}</Text>
            <Text style={styles.subtitle}>{copy.registerSubtitle}</Text>

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
                  textContentType="newPassword"
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

            <View style={styles.rulesBox}>
              <Text style={styles.rulesTitle}>{copy.passwordRequirements}</Text>
              <Rule passed={rules.length} text={copy.ruleLength} styles={styles} />
              <Rule passed={rules.uppercase} text={copy.ruleUppercase} styles={styles} />
              <Rule passed={rules.lowercase} text={copy.ruleLowercase} styles={styles} />
              <Rule passed={rules.number} text={copy.ruleNumber} styles={styles} />
              <Rule passed={rules.special} text={copy.ruleSpecial} styles={styles} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{copy.confirmPassword}</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    setErrors((current) => ({ ...current, confirmPassword: undefined }));
                  }}
                  secureTextEntry={!showConfirmPassword}
                  textContentType="newPassword"
                  editable={!submitting}
                  style={styles.passwordInput}
                  placeholder={copy.confirmPassword}
                  placeholderTextColor={colors.textMuted}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword((value) => !value)}
                  disabled={submitting}
                  style={styles.showButton}
                >
                  <Text style={styles.showText}>{showConfirmPassword ? copy.hide : copy.show}</Text>
                </Pressable>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.error}>{copy[errors.confirmPassword]}</Text>
              )}
            </View>

            {requestError && <Text style={styles.requestError}>{copy[requestError]}</Text>}

            {submitting ? (
              <USGProgress text={copy.registering} />
            ) : (
              <Pressable style={styles.primaryButton} onPress={handleRegister}>
                <Text style={styles.primaryButtonText}>{copy.registerAction}</Text>
              </Pressable>
            )}

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>{copy.haveAccount}</Text>
              <Pressable onPress={() => navigation.replace('Login')} disabled={submitting}>
                <Text style={styles.switchLink}>{copy.loginAction}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Rule({ passed, text, styles }) {
  return (
    <Text style={[styles.rule, passed && styles.rulePassed]}>
      {passed ? '✓' : '•'} {text}
    </Text>
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
    successContent: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.md,
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
    rulesBox: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceSoft,
      padding: 12,
      marginTop: -4,
      marginBottom: 16,
    },
    rulesTitle: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 8,
    },
    rule: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 20,
    },
    rulePassed: {
      color: colors.gold,
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
