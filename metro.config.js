const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  'bin', 'txt', 'jpg', 'png', 'json', 'mp3', 'ttf', 'wav', 'm4a', 'aac', 'mp4', 'mov'
);

// Add support for additional source extensions
config.resolver.sourceExts.push('cjs');

module.exports = config;

