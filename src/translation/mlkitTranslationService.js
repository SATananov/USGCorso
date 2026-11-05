import { requireOptionalNativeModule } from 'expo';

const SUPPORTED_LANGUAGES = ['bg', 'en', 'it'];

export function isOnDeviceTranslationAvailable() {
  return Boolean(requireOptionalNativeModule('USGTranslate'));
}

export async function translateOnDevice(text, sourceLanguage, targetLanguage) {
  if (!SUPPORTED_LANGUAGES.includes(sourceLanguage) || !SUPPORTED_LANGUAGES.includes(targetLanguage)) {
    throw new Error('Unsupported translation language');
  }

  const nativeModule = requireOptionalNativeModule('USGTranslate');

  if (!nativeModule) {
    throw new Error('USGTranslate requires an updated Android build');
  }

  if (!text || sourceLanguage === targetLanguage) {
    return text || '';
  }

  return nativeModule.translateText(text, sourceLanguage, targetLanguage);
}
