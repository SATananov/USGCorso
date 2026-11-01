import { recognizeWithExpoOcr } from './providers/expoOcrProvider';
import { recognizeWithTesseract } from './providers/tesseractProvider';

const PRIMARY_TIMEOUT_MS = 18000;
const FALLBACK_TIMEOUT_MS = 15000;

function timeoutAfter(ms, code) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(code)), ms);
  });
}

function languageForApp(language) {
  if (language === 'bg') {
    return 'bul+eng';
  }

  if (language === 'it') {
    return 'ita+eng';
  }

  return 'eng';
}

async function runWithTimeout(task, ms, code) {
  return Promise.race([
    task,
    timeoutAfter(ms, code),
  ]);
}

export async function recognizeTextFromImage(uri, language = 'en') {
  if (!uri) {
    throw new Error('Missing image URI');
  }

  const ocrLanguage = languageForApp(language);

  try {
    return await runWithTimeout(
      recognizeWithTesseract(uri, ocrLanguage),
      PRIMARY_TIMEOUT_MS,
      'TESSERACT_TIMEOUT'
    );
  } catch {
    return runWithTimeout(
      recognizeWithExpoOcr(uri),
      FALLBACK_TIMEOUT_MS,
      'EXPO_OCR_TIMEOUT'
    );
  }
}
