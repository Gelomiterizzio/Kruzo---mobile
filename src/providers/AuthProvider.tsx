import { createContext, useContext, useEffect, useState } from 'react'
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
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  appUser: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const setStoreUser = useStore((s) => s.setUser)
  const setFavorites = useStore((s) => s.setFavorites)

  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        try {
          const u = await getUserById(fbUser.uid)
          setAppUser(u)
          setStoreUser(u)
          if (u?.favoriteIds?.length) setFavorites(u.favoriteIds)
        } catch {
          setAppUser(null)
          setStoreUser(null)
        }
      } else {
        setAppUser(null)
        setStoreUser(null)
        setFavorites([])
      }
      setLoading(false)
    })
    return unsub
  }, [setStoreUser, setFavorites])

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
