import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import USGProgressBar from '../components/USGProgressBar';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { authCopy } from './authCopy';

export default function AuthLoadingScreen() {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const copy = authCopy[language] ?? authCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>{copy.brand}</Text>
        <USGProgressBar label={copy.checkingAccount} />
      </View>
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
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    brand: {
      color: colors.gold,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 4,
      textAlign: 'center',
      marginBottom: 10,
    },
  });
}
