import { useCallback, useState } from 'react'
import { useAuthContext } from '@/providers/AuthProvider'
import { signInWithEmail, registerWithEmail, logout, resetPassword } from '@/services/auth'

export function parseFirebaseError(error: unknown): string {
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
  const { firebaseUser, appUser: user, loading } = useAuthContext()
  const [error, setError] = useState<string | null>(null)

  const clearError = () => setError(null)

  const loginEmail = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      await signInWithEmail(email, password)
    } catch (e) {
      setError(parseFirebaseError(e))
      throw e
    }
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    setError(null)
    try {
      await registerWithEmail(email, password, name)
    } catch (e) {
      setError(parseFirebaseError(e))
      throw e
    }
  }, [])

  const sendReset = useCallback(async (email: string): Promise<boolean> => {
    setError(null)
    try {
      await resetPassword(email)
      return true
    } catch (e) {
      setError(parseFirebaseError(e))
      return false
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    await logout()
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
    register,
    sendReset,
    signOut,
  }
}
