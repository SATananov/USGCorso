import * as ExpoCamera from 'expo-camera';

export async function scanQrFromImage(uri) {
  if (!uri) {
    return {
      codes: [],
      results: [],
    };
  }

  const scanFromURLAsync =
    ExpoCamera.CameraView?.scanFromURLAsync ??
    ExpoCamera.Camera?.scanFromURLAsync;

  if (typeof scanFromURLAsync !== 'function') {
    throw new Error('QR image scanner is unavailable');
  }

  const results = await scanFromURLAsync(uri, ['qr']);
  const codes = [
    ...new Set(
      (results ?? [])
        .map((result) => result?.data?.trim())
        .filter(Boolean)
    ),
  ];

  return {
    codes,
    results: results ?? [],
  };
}
