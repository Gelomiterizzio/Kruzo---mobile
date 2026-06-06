import { z } from 'zod'

/**
 * Validates the public Expo env (EXPO_PUBLIC_*) at startup so a missing/typo'd
 * Firebase key fails fast with a clear message instead of an opaque SDK error.
 * These mirror the web NEXT_PUBLIC_FIREBASE_* values and point at the SAME
 * Firebase project (kruzo-web). They are public by design.
 */
const schema = z.object({
  EXPO_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional().default(''),
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: z.string().optional().default(''),
})

// process.env.EXPO_PUBLIC_* are statically inlined by Expo at build time.
const raw = {
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
}

const parsed = schema.safeParse(raw)

if (!parsed.success) {
  const missing = parsed.error.issues.map((i) => i.path.join('.')).join(', ')
  throw new Error(
    `[KRUZO] Configuración de entorno inválida o faltante: ${missing}. ` +
      'Copia .env.example a .env y completa las claves de Firebase.',
  )
}

export const env = parsed.data
