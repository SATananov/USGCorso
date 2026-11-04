import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

export default function USGBackToTop({ visible, onPress, language = 'en', dock = false, bottomOffset = 12 }) {
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      offset.stopAnimation();
      offset.setValue(0);
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(offset, { toValue: -6, duration: 850, useNativeDriver: true }),
        Animated.timing(offset, { toValue: 0, duration: 850, useNativeDriver: true }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [offset, visible]);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={dock ? styles.dock : [styles.overlay, { bottom: bottomOffset }]}>
      <Animated.View style={{ transform: [{ translateY: offset }] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={language === 'bg' ? 'Нагоре' : language === 'it' ? 'Torna su' : 'Back to top'}
          onPress={onPress}
          style={styles.circle}
        >
          <Text style={styles.arrow}>↑</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    height: 46,
    backgroundColor: '#08080a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    right: 14,
    zIndex: 30,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#d4af37',
    backgroundColor: 'rgba(8, 8, 10, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  arrow: {
    color: '#d4af37',
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    textAlign: 'center',
  },
});
