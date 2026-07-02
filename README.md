# KRUZO Mobile (Android) — Expo / React Native

App móvil de **KRUZO** — _"Tu Ciudad. Tu Mercado."_ — el marketplace de negocios y
emprendimientos locales de Santa Cruz de la Sierra, Bolivia.

Es un **cliente del mismo backend Firebase** que la web ([`../web`](../web), fuente de
verdad): no crea colecciones, índices ni APIs nuevas. Las reglas de Firestore
(endurecidas y desplegadas) son la autoridad de seguridad; el cliente nunca escribe
campos privilegiados.

**Estado: Release Candidate (v1.0.2)** — código listo para producción; solo quedan
los pasos externos de publicación (Play Console, credenciales EAS). Ver
[docs/09-PHASE-9-GO-LIVE.md](docs/09-PHASE-9-GO-LIVE.md).

---

## Funcionalidades

- **Descubrimiento:** Home con hero, tiles de categorías y carruseles de destacados;
  Explorar con filtros por categoría/zona e infinite scroll (paridad web: filtros, sin
  búsqueda full-text).
- **Negocios:** perfil completo (portada, CTAs de WhatsApp/llamada/compartir,
  publicaciones, reseñas con distribución, horarios, mapa nativo), favoritos con
  actualización optimista y feedback háptico.
- **Publicaciones:** detalle con precios/descuentos/delivery y contacto directo por
  WhatsApp.
- **Cuenta:** registro/login con email y **Google Sign-In nativo**, recuperación de
  contraseña, edición de perfil, **eliminación de cuenta in-app** (requisito de Google
  Play; Cloud Function `deleteAccount` con limpieza total de datos), manejo de usuarios
  baneados.
- **Panel del emprendedor:** dashboard con métricas reales, CRUD de negocio y
  publicaciones (con subida de imágenes, límite 5 MB validado), reseñas, analytics.
- **Administración:** aprobación/suspensión de negocios, moderación de posts, gestión
  de usuarios (roles/bans), reportes.
- **Plataforma:** modo claro/oscuro, offline-first (React Query persistido +
  NetInfo), notificaciones (subcolección real + push client-ready), deep links
  (`kruzo://` y App Links `https://kruzo.bo/*`), accesibilidad (roles/labels/estados).
- **Experiencia premium:** microinteracciones con springs (cards, corazón de
  favorito), skeletons con shimmer, empty states cuidados, transiciones nativas
  consistentes, entradas escalonadas.

## Stack

| Capa        | Tecnología                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Framework   | Expo SDK 53 · React Native 0.79 (New Architecture + Hermes) · React 19                                |
| Navegación  | Expo Router (file-based, route groups + guards por rol)                                               |
| Lenguaje    | TypeScript **strict** (`noUncheckedIndexedAccess`)                                                    |
| Backend     | Firebase JS SDK 11 (Auth con persistencia AsyncStorage, Firestore, Storage, Functions)                |
| Datos       | TanStack Query 5 (infinite queries, persistencia offline) · Zustand 5                                 |
| Formularios | React Hook Form 7 + Zod 3                                                                             |
| Nativo      | react-native-maps · expo-image · expo-image-picker · expo-notifications · @react-native-google-signin |

## Estructura

```
app/            Rutas Expo Router (thin): (tabs), (auth), dashboard/, admin/,
                business/[slug], post/[id], user/[id], settings, notifications
src/
  components/   Design system (ui/, overlay/, feedback/, layout/) — theme-aware, a11y
  features/     Dominio: business/, post/, review/, home/, auth/, settings/
  services/     Firebase: auth, firestore (con normalizadores defensivos), storage,
                account (deleteAccount), admin, notifications, googleSignIn
  hooks/        useAuth, useBusinesses, useFavorites, usePosts, useReviews, …
  providers/    Query (persist) · Theme · Auth
  store/        Zustand (favoritos persistidos)
  lib/          env (validado con Zod), logger, network, queryClient
  theme/        Tokens 1:1 con la web (HSL) + estilo de mapa dark
  utils/ types/ constants/
```

Arquitectura en detalle: [docs/01-PHASE-1-ARCHITECTURE.md](docs/01-PHASE-1-ARCHITECTURE.md) ·
Auditoría del backend compartido: [docs/00-PHASE-0-AUDIT.md](docs/00-PHASE-0-AUDIT.md)

## Setup

Requisitos: Node ≥ 20, JDK 17+ (para builds nativos: Android Studio JBR 21 + NDK 27.1),
Android SDK.

```bash
npm install
cp .env.example .env   # claves EXPO_PUBLIC_* de Firebase (mismo proyecto kruzo-web)
npm run start          # Metro (requiere dev build — ver nota)
```

> **Nota:** Google Sign-In y `react-native-maps` son módulos nativos — no funcionan en
> Expo Go. Usa un dev build (`npm run android`) o un build de EAS.
> `google-services.json` (FCM) es opcional en desarrollo y va gitignored.

## Scripts

| Script                            | Acción                       |
| --------------------------------- | ---------------------------- |
| `npm run start`                   | Metro (dev client)           |
| `npm run android`                 | Compila e instala en Android |
| `npm run type-check`              | `tsc --noEmit`               |
| `npm run lint` / `lint:fix`       | ESLint                       |
| `npm run format` / `format:check` | Prettier                     |
| `npm test` / `test:watch`         | Jest (+ Testing Library)     |
| `npm run doctor`                  | expo-doctor                  |

## Calidad y validación

Cada fase se validó con la batería completa: **prettier · eslint (0) · tsc (0) ·
jest · expo-doctor 18/18 · build release real + ejecución verificada en emulador
(instalación limpia, arranque frío, navegación completa, logcat sin errores)**.
El RC actual: 0 `console.*`, 0 TODO/FIXME, 0 `any`, sin fugas de
listeners/timers, lecturas defensivas (`mapBusiness`/`mapPost`) contra documentos
parciales.

## Seguridad

- Las **reglas de Firestore** (repo web, desplegadas) son la única autoridad: locks de
  campos privilegiados (rol, bans, verificación), validadas 53/53 en el emulador.
- El cliente móvil se verificó **write-por-write** contra esas reglas
  ([docs/08 §2](docs/08-PHASE-6-RUNTIME-AUDIT.md)).
- Sin secretos en el repo (`.env`, keystores, `google-services.json` gitignored);
  config Firebase pública por diseño; env validado al arranque.
- Eliminación de cuenta vía Cloud Function privilegiada (Admin SDK), validada E2E
  contra producción.
- **Privacidad:** la app no solicita ubicación, no incluye analítica ni anuncios.
  Política oficial: [docs/PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md) (publicada en
  `kruzo.bo/privacy`).

## Release / Publicación

- **[docs/09-PHASE-9-GO-LIVE.md](docs/09-PHASE-9-GO-LIVE.md)** — checklist de Play
  Store, registro de riesgos y **manual de lanzamiento de 11 pasos** (EAS
  credentials → FCM → OAuth/SHA → Maps → `.aab` → Play Console → App Links →
  datos → rollout). _Empieza aquí para publicar._
- [docs/07-RELEASE.md](docs/07-RELEASE.md) — ingeniería de release: EAS, firma
  (managed credentials), toolchain del build local, App Links, assets.
- Perfiles EAS: `development` (dev client) · `preview` (APK interno) ·
  `production` (**AAB** + autoIncrement + submit a track internal).

## Documentación por fase

| Doc                                                                                 | Contenido                                                            |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [00](docs/00-PHASE-0-AUDIT.md)                                                      | Auditoría del backend web (colecciones, reglas, constraints)         |
| [01](docs/01-PHASE-1-ARCHITECTURE.md) · [02](docs/02-SCAFFOLD-REPORT.md)            | Arquitectura y scaffold                                              |
| [03](docs/03-PHASE-2-DESIGN-SYSTEM.md)                                              | Design system                                                        |
| [04](docs/04-PHASE-3-SCREENS.md) · [05](docs/05-PHASE-3.5-FUNCTIONAL-COMPLETION.md) | Pantallas y compleción funcional                                     |
| [06](docs/06-PHASE-4-PREMIUM.md)                                                    | Offline-first, optimistic updates, push readiness                    |
| [07](docs/07-RELEASE.md)                                                            | Release engineering                                                  |
| [08](docs/08-PHASE-6-RUNTIME-AUDIT.md)                                              | Auditoría runtime (causas raíz del crash del APK) + matriz de reglas |
| [09](docs/09-PHASE-9-GO-LIVE.md)                                                    | **Go-live: checklist, riesgos y manual de publicación**              |
| [PRIVACY_POLICY](docs/PRIVACY_POLICY.md)                                            | Política de privacidad oficial + mapeo a Data Safety                 |
