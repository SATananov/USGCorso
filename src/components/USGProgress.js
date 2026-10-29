import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';

export default function USGProgress({ text }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 120],
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <ActivityIndicator size="small" color={colors.gold} />
        <Text style={styles.text}>{text}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    wrapper: {
      width: '100%',
      marginTop: 18,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    text: {
      color: colors.textSoft,
      fontSize: 13,
      textAlign: 'center',
    },
    track: {
      height: 4,
      marginTop: 12,
      borderRadius: 2,
      overflow: 'hidden',
      backgroundColor: colors.surfaceRaised,
    },
    fill: {
      alignSelf: 'center',
      width: 90,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.gold,
    },
  });
}
