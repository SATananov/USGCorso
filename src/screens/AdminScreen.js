import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { adminCopy } from '../admin/adminCopy';
import { getAdminUsers, getMyRole } from '../admin/adminService';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';
import USGProgressBar from '../components/USGProgressBar';

export default function AdminScreen() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const labels = adminCopy[language] ?? adminCopy.en;
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data, error: loadError } = await getAdminUsers();

    if (loadError) {
      setUsers([]);
      setError(labels.loadError);
      setLoading(false);
      return;
    }

    setUsers(data ?? []);
    setLoading(false);
  }, [labels.loadError]);

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      const { data, error: roleError } = await getMyRole(user?.id);

      if (!active) {
        return;
      }

      const allowed = !roleError && data?.role === 'admin';
      setIsAdmin(allowed);
      setChecking(false);

      if (allowed) {
        loadUsers();
      }
    }

    checkAccess();

    return () => {
      active = false;
    };
  }, [loadUsers, user?.id]);

  if (checking) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <USGProgressBar label={labels.accessChecking} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={styles.denied}>{labels.accessDenied}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>USG CORSO</Text>
          <Text style={styles.title}>{labels.title}</Text>
          <Text style={styles.subtitle}>{labels.subtitle}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{labels.usersCount}</Text>
          <Text style={styles.summaryValue}>{users.length}</Text>
          <Pressable style={styles.button} onPress={loadUsers}>
            <Text style={styles.buttonText}>{labels.refresh}</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>{labels.usersTitle}</Text>

        {loading ? <USGProgressBar label={labels.usersTitle} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && users.length === 0 ? (
          <Text style={styles.empty}>{labels.noUsers}</Text>
        ) : null}

        {users.map((item) => {
          const name = item.display_name || item.username || item.email;
          const location = [item.city, item.country].filter(Boolean).join(', ');

          return (
            <View key={item.user_id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userText}>
                  <Text style={styles.userName}>{name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                <Text style={styles.roleBadge}>
                  {item.role === 'admin' ? labels.admin : labels.user}
                </Text>
              </View>

              <Text style={styles.metaLabel}>{labels.memberSince}</Text>
              <Text style={styles.metaValue}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>

              <Text style={styles.metaLabel}>{labels.location}</Text>
              <Text style={styles.metaValue}>
                {location || labels.profileMissing}
              </Text>
            </View>
          );
        })}
      </ScrollView>
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
    center: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.lg,
    },
    hero: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 24,
      alignItems: 'center',
      marginBottom: 12,
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 3,
      marginBottom: 10,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 8,
    },
    summaryCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 18,
      marginBottom: 16,
    },
    summaryLabel: {
      color: colors.textSoft,
      fontSize: 12,
    },
    summaryValue: {
      color: colors.text,
      fontSize: 30,
      fontWeight: '700',
      marginTop: 4,
      marginBottom: 12,
    },
    button: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.gold,
      paddingVertical: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 10,
    },
    userCard: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 16,
      marginBottom: 10,
    },
    userHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12,
    },
    userText: {
      flex: 1,
    },
    userName: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    userEmail: {
      color: colors.textSoft,
      fontSize: 11,
      marginTop: 3,
    },
    roleBadge: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    metaLabel: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      marginTop: 8,
    },
    metaValue: {
      color: colors.textSoft,
      fontSize: 12,
      marginTop: 2,
    },
    denied: {
      color: colors.text,
      fontSize: 15,
      textAlign: 'center',
    },
    error: {
      color: colors.danger || '#d66',
      fontSize: 12,
      marginBottom: 12,
    },
    empty: {
      color: colors.textSoft,
      fontSize: 12,
    },
  });
}
