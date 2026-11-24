import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, Text, useWindowDimensions, View } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const DOUBLE_TAP_DURATION = 160;

export default function DogPhotoViewer({
  visible,
  uri,
  onClose,
  styles,
  resetKey = uri,
  imageError = false,
  imageRevision = 0,
  errorLabel,
  retryLabel,
  onImageError,
  onRetry,
  retrying = false,
}) {
  const { width, height } = useWindowDimensions();
  const [imageSize, setImageSize] = useState(null);
  const scale = useSharedValue(1);
  const zoomed = useSharedValue(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setImageSize(null);
      scale.value = 1;
      zoomed.value = false;
      translateX.value = 0;
      translateY.value = 0;
    }
  }, [resetKey, visible, scale, zoomed, translateX, translateY]);

  const viewport = { width: Math.max(1, width - 36), height: Math.max(1, height - 36) };
  const fittedSize = useMemo(() => {
    if (!imageSize) return viewport;
    const ratio = Math.min(viewport.width / imageSize.width, viewport.height / imageSize.height);
    return { width: imageSize.width * ratio, height: imageSize.height * ratio };
  }, [imageSize, viewport.height, viewport.width]);

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
      const nextScale = Math.max(1, Math.min(3, previousScale * event.scaleChange));
      const scaleRatio = nextScale / previousScale;
      const focalOffsetX = event.focalX - viewport.width / 2 - translateX.value;
      const focalOffsetY = event.focalY - viewport.height / 2 - translateY.value;

      translateX.value = clampX(translateX.value + (1 - scaleRatio) * focalOffsetX, nextScale);
      translateY.value = clampY(translateY.value + (1 - scaleRatio) * focalOffsetY, nextScale);
      scale.value = nextScale;
      zoomed.value = nextScale > 1;
    },
    onDeactivate: () => {
      if (scale.value <= 1) {
        scale.value = 1;
        zoomed.value = false;
        translateX.value = 0;
        translateY.value = 0;
      }
    },
  });

  const pan = usePanGesture({
    enabled: zoomed,
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
        zoomed.value = false;
        translateX.value = withTiming(0, { duration: DOUBLE_TAP_DURATION });
        translateY.value = withTiming(0, { duration: DOUBLE_TAP_DURATION });
      } else {
        const targetScale = 2;
        const offsetX = event.x - viewport.width / 2;
        const offsetY = event.y - viewport.height / 2;
        scale.value = withTiming(targetScale, { duration: DOUBLE_TAP_DURATION });
        zoomed.value = true;
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

  function closeViewer() {
    scale.value = 1;
    zoomed.value = false;
    translateX.value = 0;
    translateY.value = 0;
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closeViewer}
    >
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.96)' }}>
        <Pressable style={styles.photoPreviewBackdrop} onPress={closeViewer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close photo preview"
            style={styles.photoPreviewClose}
            onPress={(event) => {
              event.stopPropagation();
              closeViewer();
            }}
            hitSlop={12}
          >
            <Animated.Text style={styles.photoPreviewCloseText}>×</Animated.Text>
          </Pressable>
          <Pressable
            style={{ width: viewport.width, height: viewport.height, alignItems: 'center', justifyContent: 'center' }}
            onPress={(event) => event.stopPropagation()}
          >
            <GestureDetector gesture={gesture}>
              <View style={{ width: viewport.width, height: viewport.height, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <Animated.View style={[{ width: fittedSize.width, height: fittedSize.height }, imageStyle]}>
                  <Animated.Image
                    key={imageRevision}
                    source={{ uri }}
                    onLoad={(event) => {
                      const { width: imageWidth, height: imageHeight } = event.nativeEvent.source;
                      setImageSize({ width: imageWidth, height: imageHeight });
                    }}
                    onError={() => onImageError?.(uri)}
                    resizeMode="contain"
                    style={{ width: '100%', height: '100%' }}
                  />
                </Animated.View>
              </View>
            </GestureDetector>
            {imageError ? (
              <View pointerEvents="box-none" style={styles.photoPreviewErrorOverlay}>
                <View style={styles.photoPreviewErrorCard}>
                  <Text style={styles.photoErrorText}>{errorLabel}</Text>
                  <Pressable
                    accessibilityRole="button"
                    disabled={retrying}
                    onPress={(event) => {
                      event.stopPropagation();
                      onRetry?.();
                    }}
                    style={styles.photoRetryButton}
                  >
                    <Text style={styles.photoRetryText}>{retryLabel}</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
}
