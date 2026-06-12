import { useCallback, useState } from 'react'
import { useAuthContext } from '@/providers/AuthProvider'
import {
  signInWithEmail,
  registerWithEmail,
  logout,
  resetPassword,
  signInWithGoogleCredential,
} from '@/services/auth'
import { getGoogleIdToken, googleSignOut, GoogleSignInError } from '@/services/googleSignIn'

export function parseAuthError(error: unknown): string {
  if (error instanceof GoogleSignInError) {
    // 'cancelled' is handled by callers (no error surfaced); map the rest.
    return error.message
  }
  const msg = error instanceof Error ? error.message : String(error)
  if (
    msg.includes('user-not-found') ||
    msg.includes('wrong-password') ||
    msg.includes('invalid-credential')
  )
    return 'Email o contraseña incorrectos'
  if (msg.includes('email-already-in-use')) return 'Este email ya está registrado'
  if (msg.includes('too-many-requests')) return 'Demasiados intentos. Intenta más tarde'
  if (msg.includes('network-request-failed')) return 'Error de conexión. Verifica tu internet'
  return 'Error inesperado. Intenta de nuevo'
}

export function useAuth() {
  const { firebaseUser, appUser: user, loading, refreshUser } = useAuthContext()
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  const loginEmail = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      await signInWithEmail(email, password)
    } catch (e) {
      setError(parseAuthError(e))
      throw e
    }
  }, [])

  const loginGoogle = useCallback(async () => {
    setError(null)
    try {
      const idToken = await getGoogleIdToken()
      await signInWithGoogleCredential(idToken)
      // onAuthStateChanged fires BEFORE createUserDocument writes the user doc,
      // so for first-time sign-ins appUser is still null — re-fetch it now.
      await refreshUser()
    } catch (e) {
      // A user-cancelled flow is not an error worth surfacing.
      if (e instanceof GoogleSignInError && e.code === 'cancelled') return
      setError(parseAuthError(e))
      throw e
    }
  }, [refreshUser])

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setError(null)
      try {
        await registerWithEmail(email, password, name)
        // Same race as loginGoogle: hydrate appUser created moments ago.
        await refreshUser()
      } catch (e) {
        setError(parseAuthError(e))
        throw e
      }
    },
    [refreshUser],
  )

  const sendReset = useCallback(async (email: string): Promise<boolean> => {
    setError(null)
    try {
      await resetPassword(email)
      return true
    } catch (e) {
      setError(parseAuthError(e))
      return false
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    await Promise.all([logout(), googleSignOut()])
  }, [])

  return {
    user,
    firebaseUser,
    loading,
    error,
    clearError,
    isAuthenticated: !!firebaseUser,
    isEntrepreneur: user?.role === 'entrepreneur' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
    loginEmail,
    loginGoogle,
    register,
    sendReset,
    signOut,
    refreshUser,
  }
}
