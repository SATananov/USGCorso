import { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CANE_CORSO_GROWTH_SOURCES, CANE_CORSO_PUBLISHED_MEANS, dogAgeInMonths } from '../dogs/caneCorsoGrowthReference';
import { useTheme } from '../theme/ThemeContext';

const labels = {
  bg: {
    title: 'РАСТЕЖ — СРАВНЕНИЕ', line: 'ЛИНИЯ', bar: 'СТЪЛБОВЕ', age: 'Възраст (месеци)',
    published: 'Публикувана средна', own: 'Моето куче', missingBirth: 'Добави дата на раждане в профила, за да сравняваме измерванията по възраст.',
    noRecords: 'Добави измерване на теглото, за да видиш личното развитие.',
    noYoung: 'Месечните публикувани средни стойности са само за възраст 1–12 месеца. Измерванията след тази възраст остават в историята.',
    disclosure: 'Ориентировъчно сравнение, не диагноза. Публикуваните месечни стойности са за ограничена група Cane Corso от една развъдна линия, не са официален стандарт или медицинска норма. Всяко Cane Corso е индивидуално. Важни са общото състояние, телосложението и последователният растеж. Обсъди притесненията с ветеринарен лекар.',
    fci: 'FCI №343: стандартът определя тегло за възрастни (мъжки 45–50 кг; женски 40–45 кг), но не дава месечни норми.',
    source: 'Научен източник (2026)', note: 'Точките са от реално измерени дати; средните са публикувани за цели месеци.',
    noRange: 'Няма валидиран месечен диапазон за породата в използваното изследване. Не обозначаваме „под/над норма“ само от средната.',
    tableTitle: 'ТАБЛИЦА ПО ВЪЗРАСТ', tableAge: 'Месеци', tableMean: 'Публикувана средна (кг)', tableActual: 'Моето куче (кг)',
  },
  en: {
    title: 'GROWTH — COMPARISON', line: 'LINE', bar: 'BARS', age: 'Age (months)',
    published: 'Published mean', own: 'My dog', missingBirth: 'Add a date of birth to the dog profile to compare measurements by age.',
    noRecords: 'Add a weight measurement to see your dog’s growth.',
    noYoung: 'The published monthly means cover only ages 1–12 months. Later measurements remain in the history.',
    disclosure: 'Illustrative comparison, not a diagnosis. The monthly figures come from a limited Cane Corso breeding-line sample, not an official breed standard or clinical normal range. Each Cane Corso is an individual. Body condition and consistent growth matter. Discuss concerns with your veterinarian.',
    fci: 'FCI №343 specifies adult weights (male 45–50 kg; female 40–45 kg), not monthly norms.',
    source: 'Research source (2026)', note: 'Dog points represent measured dates; published averages are at whole months.',
    noRange: 'No validated monthly breed-wide range was available in this study. Being above or below the mean is not labelled abnormal.',
    tableTitle: 'AGE REFERENCE TABLE', tableAge: 'Months', tableMean: 'Published mean (kg)', tableActual: 'My dog (kg)',
  },
  it: {
    title: 'CRESCITA — CONFRONTO', line: 'LINEA', bar: 'BARRE', age: 'Età (mesi)',
    published: 'Media pubblicata', own: 'Il mio cane', missingBirth: 'Aggiungi la data di nascita al profilo del cane per confrontare le misurazioni.',
    noRecords: 'Aggiungi una misurazione del peso per vedere la crescita del cane.',
    noYoung: 'Le medie mensili pubblicate coprono solo 1–12 mesi. Le misurazioni successive restano nello storico.',
    disclosure: 'Confronto indicativo, non diagnostico. I valori mensili provengono da un campione limitato di una linea di allevamento Cane Corso, non da uno standard ufficiale o da un intervallo clinico. Ogni Cane Corso è diverso. Contano la condizione corporea e la crescita nel tempo. Consulta il veterinario in caso di dubbi.',
    fci: 'FCI №343 indica i pesi adulti (maschi 45–50 kg; femmine 40–45 kg), non valori mensili.',
    source: 'Fonte scientifica (2026)', note: 'I punti del cane derivano da date reali; le medie pubblicate sono mensili.',
    noRange: 'Questo studio non fornisce un intervallo mensile validato per tutta la razza. Uno scarto dalla media non significa anomalia.',
    tableTitle: 'TABELLA PER ETÀ', tableAge: 'Mesi', tableMean: 'Media pubblicata (kg)', tableActual: 'Il mio cane (kg)',
  },
};

const PLOT_W = 650;
const PLOT_H = 220;
const LEFT = 28;
const RIGHT = 18;
const TOP = 10;
const BOTTOM = 30;
const COLOR_REF = '#b6a783';
const COLOR_DOG = '#d4af37';

function segment(a, b, color, thickness = 2, dashed = false) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return <View key={`${a.key}-${b.key}-${color}`} style={{ position: 'absolute', left: a.x, top: a.y - thickness / 2, width: length, height: thickness, backgroundColor: color, opacity: dashed ? 0.7 : 1, transform: [{ translateX: dx / 2 - length / 2 }, { translateY: dy / 2 }, { rotate: `${angle}deg` }] }} />;
}

function Dot({ point, color, size = 8 }) {
  return <View style={{ position: 'absolute', left: point.x - size / 2, top: point.y - size / 2, width: size, height: size, borderRadius: size / 2, backgroundColor: color, borderWidth: 1, borderColor: '#08080a' }} />;
}

export default function USGGrowthComparisonChart({ dog, history, language = 'en', display = 'both' }) {
  const { colors } = useTheme();
  const copy = labels[language] || labels.en;
  const [mode, setMode] = useState('line');
  const sex = dog?.sex === 'female' ? 'female' : dog?.sex === 'male' ? 'male' : null;
  const birthDate = dog?.birth_date;
  const reference = useMemo(() => sex ? CANE_CORSO_PUBLISHED_MEANS.map(item => ({ month: item.month, kg: item[sex] })) : [], [sex]);
  const measured = useMemo(() => (history || []).map(item => ({ id: item.id, month: dogAgeInMonths(birthDate, item.measured_on), kg: Number(item.weight_kg) })).filter(item => item.month !== null && item.month >= 1 && item.month <= 12 && Number.isFinite(item.kg)).sort((a, b) => a.month - b.month), [history, birthDate]);
  const maxWeight = Math.ceil(Math.max(50, ...reference.map(p => p.kg), ...measured.map(p => p.kg)) / 10) * 10;
  const x = m => LEFT + (m - 1) * (PLOT_W - LEFT - RIGHT) / 11;
  const y = kg => TOP + (maxWeight - kg) * (PLOT_H - TOP - BOTTOM) / maxWeight;
  const refPoints = reference.map(p => ({ ...p, x: x(p.month), y: y(p.kg), key: `r${p.month}` }));
  const dogPoints = measured.map(p => ({ ...p, x: x(p.month), y: y(p.kg), key: `d${p.id}` }));
  const chartAvailable = Boolean(sex);
  const actualByMonth = month => {
    const nearby = measured.filter(point => Math.round(point.month) === month);
    return nearby.length ? nearby.reduce((best, point) => Math.abs(point.month - month) < Math.abs(best.month - month) ? point : best) : null;
  };
  const formatKg = value => Number(value).toLocaleString(language === 'bg' ? 'bg-BG' : language === 'it' ? 'it-IT' : 'en-GB', { maximumFractionDigits: 2 });
  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.gold }]}>{copy.title}</Text>
      {display !== 'table' ? <View style={styles.toggle}>
        {['line', 'bar'].map(key => <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: mode === key }} onPress={() => setMode(key)} style={[styles.option, { borderColor: mode === key ? colors.gold : colors.border, backgroundColor: mode === key ? colors.activeSurface : colors.background }]}><Text style={{ color: mode === key ? colors.gold : colors.textSoft, fontWeight: '700' }}>{copy[key]}</Text></Pressable>)}
      </View> : null}
      {!sex ? <Text style={[styles.copy, { color: colors.textSoft }]}>{language === 'bg' ? 'Посочи пола на кучето, за да видиш съответните публикувани средни стойности.' : language === 'it' ? 'Indica il sesso del cane per vedere le medie pubblicate.' : 'Set the dog’s sex to see the corresponding published means.'}</Text> : null}
      {!birthDate ? <Text style={[styles.copy, { color: colors.textSoft }]}>{copy.missingBirth}</Text> : null}
      {birthDate && !history?.length ? <Text style={[styles.copy, { color: colors.textSoft }]}>{copy.noRecords}</Text> : null}
      {chartAvailable ? (
        <>
          {display !== 'table' ? <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mode === 'line' ? (
              <View style={{ width: PLOT_W, height: PLOT_H }}>
                {[0, 10, 20, 30, 40, 50, 60, 70].filter(n => n <= maxWeight).map(n => (
                  <View key={n}>
                    <View style={{ position: 'absolute', left: LEFT, right: RIGHT, top: y(n), height: 1, backgroundColor: colors.border }} />
                    <Text style={{ position: 'absolute', left: 0, top: y(n) - 8, width: LEFT - 5, textAlign: 'right', fontSize: 10, color: colors.textMuted }}>{n}</Text>
                  </View>
                ))}
                {refPoints.slice(1).map((p, i) => segment(refPoints[i], p, COLOR_REF, 2))}
                {dogPoints.slice(1).map((p, i) => segment(dogPoints[i], p, COLOR_DOG, 3))}
                {refPoints.map(p => <Dot key={p.key} point={p} color={COLOR_REF} size={5} />)}
                {dogPoints.map(p => <Dot key={p.key} point={p} color={COLOR_DOG} size={10} />)}
                {reference.map(p => <Text key={p.month} style={{ position: 'absolute', left: x(p.month) - 9, top: PLOT_H - 19, color: colors.textSoft, fontSize: 10 }}>{p.month}</Text>)}
              </View>
            ) : (
              <View style={styles.barRow}>
                {reference.map(item => {
                  const actual = actualByMonth(item.month);
                  return (
                    <View key={item.month} style={styles.barGroup}>
                      <View style={styles.barPair}>
                        <View style={[styles.bar, { height: Math.max(2, item.kg / maxWeight * 175), backgroundColor: COLOR_REF }]} />
                        {actual ? <View style={[styles.bar, { height: Math.max(2, actual.kg / maxWeight * 175), backgroundColor: COLOR_DOG }]} /> : <View style={styles.barPlaceholder} />}
                      </View>
                      <Text style={{ fontSize: 11, color: colors.textSoft }}>{item.month} {language === 'bg' ? 'м.' : language === 'it' ? 'm.' : 'mo'}</Text>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>{actual ? `${actual.kg} kg` : '—'}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
          {measured.length === 0 ? <Text style={[styles.copy, { color: colors.textSoft }]}>{copy.noYoung}</Text> : null}
          <Text style={[styles.axis, { color: colors.textMuted }]}>{copy.age}</Text>
          <View style={styles.legend}><View style={[styles.swatch, { backgroundColor: COLOR_REF }]} /><Text style={[styles.legendText, { color: colors.textSoft }]}>{copy.published}</Text><View style={[styles.swatch, { backgroundColor: COLOR_DOG }]} /><Text style={[styles.legendText, { color: colors.textSoft }]}>{copy.own}</Text></View>
          <Text style={[styles.detail, { color: colors.textMuted }]}>{copy.note}</Text>
          </> : null}
          {display !== 'chart' ? <>
          <Text style={[styles.tableTitle, { color: colors.gold }]}>{copy.tableTitle}</Text>
          <View style={[styles.tableRow, styles.tableHeader, { borderColor: colors.border }]}>
            <Text style={[styles.tableCell, { color: colors.textSoft }]}>{copy.tableAge}</Text>
            <Text style={[styles.tableCell, { color: colors.textSoft }]}>{copy.tableMean}</Text>
            <Text style={[styles.tableCell, { color: colors.textSoft }]}>{copy.tableActual}</Text>
          </View>
          {reference.map(item => {
            const actual = actualByMonth(item.month);
            return (
              <View key={item.month} style={[styles.tableRow, { borderColor: colors.border }]}>
                <Text style={[styles.tableCell, { color: colors.textSoft }]}>{item.month}</Text>
                <Text style={[styles.tableCell, { color: COLOR_REF }]}>{formatKg(item.kg)}</Text>
                <Text style={[styles.tableCell, { color: actual ? COLOR_DOG : colors.textMuted }]}>{actual ? formatKg(actual.kg) : '—'}</Text>
              </View>
            );
          })}
          </> : null}
        </>
      ) : null}
      <Text style={[styles.copy, { color: colors.textSoft }]}>{copy.disclosure}</Text>
      <Text style={[styles.detail, { color: colors.textMuted }]}>{copy.noRange}</Text>
      <Text style={[styles.detail, { color: colors.textMuted }]}>{copy.fci}</Text>
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL(CANE_CORSO_GROWTH_SOURCES.article)}><Text style={[styles.link, { color: colors.gold }]}>{copy.source}</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 14 },
  toggle: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  option: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  barRow: { minHeight: 225, flexDirection: 'row', alignItems: 'flex-end', gap: 12, paddingBottom: 18 },
  barGroup: { minWidth: 60, alignItems: 'center', gap: 5 },
  barPair: { height: 185, alignItems: 'flex-end', flexDirection: 'row', gap: 3 },
  bar: { width: 22, borderRadius: 4 },
  barPlaceholder: { width: 22, height: 2, backgroundColor: 'transparent' },
  axis: { textAlign: 'center', fontSize: 11, marginTop: 4 },
  legend: { flexDirection: 'row', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginVertical: 12 },
  swatch: { width: 11, height: 11, borderRadius: 2 },
  legendText: { fontSize: 12, marginRight: 12 },
  copy: { lineHeight: 20, fontSize: 13, marginTop: 12 },
  detail: { lineHeight: 18, fontSize: 11, marginTop: 10 },
  link: { marginTop: 12, fontWeight: '700', textDecorationLine: 'underline' },
  tableTitle: { marginTop: 20, marginBottom: 10, fontWeight: '800', fontSize: 15 },
  tableRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, minHeight: 36 },
  tableHeader: { minHeight: 48 },
  tableCell: { flex: 1, fontSize: 12, paddingHorizontal: 5, paddingVertical: 7, textAlign: 'center' },
});
