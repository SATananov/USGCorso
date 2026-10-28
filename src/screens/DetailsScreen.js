import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

export default function DetailsScreen({ route }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const title = route.params?.title || 'USG Corso';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Image
            source={require('../../assets/usg-seal-splash.png')}
            style={styles.watermark}
            resizeMode="contain"
          />

          <Text style={styles.kicker}>{t('details.kicker')}</Text>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.divider}>
            <View style={styles.line} />
            <View style={styles.diamond} />
            <View style={styles.line} />
          </View>

          <Text style={styles.copy}>{t('details.copy')}</Text>
        </View>

        <Text style={styles.footer}>USG — Unico Suo Genere™</Text>
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
      paddingHorizontal: spacing.md,
    },
    card: {
      minHeight: 330,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    watermark: {
      position: 'absolute',
      width: 245,
      height: 245,
      opacity: 0.05,
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 3,
      marginBottom: spacing.sm,
    },
    title: {
      color: colors.text,
      fontSize: 30,
      fontWeight: '700',
      textAlign: 'center',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      width: 145,
      marginVertical: spacing.lg,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: colors.goldDark,
    },
    diamond: {
      width: 7,
      height: 7,
      marginHorizontal: 8,
      backgroundColor: colors.gold,
      transform: [{ rotate: '45deg' }],
    },
    copy: {
      color: colors.textSoft,
      fontSize: 15,
      lineHeight: 24,
      textAlign: 'center',
    },
    footer: {
      color: colors.textMuted,
      fontSize: 10,
      textAlign: 'center',
      marginTop: spacing.lg,
    },
  });
}
