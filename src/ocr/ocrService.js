import { recognizeWithTesseract } from './providers/tesseractProvider';

const OCR_TIMEOUT_MS = 25000;

function languageForApp(language) {
  if (language === 'bg') return 'bul';
  if (language === 'it') return 'ita';
  return 'eng';
}

function withTimeout(task, ms) {
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('OCR_TIMEOUT')), ms);
  });
  return Promise.race([task, deadline]).finally(() => clearTimeout(timer));
}

export async function recognizeTextFromImage(uri, language = 'en') {
  if (!uri) throw new Error('Missing image URI');
  return withTimeout(
    recognizeWithTesseract(uri, languageForApp(language)),
    OCR_TIMEOUT_MS
  );
}
