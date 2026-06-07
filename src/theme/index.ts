import {
  lightColors,
  darkColors,
  brand,
  gold,
  spacing,
  radius,
  fontSize,
  fontWeight,
  type ColorTokens,
} from './tokens'

export interface Theme {
  dark: boolean
  colors: ColorTokens
  brand: typeof brand
  gold: typeof gold
  spacing: typeof spacing
  radius: typeof radius
  fontSize: typeof fontSize
  fontWeight: typeof fontWeight
}

export const lightTheme: Theme = {
  dark: false,
  colors: lightColors,
  brand,
  gold,
  spacing,
  radius,
  fontSize,
  fontWeight,
}

export const darkTheme: Theme = {
  ...lightTheme,
  dark: true,
  colors: darkColors,
}

export * from './tokens'
