import type { UserRole } from '@/types/user'

// Pure, framework-free route-guard logic — unit-tested without the router.
// Mirrors the web middleware.ts intent; the real authority is Firestore rules.

export type RouteGroup = 'public' | 'auth' | 'protected' | 'admin'

export interface GuardState {
  isAuthenticated: boolean
  role: UserRole | null
}

export const HOME_ROUTE = '/' as const
export const LOGIN_ROUTE = '/login' as const

/**
 * Returns the path to redirect to, or `null` if access is allowed.
 * - public:    always allowed
 * - auth:      signed-in users are bounced to the app
 * - protected: requires being signed in (any role). Mirrors the web proxy.ts,
 *              where /dashboard is auth-only: a plain user must be able to
 *              reach the dashboard to create their FIRST business (the
 *              onBusinessWritten Cloud Function then promotes them to
 *              entrepreneur). Requiring the role here would lock everyone out.
 * - admin:     requires admin
 */
export function resolveRedirect(group: RouteGroup, state: GuardState): string | null {
  const { isAuthenticated, role } = state

  switch (group) {
    case 'public':
      return null
    case 'auth':
      return isAuthenticated ? HOME_ROUTE : null
    case 'protected':
      return isAuthenticated ? null : LOGIN_ROUTE
    case 'admin':
      if (!isAuthenticated) return LOGIN_ROUTE
      return role === 'admin' ? null : HOME_ROUTE
    default:
      return null
  }
}
