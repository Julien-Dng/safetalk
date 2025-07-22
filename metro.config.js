const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add Firebase support
config.resolver.assetExts.push('db');

module.exports = config;