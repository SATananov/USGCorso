import { requireOptionalNativeModule } from 'expo';

const USGOcr = requireOptionalNativeModule('USGOcr');
let active = false;

export async function recognizeWithTesseract(uri, languages, layout = 'auto', processing = 'original') {
  if (!USGOcr) {
    throw new Error('USGOcr native module is unavailable');
  }

  if (active) throw new Error('OCR_BUSY');
  active = true;
  let result;
  try {
    result = await USGOcr.recognizeText(uri, languages, layout, processing);
  } finally {
    active = false;
  }

  return {
    text: result?.text?.trim() ?? '',
    blocks: [],
    confidence: result?.confidence ?? null,
    provider: 'tesseract',
    languages: result?.languages ?? languages,
  };
}
