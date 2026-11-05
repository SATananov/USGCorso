import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const translations = {
  bg: { title: 'БЪРЗ ДОСТЪП', sections: 'СЕКЦИИ', close: 'ЗАТВОРИ', ranking: 'Класации', missions: 'Мисии', personal: 'Лична цел', activity: 'Активност', achievements: 'Значки', timeline: 'Хронология' },
  en: { title: 'QUICK ACCESS', sections: 'SECTIONS', close: 'CLOSE', ranking: 'Rankings', missions: 'Missions', personal: 'Personal goal', activity: 'Activity', achievements: 'Badges', timeline: 'Timeline' },
  it: { title: 'ACCESSO RAPIDO', sections: 'SEZIONI', close: 'CHIUDI', ranking: 'Classifiche', missions: 'Missioni', personal: 'Obiettivo', activity: 'Attività', achievements: 'Distintivi', timeline: 'Cronologia' },
};

const destinations = [
  ['ranking', '🏆'],
  ['missions', '⚑'],
  ['personal', '◎'],
  ['activity', '↗'],
  ['achievements', '★'],
  ['timeline', '◷'],
];

function NavigationGrid({ t, colors, onSelect }) {
  return (
    <View style={styles.grid}>
      {destinations.map(([key, symbol]) => (
        <Pressable key={key} accessibilityRole="button" accessibilityLabel={t[key]} onPress={() => onSelect(key)} style={[styles.tile, { borderColor: colors.border, backgroundColor: colors.background }]}>
          <Text style={[styles.symbol, { color: colors.gold }]}>{symbol}</Text>
          <Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.tileText, { color: colors.text }]}>{t[key]}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function ArenaQuickNavigation({ language, colors, onSelect }) {
  const t = translations[language] ?? translations.en;
  return (
    <View style={[styles.panel, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Text style={[styles.heading, { color: colors.gold }]}>{t.title}</Text>
      <NavigationGrid t={t} colors={colors} onSelect={onSelect} />
    </View>
  );
}

export function ArenaQuickSectionsDock({ language, colors, visible, onSelect }) {
  const [open, setOpen] = useState(false);
  const t = translations[language] ?? translations.en;
  if (!visible && !open) return null;
  return (
    <>
      {visible ? (
        <View style={styles.floating} pointerEvents="box-none">
          <Pressable accessibilityRole="button" accessibilityLabel={t.sections} onPress={() => setOpen(true)} style={[styles.floatingButton, { borderColor: colors.gold, backgroundColor: colors.background }]}>
            <Text style={[styles.floatingLabel, { color: colors.gold }]}>{t.sections}</Text>
          </Pressable>
        </View>
      ) : null}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <View style={styles.modalCenter}>
          <Pressable style={styles.scrim} accessibilityRole="button" accessibilityLabel={t.close} onPress={() => setOpen(false)} />
          <View style={[styles.modalPanel, { borderColor: colors.gold, backgroundColor: colors.surface }]}>
            <Text style={[styles.heading, { color: colors.gold }]}>{t.title}</Text>
            <NavigationGrid t={t} colors={colors} onSelect={key => { setOpen(false); requestAnimationFrame(() => onSelect(key)); }} />
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={[styles.closeButton, { borderColor: colors.gold }]}>
              <Text style={[styles.closeText, { color: colors.gold }]}>{t.close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 12 },
  heading: { fontWeight: '800', fontSize: 15, letterSpacing: 0.7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  tile: { width: '48%', flexGrow: 1, minHeight: 74, borderWidth: 1, borderRadius: 13, paddingHorizontal: 11, paddingVertical: 10, alignItems: 'flex-start', justifyContent: 'center', gap: 4 },
  symbol: { fontSize: 19, fontWeight: '800' },
  tileText: { fontWeight: '700', fontSize: 13 },
  floating: { position: 'absolute', bottom: 90, left: 0, right: 0, alignItems: 'center', zIndex: 31 },
  floatingButton: { borderWidth: 1.5, paddingHorizontal: 14, height: 40, borderRadius: 21, alignItems: 'center', justifyContent: 'center', elevation: 10 },
  floatingLabel: { fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },
  modalCenter: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.77)' },
  modalPanel: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 17 },
  closeButton: { alignSelf: 'center', borderWidth: 1, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 30 },
  closeText: { fontWeight: '800', fontSize: 12 },
});
