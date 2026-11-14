import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
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

import USGBackToTop from '../components/USGBackToTop';
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
  const authPresentation = {
    bg: {
      login: 'Добре дошъл обратно',
      register: 'Стани част от USG Corso',
      loginSubtitle: 'Твоето лично пространство за Cane Corso те очаква.',
      registerSubtitle: 'Създай профил и открий общността на USG.',
    },
    en: {
      login: 'Welcome back',
      register: 'Join USG Corso',
      loginSubtitle: 'Your personal Cane Corso space is waiting.',
      registerSubtitle: 'Create your profile and discover the USG community.',
    },
    it: {
      login: 'Bentornato',
      register: 'Entra in USG Corso',
      loginSubtitle: 'Il tuo spazio dedicato al Cane Corso ti aspetta.',
      registerSubtitle: 'Crea il profilo e scopri la comunità USG.',
    },
  }[language] || {
    login: 'Welcome back',
    register: 'Join USG Corso',
    loginSubtitle: 'Your personal Cane Corso space is waiting.',
    registerSubtitle: 'Create your profile and discover the USG community.',
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmInputRef = useRef(null);
  const focusedInputRef = useRef(null);
  const scrollOffsetRef = useRef(0);
  const keyboardTopRef = useRef(null);
  const focusScrollTimerRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  function revealFocusedInput() {
    if (Platform.OS !== 'android' || keyboardTopRef.current === null) {
      return;
    }

    focusedInputRef.current?.measureInWindow?.((x, y, width, height) => {
      if (y <= 0 || height <= 0) {
        return;
      }

      const overlap = y + height + 28 - keyboardTopRef.current;
      if (overlap > 0) {
        scrollRef.current?.scrollTo({
          y: Math.max(0, scrollOffsetRef.current + overlap),
          animated: true,
        });
      }
    });
  }

  function handleInputFocus(ref) {
    if (Platform.OS !== 'android') {
      return;
    }

    focusedInputRef.current = ref.current;
    if (focusScrollTimerRef.current) {
      clearTimeout(focusScrollTimerRef.current);
    }
    focusScrollTimerRef.current = setTimeout(revealFocusedInput, 320);
  }

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const shown = Keyboard.addListener('keyboardDidShow', (event) => {
      keyboardTopRef.current = event.endCoordinates.screenY;
      setKeyboardHeight(event.endCoordinates.height);
      if (focusScrollTimerRef.current) {
        clearTimeout(focusScrollTimerRef.current);
      }
      focusScrollTimerRef.current = setTimeout(revealFocusedInput, 120);
    });
    const hidden = Keyboard.addListener('keyboardDidHide', () => {
      keyboardTopRef.current = null;
      setKeyboardHeight(0);
    });
    return () => {
      shown.remove();
      hidden.remove();
      if (focusScrollTimerRef.current) {
        clearTimeout(focusScrollTimerRef.current);
      }
    };
  }, []);

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
      scrollRef.current?.scrollTo({ y: 0, animated: true });
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
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardHeight > 0 && {
              justifyContent: 'flex-start',
              paddingBottom: keyboardHeight + 48,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          onScroll={(event) => {
            scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
            const visible = event.nativeEvent.contentOffset.y > 180;
            setShowBackToTop((current) => current === visible ? current : visible);
          }}
          scrollEventThrottle={16}
        >
          <AuthLanguageSelector />

          <View style={styles.card}>
            <Pressable onPress={onBack} disabled={submitting}>
              <Text style={styles.backText}>{"←  "}{copy.back}</Text>
            </Pressable>

            <Image source={require("../../assets/usg-auth-crest.png")} style={[styles.crest, isRegister && styles.crestCompact]} accessible accessibilityLabel="USG Unico Suo Genere" />
            <Text style={styles.brand}>{copy.brand}</Text>
            <Text style={styles.title}>
              {isRegister ? authPresentation.register : authPresentation.login}
            </Text>
            <Text style={styles.subtitle}>
              {isRegister ? authPresentation.registerSubtitle : authPresentation.loginSubtitle}
            </Text>
            <View style={styles.heroDivider} />

            <Text style={styles.label}>{copy.email}</Text>
            <TextInput
              value={email}
              ref={emailInputRef}
              onFocus={() => handleInputFocus(emailInputRef)}
              onChangeText={(value) => {
                setEmail(value);
                setErrors((current) => ({
                  ...current,
                  email: value.trim() && !isEmailValid(value) ? copy.emailInvalid : '',
                }));
                setServerError('');
              }}
              onBlur={() => {
                setErrors((current) => ({
                  ...current,
                  email: !email.trim()
                    ? copy.emailRequired
                    : !isEmailValid(email) ? copy.emailInvalid : '',
                }));
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
                ref={passwordInputRef}
                onFocus={() => { setPasswordFocused(true); handleInputFocus(passwordInputRef); }}
                onBlur={() => setPasswordFocused(false)}
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
                {(((passwordFocused || password.length > 0) && !isPasswordValid(password)) || Boolean(errors.password)) ? (
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
                ) : null}

                <Text style={styles.label}>{copy.confirmPassword}</Text>
                <View
                  style={[
                    styles.passwordRow,
                    errors.confirmPassword && styles.inputError,
                  ]}
                >
                  <TextInput
                    value={confirmPassword}
                    ref={confirmInputRef}
                    onFocus={() => handleInputFocus(confirmInputRef)}
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
      <USGBackToTop
        visible={showBackToTop}
        language={language}
        bottomOffset={88}
        onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
      />
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
    marginTop: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 6,
  },
  text: {
    flex: 1,
    fontSize: 10,
    lineHeight: 13,
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
      paddingVertical: 18,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    backText: {
      color: colors.goldSoft,
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 12,
    },
    crest: {
      width: 92,
      height: 92,
      resizeMode: 'contain',
      alignSelf: 'center',
      marginBottom: 8,
    },
    crestCompact: {
      width: 78,
      height: 78,
      marginBottom: 6,
    },
    brand: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 3.5,
      textAlign: 'center',
      marginBottom: 8,
    },
    title: {
      color: colors.text,
      fontSize: 25,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      marginBottom: 14,
      paddingHorizontal: 8,
    },
    heroDivider: {
      width: 48,
      height: 2,
      backgroundColor: colors.gold,
      borderRadius: 1,
      alignSelf: 'center',
      marginBottom: 8,
    },
    label: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 10,
      marginBottom: 6,
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
      paddingHorizontal: 10,
      paddingVertical: 7,
      marginTop: 8,
    },
    rulesTitle: {
      color: colors.textSoft,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
      marginBottom: 1,
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
    },
    primaryButton: {
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
      marginTop: 16,
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
