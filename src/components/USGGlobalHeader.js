import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getAvatarPreset } from '../profile/avatarPresets';
import { getMyProfile } from '../profile/profileService';
import { useTheme } from '../theme/ThemeContext';
import USGHeaderPanels from './USGHeaderPanels';
import { consumeHeaderPanel } from '../app/headerPanelRequest';

export default function USGGlobalHeader({ navigation, route, title }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [panel, setPanel] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!user?.id) {
        if (active) {
          setProfile(null);
        }
        return;
      }

      const { data } = await getMyProfile(user.id);

      if (active) {
        setProfile(data ?? null);
      }
    }

    loadProfile();
    const unsubscribe = navigation.addListener('focus', loadProfile);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigation, user?.id]);

  useEffect(() => {
    const openRequestedPanel = () => {
      const requestedPanel = consumeHeaderPanel();

      if (requestedPanel) {
        setPanel(requestedPanel);
      }
    };

    openRequestedPanel();
    const unsubscribe = navigation.addListener('focus', openRequestedPanel);

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (route?.params?.openPanel === 'account') {
      setPanel('account');
      navigation.setParams({ openPanel: undefined });
    }
  }, [navigation, route?.params?.openPanel]);

  const accountLabel = user?.email || t('settings.account');
  const initial = user?.email?.trim()?.charAt(0)?.toUpperCase() || 'G';
  const avatar = profile?.avatar_preset
    ? getAvatarPreset(profile.avatar_preset)
    : null;

  return (
    <>
      <View
        style={[
          styles.safeArea,
          {
            paddingTop: Math.max(insets.top, 8),
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings.title')}
            onPress={() => setPanel('settings')}
            style={({ pressed }) => [
              styles.controlButton,
              panel === 'settings' && styles.controlButtonActive,
              pressed && styles.controlButtonPressed,
            ]}
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </Pressable>

          <View style={styles.center}>
            <Text style={styles.brand}>USG CORSO</Text>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={accountLabel}
            onPress={() => setPanel('account')}
            style={({ pressed }) => [
              styles.avatarButton,
              panel === 'account' && styles.avatarButtonActive,
              pressed && styles.controlButtonPressed,
            ]}
          >
            {avatar ? (
              <Image source={avatar.source} style={styles.headerAvatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </Pressable>
        </View>
      </View>

      <USGHeaderPanels
        navigation={navigation}
        panel={panel}
        onClose={() => setPanel(null)}
      />
    </>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    safeArea: {
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    header: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingBottom: 8,
    },
    controlButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    controlButtonActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    avatarButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarButtonActive: {
      borderWidth: 2,
    },
    headerAvatarImage: {
      width: 38,
      height: 38,
      borderRadius: 19,
    },
    controlButtonPressed: {
      opacity: 0.7,
    },
    settingsIcon: {
      color: colors.gold,
      fontSize: 21,
      lineHeight: 24,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 10,
    },
    brand: {
      color: colors.goldSoft,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 2.2,
    },
    title: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
      marginTop: 3,
      maxWidth: '100%',
    },
    avatarText: {
      color: colors.gold,
      fontSize: 15,
      fontWeight: '800',
    },
  });
}



