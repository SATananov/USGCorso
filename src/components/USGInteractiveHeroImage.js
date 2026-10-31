import { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

export default function USGInteractiveHeroImage({
  source,
  title,
}) {
  const [open, setOpen] = useState(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setOpen(false);
        return true;
      }
    );

    return () => subscription.remove();
  }, [open]);

  const fullscreenImageSize = useMemo(() => {
    const horizontalPadding = 32;
    const verticalReserve = 170;
    const aspectRatio = 1.5;
    const maxWidth = Math.max(1, screenWidth - horizontalPadding);
    const maxHeight = Math.max(1, screenHeight - verticalReserve);

    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { width, height };
  }, [screenWidth, screenHeight]);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${title} image fullscreen`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.imageFrame,
          pressed && styles.imageFramePressed,
        ]}
      >
        <Image source={source} style={styles.image} resizeMode="cover" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close fullscreen image"
          onPress={() => setOpen(false)}
          style={styles.modalRoot}
        >
          <View style={styles.modalContent}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close fullscreen image"
              onPress={(event) => {
                event.stopPropagation();
                setOpen(false);
              }}
              hitSlop={12}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>

            <Pressable
              onPress={(event) => event.stopPropagation()}
              style={[
                styles.fullscreenImageWrap,
                {
                  width: fullscreenImageSize.width,
                  height: fullscreenImageSize.height,
                },
              ]}
            >
              <Image source={source} style={styles.fullscreenImage} resizeMode="contain" />
            </Pressable>

            <Text pointerEvents="none" style={styles.fullscreenHint}>
              Tap outside the image or × to close
            </Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    imageFrame: {
      width: '100%',
      aspectRatio: 1.5,
      marginBottom: 14,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    imageFramePressed: {
      opacity: 0.88,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    modalRoot: {
      flex: 1,
      backgroundColor: colors.overlay,
    },
    modalContent: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 56,
      paddingBottom: 34,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: 54,
      right: 18,
      zIndex: 10,
      width: 46,
      height: 46,
      borderRadius: 23,
      borderWidth: 1,
      borderColor: colors.goldSoft,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonPressed: {
      backgroundColor: colors.activeSurface,
    },
    closeButtonText: {
      color: colors.gold,
      fontSize: 32,
      lineHeight: 34,
      fontWeight: '300',
      marginTop: -2,
    },
    fullscreenImageWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    fullscreenImage: {
      width: '100%',
      height: '100%',
    },
    fullscreenHint: {
      position: 'absolute',
      bottom: 18,
      color: '#b8b8b8',
      fontSize: 11,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
  });
}
