import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const crestScale = useRef(new Animated.Value(0.05)).current;
  const crestOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(crestOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(crestScale, {
          toValue: 0.35,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(crestScale, {
        toValue: 1,
        duration: 2300,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 900,
      delay: 3300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5800);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <ImageBackground
        source={require('./assets/splash-bg-premium-strong.png')}
        style={styles.splash}
        resizeMode="cover"
      >
        <StatusBar style="light" />

        <Animated.Image
          source={require('./assets/usg-seal-splash.png')}
          style={[
            styles.splashSeal,
            {
              opacity: crestOpacity,
              transform: [{ scale: crestScale }],
            },
          ]}
          resizeMode="contain"
        />

        <Animated.View style={[styles.splashTextBox, { opacity: textOpacity }]}>
          <Text style={styles.splashBrand}>USG — Unico Suo Genere™</Text>
          <Text style={styles.splashTagline}>
            The Global Cane Corso Mobile Ecosystem
          </Text>
        </Animated.View>
      </ImageBackground>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050506',
    paddingHorizontal: 24,
  },
  splashSeal: {
    width: 300,
    height: 360,
  },
  splashTextBox: {
    alignItems: 'center',
    marginTop: 14,
  },
  splashBrand: {
    color: '#d4af37',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  splashTagline: {
    color: '#ffffff',
    fontSize: 15,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 9,
    lineHeight: 22,
  },
});
