import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { useColorScheme } from 'react-native'
import { lightTheme, darkTheme, type Theme } from '@/theme'

type SchemePref = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  scheme: 'light' | 'dark'
  preference: SchemePref
  setPreference: (p: SchemePref) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  scheme: 'light',
  preference: 'system',
  setPreference: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme()
  const [preference, setPreference] = useState<SchemePref>('system')

  const scheme: 'light' | 'dark' =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference

  const handleSetPreference = useCallback((p: SchemePref) => setPreference(p), [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: scheme === 'dark' ? darkTheme : lightTheme,
      scheme,
      preference,
      setPreference: handleSetPreference,
    }),
    [scheme, preference, handleSetPreference],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
