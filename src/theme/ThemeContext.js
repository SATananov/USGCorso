import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { darkTheme, lightTheme } from '../styles/usgTheme';

const STORAGE_KEY = '@usgcorso/theme';
const SUPPORTED_THEMES = ['dark', 'light'];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeName, setThemeNameState] = useState('dark');

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((savedTheme) => {
        if (active && SUPPORTED_THEMES.includes(savedTheme)) {
          setThemeNameState(savedTheme);
        }
      })
      .catch((error) => {
        console.warn('Theme restore failed:', error);
      });

    return () => {
      active = false;
    };
  }, []);

  const setThemeName = useCallback((nextTheme) => {
    if (!SUPPORTED_THEMES.includes(nextTheme)) {
      return;
    }

    setThemeNameState(nextTheme);

    AsyncStorage.setItem(STORAGE_KEY, nextTheme).catch((error) => {
      console.warn('Theme save failed:', error);
    });
  }, []);

  const colors = themeName === 'light' ? lightTheme : darkTheme;

  const value = useMemo(
    () => ({
      themeName,
      setThemeName,
      colors,
      isDark: themeName === 'dark',
      supportedThemes: SUPPORTED_THEMES,
    }),
    [themeName, setThemeName, colors]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
