// Firebase JS SDK v11 ships `getReactNativePersistence` only in its React Native
// build (dist/rn). Metro resolves that build at runtime via the "react-native"
// export condition, but TypeScript resolves the browser types where the symbol
// is absent. This augmentation makes the (real, runtime-present) export visible
// to TS. Remove if a future firebase version exports it from the main types.
import type { Persistence } from 'firebase/auth'

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence
}
