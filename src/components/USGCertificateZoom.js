import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import USGRecognitionCertificate from './USGRecognitionCertificate';
import USGZoomSurface from './USGZoomSurface';

const CERTIFICATE_RATIO = 3508 / 2480;

function CertificateContent({ certificate, width, height }) {
  const layoutWidth = Math.max(720, width);
  const layoutHeight = layoutWidth / CERTIFICATE_RATIO;
  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: layoutWidth, height: layoutHeight, left: (width - layoutWidth) / 2, top: (height - layoutHeight) / 2, transform: [{ scale: width / layoutWidth }] }}>
        <USGRecognitionCertificate certificate={certificate} width={layoutWidth} fitToScreen={false} />
      </View>
    </View>
  );
}

export default function USGCertificateZoom({ certificate, resetKey }) {
  return (
    <GestureHandlerRootView style={{ flex: 1, marginHorizontal: 14 }}>
      <USGZoomSurface aspectRatio={CERTIFICATE_RATIO} maxScale={5} resetKey={resetKey} renderContent={({ width, height }) => <CertificateContent certificate={certificate} width={width} height={height} />} />
    </GestureHandlerRootView>
  );
}
