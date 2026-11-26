import { recognizeWithTesseract } from './providers/tesseractProvider';

const OCR_TIMEOUT_MS = 45000;

export const OCR_MODELS = { bg: 'bul', en: 'eng', it: 'ita', all: 'bul+eng+ita' };

function withTimeout(task, ms) {
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('OCR_TIMEOUT')), ms);
  });
  return Promise.race([task, deadline]).finally(() => clearTimeout(timer));
}

export async function recognizeTextFromImage(uri, language = 'all', layout = 'auto', processing = 'original') {
  if (!uri) throw new Error('Missing image URI');
  return withTimeout(
    recognizeWithTesseract(uri, OCR_MODELS[language] ?? OCR_MODELS.all, layout, processing),
    OCR_TIMEOUT_MS
  );
}
