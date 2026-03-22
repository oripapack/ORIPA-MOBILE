/**
 * Foundation native tweaks applied at `expo prebuild`:
 * - Podfile: ENV['RCT_REMOVE_LEGACY_ARCH'] — aligns with New Architecture when supported by RN.
 * - android/gradle.properties: hermesV1Enabled (when the generated template reads it).
 */
const {
  createRunOncePlugin,
  withPodfile,
  withGradleProperties,
} = require('@expo/config-plugins');

function withNativeFoundation(config) {
  config = withPodfile(config, async (cfg) => {
    if (!cfg.modResults.contents.includes('RCT_REMOVE_LEGACY_ARCH')) {
      cfg.modResults.contents =
        `ENV['RCT_REMOVE_LEGACY_ARCH'] = '1'\n\n` + cfg.modResults.contents;
    }
    return cfg;
  });

  config = withGradleProperties(config, (cfg) => {
    const items = cfg.modResults;
    const has = (key) =>
      items.some((i) => i.type === 'property' && i.key === key);
    if (!has('hermesV1Enabled')) {
      items.push({ type: 'empty' });
      items.push({
        type: 'comment',
        value: ' Hermes V1 — enable when supported by the RN / Expo template',
      });
      items.push({ type: 'property', key: 'hermesV1Enabled', value: 'true' });
    }
    return cfg;
  });

  return config;
}

module.exports = createRunOncePlugin(withNativeFoundation, 'with-native-foundation', '1.0.0');
