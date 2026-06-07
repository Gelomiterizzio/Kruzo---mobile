# KRUZO Mobile — FASE 1: Arquitectura

> **Estado:** Diseño de arquitectura. **Aún sin código de app** (este es el plano).
> **Base:** [`00-PHASE-0-AUDIT.md`](./00-PHASE-0-AUDIT.md) (fuente de verdad = `web/`).
> **Stack obligatorio:** Expo + Expo Router + React Native + TypeScript estricto + Firebase Web SDK +
> TanStack Query + Zustand + React Hook Form + Zod + Expo Secure Store.
> **Decisión de búsqueda (aprobada):** paridad con web — filtros por categoría/zona; el texto libre no
> consulta el backend.

---

## 1. Principios de arquitectura

1. **Feature-first + capas limpias.** El código se organiza por _feature_ (auth, business, post,
   review, favorite, dashboard, admin) y dentro de cada una por capa. Lo transversal vive en `src/`.
2. **Regla de dependencias (unidireccional):**
   `app/ (rutas)` → `features/` → `components/ (DS) · hooks/ · services/ · store/ · utils/ · types/ · theme/`.
   Nunca al revés. `services/` no importa de `features/`; `components/` (design system) no conoce dominio.
3. **El backend es intocable.** `services/` replica el contrato de `web/lib/firebase/*` **sin crear**
   colecciones, índices ni funciones. Mismas queries → mismos índices ya desplegados.
4. **Paridad de lógica, reescritura de plataforma.** Tipos, validaciones (Zod), hooks (React Query),
   store (Zustand) y utils se portan casi literal; auth nativa, navegación, uploads, mapas y push se
   reescriben para Android.
5. **TypeScript estricto, sin `any` de dominio.** `strict: true`, `noUncheckedIndexedAccess`, paths `@/*`.
6. **Premium por defecto:** skeletons, optimistic updates, pull-to-refresh, infinite scroll, error
   boundaries, haptics y animaciones nativas (Reanimated) en toda lista/transición.

---

## 2. Estructura de carpetas

Expo Router exige `app/` en la raíz (rutas) y `assets/` en la raíz. Todo lo demás vive bajo `src/`
con alias `@/*`. Los módulos lógicos pedidos (components, features, services, hooks, store, providers,
constants, types, utils, theme, tests) existen **exactamente con esos nombres**, anidados en `src/`.

```
mobile/
├── app/                         # ── RUTAS (Expo Router) — pantallas finas que delegan en features/
│   ├── _layout.tsx              # Root: SafeArea + Providers + Theme + gate de auth + deep linking
│   ├── index.tsx                # Splash / redirección según sesión
│   ├── +not-found.tsx
│   ├── (auth)/                  # Solo NO autenticados (guard: si hay sesión → (tabs))
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                  # App principal (pública) con tab bar inferior
│   │   ├── _layout.tsx          # Tabs: Inicio · Explorar · Favoritos · Perfil
│   │   ├── index.tsx            # Home
│   │   ├── explore.tsx          # Explorar + filtros (= "search" web)
│   │   ├── favorites.tsx
│   │   └── profile.tsx          # Perfil/cuenta (+ accesos a dashboard/admin según rol)
│   ├── business/[slug].tsx      # Perfil de negocio (tabs internos: Publicaciones/Reseñas/Info/Mapa)
│   ├── post/[id].tsx            # Detalle de publicación
│   ├── user/[id].tsx            # Perfil público de usuario
│   ├── notifications.tsx
│   ├── settings.tsx
│   ├── (dashboard)/             # Rol entrepreneur|admin (guard de rol)
│   │   ├── _layout.tsx
│   │   ├── index.tsx · business.tsx · analytics.tsx · reviews.tsx · settings.tsx
│   │   └── posts/index.tsx · posts/new.tsx · posts/[id]/edit.tsx
│   └── (admin)/                 # Rol admin (guard de rol)
│       ├── _layout.tsx
│       └── index.tsx · businesses.tsx · users.tsx · posts.tsx · categories.tsx · reports.tsx
│
├── src/
│   ├── components/              # ── DESIGN SYSTEM (sin dominio, 100% reutilizable)
│   │   ├── ui/                  # Button, Card, Input, SearchBar, Modal/Sheet, Skeleton, Tabs,
│   │   │                        #   Avatar, Badge, Toast, Chip, Switch, RatingStars, PriceTag
│   │   ├── feedback/            # EmptyState, LoadingState, ErrorBoundary, ErrorState, Spinner
│   │   └── layout/              # Screen, Header, SafeScreen, KeyboardAware
│   │
│   ├── features/               # ── MÓDULOS DE DOMINIO (UI + hooks de feature)
│   │   ├── auth/               # LoginForm, RegisterForm, useGoogleSignIn, authGuards
│   │   ├── business/          # BusinessCard, BusinessGrid, BusinessProfile, BusinessForm, BusinessMap
│   │   ├── post/              # PostCard, PostGrid, PostForm, PostDetail
│   │   ├── review/            # ReviewCard, ReviewForm, RatingSummary
│   │   ├── favorite/         # useFavorites (optimista)
│   │   ├── home/             # Hero, CategoryGrid, FeaturedSection
│   │   ├── search/           # Filters, results (categoría/zona)
│   │   ├── dashboard/        # StatsCards, analytics charts, mis posts/negocio
│   │   └── admin/            # moderación negocios/usuarios/posts/categorías/reportes
│   │
│   ├── services/              # ── FIREBASE (espejo de web/lib/firebase, sin server-only)
│   │   ├── firebase.ts        # init app + initializeAuth(getReactNativePersistence)
│   │   ├── auth.ts            # email/google/reset/logout/onAuthChange/createUserDocument
│   │   ├── firestore.ts       # getBusinesses/getPosts/getReviews/createReview/toggleFavorite...
│   │   └── storage.ts         # uploadImage (URI→blob), uploadBusiness/PostImages, delete
│   │
│   ├── hooks/                 # ── HOOKS TRANSVERSALES (React Query)
│   │   ├── useAuth.ts · useBusinesses.ts · usePosts.ts · useReviews.ts
│   │   ├── useGeolocation.ts · useDebounce.ts · useRefreshByUser.ts (pull-to-refresh)
│   │
│   ├── store/                 # ── ZUSTAND (persist → AsyncStorage)
│   │   └── useStore.ts        # localFavorites, selectedCategory, searchQuery, unreadCount
│   │
│   ├── providers/             # AuthProvider · QueryProvider · ThemeProvider · ToastProvider
│   ├── constants/             # constants.ts (BUSINESS_CATEGORIES, SCZ_ZONES, paginación, labels)
│   ├── types/                 # business.ts · post.ts · review.ts · user.ts  (idénticos a web)
│   ├── utils/                 # formatters · validators(zod) · whatsapp · cn/clsx · firestore-helpers
│   ├── theme/                 # tokens.ts (colores HSL→hex, spacing, radius, type) · darkTheme · useTheme
│   └── lib/                   # queryClient.ts, env.ts (validación de env con zod), linking.ts
│
├── assets/                   # iconos, splash, fuentes, imágenes
├── tests/                    # setup + utilidades de test (specs co-locados junto al código)
├── app.json / app.config.ts  # Config Expo (scheme, android package, plugins, deep links)
├── eas.json                  # Perfiles de build (development/preview/production)
├── babel.config.js · metro.config.js · tsconfig.json · .eslintrc · .env / env.d.ts
└── package.json
```

**¿Por qué `app/` fino + `features/` gordo?** Mantiene las rutas como adaptadores triviales (params →
componente de feature), facilita test unitario de las features sin el router, y evita lógica acoplada
al sistema de archivos de Expo Router.

---

## 3. Navegación (Expo Router) y guards de rol

Reemplaza `middleware.ts` (web) por **guards declarativos en los `_layout.tsx` de cada grupo**, usando
el estado de `AuthProvider`. La autoridad real sigue siendo **las reglas de Firestore**; los guards solo
mejoran la UX (ocultar/redirigir).

| Grupo         | Regla de acceso                                                             | Equivalente web             |
| ------------- | --------------------------------------------------------------------------- | --------------------------- |
| `(auth)`      | Si hay sesión → redirige a `(tabs)`                                         | middleware `AUTH_ONLY`      |
| `(tabs)`      | Público (Home/Explore/Detalles). Favoritos/Perfil piden login para acciones | `(main)`                    |
| `(dashboard)` | `appUser.role ∈ {entrepreneur, admin}`; si no, → `(tabs)` o `/login`        | `PROTECTED`                 |
| `(admin)`     | `appUser.role === 'admin'`; si no, → `(tabs)`                               | `ADMIN_ONLY` + guard server |

**Patrón de guard** (en cada `_layout` protegido): mientras `loading` → splash; si no cumple → `Redirect`.
Sin sesión httpOnly, sin `/api/session`, sin SSR.

**IA de navegación (premium, estilo Yelp/Airbnb):** tab bar inferior de 4 (Inicio · Explorar · Favoritos
· Perfil). El acceso a Dashboard/Admin se hace desde **Perfil** (condicionado por rol), no como tab, para
no contaminar la barra del usuario común. Detalles (negocio/post/usuario) son _stack screens_ push.

**Deep linking / Share Sheet:** `scheme: "kruzo"` + universal links a `kruzo.bo`. Rutas enlazables:
`business/[slug]`, `post/[id]`, `user/[id]`. `Share` nativo genera la URL canónica (paridad con
`navigator.share` web).

---

## 4. Capa de datos (services + React Query)

- **Servicios = espejo de `web/lib/firebase/firestore.ts`** con **idénticas firmas y queries**
  (mismos `where/orderBy/limit/startAfter` → mismos índices ya desplegados). Los cursores siguen siendo
  `DocumentSnapshot` como `pageParam` (el JS SDK funciona igual en RN).
- **React Query:** se portan `useBusinesses/usePosts/useReviews` **sin cambios de lógica**
  (`useInfiniteQuery`, mismas `queryKey`, mismo `getNextPageParam`). Se añade:
  - `staleTime`/`gcTime` afinados para móvil + `retry` inteligente (backoff, no reintentar en `permission-denied`).
  - **Persistencia offline** (Fase 4): `@tanstack/react-query-persist-client` + persister AsyncStorage
    → caché de listas/detalle disponible sin red.
  - **Optimistic updates** para favoritos y creación de reseña (rollback en error), igual que el patrón
    optimista que ya hace `useFavorites` con el store.
- **Mutaciones** (crear negocio/post/reseña, toggle favorito, moderación admin) → `useMutation` con
  `invalidateQueries` de las keys afectadas.

---

## 5. Estado de cliente (Zustand)

Igual que web (`useStore.ts`) pero con `persist` sobre **AsyncStorage** (no `localStorage`):
`localFavorites`, `searchQuery`, `selectedCategory`, `unreadCount`. La verdad de datos remotos vive en
React Query; Zustand solo guarda estado de UI y el espejo optimista de favoritos.

---

## 6. Autenticación (capa de plataforma reescrita)

- **Init:** `initializeApp(config)` + **`initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })`**
  (NO `getAuth`, que no persiste en RN). Config desde `NEXT_PUBLIC_FIREBASE_*` reusadas como
  `EXPO_PUBLIC_FIREBASE_*` (validadas con Zod en `lib/env.ts`).
- **Email/contraseña, registro, reset, logout:** se portan tal cual desde `web/lib/firebase/auth.ts`,
  **eliminando `syncSession`/`clearSession`** (web-only).
- **Google:** `@react-native-google-signin/google-signin` → `GoogleAuthProvider.credential(idToken)` →
  `signInWithCredential`. Requiere **dev build (EAS)**, no funciona en Expo Go.
- **`createUserDocument`** idéntico (rol inicial `user`; sin auto-ascenso).
- **Sesión segura:** Firebase ya persiste el token en AsyncStorage; **Expo Secure Store** se usa para
  datos sensibles adicionales (p. ej. flags). `onAuthChange` hidrata `appUser` desde Firestore y carga
  `favoriteIds` (igual que `AuthProvider` web).
- **App Check:** Android → Play Integrity (opt-in). Antes de Fase 3 hay que verificar si Firestore tiene
  _enforcement_ activado; si lo está, registrar el proveedor o el cliente quedará bloqueado.

---

## 7. Sistema de diseño y theming (preludio Fase 2)

- **Tokens tipados** en `src/theme/tokens.ts` traducidos desde `globals.css` (HSL→hex) y
  `tailwind.config.ts`. Sin NativeWind: tema TS + `StyleSheet`/primitivos para control total de
  animaciones y rendimiento (NativeWind se evaluó y se descarta por overhead de runtime y fricción con
  Reanimated; de todos modos reconstruimos los componentes).
- **Paleta** (de la auditoría): primary light `#F0560F` aprox (`hsl(22 94% 48%)`) / dark `hsl(22 90% 56%)`;
  `brand` 50→900 (`#fff4f0 … #ff4500 … #7a2000`); `gold` `#fbbf24/#f59e0b/#d97706`; fondo cálido
  light/dark; `radius` 12px. Light y dark con `useColorScheme` + override manual (paridad con `next-themes`).
- **Animaciones:** `react-native-reanimated` + `react-native-gesture-handler` reemplazan
  `framer-motion`; `@gorhom/bottom-sheet` para modales/sheets; `expo-haptics` para feedback premium.
- **Iconos:** `lucide-react-native` (mismos iconos que web).
- **Imágenes:** `expo-image` (caché, blurhash, placeholders) en vez de `next/image`.

---

## 8. Subsistemas de plataforma

| Subsistema        | Web                     | Móvil (decisión)                                                                                         |
| ----------------- | ----------------------- | -------------------------------------------------------------------------------------------------------- |
| Imágenes (upload) | `File` + dropzone       | `expo-image-picker` → `fetch(uri).blob()` → `uploadBytesResumable` (mismas rutas, <5 MB)                 |
| Mapa              | Leaflet (HTML)          | `react-native-maps` (Google Maps Android). Fallback a dirección si `coordinates == null`                 |
| Ubicación         | `useGeolocation` (web)  | `expo-location` (permisos runtime)                                                                       |
| Compartir         | `navigator.share`       | `Share` / `expo-sharing` (URL canónica `kruzo.bo/...`)                                                   |
| Contacto          | `wa.me` + `tel:`        | `Linking.openURL` (WhatsApp + tel), reusando `buildWhatsApp*URL`                                         |
| Push              | "preparado" (sin envío) | `expo-notifications`: registrar token y persistirlo. **Envío FCM = backend nuevo → requiere aprobación** |
| Tema persistente  | `next-themes`           | `useColorScheme` + Zustand/SecureStore                                                                   |

---

## 9. Mapa de portabilidad de archivos (web → móvil)

| Origen `web/lib/...`                                  | Destino `mobile/src/...`                | Cambio                                 |
| ----------------------------------------------------- | --------------------------------------- | -------------------------------------- |
| `types/{business,post,review,user}.ts`                | `types/*`                               | **Copia literal**                      |
| `utils/{formatters,validators,whatsapp,constants}.ts` | `utils/*`, `constants/*`                | **Copia literal** (date-fns, zod)      |
| `firebase/config.ts`                                  | `services/firebase.ts`                  | `initializeAuth` + persistencia RN     |
| `firebase/auth.ts`                                    | `services/auth.ts`                      | Quitar session sync; Google nativo     |
| `firebase/firestore.ts`                               | `services/firestore.ts`                 | **~95% igual**; cursores idénticos     |
| `firebase/storage.ts`                                 | `services/storage.ts`                   | `File`→`blob` desde URI                |
| `firebase/admin.ts`, `app/api/session`                | —                                       | **Eliminado** (server-only)            |
| `hooks/use{Businesses,Posts,Reviews,Favorites}.ts`    | `hooks/*`                               | Lógica idéntica                        |
| `store/useStore.ts`                                   | `store/useStore.ts`                     | `persist` → AsyncStorage               |
| `providers/{Auth,Query,Theme}Provider`                | `providers/*`                           | Reescritura RN                         |
| `components/*` (Tailwind)                             | `components/` + `features/*`            | **Reconstrucción UI**, misma semántica |
| `middleware.ts`                                       | guards en `(dashboard)/(admin)/_layout` | Reescritura cliente                    |

---

## 10. Pantallas → rutas (paridad con la auditoría)

| Pantalla (web)              | Ruta móvil                                | Notas                                           |
| --------------------------- | ----------------------------------------- | ----------------------------------------------- |
| Home `/`                    | `(tabs)/index`                            | Hero + CategoryGrid + FeaturedSections          |
| Explore `/explore`          | `(tabs)/explore`                          | Grid + filtros                                  |
| Search `/search`            | (fusionada en `explore`)                  | **Filtros cat/zona; texto NO consulta backend** |
| Trending `/trending`        | `(tabs)/index` (sección) o `trending.tsx` | A decidir en Fase 3                             |
| Favorites `/favorites`      | `(tabs)/favorites`                        | Requiere login                                  |
| Business `/business/[slug]` | `business/[slug]`                         | Tabs internos Publicaciones/Reseñas/Info/Mapa   |
| Post `/post/[id]`           | `post/[id]`                               | CTA WhatsApp                                    |
| User `/user/[id]`           | `user/[id]`                               | Perfil público                                  |
| Login/Register/Forgot       | `(auth)/*`                                | —                                               |
| Settings / Notifications    | `settings`, `notifications`               | —                                               |
| Dashboard (8 vistas)        | `(dashboard)/*`                           | Guard rol entrepreneur/admin                    |
| Admin (6 vistas)            | `(admin)/*`                               | Guard rol admin                                 |

---

## 11. Dependencias propuestas (objetivo)

**Core:** `expo` (SDK 53), `expo-router` (~5), `react` 19, `react-native` 0.79, `typescript` 5.
**Datos/estado:** `firebase` ^11.9 (igual que web), `@tanstack/react-query` ^5,
`@tanstack/react-query-persist-client`, `zustand` ^5, `@react-native-async-storage/async-storage`.
**Formularios/validación:** `react-hook-form` ^7, `@hookform/resolvers`, `zod` ^3.
**Plataforma:** `expo-secure-store`, `expo-image`, `expo-image-picker`, `expo-location`,
`expo-notifications`, `expo-haptics`, `expo-sharing`, `expo-linking`, `expo-constants`.
**Auth Google:** `@react-native-google-signin/google-signin` (requiere dev build).
**UI/anim:** `react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`,
`react-native-screens`, `@gorhom/bottom-sheet`, `lucide-react-native`, `react-native-svg`.
**Mapa:** `react-native-maps`.
**Fechas:** `date-fns` ^3.
**Calidad:** `eslint` + `eslint-config-expo`, `jest-expo`, `@testing-library/react-native`,
`typescript` strict.

---

## 12. Calidad, testing y CI (preludio Fase 6)

- **TS estricto:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, alias `@/*`.
- **Lint:** `eslint-config-expo` + reglas import/order; `type-check` separado.
- **Tests:** `jest-expo` + RNTL. Unitarios: utils/validators/formatters (portados, ya probados en web),
  hooks (con QueryClient de test), guards de rol, lógica de favoritos optimista. Componentes DS clave.
- **CI:** workflow `type-check → lint → test → expo-doctor` (build EAS opcional). `expo prebuild`/EAS
  para el APK de producción.
- **Validación de env:** `lib/env.ts` con Zod falla rápido si falta una `EXPO_PUBLIC_FIREBASE_*`.

---

## 13. Riesgos y decisiones abiertas (a confirmar antes de implementar)

1. **Google Sign-In + Expo Go:** `@react-native-google-signin` **no** corre en Expo Go → se necesita
   **dev build (EAS)**. Confirmar que se usará dev build. Alternativa más simple para arrancar:
   email/contraseña primero y Google en una iteración posterior.
2. **App Check enforcement:** si está activo en Firestore, el cliente móvil debe registrar Play Integrity
   o todas las queries fallarán. **Verificar en consola antes de Fase 3.**
3. **`react-native-maps` Android key:** requiere una API key de Google Maps (Android) en `app.config.ts`.
   Si no se desea Google Maps, el tab "Mapa" puede degradar a dirección + botón "abrir en Maps".
4. **Versiones Expo SDK:** fijar SDK 53 (RN 0.79 / React 19, alinea con web). Si el entorno tiene otra,
   ajustar en el scaffold.
5. **Push real:** registrar token es seguro; **enviar** notificaciones implica una Cloud Function nueva
   (fuera de "no crear backend") → solo con aprobación explícita.
6. **Repo destino:** `Kruzo---mobile`. El scaffold inicializa git, rama base y estructura; el primer push
   se hará **solo cuando una fase compile y valide** (regla de ejecución).

---

## Conclusión de la Fase 1

La arquitectura maximiza la **reutilización de la lógica ya probada en producción** (tipos, validaciones,
servicios, hooks, store, utils) y aísla el trabajo real en **plataforma + UI**. Respeta las 10
restricciones de la auditoría, no toca el backend, y deja listo el terreno para la Fase 2 (Design System)
y Fase 3 (pantallas). **Siguiente paso sugerido:** crear el scaffold real del proyecto Expo en `mobile/`
con esta estructura (sin pantallas todavía), validar `tsc`/`lint`/`expo-doctor`, y solo entonces avanzar.
