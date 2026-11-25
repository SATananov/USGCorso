import { recognizeWithTesseract } from './providers/tesseractProvider';

const OCR_TIMEOUT_MS = 45000;

function languageForApp(language) {
  if (language === 'bg') return 'bul+eng+ita';
  if (language === 'it') return 'ita+eng+bul';
  return 'eng+bul+ita';
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
