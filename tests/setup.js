jest.mock('../src/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      textSoft: '#cccccc',
      textMuted: '#888888',
      gold: '#ffcc00',
      goldSoft: '#ddbb55',
      border: '#333333',
      danger: '#ff3333',
      success: '#33cc66',
    },
  }),
}));

jest.mock('../src/i18n/LanguageContext', () => {
  const translate = (key) => key;
  return { useLanguage: () => ({ language: 'en', t: translate }) };
});

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return { ...actual, useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }) };
});

jest.mock('../src/components/USGBackToTop', () => () => null);
jest.mock('../src/components/USGZoomImage', () => () => null);
jest.mock('../src/components/USGProgressBar', () => () => null);
jest.mock('../src/components/USGGlobalHeader', () => () => null);
jest.mock('../src/components/USGBackButton', () => () => null);
jest.mock('../src/components/USGHomeButton', () => () => null);
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
