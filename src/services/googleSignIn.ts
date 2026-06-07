import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

// Real, production Google Sign-In via the native @react-native-google-signin
// module (requires an EAS dev build — does NOT run in Expo Go). It returns a
// Google idToken which Firebase consumes through signInWithCredential
// (see services/auth.ts). No hacks, no Expo-Go fallback.

export type GoogleSignInErrorCode =
  | 'cancelled'
  | 'in-progress'
  | 'play-services'
  | 'no-id-token'
  | 'not-configured'
  | 'unknown'

export class GoogleSignInError extends Error {
  readonly code: GoogleSignInErrorCode
  constructor(code: GoogleSignInErrorCode, message: string) {
    super(message)
    this.name = 'GoogleSignInError'
    this.code = code
  }
}

let configured = false
function ensureConfigured() {
  if (configured) return
  if (!env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
    throw new GoogleSignInError(
      'not-configured',
      'Falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID para el inicio de sesión con Google.',
    )
  }
  GoogleSignin.configure({
    webClientId: env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  })
  configured = true
}

/** Triggers the native Google flow and returns a Firebase-usable idToken. */
export async function getGoogleIdToken(): Promise<string> {
  ensureConfigured()
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
    const response = await GoogleSignin.signIn()
    if (isSuccessResponse(response)) {
      const idToken = response.data.idToken
      if (!idToken) {
        throw new GoogleSignInError('no-id-token', 'Google no devolvió un idToken.')
      }
      return idToken
    }
    // response.type === 'cancelled'
    throw new GoogleSignInError('cancelled', 'Inicio de sesión con Google cancelado.')
  } catch (e) {
    if (e instanceof GoogleSignInError) throw e
    if (isErrorWithCode(e)) {
      switch (e.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          throw new GoogleSignInError('cancelled', 'Inicio de sesión con Google cancelado.')
        case statusCodes.IN_PROGRESS:
          throw new GoogleSignInError('in-progress', 'Ya hay un inicio de sesión en curso.')
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new GoogleSignInError(
            'play-services',
            'Google Play Services no está disponible o está desactualizado.',
          )
        default:
          break
      }
    }
    logger.error(e, { scope: 'getGoogleIdToken' })
    throw new GoogleSignInError('unknown', 'No se pudo iniciar sesión con Google.')
  }
}

/** Clears the native Google session (call alongside Firebase signOut). */
export async function googleSignOut(): Promise<void> {
  try {
    if (configured) await GoogleSignin.signOut()
  } catch (e) {
    logger.warn('googleSignOut failed', e)
  }
}
