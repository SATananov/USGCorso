import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { GestureDetector, usePanGesture, usePinchGesture, useSimultaneousGestures, useTapGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const DOUBLE_TAP_DURATION = 160;

export default function USGZoomSurface({ source, renderContent, aspectRatio, viewport: fixedViewport, style, maxScale = 3, resetKey, imageRevision = 0, onImageError }) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState(null);
  const scale = useSharedValue(1);
  const panEnabled = useSharedValue(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const viewport = fixedViewport ?? layout;
  const sourceKey = typeof source === 'number' ? source : source?.uri;
  useEffect(() => {
    setImageSize(null);
  }, [sourceKey, resetKey, imageRevision]);
  useEffect(() => {
    scale.value = 1;
    panEnabled.value = false;
    translateX.value = 0;
    translateY.value = 0;
  }, [sourceKey, resetKey, imageRevision, viewport.width, viewport.height, scale, panEnabled, translateX, translateY]);
  const fittedSize = useMemo(() => {
    const ratio = aspectRatio || (imageSize ? imageSize.width / imageSize.height : 0);
    if (!ratio || !Number.isFinite(ratio)) return viewport;
    const width = Math.min(viewport.width, viewport.height * ratio);
    return { width, height: width / ratio };
  }, [aspectRatio, imageSize, viewport.width, viewport.height]);

  const clampX = (value, zoom) => {
    'worklet';
    const limit = Math.max(0, (fittedSize.width * zoom - viewport.width) / 2);
    return Math.max(-limit, Math.min(limit, value));
  };

  const clampY = (value, zoom) => {
    'worklet';
    const limit = Math.max(0, (fittedSize.height * zoom - viewport.height) / 2);
    return Math.max(-limit, Math.min(limit, value));
  };

  const pinch = usePinchGesture({
    onUpdate: (event) => {
      const previousScale = scale.value;
      const nextScale = Math.max(1, Math.min(maxScale, previousScale * event.scaleChange));
      const scaleRatio = nextScale / previousScale;
      const focalOffsetX = event.focalX - viewport.width / 2 - translateX.value;
      const focalOffsetY = event.focalY - viewport.height / 2 - translateY.value;

      translateX.value = clampX(translateX.value + (1 - scaleRatio) * focalOffsetX, nextScale);
      translateY.value = clampY(translateY.value + (1 - scaleRatio) * focalOffsetY, nextScale);
      scale.value = nextScale;
    },
    onDeactivate: () => {
      panEnabled.value = scale.value > 1;
      if (scale.value <= 1) {
        scale.value = 1;
        translateX.value = 0;
        translateY.value = 0;
      }
    },
  });

  const pan = usePanGesture({
    enabled: panEnabled,
    maxPointers: 1,
    onActivate: () => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    },
    onUpdate: (event) => {
      if (scale.value <= 1) return;
      translateX.value = clampX(startX.value + event.translationX, scale.value);
      translateY.value = clampY(startY.value + event.translationY, scale.value);
    },
  });

  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onActivate: (event) => {
      if (scale.value > 1) {
        scale.value = withTiming(1, { duration: DOUBLE_TAP_DURATION });
        panEnabled.value = false;
        translateX.value = withTiming(0, { duration: DOUBLE_TAP_DURATION });
        translateY.value = withTiming(0, { duration: DOUBLE_TAP_DURATION });
      } else {
        const targetScale = Math.min(2, maxScale);
        const offsetX = event.x - viewport.width / 2;
        const offsetY = event.y - viewport.height / 2;
        scale.value = withTiming(targetScale, { duration: DOUBLE_TAP_DURATION });
        panEnabled.value = true;
        translateX.value = withTiming(clampX((1 - targetScale) * offsetX, targetScale), {
          duration: DOUBLE_TAP_DURATION,
        });
        translateY.value = withTiming(clampY((1 - targetScale) * offsetY, targetScale), {
          duration: DOUBLE_TAP_DURATION,
        });
      }
    },
  });

  const gesture = useSimultaneousGestures(pinch, pan, doubleTap);
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={style ?? { flex: 1, width: '100%' }} onLayout={(event) => {
      if (!fixedViewport) {
        const { width, height } = event.nativeEvent.layout;
        setLayout((current) => current.width === width && current.height === height ? current : { width, height });
      }
    }}>
      {viewport.width > 0 && viewport.height > 0 ? (
        <GestureDetector gesture={gesture}>
          <View style={{ width: viewport.width, height: viewport.height, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <Animated.View style={[{ width: fittedSize.width, height: fittedSize.height }, imageStyle]}>
              {renderContent ? renderContent(fittedSize) : (
                <Animated.Image key={`${sourceKey}:${imageRevision}`} source={source} resizeMode="contain" style={{ width: '100%', height: '100%' }} onLoad={(event) => {
                  const size = event.nativeEvent.source;
                  if (size?.width > 0 && size?.height > 0) setImageSize({ width: size.width, height: size.height });
                }} onError={() => onImageError?.()} />
              )}
            </Animated.View>
          </View>
        </GestureDetector>
      ) : null}
    </View>
  );
}
