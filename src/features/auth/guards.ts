import type { UserRole } from '@/types/user'

// Pure, framework-free route-guard logic — unit-tested without the router.
// Mirrors the web middleware.ts intent; the real authority is Firestore rules.

export type RouteGroup = 'public' | 'auth' | 'entrepreneur' | 'admin'

export interface GuardState {
  isAuthenticated: boolean
  role: UserRole | null
}

export const HOME_ROUTE = '/' as const
export const LOGIN_ROUTE = '/login' as const

/**
 * Returns the path to redirect to, or `null` if access is allowed.
 * - public:       always allowed
 * - auth:         signed-in users are bounced to the app
 * - entrepreneur: requires entrepreneur OR admin
 * - admin:        requires admin
 */
export function resolveRedirect(group: RouteGroup, state: GuardState): string | null {
  const { isAuthenticated, role } = state

  switch (group) {
    case 'public':
      return null
    case 'auth':
      return isAuthenticated ? HOME_ROUTE : null
    case 'entrepreneur':
      if (!isAuthenticated) return LOGIN_ROUTE
      return role === 'entrepreneur' || role === 'admin' ? null : HOME_ROUTE
    case 'admin':
      if (!isAuthenticated) return LOGIN_ROUTE
      return role === 'admin' ? null : HOME_ROUTE
    default:
      return null
  }
}
