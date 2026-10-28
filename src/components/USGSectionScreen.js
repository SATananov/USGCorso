import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../styles/usgTheme';

export default function USGSectionScreen({
  kicker,
  title,
  subtitle,
  body,
  children,
}) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image
            source={require('../../assets/usg-seal-splash.png')}
            style={styles.watermark}
            resizeMode="contain"
          />

          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDiamond} />
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.body}>{body}</Text>
          {children}
        </View>

        <Text style={styles.footer}>USG — Unico Suo Genere™</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: 20,
    paddingBottom: spacing.xl,
  },
  hero: {
    minHeight: 235,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    width: 220,
    height: 220,
    opacity: 0.05,
  },
  kicker: {
    color: colors.goldSoft,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
    marginTop: 18,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.goldDark,
  },
  dividerDiamond: {
    width: 7,
    height: 7,
    marginHorizontal: 8,
    backgroundColor: colors.gold,
    transform: [{ rotate: '45deg' }],
  },
  subtitle: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 300,
  },
  card: {
    marginTop: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  body: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
  },
  footer: {
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 22,
    letterSpacing: 0.8,
  },
});
