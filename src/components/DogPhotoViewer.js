import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import USGZoomSurface from './USGZoomSurface';

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
  const viewport = { width: Math.max(1, width - 36), height: Math.max(1, height - 36) };
  const closeViewer = onClose;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closeViewer}
    >
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
        <View style={styles.photoPreviewBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeViewer} />
          <View style={{ width: viewport.width, height: viewport.height, alignItems: 'center', justifyContent: 'center' }}>
            {visible && uri ? <USGZoomSurface source={{ uri }} viewport={viewport} style={{ width: viewport.width, height: viewport.height }} resetKey={resetKey} imageRevision={imageRevision} onImageError={() => onImageError?.(uri)} /> : null}
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
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close photo preview"
            style={styles.photoPreviewClose}
            onPress={closeViewer}
            hitSlop={12}
          >
            <Animated.Text style={styles.photoPreviewCloseText}>×</Animated.Text>
          </Pressable>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
