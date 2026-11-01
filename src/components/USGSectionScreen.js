import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthWelcomeCarousel from '../auth/AuthWelcomeCarousel';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';
import USGScrollHint from './USGScrollHint';

export default function USGSectionScreen({
  kicker,
  title,
  subtitle,
  body,
  children,
  heroImage,
  heroCarousel = false,
  showScrollHint = false,
}) {
  const scrollRef = useRef(null);
  const [isHeroOpen, setIsHeroOpen] = useState(false);
  const [isScrollHintVisible, setIsScrollHintVisible] = useState(showScrollHint);
  const [carouselResetKey, setCarouselResetKey] = useState(0);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  useFocusEffect(
    useCallback(() => {
      if (!heroCarousel) {
        return undefined;
      }

      scrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
      setIsScrollHintVisible(showScrollHint);
      setCarouselResetKey((value) => value + 1);

      return undefined;
    }, [heroCarousel, showScrollHint])
  );

  const closeHero = () => {
    setIsHeroOpen(false);
  };

  useEffect(() => {
    if (!isHeroOpen) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        closeHero();
        return true;
      }
    );

    return () => subscription.remove();
  }, [isHeroOpen]);

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          if (
            event.nativeEvent.contentOffset.y > 24 &&
            isScrollHintVisible
          ) {
            setIsScrollHintVisible(false);
          }
        }}
        scrollEventThrottle={16}
      >
        {heroCarousel ? (
          <AuthWelcomeCarousel key={`section-carousel-${carouselResetKey}`} colors={colors} />
        ) : heroImage ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${title} image fullscreen`}
            onPress={() => setIsHeroOpen(true)}
            style={({ pressed }) => [
              styles.imageFrame,
              pressed && styles.imageFramePressed,
            ]}
          >
            <Image
              source={heroImage}
              style={styles.sectionHeroImage}
              resizeMode="cover"
            />
          </Pressable>
        ) : null}

        <View style={styles.hero}>
          <Image
            source={require('../../assets/usg-seal-splash.png')}
            style={styles.watermark}
            resizeMode="contain"
          />

          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDiamond} />
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.body}>{body}</Text>
          {children}
        </View>

        <Text style={styles.footer}>USG — Unico Suo Genere™</Text>
      </ScrollView>

      <USGScrollHint
        visible={showScrollHint && isScrollHintVisible}
        bottom={Math.max(insets.bottom, 16) + 8}
      />

      {!heroCarousel && heroImage && (
        <Modal
          visible={isHeroOpen}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={closeHero}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close fullscreen image"
            onPress={closeHero}
            style={styles.modalRoot}
          >
            <View style={styles.modalContent}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close fullscreen image"
                onPress={(event) => {
                  event.stopPropagation();
                  closeHero();
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
                onPress={(event) => {
                  event.stopPropagation();
                }}
                style={[
                  styles.fullscreenImageWrap,
                  {
                    width: fullscreenImageSize.width,
                    height: fullscreenImageSize.height,
                  },
                ]}
              >
                <Image
                  source={heroImage}
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
              </Pressable>

              <Text pointerEvents="none" style={styles.fullscreenHint}>
                Tap outside the image or × to close
              </Text>
            </View>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: spacing.md,
      paddingTop: 20,
      paddingBottom: spacing.xl,
    },
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
    sectionHeroImage: {
      width: '100%',
      height: '100%',
    },
    hero: {
      minHeight: 235,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: 28,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    watermark: {
      position: 'absolute',
      width: 220,
      height: 220,
      opacity: 0.05,
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 3.2,
      textTransform: 'uppercase',
      marginBottom: 12,
      width: '100%',
      textAlign: 'center',
    },
    title: {
      color: colors.text,
      fontSize: 29,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 0.4,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      width: 150,
      marginTop: 18,
      marginBottom: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.goldDark,
    },
    dividerDiamond: {
      width: 7,
      height: 7,
      marginHorizontal: 8,
      backgroundColor: colors.gold,
      transform: [{ rotate: '45deg' }],
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 20,
      textAlign: 'center',
      maxWidth: 300,
    },
    card: {
      marginTop: 14,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: 22,
      paddingVertical: 24,
    },
    body: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 21,
      textAlign: 'center',
    },
    footer: {
      color: colors.textMuted,
      fontSize: 9,
      textAlign: 'center',
      marginTop: 22,
      letterSpacing: 0.8,
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
