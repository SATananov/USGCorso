import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppControls } from '../app/AppControlContext';
import { requestHeaderPanel } from '../app/headerPanelRequest';
import { deleteMyAccount } from '../account/accountDeleteService';
import { accountSettingsCopy, formatMemberSince } from '../account/accountSettingsCopy';
import { adminCopy } from '../admin/adminCopy';
import { getMyRole } from '../admin/adminService';
import { accountCopy } from '../auth/accountCopy';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase } from '../lib/supabase';
import { getAvatarPreset } from '../profile/avatarPresets';
import { profileCopy } from '../profile/profileCopy';
import { getMyProfile } from '../profile/profileService';
import { useTheme } from '../theme/ThemeContext';
import USGProgressBar from './USGProgressBar';

const RESET_KEYS = [
  '@usgcorso/language',
  '@usgcorso/theme',
  '@usgcorso/notification-preferences',
  '@usgcorso/privacy-preferences',
];

const copy = {
  en: {
    settingsTitle: 'Settings',
    accountTitle: 'Account',
    open: 'OPEN',
    theme: 'Theme',
    language: 'Language',
    notifications: 'Notifications',
    privacy: 'Privacy',
    profile: 'My profile',
    legal: 'Legal information',
    help: 'Help and support',
    replayIntro: 'Replay introduction',
    reset: 'Reset preferences',
    dark: 'Dark',
    light: 'Light',
    themeHint: 'Choose the visual theme of the application.',
    languageHint: 'Choose the language used across USG Corso.',
    replayHint: 'Open the USG introduction again.',
    resetHint: 'Restore local preferences to their default values.',
    accountStatus: 'Account active',
    accountEmail: 'Email',
    profileHint: 'View your profile details here without leaving the current page.',
    accountDetails: 'Account settings',
    accountDetailsHint: 'View the current signed-in account.',
    editProfile: 'Edit profile',
    editProfileHint: 'Avatar, name, country and city come in PROFILE 01.',
    signOut: 'Sign out',
    signOutHint: 'End the current session on this device.',
    guestTitle: 'Guest mode',
    guestHint: 'You are browsing the public part without an account.',
    close: 'Close',
    resetTitle: 'Reset preferences?',
    resetMessage: 'Language, theme, notifications and privacy preferences will return to defaults.',
    cancel: 'Cancel',
    resetAction: 'Reset',
    resetDone: 'Preferences were reset.',
    resetError: 'Preferences could not be reset.',
  },
  bg: {
    settingsTitle: 'Настройки',
    accountTitle: 'Профил',
    open: 'ОТВОРИ',
    theme: 'Тема',
    language: 'Език',
    notifications: 'Известия',
    privacy: 'Поверителност',
    profile: 'Моят профил',
    legal: 'Правна информация',
    help: 'Помощ и поддръжка',
    replayIntro: 'Повторно въведение',
    reset: 'Нулиране на предпочитанията',
    dark: 'Тъмна',
    light: 'Светла',
    themeHint: 'Избери визуалната тема на приложението.',
    languageHint: 'Избери езика за цялото USG Corso.',
    replayHint: 'Отвори отново USG въведението.',
    resetHint: 'Върни локалните предпочитания към началните стойности.',
    accountStatus: 'Акаунтът е активен',
    accountEmail: 'Имейл',
    profileHint: 'Виж основната информация за профила тук, без да напускаш текущата страница.',
    accountDetails: 'Настройки на акаунта',
    accountDetailsHint: 'Виж текущия влязъл акаунт.',
    editProfile: 'Редактиране на профил',
    editProfileHint: 'Avatar, име, държава и град идват в PROFILE 01.',
    signOut: 'Изход от профила',
    signOutHint: 'Приключи текущата сесия на това устройство.',
    guestTitle: 'Гост режим',
    guestHint: 'Разглеждаш публичната част без акаунт.',
    close: 'Затвори',
    resetTitle: 'Да нулирам ли предпочитанията?',
    resetMessage: 'Езикът, темата, известията и поверителността ще се върнат към началните стойности.',
    cancel: 'Отказ',
    resetAction: 'Нулирай',
    resetDone: 'Предпочитанията са нулирани.',
    resetError: 'Предпочитанията не можаха да бъдат нулирани.',
  },
  it: {
    settingsTitle: 'Impostazioni',
    accountTitle: 'Profilo',
    open: 'APRI',
    theme: 'Tema',
    language: 'Lingua',
    notifications: 'Notifiche',
    privacy: 'Privacy',
    profile: 'Il mio profilo',
    legal: 'Informazioni legali',
    help: 'Aiuto e supporto',
    replayIntro: 'Ripeti introduzione',
    reset: 'Ripristina preferenze',
    dark: 'Scuro',
    light: 'Chiaro',
    themeHint: 'Scegli il tema visivo dell’applicazione.',
    languageHint: 'Scegli la lingua usata in USG Corso.',
    replayHint: 'Apri di nuovo l’introduzione USG.',
    resetHint: 'Ripristina le preferenze locali ai valori iniziali.',
    accountStatus: 'Account attivo',
    accountEmail: 'Email',
    profileHint: 'Visualizza qui le informazioni principali senza lasciare la pagina corrente.',
    accountDetails: 'Impostazioni account',
    accountDetailsHint: 'Visualizza l’account attualmente connesso.',
    editProfile: 'Modifica profilo',
    editProfileHint: 'Avatar, nome, paese e città arriveranno in PROFILE 01.',
    signOut: 'Esci dal profilo',
    signOutHint: 'Termina la sessione corrente su questo dispositivo.',
    guestTitle: 'Modalità ospite',
    guestHint: 'Stai esplorando la parte pubblica senza account.',
    close: 'Chiudi',
    resetTitle: 'Ripristinare le preferenze?',
    resetMessage: 'Lingua, tema, notifiche e privacy torneranno ai valori iniziali.',
    cancel: 'Annulla',
    resetAction: 'Ripristina',
    resetDone: 'Preferenze ripristinate.',
    resetError: 'Impossibile ripristinare le preferenze.',
  },
};

export default function USGHeaderPanels({ navigation, panel, onClose }) {
  if (!panel) {
    return null;
  }

  return panel === 'settings' ? (
    <SettingsPanel navigation={navigation} onClose={onClose} />
  ) : (
    <AccountPanel navigation={navigation} onClose={onClose} />
  );
}

function PanelShell({ title, children, onClose }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.panel,
            {
              top: Math.max(insets.top + 66, 78),
              maxHeight: Math.max(320, 620 - insets.top),
            },
          ]}
        >
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.panelContent}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SettingsPanel({ navigation, onClose }) {
  const { language, setLanguage, t } = useLanguage();
  const { themeName, setThemeName, colors } = useTheme();
  const { replayIntro } = useAppControls();
  const [openKey, setOpenKey] = useState(null);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const labels = copy[language] ?? copy.en;

  function toggle(key) {
    setOpenKey((current) => (current === key ? null : key));
  }

  function openRoute(route) {
    onClose();
    navigation.getParent()?.navigate(route);
  }

  function confirmReset() {
    Alert.alert(
      labels.resetTitle,
      labels.resetMessage,
      [
        {
          text: labels.cancel,
          style: 'cancel',
        },
        {
          text: labels.resetAction,
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(RESET_KEYS);
              await setLanguage('en');
              await setThemeName('dark');
              Alert.alert(labels.resetAction, labels.resetDone);
            } catch {
              Alert.alert(labels.resetAction, labels.resetError);
            }
          },
        },
      ]
    );
  }

  function runIntro() {
    onClose();
    setTimeout(replayIntro, 120);
  }

  return (
    <PanelShell title={labels.settingsTitle} onClose={onClose}>
      <AccordionRow
        title={labels.theme}
        open={openKey === 'theme'}
        onPress={() => toggle('theme')}
      >
        <Text style={styles.hint}>{labels.themeHint}</Text>
        <View style={styles.choiceRow}>
          <ChoiceButton
            label={labels.dark}
            active={themeName === 'dark'}
            onPress={() => setThemeName('dark')}
          />
          <ChoiceButton
            label={labels.light}
            active={themeName === 'light'}
            onPress={() => setThemeName('light')}
          />
        </View>
      </AccordionRow>

      <AccordionRow
        title={labels.language}
        open={openKey === 'language'}
        onPress={() => toggle('language')}
      >
        <Text style={styles.hint}>{labels.languageHint}</Text>
        <View style={styles.choiceRow}>
          {['en', 'bg', 'it'].map((code) => (
            <ChoiceButton
              key={code}
              label={code.toUpperCase()}
              active={language === code}
              onPress={() => setLanguage(code)}
            />
          ))}
        </View>
      </AccordionRow>

      <RouteAccordion
        title={labels.notifications}
        description={t('settings.notificationsHint')}
        open={openKey === 'notifications'}
        onToggle={() => toggle('notifications')}
        onOpen={() => openRoute('NotificationSettings')}
        openLabel={labels.open}
      />

      <RouteAccordion
        title={labels.privacy}
        description={t('settings.privacyHint')}
        open={openKey === 'privacy'}
        onToggle={() => toggle('privacy')}
        onOpen={() => openRoute('PrivacySettings')}
        openLabel={labels.open}
      />

      <RouteAccordion
        title={labels.profile}
        description={t('settings.accountHint')}
        open={openKey === 'profile'}
        onToggle={() => toggle('profile')}
        onOpen={() => openRoute('AccountSettings')}
        openLabel={labels.open}
      />

      <RouteAccordion
        title={labels.legal}
        description={t('settings.legalHint')}
        open={openKey === 'legal'}
        onToggle={() => toggle('legal')}
        onOpen={() => openRoute('Legal')}
        openLabel={labels.open}
      />

      <RouteAccordion
        title={labels.help}
        description={t('settings.helpHint')}
        open={openKey === 'help'}
        onToggle={() => toggle('help')}
        onOpen={() => openRoute('HelpSupport')}
        openLabel={labels.open}
      />

      <AccordionRow
        title={labels.replayIntro}
        open={openKey === 'intro'}
        onPress={() => toggle('intro')}
      >
        <Text style={styles.hint}>{labels.replayHint}</Text>
        <ActionButton label={labels.open} onPress={runIntro} />
      </AccordionRow>

      <AccordionRow
        title={labels.reset}
        open={openKey === 'reset'}
        onPress={() => toggle('reset')}
      >
        <Text style={styles.hint}>{labels.resetHint}</Text>
        <ActionButton label={labels.resetAction} onPress={confirmReset} danger />
      </AccordionRow>
    </PanelShell>
  );
}

function AccountPanel({ navigation, onClose }) {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const [openKey, setOpenKey] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(Boolean(user));
  const [profileError, setProfileError] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [accountMessage, setAccountMessage] = useState('');
  const [accountError, setAccountError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const labels = copy[language] ?? copy.en;
  const authLabels = accountCopy[language] ?? accountCopy.en;
  const profileLabels = profileCopy[language] ?? profileCopy.en;
  const accountLabels = accountSettingsCopy[language] ?? accountSettingsCopy.en;
  const adminLabels = adminCopy[language] ?? adminCopy.en;
  const initial = user?.email?.trim()?.charAt(0)?.toUpperCase() || 'G';
  const avatar = profile?.avatar_preset
    ? getAvatarPreset(profile.avatar_preset)
    : null;

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user) {
        if (active) {
          setProfile(null);
          setProfileLoading(false);
        }
        return;
      }

      setProfileLoading(true);
      setProfileError('');

      const { data, error: loadError } = await getMyProfile(user.id);

      if (!active) {
        return;
      }

      if (loadError) {
        setProfile(null);
        setProfileError(profileLabels.loadError);
        setProfileLoading(false);
        return;
      }

      setProfile(data);
      setProfileLoading(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [profileLabels.loadError, user]);

  useEffect(() => {
    let active = true;

    async function loadRole() {
      if (!user) {
        if (active) {
          setIsAdmin(false);
        }
        return;
      }

      const { data } = await getMyRole(user.id);

      if (active) {
        setIsAdmin(data?.role === 'admin');
      }
    }

    loadRole();

    return () => {
      active = false;
    };
  }, [user]);

  function toggle(key) {
    setOpenKey((current) => (current === key ? null : key));
  }

  function openAccount() {
    requestHeaderPanel('account');
    onClose();
    navigation.getParent()?.navigate('AccountSettings');
  }

  function openAdmin() {
    onClose();
    navigation.getParent()?.navigate('Admin');
  }

  async function sendPasswordReset() {
    if (!user?.email || passwordBusy) {
      return;
    }

    setPasswordBusy(true);
    setAccountMessage('');
    setAccountError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      user.email
    );

    if (resetError) {
      setAccountError(accountLabels.passwordError + ' ' + resetError.message);
      setPasswordBusy(false);
      return;
    }

    setAccountMessage(accountLabels.passwordSent);
    setPasswordBusy(false);
  }

  async function handleDeleteAccount() {
    if (deleteBusy) {
      return;
    }

    if (deleteConfirm.trim() !== 'DELETE') {
      setDeleteError(accountLabels.dangerConfirmError);
      return;
    }

    setDeleteBusy(true);
    setDeleteError('');

    const { data, error: deleteAccountError } = await deleteMyAccount();

    if (deleteAccountError) {
      setDeleteError(accountLabels.dangerDeleteError);
      setDeleteBusy(false);
      return;
    }

    if (!data?.ok) {
      setDeleteError(
        data?.code === 'last_admin'
          ? accountLabels.dangerLastAdmin
          : accountLabels.dangerDeleteError
      );
      setDeleteBusy(false);
      return;
    }

    await supabase.auth.signOut({ scope: 'local' });
    onClose();
  }

  async function handleSignOut() {
    setBusy(true);
    setError('');

    const { error: signOutError } = await signOut();

    if (signOutError) {
      setError(authLabels.signOutError);
      setBusy(false);
      return;
    }

    onClose();
  }

  return (
    <PanelShell title={labels.accountTitle} onClose={onClose}>
      <View style={styles.accountHero}>
        {avatar ? (
          <Image source={avatar.source} style={styles.largeAvatar} />
        ) : (
          <View style={styles.largeAvatar}>
            <Text style={styles.largeAvatarText}>{initial}</Text>
          </View>
        )}

        <View style={styles.accountHeroText}>
          <Text style={styles.accountStatus}>
            {profile?.display_name || (user ? labels.accountStatus : labels.guestTitle)}
          </Text>
          <Text style={styles.accountEmail} numberOfLines={1}>
            {profile?.username ? `@${profile.username}` : user?.email || labels.guestHint}
          </Text>
        </View>
      </View>

      {user ? (
        <>
          <AccordionRow
            title={labels.profile}
            open={openKey === 'profile'}
            onPress={() => toggle('profile')}
          >
            {profileLoading ? (
              <USGProgressBar label={profileLabels.title} />
            ) : profileError ? (
              <Text style={styles.error}>{profileError}</Text>
            ) : profile ? (
              <>
                {profile.display_name ? (
                  <>
                    <Text style={styles.miniLabel}>{profileLabels.displayName}</Text>
                    <Text style={styles.valueText}>{profile.display_name}</Text>
                  </>
                ) : null}

                {profile.username ? (
                  <>
                    <Text style={styles.miniLabel}>{profileLabels.username}</Text>
                    <Text style={styles.valueText}>@{profile.username}</Text>
                  </>
                ) : null}

                {profile.bio ? (
                  <>
                    <Text style={styles.miniLabel}>{profileLabels.bio}</Text>
                    <Text style={styles.valueText}>{profile.bio}</Text>
                  </>
                ) : null}

                {profile.country ? (
                  <>
                    <Text style={styles.miniLabel}>{profileLabels.country}</Text>
                    <Text style={styles.valueText}>{profile.country}</Text>
                  </>
                ) : null}

                {profile.city ? (
                  <>
                    <Text style={styles.miniLabel}>{profileLabels.city}</Text>
                    <Text style={styles.valueText}>{profile.city}</Text>
                  </>
                ) : null}

                <Text style={styles.miniLabel}>{profileLabels.email}</Text>
                <Text style={styles.valueText}>{user.email}</Text>
              </>
            ) : (
              <Text style={styles.hint}>{profileLabels.incompleteText}</Text>
            )}
          </AccordionRow>

          <AccordionRow
            title={labels.accountDetails}
            open={openKey === 'account'}
            onPress={() => toggle('account')}
          >
            <Text style={styles.miniLabel}>{accountLabels.email}</Text>
            <Text style={styles.valueText}>{user.email}</Text>

            <Text style={styles.miniLabel}>{accountLabels.memberSince}</Text>
            <Text style={styles.valueText}>
              {formatMemberSince(user.created_at, language)}
            </Text>

            <Text style={styles.miniLabel}>{accountLabels.security}</Text>
            <Text style={styles.hint}>{accountLabels.securityHint}</Text>

            <Text style={styles.miniLabel}>{accountLabels.password}</Text>
            <Text style={styles.hint}>{accountLabels.passwordHint}</Text>

            {accountError ? (
              <Text style={styles.error}>{accountError}</Text>
            ) : null}

            {accountMessage ? (
              <Text style={styles.accountSuccess}>{accountMessage}</Text>
            ) : null}

            {passwordBusy ? (
              <USGProgressBar label={accountLabels.passwordSending} />
            ) : (
              <ActionButton
                label={accountLabels.passwordAction}
                onPress={sendPasswordReset}
              />
            )}

            <View style={styles.dangerZone}>
              <Text style={styles.dangerZoneTitle}>{accountLabels.dangerTitle}</Text>
              <Text style={styles.hint}>{accountLabels.dangerHint}</Text>

              {!deleteOpen ? (
                <ActionButton
                  label={accountLabels.dangerAction}
                  onPress={() => {
                    setDeleteOpen(true);
                    setDeleteConfirm('');
                    setDeleteError('');
                  }}
                  danger
                />
              ) : (
                <>
                  <Text style={styles.deleteWarning}>
                    {accountLabels.dangerWarning}
                  </Text>

                  <TextInput
                    value={deleteConfirm}
                    onChangeText={(value) => {
                      setDeleteConfirm(value);
                      setDeleteError('');
                    }}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    placeholder={accountLabels.dangerConfirmLabel}
                    placeholderTextColor={colors.textMuted}
                    style={styles.deleteInput}
                  />

                  {deleteError ? (
                    <Text style={styles.error}>{deleteError}</Text>
                  ) : null}

                  {deleteBusy ? (
                    <USGProgressBar label={accountLabels.dangerBusy} />
                  ) : (
                    <>
                      <ActionButton
                        label={accountLabels.dangerConfirmAction}
                        onPress={handleDeleteAccount}
                        danger
                      />
                      <ActionButton
                        label={accountLabels.dangerCancel}
                        onPress={() => {
                          setDeleteOpen(false);
                          setDeleteConfirm('');
                          setDeleteError('');
                        }}
                      />
                    </>
                  )}
                </>
              )}
            </View>
          </AccordionRow>

          <AccordionRow
            title={labels.editProfile}
            open={openKey === 'edit'}
            onPress={() => toggle('edit')}
          >
            <Text style={styles.hint}>{profileLabels.avatarHint}</Text>
            <ActionButton label={labels.open} onPress={openAccount} />
          </AccordionRow>

          {isAdmin ? (
            <AccordionRow
              title={adminLabels.panelTitle}
              open={openKey === 'admin'}
              onPress={() => toggle('admin')}
            >
              <Text style={styles.hint}>{adminLabels.panelHint}</Text>
              <ActionButton label={adminLabels.open} onPress={openAdmin} />
            </AccordionRow>
          ) : null}

          <AccordionRow
            title={labels.signOut}
            open={openKey === 'signout'}
            onPress={() => toggle('signout')}
          >
            <Text style={styles.hint}>{labels.signOutHint}</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {busy ? (
              <USGProgressBar label={authLabels.signingOut} />
            ) : (
              <ActionButton
                label={authLabels.signOut}
                onPress={handleSignOut}
                danger
              />
            )}
          </AccordionRow>
        </>
      ) : (
        <View style={styles.guestCard}>
          <Text style={styles.hint}>{labels.guestHint}</Text>
        </View>
      )}
    </PanelShell>
  );
}

function RouteAccordion({
  title,
  description,
  open,
  onToggle,
  onOpen,
  openLabel,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <AccordionRow title={title} open={open} onPress={onToggle}>
      <Text style={styles.hint}>{description}</Text>
      <ActionButton label={openLabel} onPress={onOpen} />
    </AccordionRow>
  );
}

function AccordionRow({ title, open, onPress, children }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.accordion, open && styles.accordionOpen]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.accordionHeader,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.rowMarker} />
        <Text style={styles.accordionTitle}>{title}</Text>
        <Text style={styles.chevron}>{open ? '⌃' : '⌄'}</Text>
      </Pressable>

      {open ? <View style={styles.accordionBody}>{children}</View> : null}
    </View>
  );
}

function ChoiceButton({ label, active, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choiceButton,
        active && styles.choiceButtonActive,
      ]}
    >
      <Text
        style={[
          styles.choiceText,
          active && styles.choiceTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ActionButton({ label, onPress, danger = false }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        danger && styles.dangerButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.actionText, danger && styles.dangerText]}>
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    modalRoot: {
      flex: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
    },
    panel: {
      position: 'absolute',
      left: 14,
      right: 14,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.background,
      overflow: 'hidden',
    },
    panelHeader: {
      minHeight: 62,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    panelTitle: {
      flex: 1,
      color: colors.text,
      fontSize: 22,
      fontWeight: '800',
    },
    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeText: {
      color: colors.gold,
      fontSize: 24,
      lineHeight: 26,
    },
    panelContent: {
      padding: 12,
      paddingBottom: 18,
    },
    accordion: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: 8,
      overflow: 'hidden',
    },
    accordionOpen: {
      borderColor: colors.gold,
      backgroundColor: colors.surfaceSoft,
    },
    accordionHeader: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
    },
    rowMarker: {
      width: 11,
      height: 11,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.gold,
      marginRight: 12,
    },
    accordionTitle: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    chevron: {
      color: colors.gold,
      fontSize: 19,
      fontWeight: '800',
      marginLeft: 10,
    },
    accordionBody: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 14,
    },
    hint: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 17,
    },
    choiceRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    choiceButton: {
      flex: 1,
      minHeight: 40,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    choiceButtonActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    choiceText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '800',
    },
    choiceTextActive: {
      color: colors.gold,
    },
    actionButton: {
      minHeight: 42,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      paddingHorizontal: 14,
    },
    actionText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    dangerButton: {
      borderColor: '#a84b4b',
    },
    dangerText: {
      color: '#d56b6b',
    },
    pressed: {
      opacity: 0.72,
    },
    accountHero: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 14,
      marginBottom: 10,
    },
    largeAvatar: {
      width: 58,
      height: 58,
      borderRadius: 29,
      borderWidth: 1.5,
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    largeAvatarText: {
      color: colors.gold,
      fontSize: 22,
      fontWeight: '800',
    },
    accountHeroText: {
      flex: 1,
    },
    accountStatus: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '800',
    },
    accountEmail: {
      color: colors.textSoft,
      fontSize: 11,
      marginTop: 5,
    },
    miniLabel: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '700',
    },
    valueText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 5,
      marginBottom: 10,
    },
    error: {
      color: '#d56b6b',
      fontSize: 11,
      lineHeight: 17,
      marginTop: 10,
    },
    accountSuccess: {
      color: colors.gold,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 10,
    },
    dangerZone: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 18,
      paddingTop: 16,
    },
    dangerZoneTitle: {
      color: '#d56b6b',
      fontSize: 11,
      fontWeight: '800',
      marginBottom: 6,
    },
    deleteWarning: {
      color: '#d56b6b',
      fontSize: 11,
      lineHeight: 17,
      fontWeight: '700',
      marginTop: 12,
    },
    deleteInput: {
      minHeight: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#a84b4b',
      color: colors.text,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      marginTop: 12,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
    },
    guestCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 16,
    },
  });
}






