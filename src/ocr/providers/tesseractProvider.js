import { requireOptionalNativeModule } from 'expo';

const USGOcr = requireOptionalNativeModule('USGOcr');

export async function recognizeWithTesseract(uri, languages) {
  if (!USGOcr) {
    throw new Error('USGOcr native module is unavailable');
  }

  const result = await USGOcr.recognizeText(uri, languages);

  return {
    text: result?.text?.trim() ?? '',
    blocks: [],
    confidence: result?.confidence ?? null,
    provider: 'tesseract',
    languages: result?.languages ?? languages,
  };
}
