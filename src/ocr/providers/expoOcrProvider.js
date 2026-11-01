import { recognizeText } from 'expo-ocr-kit';

export async function recognizeWithExpoOcr(uri) {
  const result = await recognizeText(uri);
  const text = result?.text?.trim() ?? '';

  return {
    text,
    blocks: result?.blocks ?? [],
    confidence: null,
    provider: 'expo-ocr-kit',
    languages: null,
  };
}
