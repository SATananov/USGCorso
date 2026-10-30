import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import GeoSelector from '../components/GeoSelector';
import USGProgressBar from '../components/USGProgressBar';
import { useLanguage } from '../i18n/LanguageContext';
import { getCities, getCountries } from '../profile/geoService';
import { avatarPresets, getAvatarPreset } from '../profile/avatarPresets';
import { profileCopy } from '../profile/profileCopy';
import {
  getMyProfile,
  getProfileCompletion,
  isLocalProfileReady,
  saveMyProfile,
} from '../profile/profileService';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

const EMPTY_PROFILE = {
  displayName: '',
  username: '',
  bio: '',
  country: '',
  city: '',
  avatarPreset: 'natural-black',
};

export default function AccountSettingsScreen() {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const { user } = useAuth();
  const copy = profileCopy[language] ?? profileCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(Boolean(user));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const loadCountries = useCallback(async () => {
    if (countries.length || countriesLoading) {
      return;
    }

    setCountriesLoading(true);

    try {
      const data = await getCountries();
      setCountries(data);
    } catch {
      setError(copy.geoLoadError);
    } finally {
      setCountriesLoading(false);
    }
  }, [copy.geoLoadError, countries.length, countriesLoading]);

  const loadCities = useCallback(
    async (country) => {
      if (!country) {
        setCities([]);
        return;
      }

      setCitiesLoading(true);

      try {
        const data = await getCities(country);
        setCities(data);
      } catch {
        setCities([]);
        setError(copy.geoLoadError);
      } finally {
        setCitiesLoading(false);
      }
    },
    [copy.geoLoadError]
  );

  const loadProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: loadError } = await getMyProfile(user.id);

    if (loadError) {
      setError(`${copy.loadError} ${copy.technicalError} ${loadError.message}`);
      setLoading(false);
      return;
    }

    const next = data
      ? {
          displayName: data.display_name ?? '',
          username: data.username ?? '',
          bio: data.bio ?? '',
          country: data.country ?? '',
          city: data.city ?? '',
          avatarPreset: data.avatar_preset || 'natural-black',
        }
      : EMPTY_PROFILE;

    setForm(next);
    setLoading(false);

    if (next.country) {
      loadCities(next.country);
    }
  }, [copy.loadError, copy.technicalError, loadCities, user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setMessage('');
    setError('');
  }

  function selectCountry(country) {
    setForm((current) => ({
      ...current,
      country,
      city: '',
    }));
    setMessage('');
    setError('');
    loadCities(country);
  }

  function validate() {
    const displayName = form.displayName.trim();
    const username = form.username.trim().toLowerCase();
    const bio = form.bio.trim();

    if (displayName && (displayName.length < 2 || displayName.length > 50)) {
      return copy.nameInvalid;
    }

    if (username && !/^[a-z0-9._]{3,24}$/.test(username)) {
      return copy.usernameInvalid;
    }

    if (bio.length > 240) {
      return copy.bioInvalid;
    }

    return '';
  }

  async function handleSave() {
    if (!user || saving) {
      return;
    }

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    const { error: saveError } = await saveMyProfile(user.id, form);

    if (saveError) {
      if (saveError.code === '23505') {
        setError(copy.usernameTaken);
      } else {
        const detail = [saveError.code, saveError.message]
          .filter(Boolean)
          .join(' — ');
        setError(`${copy.saveError} ${copy.technicalError} ${detail}`);
      }

      setSaving(false);
      return;
    }

    setMessage(copy.saved);
    setSaving(false);
  }

  const preview = {
    display_name: form.displayName,
    username: form.username,
    bio: form.bio,
    country: form.country,
    city: form.city,
    avatar_preset: form.avatarPreset,
  };
  const completion = getProfileCompletion(preview);
  const localReady = isLocalProfileReady(preview);
  const selectedAvatar = getAvatarPreset(form.avatarPreset);
  const naturalAvatars = avatarPresets.filter((item) => item.group === 'natural');
  const croppedAvatars = avatarPresets.filter((item) => item.group === 'cropped');

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={styles.note}>{copy.loadError}</Text>
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
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <Image source={selectedAvatar.source} style={styles.heroAvatar} />
            <View style={styles.heroText}>
              <Text style={styles.kicker}>{copy.kicker}</Text>
              <Text style={styles.title}>{copy.title}</Text>
              <Text style={styles.email} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
          </View>

          <View style={[styles.notice, localReady && styles.noticeReady]}>
            <Text style={styles.noticeTitle}>
              {localReady ? copy.completeTitle : copy.incompleteTitle}
            </Text>
            <Text style={styles.noticeText}>
              {localReady ? copy.completeText : copy.incompleteText}
            </Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.sectionTitle}>{copy.completion}</Text>
              <Text style={styles.progressValue}>{completion}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${completion}%` }]} />
            </View>
          </View>

          {loading ? (
            <USGProgressBar label={copy.title} />
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>{copy.avatar}</Text>
                <Text style={styles.hint}>{copy.avatarHint}</Text>

                <AvatarGroup
                  label={copy.naturalEars}
                  avatars={naturalAvatars}
                  selectedId={form.avatarPreset}
                  onSelect={(id) => updateField('avatarPreset', id)}
                  styles={styles}
                />

                <AvatarGroup
                  label={copy.croppedEars}
                  avatars={croppedAvatars}
                  selectedId={form.avatarPreset}
                  onSelect={(id) => updateField('avatarPreset', id)}
                  styles={styles}
                />
              </View>

              <View style={styles.card}>
                <Field
                  label={copy.displayName}
                  value={form.displayName}
                  placeholder={copy.displayNamePlaceholder}
                  onChangeText={(value) => updateField('displayName', value)}
                  styles={styles}
                  colors={colors}
                />

                <Field
                  label={copy.username}
                  value={form.username}
                  placeholder={copy.usernamePlaceholder}
                  onChangeText={(value) => updateField('username', value)}
                  autoCapitalize="none"
                  styles={styles}
                  colors={colors}
                />

                <Field
                  label={copy.bio}
                  value={form.bio}
                  placeholder={copy.bioPlaceholder}
                  onChangeText={(value) => updateField('bio', value)}
                  multiline
                  maxLength={240}
                  styles={styles}
                  colors={colors}
                />

                <GeoSelector
                  label={copy.country}
                  value={form.country}
                  placeholder={copy.countryPlaceholder}
                  options={countries}
                  loading={countriesLoading}
                  searchPlaceholder={copy.searchCountry}
                  emptyText={copy.noGeoResults}
                  onPress={loadCountries}
                  onSelect={selectCountry}
                />

                <GeoSelector
                  label={copy.city}
                  value={form.city}
                  placeholder={
                    form.country ? copy.cityPlaceholder : copy.chooseCountryFirst
                  }
                  options={cities}
                  loading={citiesLoading}
                  disabled={!form.country}
                  searchPlaceholder={copy.searchCity}
                  emptyText={copy.noGeoResults}
                  onPress={() => loadCities(form.country)}
                  onSelect={(value) => updateField('city', value)}
                />

                <Text style={styles.readOnlyLabel}>{copy.email}</Text>
                <View style={styles.readOnly}>
                  <Text style={styles.readOnlyText}>{user.email}</Text>
                </View>

                {!localReady ? (
                  <Text style={styles.localHint}>{copy.localRequired}</Text>
                ) : null}

                {error ? <Text style={styles.error}>{error}</Text> : null}
                {message ? <Text style={styles.success}>{message}</Text> : null}

                {saving ? (
                  <USGProgressBar label={copy.saving} />
                ) : (
                  <Pressable style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>{copy.save}</Text>
                  </Pressable>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AvatarGroup({ label, avatars, selectedId, onSelect, styles }) {
  return (
    <View style={styles.avatarGroup}>
      <Text style={styles.avatarGroupTitle}>{label}</Text>
      <View style={styles.avatarGrid}>
        {avatars.map((avatar) => {
          const selected = selectedId === avatar.id;

          return (
            <Pressable
              key={avatar.id}
              onPress={() => onSelect(avatar.id)}
              style={[
                styles.avatarOption,
                selected && styles.avatarOptionSelected,
              ]}
            >
              <Image source={avatar.source} style={styles.avatarImage} />
              {selected ? (
                <View style={styles.avatarCheck}>
                  <Text style={styles.avatarCheckText}>✓</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChangeText,
  multiline = false,
  maxLength,
  autoCapitalize = 'sentences',
  styles,
  colors,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onChangeText={onChangeText}
        multiline={multiline}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.md,
      paddingBottom: 36,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    heroCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 16,
    },
    heroAvatar: {
      width: 86,
      height: 86,
      borderRadius: 43,
      borderWidth: 1.5,
      borderColor: colors.gold,
      marginRight: 16,
    },
    heroText: {
      flex: 1,
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 2,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '800',
      marginTop: 5,
    },
    email: {
      color: colors.textSoft,
      fontSize: 11,
      marginTop: 6,
    },
    notice: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
      padding: 14,
      marginTop: 12,
    },
    noticeReady: {
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
    },
    noticeTitle: {
      color: colors.gold,
      fontSize: 13,
      fontWeight: '800',
    },
    noticeText: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 5,
    },
    progressCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 14,
      marginTop: 12,
    },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    progressValue: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '800',
    },
    progressTrack: {
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.border,
      overflow: 'hidden',
      marginTop: 10,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: colors.gold,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 16,
      marginTop: 12,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
    },
    hint: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 5,
    },
    avatarGroup: {
      marginTop: 16,
    },
    avatarGroupTitle: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.6,
      marginBottom: 9,
    },
    avatarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    avatarOption: {
      width: '31%',
      aspectRatio: 1,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 4,
      overflow: 'hidden',
    },
    avatarOptionSelected: {
      borderWidth: 2,
      borderColor: colors.gold,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 14,
    },
    avatarCheck: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 25,
      height: 25,
      borderRadius: 13,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarCheckText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: '900',
    },
    field: {
      marginTop: 15,
    },
    label: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '700',
      marginBottom: 6,
    },
    input: {
      minHeight: 46,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      color: colors.text,
      paddingHorizontal: 13,
      paddingVertical: 10,
      fontSize: 13,
    },
    inputMultiline: {
      minHeight: 96,
      textAlignVertical: 'top',
    },
    readOnlyLabel: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '700',
      marginTop: 16,
      marginBottom: 6,
    },
    readOnly: {
      minHeight: 44,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      justifyContent: 'center',
      paddingHorizontal: 13,
    },
    readOnlyText: {
      color: colors.textSoft,
      fontSize: 12,
    },
    localHint: {
      color: colors.goldSoft,
      fontSize: 10,
      lineHeight: 16,
      marginTop: 14,
    },
    error: {
      color: '#d56b6b',
      fontSize: 11,
      lineHeight: 17,
      marginTop: 14,
    },
    success: {
      color: colors.gold,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 14,
    },
    saveButton: {
      minHeight: 48,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 18,
    },
    saveButtonText: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1,
    },
    note: {
      color: colors.textSoft,
      fontSize: 12,
      textAlign: 'center',
    },
  });
}
