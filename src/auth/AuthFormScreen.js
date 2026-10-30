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

import USGProgressBar from '../components/USGProgressBar';
import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from './AuthContext';
import { authCopy } from './authCopy';
import { getAuthErrorKey } from './authErrors';
import AuthLanguageSelector from './AuthLanguageSelector';
import {
  getPasswordRules,
  isEmailValid,
  isPasswordValid,
} from './authValidation';

export default function AuthFormScreen({ mode, onBack, onSwitch, onForgotPassword, onRegistered }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const { signIn, signUp } = useAuth();
  const copy = authCopy[language] ?? authCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isRegister = mode === 'register';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordRules = getPasswordRules(password);

  function validate() {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = copy.emailRequired;
    } else if (!isEmailValid(email)) {
      nextErrors.email = copy.emailInvalid;
    }

    if (!password) {
      nextErrors.password = copy.passwordRequired;
    } else if (isRegister && !isPasswordValid(password)) {
      nextErrors.password = copy.passwordInvalid;
    }

    if (isRegister) {
      if (!confirmPassword) {
        nextErrors.confirmPassword = copy.confirmRequired;
      } else if (password !== confirmPassword) {
        nextErrors.confirmPassword = copy.passwordMismatch;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    setServerError('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      if (isRegister) {
        const { data, error } = await signUp(email, password);

        if (error) {
          setServerError(copy[getAuthErrorKey(error)]);
          return;
        }

        if (
          data?.user &&
          Array.isArray(data.user.identities) &&
          data.user.identities.length === 0
        ) {
          setServerError(copy.emailExists);
          return;
        }

        if (!data?.session) {
          onRegistered();
        }
      } else {
        const { error } = await signIn(email, password);

        if (error) {
          setServerError(copy[getAuthErrorKey(error)]);
        }
      }
    } catch {
      setServerError(copy.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <AuthLanguageSelector />

          <View style={styles.card}>
            <Pressable onPress={onBack} disabled={submitting}>
              <Text style={styles.backText}>{copy.back}</Text>
            </Pressable>

            <Text style={styles.brand}>{copy.brand}</Text>
            <Text style={styles.title}>
              {isRegister ? copy.registerTitle : copy.loginTitle}
            </Text>

            <Text style={styles.label}>{copy.email}</Text>
            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setErrors((current) => ({ ...current, email: '' }));
                setServerError('');
              }}
              style={[styles.input, errors.email && styles.inputError]}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!submitting}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            <Text style={styles.label}>{copy.password}</Text>
            <View style={[styles.passwordRow, errors.password && styles.inputError]}>
              <TextInput
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setErrors((current) => ({ ...current, password: '' }));
                  setServerError('');
                }}
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!submitting}
              />
              <Pressable
                onPress={() => setShowPassword((current) => !current)}
                style={styles.eyeButton}
              >
                <PasswordEye visible={showPassword} colors={colors} />
              </Pressable>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            {!isRegister && onForgotPassword ? (
              <Pressable
                style={styles.forgotButton}
                onPress={onForgotPassword}
                disabled={submitting}
              >
                <Text style={styles.forgotText}>
                  {language === 'bg'
                    ? '\u0417\u0430\u0431\u0440\u0430\u0432\u0435\u043d\u0430 \u043f\u0430\u0440\u043e\u043b\u0430?'
                    : language === 'it'
                      ? 'Password dimenticata?'
                      : 'Forgot password?'}
                </Text>
              </Pressable>
            ) : null}
            {isRegister ? (
              <>
                <View style={styles.rulesBox}>
                  {passwordRules.length &&
                  passwordRules.uppercase &&
                  passwordRules.lowercase &&
                  passwordRules.number &&
                  passwordRules.special ? (
                    <View style={styles.rulesSuccessRow}>
                      <View
                        style={[
                          styles.ruleSuccessDot,
                          { backgroundColor: colors.gold },
                        ]}
                      />
                      <Text style={styles.rulesSuccessText}>
                        {copy.passwordStrong}
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.rulesTitle}>
                        {copy.passwordRulesTitle}
                      </Text>

                      <View style={styles.rulesGrid}>
                        <RuleRow
                          active={passwordRules.length}
                          text={copy.passwordLength}
                          colors={colors}
                        />
                        <RuleRow
                          active={passwordRules.uppercase}
                          text={copy.passwordUppercase}
                          colors={colors}
                        />
                        <RuleRow
                          active={passwordRules.lowercase}
                          text={copy.passwordLowercase}
                          colors={colors}
                        />
                        <RuleRow
                          active={passwordRules.number}
                          text={copy.passwordNumber}
                          colors={colors}
                        />
                        <RuleRow
                          active={passwordRules.special}
                          text={copy.passwordSpecial}
                          colors={colors}
                        />
                      </View>
                    </>
                  )}
                </View>

                <Text style={styles.label}>{copy.confirmPassword}</Text>
                <View
                  style={[
                    styles.passwordRow,
                    errors.confirmPassword && styles.inputError,
                  ]}
                >
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(value) => {
                      setConfirmPassword(value);
                      setErrors((current) => ({
                        ...current,
                        confirmPassword: '',
                      }));
                      setServerError('');
                    }}
                    style={styles.passwordInput}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!submitting}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword((current) => !current)}
                    style={styles.eyeButton}
                  >
                    <PasswordEye
                      visible={showConfirmPassword}
                      colors={colors}
                    />
                  </Pressable>
                </View>
                {errors.confirmPassword ? (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </>
            ) : null}

            {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

            {submitting ? (
              <USGProgressBar
                label={isRegister ? copy.creatingAccount : copy.signingIn}
              />
            ) : (
              <Pressable style={styles.primaryButton} onPress={handleSubmit}>
                <Text style={styles.primaryText}>
                  {isRegister ? copy.createAccount : copy.signIn}
                </Text>
              </Pressable>
            )}

            <View style={styles.switchRow}>
              <Text style={styles.switchPrompt}>
                {isRegister ? copy.haveAccount : copy.noAccount}
              </Text>
              <Pressable onPress={onSwitch} disabled={submitting}>
                <Text style={styles.switchAction}>
                  {isRegister ? copy.signIn : copy.createAccount}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PasswordEye({ visible, colors }) {
  return (
    <View style={stylesForEye.wrap}>
      <View
        style={[
          stylesForEye.eye,
          {
            borderColor: colors.gold,
          },
        ]}
      >
        <View
          style={[
            stylesForEye.pupil,
            {
              backgroundColor: colors.gold,
            },
          ]}
        />
      </View>

      {!visible ? (
        <View
          style={[
            stylesForEye.slash,
            {
              backgroundColor: colors.gold,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const stylesForEye = StyleSheet.create({
  wrap: {
    width: 28,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    width: 22,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scaleY: 0.78 }],
  },
  pupil: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  slash: {
    position: 'absolute',
    width: 27,
    height: 1.5,
    borderRadius: 1,
    transform: [{ rotate: '-42deg' }],
  },
});

function RuleRow({ active, text, colors }) {
  return (
    <View style={stylesForRule.row}>
      <View
        style={[
          stylesForRule.dot,
          {
            borderColor: active ? colors.gold : colors.textMuted,
            backgroundColor: active ? colors.gold : 'transparent',
          },
        ]}
      />
      <Text
        style={[
          stylesForRule.text,
          {
            color: active ? colors.text : colors.textMuted,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const stylesForRule = StyleSheet.create({
  row: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 7,
  },
  text: {
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
  },
});

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.md,
      paddingVertical: 28,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 24,
    },
    backText: {
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
      marginBottom: 24,
    },
    label: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 12,
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
    passwordRow: {
      minHeight: 48,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 14,
      paddingRight: 12,
    },
    passwordInput: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      paddingVertical: 12,
    },
    eyeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 6,
    },
    inputError: {
      borderColor: '#b85c5c',
    },
    errorText: {
      color: '#d97b7b',
      fontSize: 11,
      lineHeight: 16,
      marginTop: 6,
    },
    serverError: {
      color: '#d97b7b',
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      marginTop: 18,
    },
    rulesBox: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: 12,
      paddingVertical: 9,
      marginTop: 10,
    },
    rulesTitle: {
      color: colors.textSoft,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
      marginBottom: 2,
    },
    rulesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    rulesSuccessRow: {
      minHeight: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ruleSuccessDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    rulesSuccessText: {
      color: colors.gold,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
    },
    forgotButton: {
      alignSelf: 'flex-end',
      paddingVertical: 8,
      marginTop: 2,
    },
    forgotText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '700',
    },    primaryButton: {
      minHeight: 50,
      borderRadius: radius.md,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      marginTop: 22,
    },
    primaryText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
    },
    switchRow: {
      alignItems: 'center',
      marginTop: 22,
    },
    switchPrompt: {
      color: colors.textMuted,
      fontSize: 11,
      marginBottom: 8,
    },
    switchAction: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '800',
    },
  });
}
