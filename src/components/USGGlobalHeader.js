import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import { getAdminNotificationSummary } from '../admin/adminNotificationService';
import { useLanguage } from '../i18n/LanguageContext';
import { getUnreadNotificationCount } from '../notifications/notificationService';
import { getAvatarPreset } from '../profile/avatarPresets';
import { getMyProfile } from '../profile/profileService';
import { useTheme } from '../theme/ThemeContext';
import USGHeaderPanels from './USGHeaderPanels';
import USGHomeButton from './USGHomeButton';
import { consumeHeaderPanel } from '../app/headerPanelRequest';

export default function USGGlobalHeader({ navigation, route, title }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [panel, setPanel] = useState(null);
  const [profile, setProfile] = useState(null);
  const [adminNotifications, setAdminNotifications] = useState(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

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
    let active = true;

    async function loadUnreadNotifications() {
      if (!user?.id) {
        if (active) {
          setUnreadNotificationCount(0);
        }
        return;
      }

      try {
        const count = await getUnreadNotificationCount();

        if (active) {
          setUnreadNotificationCount(count);
        }
      } catch {
        if (active) {
          setUnreadNotificationCount(0);
        }
      }
    }

    loadUnreadNotifications();
    const unsubscribe = navigation.addListener('focus', loadUnreadNotifications);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigation, user?.id]);

  useEffect(() => {
    let active = true;

    async function loadAdminNotifications() {
      if (!user?.id) {
        if (active) {
          setAdminNotifications(null);
        }
        return;
      }

      const { data } = await getAdminNotificationSummary(user.id);

      if (active) {
        setAdminNotifications(data?.isAdmin ? data : null);
      }
    }

    loadAdminNotifications();
    const unsubscribe = navigation.addListener('focus', loadAdminNotifications);

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
          <View style={styles.leadingActions}>
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
          {route?.name !== 'Home' ? (
            <USGHomeButton
              label={t('nav.home')}
              onPress={() => navigation.navigate('Home')}
            />
          ) : null}
          </View>

          <View style={styles.center}>
            <Text style={styles.brand}>USG CORSO</Text>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>

          <View style={styles.headerActions}>
            {user ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Notifications: ${unreadNotificationCount} unread`}
                onPress={() => navigation.getParent()?.navigate('Notifications')}
                style={({ pressed }) => [
                  styles.notificationButton,
                  pressed && styles.controlButtonPressed,
                ]}
              >
                <Text style={styles.notificationIcon}>{'\uD83D\uDD14'}</Text>
                {unreadNotificationCount > 0 ? (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            ) : null}

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
            ) : user ? (
              <Text style={styles.avatarText}>{initial}</Text>
            ) : (
              <View style={styles.guestAvatar}>
                <View style={styles.guestAvatarHead} />
                <View style={styles.guestAvatarBody} />
              </View>
            )}
          </Pressable>
          </View>
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
    leadingActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
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
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    notificationButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    notificationIcon: {
      fontSize: 17,
      lineHeight: 20,
      transform: [{ scale: 0.9 }],
    },
    notificationBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 20,
      height: 20,
      paddingHorizontal: 3,
      borderRadius: 10,
      backgroundColor: colors.gold,
      borderWidth: 1,
      borderColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notificationBadgeText: {
      color: colors.background,
      fontSize: 10,
      lineHeight: 18,
      includeFontPadding: false,
      textAlign: 'center',
      textAlignVertical: 'center',
      fontWeight: '900',
      transform: [{ translateY: -1 }],
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
    guestAvatar: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    guestAvatarHead: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: colors.gold,
      marginBottom: 2,
    },
    guestAvatarBody: {
      width: 17,
      height: 9,
      borderTopLeftRadius: 9,
      borderTopRightRadius: 9,
      backgroundColor: colors.gold,
    },
    guestAvatarHead: {
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor: colors.gold,
      marginBottom: 3,
    },
    guestAvatarBody: {
      width: 18,
      height: 10,
      borderTopLeftRadius: 9,
      borderTopRightRadius: 9,
      backgroundColor: colors.gold,
    },
  });
}



