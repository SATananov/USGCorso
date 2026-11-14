import { useMemo, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import USGRecognitionCertificate from './USGRecognitionCertificate';
import { recognitionSnapshotFromApprovedCorso } from '../recognition/recognitionData';
import { radius } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

const COPY = {
  bg: {
    kicker: 'USG COMMUNITY HONORS',
    title: 'Сертификат за признание от USG общността',
    intro: 'Почетно признание за Cane Corso, споделено с общността. Сертификатът се издава само след проверка и одобрение от USG Admin.',
    how: 'Как се получава?',
    steps: [
      'Собственикът споделя профила на Cane Corso и неговата снимка в общността.',
      'При достигане на 50 валидни харесвания кучето ще бъде предложено за признание след активиране на системата за номинации.',
      'USG Admin преглежда допустимостта, снимката и данните. Номинацията сама по себе си не е одобрение.',
      'След одобрение ще се издава сертификат с уникален номер, дата и снимка от одобрената галерия.',
    ],
    note: 'Харесванията не се отпечатват на сертификата. Това не е родословен документ или официална киноложка оценка.',
    planned: 'Издаването и автоматичните номинации предстоят. В момента е достъпен само примерен изглед.',
    button: 'Виж примерния сертификат',
    unavailable: 'Примерът ще бъде достъпен, когато има одобрена снимка на Cane Corso в общността.',
    preview: 'ПРИМЕРЕН СЕРТИФИКАТ — НЕ Е ИЗДАДЕН',
    close: 'Затвори',
  },
  en: {
    kicker: 'USG COMMUNITY HONORS',
    title: 'USG Community Certificate of Recognition',
    intro: 'An honorary recognition for a Cane Corso shared with the community. A certificate may be issued only after USG Admin review and approval.',
    how: 'How does it work?',
    steps: [
      'The owner shares a Cane Corso profile and its photo with the community.',
      'At 50 valid likes, the dog will become eligible for nomination once the nomination system is activated.',
      'USG Admin reviews eligibility, photo and details. A nomination is not an approval.',
      'After approval, a certificate will be issued with a unique number, date and a photo from the approved gallery.',
    ],
    note: 'Like counts do not appear on certificates. This is not a pedigree document or an official kennel evaluation.',
    planned: 'Issuance and automatic nominations are not active yet. Only a design preview is available.',
    button: 'View sample certificate',
    unavailable: 'A sample will be available when the community has an approved Cane Corso photo.',
    preview: 'SAMPLE CERTIFICATE — NOT ISSUED',
    close: 'Close',
  },
  it: {
    kicker: 'USG COMMUNITY HONORS',
    title: 'Certificato di riconoscimento della comunità USG',
    intro: 'Un riconoscimento onorifico per un Cane Corso condiviso con la comunità. Il certificato viene rilasciato soltanto dopo la verifica e l’approvazione di USG Admin.',
    how: 'Come si ottiene?',
    steps: [
      'Il proprietario condivide il profilo e la foto del Cane Corso con la comunità.',
      'Con 50 apprezzamenti validi, il cane sarà idoneo alla candidatura quando il sistema di candidature sarà attivo.',
      'USG Admin verifica i requisiti, la foto e i dati. La candidatura non equivale all’approvazione.',
      'Dopo l’approvazione, verrà rilasciato un certificato con numero univoco, data e foto dalla galleria approvata.',
    ],
    note: 'Il numero di apprezzamenti non compare sul certificato. Non è un pedigree né una valutazione cinofila ufficiale.',
    planned: 'Il rilascio e le candidature automatiche non sono ancora attivi. È disponibile soltanto un’anteprima.',
    button: 'Visualizza il certificato di esempio',
    unavailable: 'L’esempio sarà disponibile quando nella comunità sarà presente una foto approvata di un Cane Corso.',
    preview: 'CERTIFICATO DI ESEMPIO — NON RILASCIATO',
    close: 'Chiudi',
  },
};

export default function USGRecognitionInfoSection({ corsos = [] }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const [showPreview, setShowPreview] = useState(false);
  const copy = COPY[language] ?? COPY.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const example = useMemo(() => {
    for (const corso of corsos) {
      const preview = recognitionSnapshotFromApprovedCorso(corso);
      if (preview) return preview;
    }
    return null;
  }, [corsos]);
  const certificateWidth = Math.max(720, Dimensions.get('window').width - 28);

  return (
    <View style={styles.section}>
      <Text style={styles.kicker}>{copy.kicker}</Text>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.intro}>{copy.intro}</Text>
      <Text style={styles.heading}>{copy.how}</Text>
      {copy.steps.map((step, index) => (
        <View key={index} style={styles.stepRow}>
          <Text style={styles.stepNumber}>{index + 1}</Text>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
      <Text style={styles.note}>{copy.note}</Text>
      <Text style={styles.planned}>{copy.planned}</Text>
      {example ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.button}
          style={styles.previewButton}
          onPress={() => setShowPreview(true)}
        >
          <Text style={styles.previewButtonText}>{copy.button}</Text>
        </Pressable>
      ) : (
        <Text style={styles.unavailable}>{copy.unavailable}</Text>
      )}
      <Modal
        visible={showPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPreview(false)}
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewLabel}>{copy.preview}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.close}
              style={styles.closeButton}
              onPress={() => setShowPreview(false)}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            style={styles.previewScroll}
            contentContainerStyle={styles.previewContent}
          >
            {example ? (
              <USGRecognitionCertificate certificate={example} width={certificateWidth} />
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    section: { marginTop: 16, padding: 18, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.goldDark, backgroundColor: colors.surface },
    kicker: { color: colors.goldSoft, fontSize: 10, letterSpacing: 2, fontWeight: '800' },
    title: { color: colors.gold, fontSize: 21, fontWeight: '800', lineHeight: 28, marginTop: 8 },
    intro: { color: colors.textSoft, fontSize: 13, lineHeight: 21, marginTop: 10 },
    heading: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 18, marginBottom: 10 },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 13 },
    stepNumber: { color: colors.background, backgroundColor: colors.gold, borderRadius: 16, width: 26, height: 26, textAlign: 'center', textAlignVertical: 'center', fontSize: 13, fontWeight: '900', overflow: 'hidden' },
    stepText: { flex: 1, color: colors.textSoft, fontSize: 12, lineHeight: 19 },
    note: { color: colors.goldSoft, fontSize: 11, lineHeight: 18, marginTop: 6 },
    planned: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 10 },
    previewButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold, paddingVertical: 14, paddingHorizontal: 12, borderRadius: radius.md, minHeight: 46, marginTop: 16 },
    previewButtonText: { color: colors.background, fontSize: 13, fontWeight: '800', textAlign: 'center' },
    unavailable: { color: colors.textMuted, fontSize: 12, marginTop: 12, lineHeight: 19 },
    overlay: { flex: 1, backgroundColor: '#090909' },
    previewHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
    previewLabel: { color: colors.goldSoft, fontSize: 12, fontWeight: '800', flex: 1 },
    closeButton: { width: 42, height: 42, borderRadius: 21, borderColor: colors.gold, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    closeText: { color: colors.gold, fontSize: 29, lineHeight: 33 },
    previewScroll: { flex: 1 },
    previewContent: { alignItems: 'center', paddingVertical: 22, paddingHorizontal: 14 },
  });
}
