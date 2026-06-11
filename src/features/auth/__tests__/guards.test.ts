import { resolveRedirect, HOME_ROUTE, LOGIN_ROUTE } from '@/features/auth/guards'

describe('resolveRedirect (route guards)', () => {
  const anon = { isAuthenticated: false, role: null } as const
  const user = { isAuthenticated: true, role: 'user' } as const
  const entrepreneur = { isAuthenticated: true, role: 'entrepreneur' } as const
  const admin = { isAuthenticated: true, role: 'admin' } as const

  it('public is always allowed', () => {
    expect(resolveRedirect('public', anon)).toBeNull()
    expect(resolveRedirect('public', admin)).toBeNull()
  })

  it('auth screens bounce signed-in users home, allow anon', () => {
    expect(resolveRedirect('auth', anon)).toBeNull()
    expect(resolveRedirect('auth', user)).toBe(HOME_ROUTE)
    expect(resolveRedirect('auth', admin)).toBe(HOME_ROUTE)
  })

  it('protected area (dashboard) requires auth only — web parity', () => {
    expect(resolveRedirect('protected', anon)).toBe(LOGIN_ROUTE)
    expect(resolveRedirect('protected', user)).toBeNull()
    expect(resolveRedirect('protected', entrepreneur)).toBeNull()
    expect(resolveRedirect('protected', admin)).toBeNull()
  })

  it('admin area requires admin', () => {
    expect(resolveRedirect('admin', anon)).toBe(LOGIN_ROUTE)
    expect(resolveRedirect('admin', user)).toBe(HOME_ROUTE)
    expect(resolveRedirect('admin', entrepreneur)).toBe(HOME_ROUTE)
    expect(resolveRedirect('admin', admin)).toBeNull()
  })
})
