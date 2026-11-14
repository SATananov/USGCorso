import { useMemo } from 'react';
import { Image, ImageBackground, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { useLanguage } from '../i18n/LanguageContext';
import { recognitionCopy, recognitionColors } from '../recognition/recognitionCopy';
import { formatRecognitionDate } from '../recognition/recognitionData';

const FRAME_RATIO = 3508 / 2480;
const DARK = '#38220D';
const GOLD = '#976015';

function PositionedText({ style, text, size, color = DARK, bold = false, align = 'left', lines = 1 }) {
  return (
    <Text
      allowFontScaling={false}
      numberOfLines={lines}
      adjustsFontSizeToFit
      minimumFontScale={0.65}
      style={[style, { fontSize: size, color, fontWeight: bold ? '700' : '500', textAlign: align }]}
    >
      {text}
    </Text>
  );
}

export default function USGRecognitionCertificate({ certificate, width = 350, fitToScreen = true }) {
  const { language } = useLanguage();
  const copy = recognitionCopy[language] ?? recognitionCopy.en;
  const colorCopy = recognitionColors[language] ?? recognitionColors.en;
  const { width: windowWidth } = useWindowDimensions();
  const requestedWidth = Number.isFinite(Number(width)) && Number(width) > 0 ? Number(width) : 350;
  const displayWidth = fitToScreen ? Math.max(1, Math.min(requestedWidth, Math.max(1, windowWidth - 28))) : requestedWidth;
  const scale = displayWidth / 1491;
  const issued = certificate?.status === 'issued' && Boolean(certificate?.certificate_number);
  const style = useMemo(() => createStyles(displayWidth), [displayWidth]);
  if (!certificate?.dog_name || !certificate?.photo_url || !certificate?.source_photo_path) return null;
  const fields = [
    [copy.name, certificate.dog_name],
    [copy.sex, copy[certificate.sex] ?? copy.unknown],
    [copy.color, colorCopy[certificate.color] ?? certificate.color ?? copy.unknown],
    [copy.born, formatRecognitionDate(certificate.birth_date, language) || copy.unknown],
    [copy.owner, certificate.owner_name || copy.unknown],
  ];

  return (
    <View style={[style.frame, { width: displayWidth }]}>
      <ImageBackground
        source={require('../../assets/usg-recognition-parchment.png')}
        resizeMode="stretch"
        style={{ width: '100%', aspectRatio: FRAME_RATIO }}
      >
        <Image
          source={require('../../assets/usg-recognition-original-crest.png')}
          resizeMode="contain"
          style={{ position: 'absolute', left: '40%', top: '1%', width: '20%', height: '27%' }}
        />
        <PositionedText style={style.title} size={Math.max(6, (language === 'bg' ? 47 : 55) * scale)} text={copy.title} color={DARK} bold align="center" lines={2} />
        <PositionedText style={style.issuer} size={Math.max(5, 22 * scale)} text={copy.issuedBy} color={GOLD} align="center" />
        <PositionedText style={style.statement} size={Math.max(5, 18 * scale)} text={copy.statement} color={DARK} align="center" lines={3} />
        <Image source={{ uri: certificate.photo_url }} resizeMode="cover" style={style.photo} />
        {fields.map(([label, value], index) => (
          <View key={label} style={[style.field, { top: `${43.9 + index * 4.55}%` }]}>
            <PositionedText style={style.fieldLabel} size={Math.max(5, 21 * scale)} text={`${label}:`} bold />
            <PositionedText
              style={[style.fieldValue, index === 0 && style.recognitionFieldValueScript]}
              size={index === 0 ? Math.max(7, 31 * scale) : Math.max(5.5, 26 * scale)}
              text={value}
            />
          </View>
        ))}
        {issued ? (
          <>
            <PositionedText style={[style.footerLeft, style.recognitionIssuedFooter]} size={Math.max(4.5, 18 * scale)} text={`${copy.issued}: ${formatRecognitionDate(certificate.issued_at, language)}`} color={DARK} align="center" lines={2} />
            <PositionedText style={[style.footerRight, style.recognitionIssuedFooter]} size={Math.max(4.5, 18 * scale)} text={`${copy.number} ${certificate.certificate_number}`} color={DARK} align="center" lines={2} />
          </>
        ) : null}
        <PositionedText style={style.note} size={Math.max(3.8, 13 * scale)} text={copy.note} color={DARK} align="center" lines={2} />
        {!issued ? <View style={style.draftMask}><PositionedText size={Math.max(9, 60 * scale)} text={copy.draft} color="#7E1C1C" bold align="center" lines={2} /></View> : null}
      </ImageBackground>
    </View>
  );
}

function createStyles(width) {
  return StyleSheet.create({
    frame: { alignSelf: 'center', overflow: 'hidden', backgroundColor: '#EFD6A8' },
    recognitionLayout03B03: { display: 'none' },
    title: { position: 'absolute', left: '17%', width: '66%', top: '28.8%', height: '7.2%', textAlignVertical: 'center', includeFontPadding: false },
    issuer: { position: 'absolute', left: '18%', width: '64%', top: '33.7%', height: '2.2%', textAlignVertical: 'center', includeFontPadding: false },
    statement: { position: 'absolute', left: '34%', width: '52%', top: '40.3%', height: '3.3%', textAlignVertical: 'center', includeFontPadding: false },
    photo: { position: 'absolute', left: '12.3%', top: '43.7%', width: '18.1%', height: '27.4%', borderRadius: 2 },
    field: { position: 'absolute', left: '35.6%', width: '38.6%', height: '3.2%', flexDirection: 'row', alignItems: 'flex-start' },
    fieldLabel: { width: '39%', fontFamily: 'serif', lineHeight: Math.max(7, 24 * width / 1491), includeFontPadding: false, textAlignVertical: 'top' },
    fieldValue: { width: '60%', fontFamily: 'serif', lineHeight: Math.max(8, 29 * width / 1491), includeFontPadding: false, textAlignVertical: 'top' },
    recognitionFieldValueScript: { fontFamily: 'serif', fontStyle: 'italic', fontWeight: '700' },
    footerLeft: { position: 'absolute', left: '18%', top: '83.9%', width: '20%', height: '5%' },
    footerRight: { position: 'absolute', left: '62%', top: '83.9%', width: '20%', height: '5%' },
    recognitionIssuedFooter: { textAlignVertical: 'center', includeFontPadding: false, paddingHorizontal: 2 },
    note: { position: 'absolute', left: '24%', width: '52%', top: '93%', height: '2.7%' },
    draftMask: { position: 'absolute', left: '31%', top: '74%', width: '38%', transform: [{ rotate: '-12deg' }], backgroundColor: 'rgba(249,226,183,0.75)', borderColor: '#7E1C1C', borderWidth: Math.max(1, width / 700), padding: 3 },
  });
}
