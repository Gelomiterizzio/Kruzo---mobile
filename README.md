# KRUZO Mobile (Android) — Expo / React Native

App móvil de **KRUZO** ("Tu Ciudad. Tu Mercado.") para Santa Cruz de la Sierra, Bolivia.
Es un **cliente del mismo backend Firebase** que la web (`../web`, fuente de verdad): no crea
colecciones, índices ni APIs nuevas.

## Stack

Expo SDK 53 · Expo Router · React Native 0.79 · React 19 · TypeScript (strict) · Firebase 11 ·
TanStack Query 5 · Zustand 5 · React Hook Form 7 · Zod 3 · Expo Secure Store.

## Estructura

`app/` rutas (Expo Router) · `src/` todo lo demás con alias `@/*`:
`components` (design system) · `features` (dominio) · `services` (firebase) · `hooks` · `store` ·
`providers` · `constants` · `types` · `utils` · `theme` · `lib`. Detalle en
[`docs/01-PHASE-1-ARCHITECTURE.md`](docs/01-PHASE-1-ARCHITECTURE.md). Auditoría del backend en
[`docs/00-PHASE-0-AUDIT.md`](docs/00-PHASE-0-AUDIT.md).

## Setup

```bash
npm install
cp .env.example .env   # completa las claves de Firebase (mismo proyecto kruzo-web)
npm run start          # Metro (requiere dev build para Google Sign-In / mapas nativos)
```

> El login con Google y `react-native-maps` requieren un **dev build de EAS** (no funcionan en Expo Go).

## Scripts

| Script | Acción |
|---|---|
| `npm run start` | Inicia Metro |
| `npm run android` | Abre en Android |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Jest |
| `npm run doctor` | expo-doctor |

## Estado

Scaffold (Fase 1) validado: tsc ✓ · eslint ✓ · jest ✓ · expo-doctor 18/18 ✓. **Sin pantallas de
producto todavía** — se construyen en la Fase 2 (Design System) y Fase 3 (pantallas).
