import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import USGBackToTop from '../components/USGBackToTop';

const copy = {
  bg: { title: 'ДНЕВНИК', intro: 'Лично пространство за грижи и история на твоето Кане Корсо.', reminders: 'ГРИЖИ ЗА КОРСО', remindersSub: 'Календар и планирани грижи', history: 'ИСТОРИЯ НА ГРИЖИТЕ', historySub: 'Хранене и ежедневни грижи', documents: 'ДОКУМЕНТИ', documentsSub: 'Личен архив и OCR — следващ етап' },
  en: { title: 'DIARY', intro: 'Private care and history for your Cane Corso.', reminders: 'CORSO CARE', remindersSub: 'Calendar and planned care', history: 'CARE HISTORY', historySub: 'Feeding and everyday care', documents: 'DOCUMENTS', documentsSub: 'Private archive and OCR — coming next' },
  it: { title: 'DIARIO', intro: 'Cure e cronologia private del tuo Cane Corso.', reminders: 'CURA DEL CORSO', remindersSub: 'Calendario e cure programmate', history: 'STORICO DELLE CURE', historySub: 'Alimentazione e cure quotidiane', documents: 'DOCUMENTI', documentsSub: 'Archivio privato e OCR — fase successiva' },
};

export default function MyCorsoDiaryScreen({ navigation }) {
  const { language } = useLanguage();
  const scrollRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { colors } = useTheme();
  const w = copy[language] || copy.en;
  const s = useMemo(() => StyleSheet.create({ root: { flex: 1, backgroundColor: colors.background }, content: { padding: 22, gap: 17 }, kicker: { color: colors.goldSoft, letterSpacing: 4, textAlign: 'center', fontWeight: '800' }, title: { color: colors.text, textAlign: 'center', fontSize: 30, fontWeight: '800' }, intro: { color: colors.textSoft, textAlign: 'center', lineHeight: 23, marginBottom: 15 }, card: { padding: 20, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, gap: 8 }, heading: { color: colors.gold, fontSize: 18, fontWeight: '800' }, subtitle: { color: colors.textSoft, fontSize: 14 }, muted: { opacity: 0.65 } }), [colors]);
  return <SafeAreaView style={s.root} edges={['bottom']}><ScrollView ref={scrollRef} onScroll={event => setShowBackToTop(event.nativeEvent.contentOffset.y > 220)} scrollEventThrottle={32} contentContainerStyle={s.content}>
    <Text style={s.kicker}>USG CORSO</Text><Text style={s.title}>{w.title}</Text><Text style={s.intro}>{w.intro}</Text>
    <Pressable style={s.card} onPress={() => navigation.navigate('CorsoCareReminders')}><Text style={s.heading}>{w.reminders} ›</Text><Text style={s.subtitle}>{w.remindersSub}</Text></Pressable>
    <Pressable style={s.card} onPress={() => navigation.navigate('MyCorsoCare')}><Text style={s.heading}>{w.history} ›</Text><Text style={s.subtitle}>{w.historySub}</Text></Pressable>
    <View style={[s.card, s.muted]}><Text style={s.heading}>{w.documents}</Text><Text style={s.subtitle}>{w.documentsSub}</Text></View>
  </ScrollView><USGBackToTop visible={showBackToTop} language={language} bottomOffset={88} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} /></SafeAreaView>;
}
