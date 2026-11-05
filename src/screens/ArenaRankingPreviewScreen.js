import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import USGBackToTop from '../components/USGBackToTop';

const translations = {
  bg: {
    kicker: 'USG · UNICO SUO GENERE', title: 'КЛАСАЦИИ НА АРЕНАТА',
    intro: 'Бъдещото място за честно съревнование и уважение към Cane Corso.',
    dogTab: 'CANE CORSO', ownerTab: 'СОБСТВЕНИЦИ',
    dogTitle: 'КЛАСАЦИЯ НА CANE CORSO', ownerTitle: 'КЛАСАЦИЯ НА СОБСТВЕНИЦИТЕ',
    preview: 'ПРЕДВАРИТЕЛЕН ПРЕГЛЕД', coming: 'Класацията още не е активна',
    dogCopy: 'Тук ще се показват само Cane Corso с разрешено участие и проверени състезателни точки.',
    ownerCopy: 'Тук ще се показват само собственици с разрешено участие и проверени състезателни точки.',
    verify: 'Проверени точки в Арената', consent: 'Доброволно участие', fair: 'Честна игра',
    privacy: 'Няма публични профили или резултати в този преглед. Симулациите и личният XP не участват в класирането.',
    back: 'НАЗАД КЪМ ПРЕДИЗВИКАТЕЛСТВА',
  },
  en: {
    kicker: 'USG · UNICO SUO GENERE', title: 'ARENA RANKINGS',
    intro: 'A future home for fair competition and respect for Cane Corso.',
    dogTab: 'CANE CORSO', ownerTab: 'OWNERS',
    dogTitle: 'CANE CORSO RANKING', ownerTitle: 'OWNER RANKING',
    preview: 'PREVIEW', coming: 'Rankings are not live yet',
    dogCopy: 'Only opted-in Cane Corso with verified competition points will appear here.',
    ownerCopy: 'Only opted-in owners with verified competition points will appear here.',
    verify: 'Verified Arena points', consent: 'Opt-in participation', fair: 'Fair play',
    privacy: 'No public profiles or rankings are shown in this preview. Simulation and personal XP do not count.',
    back: 'BACK TO CHALLENGES',
  },
  it: {
    kicker: 'USG · UNICO SUO GENERE', title: 'CLASSIFICHE ARENA',
    intro: 'Un futuro spazio per competere con correttezza e rispetto per il Cane Corso.',
    dogTab: 'CANE CORSO', ownerTab: 'PROPRIETARI',
    dogTitle: 'CLASSIFICA CANE CORSO', ownerTitle: 'CLASSIFICA PROPRIETARI',
    preview: 'ANTEPRIMA', coming: 'Le classifiche non sono ancora attive',
    dogCopy: 'Saranno mostrati solo Cane Corso iscritti con punti competitivi verificati.',
    ownerCopy: 'Saranno mostrati solo proprietari iscritti con punti competitivi verificati.',
    verify: 'Punti Arena verificati', consent: 'Adesione volontaria', fair: 'Gioco corretto',
    privacy: 'Questa anteprima non mostra profili o risultati pubblici. Simulazioni ed XP personali non contano.',
    back: 'TORNA ALLE SFIDE',
  },
};

export default function ArenaRankingPreviewScreen({ navigation }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const t = translations[language] ?? translations.en;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [tab, setTab] = useState('dog');
  const scrollRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  return (
    <SafeAreaView style={styles.page} edges={['bottom']}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} scrollEventThrottle={100} onScroll={event => setShowBackToTop(event.nativeEvent.contentOffset.y > 260)}>
        <Text style={styles.kicker}>{t.kicker}</Text>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>{t.title}</Text>
        <Text style={styles.intro}>{t.intro}</Text>
        <View style={styles.tabRow}>
          <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === 'dog' }} onPress={() => setTab('dog')} style={[styles.tab, tab === 'dog' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'dog' && styles.tabTextActive]}>{t.dogTab}</Text>
          </Pressable>
          <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === 'owner' }} onPress={() => setTab('owner')} style={[styles.tab, tab === 'owner' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'owner' && styles.tabTextActive]}>{t.ownerTab}</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <Text style={styles.preview}>{t.preview}</Text>
          <View style={styles.medal}><Text style={styles.medalIcon}>♛</Text></View>
          <Text style={styles.cardTitle}>{tab === 'dog' ? t.dogTitle : t.ownerTitle}</Text>
          <Text style={styles.coming}>{t.coming}</Text>
          <Text style={styles.copy}>{tab === 'dog' ? t.dogCopy : t.ownerCopy}</Text>
          <View style={styles.pillRow}>
            {[t.verify, t.consent, t.fair].map(value => <View key={value} style={styles.pill}><Text style={styles.pillText}>{value}</Text></View>)}
          </View>
        </View>
        <View style={styles.notice}><Text style={styles.noticeText}>{t.privacy}</Text></View>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>{t.back}</Text></Pressable>
      </ScrollView>
      <USGBackToTop visible={showBackToTop} language={language} bottomOffset={76} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} />
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    content: { padding: 18, paddingBottom: 52, gap: 16 },
    kicker: { color: colors.gold, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
    title: { color: colors.text, fontSize: 25, fontWeight: '800' },
    intro: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
    tabRow: { flexDirection: 'row', gap: 9 },
    tab: { flex: 1, minWidth: 0, paddingVertical: 13, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
    tabActive: { borderColor: colors.gold, backgroundColor: colors.activeSurface },
    tabText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
    tabTextActive: { color: colors.gold },
    card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gold, borderRadius: 20, paddingHorizontal: 17, paddingVertical: 23, alignItems: 'center', gap: 14 },
    preview: { color: colors.gold, fontSize: 11, letterSpacing: 1.5, fontWeight: '800' },
    medal: { height: 80, width: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.gold, backgroundColor: colors.activeSurface, alignItems: 'center', justifyContent: 'center' },
    medalIcon: { color: colors.gold, fontSize: 40 },
    cardTitle: { color: colors.gold, fontSize: 17, fontWeight: '800', textAlign: 'center' },
    coming: { color: colors.text, fontSize: 15, fontWeight: '700', textAlign: 'center' },
    copy: { color: colors.textMuted, fontSize: 13, lineHeight: 21, textAlign: 'center' },
    pillRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 7, marginTop: 6 },
    pill: { backgroundColor: colors.activeSurface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 8 },
    pillText: { color: colors.gold, fontSize: 11, fontWeight: '700' },
    notice: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 14, padding: 14 },
    noticeText: { color: colors.textMuted, fontSize: 12, lineHeight: 19 },
    back: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: 15, alignItems: 'center' },
    backText: { color: colors.gold, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  });
}
