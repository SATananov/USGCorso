import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';

export default function USGProgressBar({ label, progress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const animation = useRef(new Animated.Value(0)).current;
  const hasProgress = typeof progress === 'number';

  useEffect(() => {
    if (hasProgress) {
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [animation, hasProgress]);

  const width = hasProgress
    ? `${Math.max(0, Math.min(100, progress))}%`
    : animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['18%', '82%'],
      });

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>
      {hasProgress ? (
        <Text style={styles.percent}>{Math.round(progress)}%</Text>
      ) : null}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    wrapper: {
      width: '100%',
      marginTop: 16,
    },
    label: {
      color: colors.textSoft,
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 10,
    },
    track: {
      width: '100%',
      height: 5,
      borderRadius: 999,
      backgroundColor: colors.surfaceRaised,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: colors.gold,
    },
    percent: {
      color: colors.goldSoft,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 7,
    },
  });
}
