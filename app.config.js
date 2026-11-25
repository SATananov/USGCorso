const appJson = require('./app.json');

const previewRuntimeVersion = '1.0.0-usg-ota-preview';

module.exports = () => {
  const base = appJson.expo;
  const mapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  const profile = process.env.EAS_BUILD_PROFILE;
  const requestedRuntime = process.env.USGCORSO_OTA_RUNTIME_VERSION;

  if (!mapsKey) {
    throw new Error('GOOGLE_MAPS_ANDROID_API_KEY is required for Android Google Maps builds.');
  }

  if (requestedRuntime && requestedRuntime !== previewRuntimeVersion) {
    throw new Error('USGCORSO_OTA_RUNTIME_VERSION must use the isolated OTA preview runtime.');
  }

  if (profile === 'otaPreview' && requestedRuntime !== previewRuntimeVersion) {
    throw new Error('otaPreview requires USGCORSO_OTA_RUNTIME_VERSION=1.0.0-usg-ota-preview.');
  }

  const plugins = (base.plugins ?? []).filter((plugin) => {
    if (typeof plugin === 'string') {
      return plugin !== 'react-native-maps';
    }

    return Array.isArray(plugin) && plugin[0] !== 'react-native-maps';
  });

  plugins.push('./plugins/withAndroidWorkManagerR8Fix');
  if (!plugins.includes('expo-updates')) plugins.push('expo-updates');
  plugins.push(['react-native-maps', { androidGoogleMapsApiKey: mapsKey }]);

  return {
    ...base,
    updates: { ...(base.updates ?? {}), enabled: true },
    runtimeVersion: requestedRuntime === previewRuntimeVersion
      ? previewRuntimeVersion
      : { policy: 'appVersion' },
    plugins,
  };
};
