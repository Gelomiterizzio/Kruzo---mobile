# KRUZO Mobile — Informe del Scaffold (Fase 1, endurecido)

> Base técnica de producción para la app Android. Scaffold validado a nivel de
> **bundle** (no solo de tipos). **Sin pantallas de producto** (placeholders); el
> Design System (Fase 2) y las pantallas (Fase 3) se construyen encima.

## Decisiones de arquitectura (resumen)

- **Capas + feature-first.** `app/` = rutas finas (Expo Router); `src/` = todo lo
  demás con alias `@/*`. Regla de dependencias unidireccional.
- **Navegación + guards de rol concretos.** Grupos `(tabs)` (público),
  `(auth)`, `(dashboard)` (entrepreneur|admin), `(admin)` (admin). La lógica de
  guard es **pura y testeada** (`src/features/auth/guards.ts` →
  `resolveRedirect`), aplicada vía `<RouteGuard>` en cada `_layout`. Reemplaza el
  `middleware.ts` web; **las reglas de Firestore siguen siendo la autoridad**.
- **Auth nativa real.** `initializeAuth` + `getReactNativePersistence(AsyncStorage)`.
  Google Sign-In de producción con `@react-native-google-signin` →
  `signInWithCredential` (requiere **dev build de EAS**, sin hacks ni Expo Go).
- **Datos.** Servicios espejo de `web/lib/firebase` (mismas queries → mismos
  índices). React Query con **persistencia offline** a AsyncStorage
  (`PersistQueryClientProvider`) + retry inteligente (no reintenta
  `permission-denied`).
- **Arranque robusto.** Splash gate ligado a `auth.loading` (no parpadea sesión)
  - **ErrorBoundary** global de último recurso.
- **Theming.** Tokens TS tipados desde el design system HSL de la web (RN acepta
  `hsl()`), light/dark vía `useColorScheme` + override.
- **Seam de observabilidad.** `src/lib/logger.ts` (punto único para Sentry/
  Crashlytics más adelante).

## Calidad / DX

- **TS estricto+**: `strict` + `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`,
  `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noImplicitOverride`.
- **ESLint** (eslint-config-expo flat) + **Prettier** (eslint-config-prettier evita
  conflictos) + **.editorconfig**.
- **Tests**: jest-expo + @testing-library/react-native; pruebas puras de
  `whatsapp` y de los guards de rol (7/7).
- **CI** (`.github/workflows/ci.yml`): type-check → lint → format:check → test.
- **engines**: Node ≥ 20.

## Validación ejecutada

| Validación               | Resultado                                           |
| ------------------------ | --------------------------------------------------- |
| `tsc --noEmit`           | ✅ 0 errores                                        |
| `eslint .`               | ✅ 0 errores / 0 warnings                           |
| `prettier --check .`     | ✅ todo formateado                                  |
| `jest`                   | ✅ 7/7 (2 suites)                                   |
| `expo-doctor`            | ✅ 18/18                                            |
| `expo export -p android` | ✅ **3986 módulos bundled** (Hermes) — grafo válido |

El `expo export` valida de verdad imports, alias `@/*`, init de Firebase, setup de
React Query/Zustand y la navegación de Expo Router (se compila el bundle real, no
solo los tipos). Se ejecutó con un `.env` temporal de placeholders (borrado).

## Riesgos / deuda conocida

1. **App Check** no implementado (Play Integrity). Importante para producción a
   gran escala; verificar enforcement de Firestore antes de Fase 3.
2. **Augmentación de tipos** `src/types/firebase-auth.d.ts` para
   `getReactNativePersistence` (firebase v11 solo lo tipa en su build RN). Eliminar
   cuando firebase lo exporte en los tipos del browser.
3. **Push**: solo se podrá registrar token; el envío FCM es backend nuevo (requiere
   aprobación, fuera de "no crear backend").
4. **Google/Maps en dispositivo**: requieren dev build de EAS + SHA-1/OAuth y API
   key de Maps configurados (deployment, no código).
5. **Libs de feature pre-instaladas** (image-picker, location, maps, notifications,
   haptics, sharing, bottom-sheet) y **pre-configuradas** (permisos/plugins en
   `app.config.ts`) intencionalmente, para que el primer dev build sea completo; se
   activan en Fase 2/3.

## Próximos pasos

- **Fase 2 — Design System** sobre los tokens: Button, Card, Input, SearchBar,
  Modal/Sheet, Skeleton, Tabs, Avatar, Badge, Toast, Empty/Loading State.
- **Fase 3 — Pantallas** reemplazando los placeholders.
