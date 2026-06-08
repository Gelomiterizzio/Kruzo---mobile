import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { type User } from 'firebase/auth'
import { onAuthChange } from '@/services/auth'
import { getUserById } from '@/services/firestore'
import { useStore } from '@/store/useStore'
import type { AppUser } from '@/types/user'

// Ported from web/providers/AuthProvider.tsx, minus the session-cookie sync and
// App Check (both web-only). Firebase persists the session via AsyncStorage.
interface AuthContextType {
  firebaseUser: User | null
  appUser: AppUser | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  appUser: null,
  loading: true,
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const setStoreUser = useStore((s) => s.setUser)
  const setFavorites = useStore((s) => s.setFavorites)
  const uidRef = useRef<string | null>(null)

  const loadAppUser = useCallback(
    async (uid: string) => {
      try {
        const u = await getUserById(uid)
        setAppUser(u)
        setStoreUser(u)
        if (u?.favoriteIds) setFavorites(u.favoriteIds)
      } catch {
        setAppUser(null)
        setStoreUser(null)
      }
    },
    [setStoreUser, setFavorites],
  )

  // Re-fetch the current user's Firestore doc (e.g. after editing the profile or
  // creating a business) so the UI reflects the change immediately.
  const refreshUser = useCallback(async () => {
    if (uidRef.current) await loadAppUser(uidRef.current)
  }, [loadAppUser])

  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser)
      uidRef.current = fbUser?.uid ?? null
      if (fbUser) {
        await loadAppUser(fbUser.uid)
      } else {
        setAppUser(null)
        setStoreUser(null)
        setFavorites([])
      }
      setLoading(false)
    })
    return unsub
  }, [loadAppUser, setStoreUser, setFavorites])

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
