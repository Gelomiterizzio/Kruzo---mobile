/**
 * KRUZO design tokens — translated 1:1 from the web design system
 * (web/app/globals.css HSL variables + web/tailwind.config.ts brand/gold scales).
 * React Native accepts `hsl(h, s%, l%)` color strings, so the values match the
 * web exactly (no lossy hex conversion for the semantic palette).
 */

export const lightColors = {
  background: 'hsl(40, 45%, 98%)',
  foreground: 'hsl(20, 35%, 8%)',
  card: 'hsl(38, 60%, 99.5%)',
  cardForeground: 'hsl(20, 35%, 8%)',
  popover: 'hsl(38, 60%, 99.5%)',
  popoverForeground: 'hsl(20, 35%, 8%)',
  primary: 'hsl(22, 94%, 48%)',
  primaryForeground: 'hsl(0, 0%, 100%)',
  secondary: 'hsl(36, 28%, 93%)',
  secondaryForeground: 'hsl(20, 30%, 16%)',
  muted: 'hsl(36, 24%, 92%)',
  mutedForeground: 'hsl(25, 12%, 48%)',
  accent: 'hsl(36, 24%, 92%)',
  accentForeground: 'hsl(20, 35%, 8%)',
  destructive: 'hsl(0, 84.2%, 60.2%)',
  destructiveForeground: 'hsl(0, 0%, 100%)',
  border: 'hsl(34, 20%, 87%)',
  input: 'hsl(34, 20%, 87%)',
  ring: 'hsl(22, 94%, 48%)',
}

export const darkColors: typeof lightColors = {
  background: 'hsl(20, 22%, 5%)',
  foreground: 'hsl(38, 30%, 94%)',
  card: 'hsl(20, 20%, 8%)',
  cardForeground: 'hsl(38, 30%, 94%)',
  popover: 'hsl(20, 20%, 8%)',
  popoverForeground: 'hsl(38, 30%, 94%)',
  primary: 'hsl(22, 90%, 56%)',
  primaryForeground: 'hsl(0, 0%, 100%)',
  secondary: 'hsl(20, 16%, 12%)',
  secondaryForeground: 'hsl(38, 30%, 94%)',
  muted: 'hsl(20, 15%, 12%)',
  mutedForeground: 'hsl(28, 12%, 56%)',
  accent: 'hsl(20, 15%, 15%)',
  accentForeground: 'hsl(38, 30%, 94%)',
  destructive: 'hsl(0, 62.8%, 50%)',
  destructiveForeground: 'hsl(0, 0%, 100%)',
  border: 'hsl(20, 16%, 13%)',
  input: 'hsl(20, 16%, 13%)',
  ring: 'hsl(22, 90%, 56%)',
}

/** Brand orange scale (web tailwind.config.ts `brand`). */
export const brand = {
  50: '#fff4f0',
  100: '#ffe4d6',
  200: '#ffc5a8',
  300: '#ff9a70',
  400: '#ff6b35',
  500: '#ff4500',
  600: '#e63a00',
  700: '#c02f00',
  800: '#9a2800',
  900: '#7a2000',
} as const

/** Gold scale — rating stars / "destacado" (web tailwind.config.ts `gold`). */
export const gold = {
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
} as const

/** 4px base spacing scale. */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const

/** Border radius — web `--radius` = 0.75rem (12px). */
export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
} as const

export type ColorTokens = typeof lightColors
