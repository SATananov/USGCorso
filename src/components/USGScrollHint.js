import { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function USGScrollHint({ visible, bottom }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      translateY.stopAnimation();
      translateY.setValue(0);
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 5,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [translateY, visible]);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.wrap, { bottom }]}>
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <Text style={styles.chevron}>⌄</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 18,
    zIndex: 20,
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#d4af37',
    backgroundColor: 'rgba(14, 14, 16, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    color: '#d4af37',
    fontSize: 23,
    lineHeight: 24,
    fontWeight: '800',
    marginTop: -4,
  },
});
