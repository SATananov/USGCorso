import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const labels = {
  bg: { line: 'ЛИНИЯ', bar: 'СТЪЛБОВЕ', noData: 'Няма измервания за този етап.', weight: 'Тегло (кг)', date: 'Дата' },
  en: { line: 'LINE', bar: 'BARS', noData: 'No measurements for this stage.', weight: 'Weight (kg)', date: 'Date' },
  it: { line: 'LINEA', bar: 'BARRE', noData: 'Nessuna misurazione per questa fase.', weight: 'Peso (kg)', date: 'Data' },
};

function LineBetween({ a, b }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return <View style={{ position: 'absolute', left: a.x, top: a.y, width: length, height: 3, backgroundColor: '#d4af37', transform: [{ translateX: dx / 2 - length / 2 }, { translateY: dy / 2 }, { rotate: `${angle}deg` }] }} />;
}

export default function USGPersonalStageChart({ items = [], language = 'en', referenceRange = null }) {
  const [mode, setMode] = useState('line');
  const t = labels[language] || labels.en;
  const sorted = useMemo(() => [...items].sort((a, b) => a.measured_on.localeCompare(b.measured_on)).slice(-24), [items]);
  const max = Math.ceil(Math.max(10, referenceRange?.[1] || 0, ...sorted.map(item => Number(item.weight_kg) || 0)) / 10) * 10;
  const width = Math.max(320, 92 + (sorted.length - 1) * 85);
  const plotWidth = width - 72;
  const points = sorted.map((item, index) => ({
    x: sorted.length === 1 ? 46 + plotWidth / 2 : 46 + index * plotWidth / (sorted.length - 1),
    y: 200 - Number(item.weight_kg) / max * 170
  }));
  return (
    <View>
      <View style={styles.controls}>
        {['line', 'bar'].map(key => <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: mode === key }} onPress={() => setMode(key)} style={[styles.control, mode === key && styles.selected]}><Text style={[styles.controlText, mode === key && styles.selectedText]}>{t[key]}</Text></Pressable>)}
      </View>
      {!sorted.length ? <Text style={styles.empty}>{t.noData}</Text> : (
        <>
          <Text style={styles.axisTitle}>{t.weight}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ width, height: 250 }}>
              {referenceRange ? (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: 46,
                    top: 200 - referenceRange[1] / max * 170,
                    width: plotWidth,
                    height: Math.max(2, (referenceRange[1] - referenceRange[0]) / max * 170),
                    backgroundColor: 'rgba(163, 186, 203, 0.38)',
                    borderTopWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: '#a3bacb'
                  }}
                />
              ) : null}
              {[0, 1, 2, 3, 4].map(step => (
                <View key={step}>
                  <Text style={[styles.tick, { top: 22 + step * 42.5 }]}>
                    {Math.round(max * (4 - step) / 4)}
                  </Text>
                  <View style={{
                    position: 'absolute',
                    left: 46,
                    top: 30 + step * 42.5,
                    width: plotWidth,
                    height: 1,
                    backgroundColor: '#473d2a'
                  }} />
                </View>
              ))}
              <View style={{
                position: 'absolute',
                left: 46,
                top: 30,
                width: 1,
                height: 170,
                backgroundColor: '#80704a'
              }} />
              {mode === 'line' ? (
                <>
                  {points.slice(1).map((point, index) => (
                    <LineBetween
                      key={sorted[index + 1].id}
                      a={points[index]}
                      b={point}
                    />
                  ))}
                  {points.map((point, index) => (
                    <View
                      key={sorted[index].id}
                      style={{
                        position: 'absolute',
                        left: point.x - 6,
                        top: point.y - 6,
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: '#d4af37'
                      }}
                    />
                  ))}
                </>
              ) : (
                points.map((point, index) => (
                  <View
                    key={sorted[index].id}
                    style={{
                      position: 'absolute',
                      left: point.x - 16,
                      top: point.y,
                      width: 32,
                      height: Math.max(2, 200 - point.y),
                      backgroundColor: '#d4af37',
                      borderTopLeftRadius: 5,
                      borderTopRightRadius: 5
                    }}
                  />
                ))
              )}
              {points.map((point, index) => (
                <View key={`${sorted[index].id}-labels`}>
                  <Text style={[styles.value, {
                    left: point.x - 38,
                    top: Math.max(0, point.y - 28)
                  }]}>
                    {Number(sorted[index].weight_kg).toLocaleString(
                      language === 'bg' ? 'bg-BG' : language === 'it' ? 'it-IT' : 'en-GB',
                      { maximumFractionDigits: 2 }
                    )} kg
                  </Text>
                  <Text style={[styles.date, {
                    left: point.x - 38,
                    top: 211
                  }]}>
                    {sorted[index].measured_on.slice(5)}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
          <Text style={[styles.axisTitle, { textAlign: 'center' }]}>
            {t.date}
          </Text>
          {referenceRange ? (
            <Text style={[styles.axisTitle, { textAlign: 'center', color: '#a3bacb', marginTop: 6 }]}>
              FCI №343 · {referenceRange[0]}–{referenceRange[1]} kg · {language === 'bg' ? 'синкава зона = породен ориентир' : language === 'it' ? 'fascia azzurra = riferimento di razza' : 'blue band = breed reference'}
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  control: { borderWidth: 1, borderColor: '#42371c', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  selected: { borderColor: '#d4af37', backgroundColor: '#1e1a12' },
  controlText: { color: '#aaaaaa', fontWeight: '700' },
  selectedText: { color: '#d4af37' },
  empty: { color: '#aaaaaa', fontSize: 14, marginVertical: 20 },
  date: { position: 'absolute', width: 76, textAlign: 'center', fontSize: 11, color: '#aaaaaa' },
  tick: { position: 'absolute', left: 0, width: 39, textAlign: 'right', fontSize: 12, color: '#aaaaaa' },
  value: { position: 'absolute', width: 76, textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#d4af37' },
  axisTitle: { fontSize: 12, color: '#aaaaaa', marginBottom: 8 },
});
