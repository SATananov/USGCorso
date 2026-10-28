import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { translations } from './translations';

const STORAGE_KEY = '@usgcorso/language';
const SUPPORTED_LANGUAGES = ['en', 'bg', 'it'];

const LanguageContext = createContext(null);

function getValue(object, path) {
  return path
    .split('.')
    .reduce((current, key) => current?.[key], object);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((savedLanguage) => {
        if (
          active &&
          SUPPORTED_LANGUAGES.includes(savedLanguage)
        ) {
          setLanguageState(savedLanguage);
        }
      })
      .catch((error) => {
        console.warn('Language restore failed:', error);
      });

    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback((nextLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) {
      return;
    }

    setLanguageState(nextLanguage);

    AsyncStorage.setItem(STORAGE_KEY, nextLanguage).catch(
      (error) => {
        console.warn('Language save failed:', error);
      }
    );
  }, []);

  const t = useCallback(
    (key) => {
      const selected =
        getValue(translations[language], key) ??
        getValue(translations.en, key);

      return selected ?? key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      'useLanguage must be used inside LanguageProvider'
    );
  }

  return context;
}
