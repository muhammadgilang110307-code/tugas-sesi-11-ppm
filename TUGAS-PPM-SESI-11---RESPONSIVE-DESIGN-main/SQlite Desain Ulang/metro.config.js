// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Tambahkan dukungan untuk file .wasm
config.resolver.assetExts.push('wasm');

// Tambahkan header HTTP yang diperlukan untuk SharedArrayBuffer (diperlukan oleh wa-sqlite)
config.server = config.server || {};
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    // Tambahkan header untuk mendukung SharedArrayBuffer
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return middleware(req, res, next);
  };
};

module.exports = config;

