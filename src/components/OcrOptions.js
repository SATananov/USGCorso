import { Pressable, StyleSheet, Text, View } from 'react-native';

const copy = {
  bg: { language: 'Език на документа', layout: 'Вид текст', processing: 'Изображение', all: 'Смесен', auto: 'Авто / страница', block: 'Текстов блок', sparse: 'Отделни надписи', original: 'Оригинал', contrast: 'Контраст' },
  en: { language: 'Document language', layout: 'Text layout', processing: 'Image', all: 'Mixed', auto: 'Auto / page', block: 'Text block', sparse: 'Sparse text', original: 'Original', contrast: 'Contrast' },
  it: { language: 'Lingua del documento', layout: 'Tipo di testo', processing: 'Immagine', all: 'Misto', auto: 'Auto / pagina', block: 'Blocco di testo', sparse: 'Testo sparso', original: 'Originale', contrast: 'Contrasto' },
};

export default function OcrOptions({ colors, language, value, onChange, disabled }) {
  const labels = copy[language] ?? copy.en;
  const groups = [
    ['language', ['bg', 'en', 'it', 'all']],
    ['layout', ['auto', 'block', 'sparse']],
    ['processing', ['original', 'contrast']],
  ];
  return (
    <View style={styles.root}>
      {groups.map(([field, options]) => (
        <View key={field} style={styles.group}>
          <Text style={[styles.label, { color: colors.textSoft }]}>{labels[field]}</Text>
          <View style={styles.row}>
            {options.map((item) => {
              const active = value[field] === item;
              return (
                <Pressable key={item} disabled={disabled} accessibilityRole="button" accessibilityState={{ selected: active, disabled: Boolean(disabled) }} onPress={() => onChange({ ...value, [field]: item })} style={[styles.option, { borderColor: colors.gold, backgroundColor: active ? colors.gold : colors.surface }]}>
                  <Text style={[styles.text, { color: active ? '#090909' : colors.gold }]}>{labels[item] ?? item.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 10, marginBottom: 12 },
  group: { gap: 5 },
  label: { fontSize: 13, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  option: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 9, minHeight: 40, justifyContent: 'center' },
  text: { fontSize: 12, fontWeight: '700' },
});
