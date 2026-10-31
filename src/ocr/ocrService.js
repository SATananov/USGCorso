import { recognizeText } from 'expo-ocr-kit';

export async function recognizeTextFromImage(uri) {
  if (!uri) {
    throw new Error('Missing image URI');
  }

  const result = await recognizeText(uri);
  const text = result?.text?.trim() ?? '';

  return {
    text,
    blocks: result?.blocks ?? [],
  };
}
