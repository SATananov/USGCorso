import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from './AuthContext';
import { accountCopy } from './accountCopy';

export default function AuthSignedInBanner() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const [visible, setVisible] = useState(true);
  const copy = accountCopy[language] ?? accountCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 3200);

    return () => clearTimeout(timer);
  }, [user?.id]);

  if (!user || !visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.wrapper}>
      <View style={styles.banner}>
        <View style={styles.dot} />
        <View style={styles.textWrap}>
          <Text style={styles.title}>{copy.signedInSuccess}</Text>
          <Text style={styles.email} numberOfLines={1}>
            {user.email}
          </Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    wrapper: {
      position: 'absolute',
      top: 12,
      left: 16,
      right: 16,
      zIndex: 1000,
      alignItems: 'center',
    },
    banner: {
      maxWidth: 420,
      width: '100%',
      minHeight: 56,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surfaceRaised,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 11,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.gold,
      marginRight: 12,
    },
    textWrap: {
      flex: 1,
    },
    title: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    email: {
      color: colors.textSoft,
      fontSize: 11,
      marginTop: 3,
    },
  });
}
