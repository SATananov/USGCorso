import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import USGBackToTop from '../components/USGBackToTop';
import { useLanguage } from '../i18n/LanguageContext';
import { getMyMapPresence, setMyMapDiscovery } from '../places/mapPresenceService';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

const STORAGE_KEY = '@usgcorso/privacy-preferences';

const defaults = {
  publicProfile: true,
  locationDiscovery: false,
};

export default function PrivacySettingsScreen() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const scrollRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [preferences, setPreferences] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadPreferences() {
        setLoading(true);
        setErrorText('');

        try {
          const [saved, presence] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEY),
            getMyMapPresence(user?.id),
          ]);

          if (!active) {
            return;
          }

          if (presence.error) {
            setErrorText(t('settings.privacyLoadError'));
            return;
          }

          const local = saved ? JSON.parse(saved) : {};

          setPreferences({
            publicProfile: typeof local.publicProfile === 'boolean'
              ? local.publicProfile
              : defaults.publicProfile,
            locationDiscovery: Boolean(presence.data?.discovery_allowed),
          });
        } catch {
          if (active) {
            setErrorText(t('settings.privacyLoadError'));
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      loadPreferences();

      return () => {
        active = false;
      };
    }, [user?.id, t])
  );

  async function updatePreference(key, value) {
    if (loading || saving) {
      return;
    }

    setErrorText('');
    setSaving(true);

    try {
      if (key === 'locationDiscovery') {
        const result = await setMyMapDiscovery(user?.id, value);

        if (result.error) {
          setErrorText(t('settings.privacySaveError'));
          return;
        }
      } else {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ publicProfile: value })
        );
      }

      setPreferences((current) => ({ ...current, [key]: value }));
    } catch {
      setErrorText(t('settings.privacySaveError'));
    } finally {
      setSaving(false);
    }
  }

  const items = [
    ['publicProfile', t('settings.publicProfile'), t('settings.publicProfileHint')],
    ['locationDiscovery', t('settings.locationDiscovery'), t('settings.locationDiscoveryHint')],
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        ref={scrollRef}
        onScroll={(event) => {
          const visible = event.nativeEvent.contentOffset.y > 220;
          setShowBackToTop((current) => current === visible ? current : visible);
        }}
        scrollEventThrottle={32}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.intro}>{t('settings.privacyIntro')}</Text>

        <View style={styles.card}>
          {items.map(([key, title, description], index) => (
            <View key={key}>
              {index > 0 && <View style={styles.separator} />}
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{title}</Text>
                  <Text style={styles.rowDescription}>{description}</Text>
                </View>
                <Switch
                  value={preferences[key]}
                  disabled={loading || saving || (key === 'locationDiscovery' && !user?.id)}
                  onValueChange={(value) => updatePreference(key, value)}
                  trackColor={{
                    false: colors.border,
                    true: colors.goldSoft,
                  }}
                  thumbColor={preferences[key] ? colors.gold : colors.textMuted}
                />
              </View>
            </View>
          ))}
        </View>

        {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
        <Text style={styles.note}>{t('settings.privacyLocalNote')}</Text>
      </ScrollView>
      <USGBackToTop
        visible={showBackToTop}
        language={language}
        bottomOffset={68}
        onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
      />
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
      padding: spacing.md,
      paddingBottom: 32,
    },
    intro: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 14,
    },
    card: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: 18,
    },
    row: {
      minHeight: 88,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    rowText: {
      flex: 1,
    },
    rowTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    rowDescription: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 4,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
    },
    note: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 12,
    },
    error: {
      color: colors.error || '#f19c9c',
      fontSize: 12,
      lineHeight: 18,
      marginTop: 12,
    },
  });
}
