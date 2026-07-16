const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// UI refactor imports from repo-root `shared/` (not under `src/`).
config.watchFolders = [projectRoot];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

// Resolve package "exports" without the "import" condition. zustand's "import"
// condition ships ESM containing `import.meta`, which Metro emits untransformed
// into the classic-script web bundle — one occurrence makes the whole bundle a
// SyntaxError (blank page, completely silent console). This is the
// Expo-documented fix; native keeps resolving the same CJS builds it already
// used via "react-native"/"require".
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
