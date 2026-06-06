import type { ExpoConfig } from 'expo/config'

// KRUZO mobile — Expo app config.
// Dynamic config (vs static app.json) so the Android Google Maps key and other
// values can come from the environment (EXPO_PUBLIC_* are inlined at build time).
const config: ExpoConfig = {
  name: 'KRUZO',
  slug: 'kruzo',
  scheme: 'kruzo',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'bo.kruzo.app',
  },
  android: {
    package: 'bo.kruzo.app',
    edgeToEdgeEnabled: true,
    config: {
      googleMaps: {
        // Required by react-native-maps on Android. Set in EAS/secret env.
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY,
      },
    },
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    '@react-native-google-signin/google-signin',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    // Place EAS project id here after `eas init` (eas.json scaffolded below).
    eas: {},
  },
}

export default config
