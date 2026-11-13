const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
if (!config.resolver.assetExts.includes('rgba')) {
  config.resolver.assetExts.push('rgba');
}

module.exports = config;
