import { Redirect, type Href } from 'expo-router'
import { useAuthContext } from '@/providers/AuthProvider'
import { resolveRedirect, type RouteGroup } from './guards'

// Declarative role guard for a route group's _layout. While auth is resolving
// it renders nothing (the splash screen is still visible). Once resolved it
// either redirects or renders the protected subtree.
export function RouteGuard({ group, children }: { group: RouteGroup; children: React.ReactNode }) {
  const { firebaseUser, appUser, loading } = useAuthContext()

  if (loading) return null

  const redirect = resolveRedirect(group, {
    isAuthenticated: !!firebaseUser,
    role: appUser?.role ?? null,
  })

  if (redirect) return <Redirect href={redirect as Href} />

  return <>{children}</>
}
