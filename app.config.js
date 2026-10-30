const appJson = require('./app.json');

module.exports = () => {
  const base = appJson.expo;
  const mapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

  if (!mapsKey) {
    throw new Error('GOOGLE_MAPS_ANDROID_API_KEY is required for Android Google Maps builds.');
  }

  const plugins = (base.plugins ?? []).filter((plugin) => {
    if (typeof plugin === 'string') {
      return plugin !== 'react-native-maps';
    }

    return Array.isArray(plugin) && plugin[0] !== 'react-native-maps';
  });

  plugins.push([
    'react-native-maps',
    {
      androidGoogleMapsApiKey: mapsKey,
    },
  ]);

  return {
    ...base,
    plugins,
  };
};
