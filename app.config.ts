import type { ExpoConfig } from 'expo/config'

// KRUZO mobile — Expo dynamic config.
// Dynamic (vs static app.json) so secrets/keys come from the environment
// (EXPO_PUBLIC_* are inlined at build time). Target: Android (Google Play).
const config: ExpoConfig = {
  name: 'KRUZO',
  slug: 'kruzo',
  scheme: 'kruzo',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  primaryColor: '#ff4500',
  assetBundlePatterns: ['**/*'],

  // Over-the-air updates (EAS Update). runtimeVersion ties a JS bundle to a
  // compatible native build; set the project id with `eas init`.
  runtimeVersion: { policy: 'appVersion' },
  updates: { fallbackToCacheTimeout: 0 },

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'bo.kruzo.app',
    // Universal Links (requires an apple-app-site-association on kruzo.bo).
    associatedDomains: ['applinks:kruzo.bo'],
  },

  android: {
    package: 'bo.kruzo.app',
    edgeToEdgeEnabled: true,
    backgroundColor: '#ffffff',
    adaptiveIcon: { backgroundColor: '#ff4500' },
    config: {
      googleMaps: {
        // Required by react-native-maps on Android. Provide via EAS secret env.
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY,
      },
    },
    // Camera/media/location/notification permissions are declared by the
    // respective config plugins below. Block the ones we never use.
    blockedPermissions: ['android.permission.RECORD_AUDIO'],
    // Android App Links: open kruzo.bo deep links in the app (autoVerify needs a
    // /.well-known/assetlinks.json on the domain). Custom scheme `kruzo://` also
    // works out of the box for business/post/user routes.
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        category: ['BROWSABLE', 'DEFAULT'],
        data: [
          { scheme: 'https', host: 'kruzo.bo', pathPrefix: '/business' },
          { scheme: 'https', host: 'kruzo.bo', pathPrefix: '/post' },
          { scheme: 'https', host: 'kruzo.bo', pathPrefix: '/user' },
        ],
      },
    ],
  },

  plugins: [
    'expo-router',
    'expo-secure-store',
    '@react-native-google-signin/google-signin',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#ffffff',
        resizeMode: 'contain',
        dark: { backgroundColor: '#0d0a08' },
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'KRUZO necesita acceso a tus fotos para subir el logo, la portada y la galería de tu negocio o publicaciones.',
        cameraPermission: 'KRUZO necesita la cámara para tomar fotos de tu negocio o productos.',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'KRUZO usa tu ubicación para mostrarte negocios y servicios cercanos en Santa Cruz.',
      },
    ],
    [
      'expo-notifications',
      {
        color: '#ff4500',
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    // Set by `eas init` (kept empty so config evaluates without an EAS project).
    eas: {},
  },
}

export default config
