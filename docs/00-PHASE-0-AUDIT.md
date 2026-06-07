# KRUZO — FASE 0: Auditoría Técnica Completa de `web/`

> **Estado:** Auditoría finalizada. **No se ha escrito código de la app móvil todavía.**
> **Fuente de verdad:** todo lo aquí documentado se extrajo leyendo el código real en `web/`.
> **Fecha:** 2026-06-06
> **Objetivo:** definir, sin inventar nada, el contrato exacto (datos, auth, reglas, diseño, flujos)
> que la app Android (Expo / React Native) debe replicar.

---

## 0. Resumen ejecutivo

`web/` es una aplicación **Next.js 16 (App Router) + React 19 + Firebase 11 (Web SDK) + Tailwind 3**,
en producción, con autoridad de datos en el backend mediante **Cloud Functions v2** y reglas de
Firestore/Storage estrictas. El stack web ya coincide casi 1:1 con el stack móvil exigido
(React Query, Zustand, React Hook Form, Zod, Firebase), por lo que **la lógica de negocio es portable
casi tal cual**; lo que cambia es la **capa de plataforma** (sesión, sign-in social, subida de
imágenes, navegación, push).

**Veredicto de portabilidad:** ALTO. No hay backend propietario ni APIs REST de negocio: la app es
un cliente directo de Firestore/Auth/Storage con agregación server-side. La app móvil será **otro
cliente del mismo backend**, sin crear base de datos, colecciones ni APIs nuevas.

---

## 1. Arquitectura encontrada

| Capa                 | Tecnología (versión real en `package.json`)                                  | Notas                                      |
| -------------------- | ---------------------------------------------------------------------------- | ------------------------------------------ |
| Framework            | Next.js `16.2.7` (App Router, RSC)                                           | `build` usa `--webpack`                    |
| UI                   | React `19.2.0`, Tailwind `3.4.7`, `framer-motion` 12, `lucide-react`         | Design tokens en CSS vars (HSL)            |
| Estado servidor      | `@tanstack/react-query` `^5.75`                                              | `useInfiniteQuery` para listas paginadas   |
| Estado cliente       | `zustand` `^5` con `persist`                                                 | Solo persiste `localFavorites`             |
| Formularios          | `react-hook-form` `^7.52` + `@hookform/resolvers` + `zod` `^3.23`            | Esquemas en `lib/utils/validators.ts`      |
| Datos                | `firebase` `^11.9` (Web SDK: Firestore, Auth, Storage, Analytics, App Check) | Singleton en `lib/firebase/config.ts`      |
| Backend autoritativo | `firebase-admin` `^13.10` + **Cloud Functions v2** (`functions/`)            | Sesión httpOnly + agregación de contadores |
| Mapas                | `leaflet` `^1.9` (sin react-leaflet)                                         | Popups HTML escapados (anti-XSS)           |
| Gráficas             | `recharts` `^2.12`                                                           | Dashboard analytics                        |
| Toasts               | `sonner` `^2`                                                                | Feedback global                            |
| Fechas               | `date-fns` `^3.6` + locale `es`                                              | `formatRelativeTime`, `formatDate`         |

**Patrón arquitectónico:** capas limpias y ya separadas en `web/lib/`:

```
lib/
├── firebase/   config.ts · auth.ts · firestore.ts · storage.ts · admin.ts(SOLO server)
├── types/      business.ts · post.ts · review.ts · user.ts   ← modelos de dominio
├── hooks/      useAuth · useBusinesses · usePosts · useReviews · useFavorites · useGeolocation
├── store/      useStore.ts (zustand persist)
├── utils/      constants · formatters · validators · whatsapp · cn
└── ads/        config.ts (AdSense, opt-in por env)
providers/      AuthProvider · QueryProvider · ThemeProvider
```

Esta separación `firebase / types / hooks / store / utils / providers` es **directamente transplantable**
a `mobile/src/` (ver Fase 1).

---

## 2. Firebase encontrado

- **Proyecto:** `kruzo-web` (memoria de auditoría previa; confirmado por `.firebaserc`).
- **Productos en uso:** Auth, Firestore (Native), Storage, Analytics (lazy, browser-only),
  App Check (opt-in reCAPTCHA v3), Cloud Functions v2.
- **Inicialización web** (`lib/firebase/config.ts`): singleton con config pública vía
  `NEXT_PUBLIC_FIREBASE_*`. **Estas claves son públicas por diseño**; la seguridad real la imponen
  las reglas de Firestore/Storage.
- **Variables de entorno** (`.env.example`):
  - Públicas (las que necesita el móvil): `API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`,
    `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`, `MEASUREMENT_ID`.
  - Servidor (NO aplican al móvil): `FIREBASE_SERVICE_ACCOUNT_KEY` o el trío
    `FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY` → solo para sesión httpOnly y guard server-side.
- **Cloud Functions** (`functions/index.js`, v2, Node 22):
  - `onReviewWritten` (`businesses/{businessId}/reviews/{reviewId}`): recalcula
    `reviewCount`, `rating` (promedio) y `ratingDistribution` en una transacción.
  - `onUserFavoritesWritten` (`users/{uid}`): mantiene `business.favoriteCount` a partir del diff
    de `favoriteIds`.
  - Lógica pura testeable en `functions/lib/aggregate.js` (`applyReviewDelta`, `summarize`,
    `visibleRating`). **El documento de negocio es la fuente de verdad de los contadores.**
  - ⚠️ Discrepancia menor: `functions/index.js:19` declara `region: 'us-central1'`, pero la memoria
    de despliegue indica `southamerica-east1`. Irrelevante para el móvil (los triggers no se llaman
    desde el cliente), pero anotado.

---

## 3. Colecciones de Firestore encontradas

Extraídas de `firestore.rules`, `firestore.indexes.json` y la capa `lib/firebase/firestore.ts`.

| Colección / Subcolección          | Lectura | Escritura                                     | Notas clave                                                                             |
| --------------------------------- | ------- | --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `users/{uid}`                     | pública | dueño (o admin)                               | Modelo `AppUser`. Contiene `role`, `favoriteIds[]`, `businessIds[]`, `notifications{}`  |
| `users/{uid}/favorites/{fid}`     | dueño   | dueño                                         | **Definida en reglas pero NO usada** por la app (favoritos viven en `user.favoriteIds`) |
| `users/{uid}/notifications/{nid}` | dueño   | dueño                                         | Soporte para notificaciones in-app                                                      |
| `businesses/{bid}`                | pública | dueño/admin (crear: emprendedor)              | Modelo `Business`. Contadores los escribe SOLO Cloud Functions                          |
| `businesses/{bid}/reviews/{rid}`  | pública | **id == uid del autor**                       | 1 reseña por usuario por negocio. Crear exige `rating ∈ [1,5]`                          |
| `posts/{pid}`                     | pública | dueño/admin (crear: emprendedor)              | Modelo `Post`. `ownerId` debe == auth.uid                                               |
| `posts/{pid}/comments/{cid}`      | pública | crea cualquier autenticado; edita dueño/admin | **En reglas; sin UI web activa**                                                        |
| `posts/{pid}/likes/{uid}`         | pública | el propio uid                                 | **En reglas; sin UI web activa**                                                        |
| `categories/{cid}`                | pública | admin                                         | Gestionada en `/admin/categories`. Ojo: la UI usa constantes hardcodeadas (ver §10)     |
| `reports/{rid}`                   | admin   | crea autenticado; edita/borra admin           | Moderación de contenido                                                                 |
| `config/{cid}`                    | pública | admin                                         | Configuración global de la plataforma                                                   |

**Índices compuestos** (`firestore.indexes.json`) — el móvil debe respetar EXACTAMENTE estas queries
o Firestore las rechazará:

- `businesses`: `status + isFeatured(desc) + createdAt(desc)`; `status + category(array) + createdAt`;
  `status + rating(desc)`; variantes con `zone` e `isFeatured`; `reviewCount + rating`.
- `posts`: `status + category + createdAt`; `businessId + createdAt`; `status + createdAt`;
  `businessId + status + createdAt`.
- `reviews` (collection group): `businessId + createdAt`; y `isHidden + createdAt`.

---

## 4. Roles encontrados

`type UserRole = 'user' | 'entrepreneur' | 'admin'` (`lib/types/user.ts`).

| Rol            | Puede                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| `user`         | Navegar, buscar/filtrar, favoritos, escribir reseñas, reportar                    |
| `entrepreneur` | Todo lo de `user` + crear/editar su(s) negocio(s) y posts + dashboard + analytics |
| `admin`        | Todo + panel `/admin`: moderar negocios/posts/usuarios, categorías, reportes      |

**Cómo se aplica el rol:**

- **Cliente:** `useAuth()` expone `isEntrepreneur` (= entrepreneur **o** admin) e `isAdmin`.
- **Backend (autoritativo):** las reglas de Firestore leen
  `get(/users/$(uid)).data.role` → `isAdmin()` / `isEntrepreneur()`.
- **Web-only:** el guard server-side de `/admin` (`app/admin/layout.tsx` + `getSessionUser()`) usa la
  cookie de sesión httpOnly. **Esto no existe en móvil** → el móvil confía en (a) reglas de Firestore
  (autoritativas) + (b) gating de UI por `appUser.role`.

⚠️ Importante: nadie crea usuarios con rol ≠ `user` desde la app (`createUserDocument` fija
`role: 'user'`). El ascenso a `entrepreneur`/`admin` ocurre fuera de banda (admin o consola). El móvil
**no debe** inventar un flujo de auto-ascenso.

---

## 5. Flujos encontrados

1. **Auth:** registro (email/pass + displayName), login email/pass, login Google (popup web),
   recuperación de contraseña, logout. Tras sign-in: `createUserDocument` (idempotente) +
   `syncSession` (cookie, **web-only**). `onAuthChange` hidrata `appUser` desde Firestore y carga
   `favoriteIds` al store.
2. **Descubrimiento (user):** Home (hero + categorías + secciones destacadas) → Explorar (grid
   paginado) → Buscar (filtro por categoría/zona) → Tendencias → detalle de negocio / detalle de post.
3. **Negocio (perfil):** galería, header con verificado/destacado, rating + reviewCount + viewCount,
   "abierto ahora" calculado en cliente, CTAs (WhatsApp / llamar / favorito / compartir), tabs
   **Publicaciones · Reseñas · Información · Mapa**. La vista (view count) la incrementa el servidor.
4. **Reseñas:** crear (1 por usuario, doc id == uid, transacción anti-duplicado) → Cloud Function
   recalcula agregados. El dueño puede responder (`ownerReply`).
5. **Favoritos:** toggle optimista (store local) → `updateDoc(users/{uid}.favoriteIds)` → Cloud
   Function ajusta `favoriteCount`.
6. **Emprendedor (dashboard):** resumen con métricas reales, crear/editar negocio, crear/editar/listar
   posts, analytics, reseñas recibidas, settings.
7. **Admin:** dashboard con agregaciones reales (`count()`, `sum()`, `average()`), moderación de
   negocios (aprobar/suspender/destacar/verificar), usuarios (roles/ban), posts, categorías, reportes.
8. **Contacto:** todo el "contacto" es vía **WhatsApp** (`wa.me` con mensaje pre-rellenado) y `tel:`.
   No hay chat interno.

---

## 6. Componentes encontrados (inventario `web/components/`)

- **business/** `BusinessCard`, `BusinessGrid`, `BusinessForm`, `BusinessProfile`
- **post/** `PostCard`, `PostGrid`, `PostForm`
- **review/** `ReviewCard`, `ReviewForm`, `StarRating` (+ `RatingBar`)
- **search/** `SearchBar`, `SearchFilters`
- **home/** `HeroSection`, `CategoryGrid`, `FeaturedSection`
- **layout/** `Navbar`, `Sidebar` (type: dashboard | admin), `Footer`
- **map/** `BusinessMap` (Leaflet)
- **shared/** `EmptyState`, `LoadingSpinner`, `SkeletonCard`/`GridSkeleton`, `ErrorBoundary`,
  `CategoryBadge`, `Avatar`(initials), `ThemeToggle`, `ImageUpload`, `WhatsAppButton`,
  `ServiceWorkerRegister`
- **ads/** `AdUnit` + 5 banners + `AdSenseScript` (opt-in por env; off por defecto)

Estos definen el **Design System a portar** en la Fase 2 (Button, Card, Input, SearchBar, Modal,
Skeleton, Tabs, Avatar, Badge, Toast, Empty/Loading State).

---

## 7. Pantallas encontradas (App Router)

**Públicas / usuario** (`app/(main)`): `/` (Home), `/explore`, `/search`, `/trending`,
`/favorites`, `/business/[slug]`, `/post/[id]`, `/user/[id]`, `/about`, `/contact`.
**Auth** (`app/(auth)`): `/login`, `/register`, `/forgot-password`.
**Cuenta:** `/settings`, `/notifications`.
**Dashboard emprendedor** (`app/dashboard`): `/dashboard`, `/business`, `/posts`, `/posts/new`,
`/posts/[id]/edit`, `/analytics`, `/reviews`, `/settings`.
**Admin** (`app/admin`): `/admin`, `/businesses`, `/users`, `/posts`, `/categories`, `/reports`.
**Sistema:** `not-found`, `error`, `loading` (varios), `robots.ts`, `sitemap.ts`, `ads.txt`,
`api/session` (web-only).

---

## 8. Rutas / API encontradas

- **No hay APIs REST de negocio.** El único route handler es `app/api/session/route.ts`
  (POST mintea cookie de sesión, DELETE la limpia) — **mecanismo exclusivo de web**.
- **`middleware.ts`** (web-only): protege `/dashboard|/settings|/favorites|/notifications`, exige admin
  para `/admin`, redirige usuarios autenticados fuera de `/login|/register|/forgot-password`.
  En móvil esto se sustituye por **route guards de Expo Router** + estado de auth.
- Todo el resto de "rutas" son lecturas/escrituras directas al SDK de Firestore.

---

## 9. Servicios encontrados (contrato de datos a replicar)

De `lib/firebase/firestore.ts`, `auth.ts`, `storage.ts` (firmas exactas que el móvil reutilizará):

**Auth** (`auth.ts`): `signInWithGoogle`, `signInWithEmail`, `registerWithEmail`, `resetPassword`,
`logout`, `onAuthChange`, `createUserDocument`. (`syncSession`/`clearSession` son web-only y se omiten.)

**Firestore** (`firestore.ts`):
`getUserById`, `updateUserProfile`,
`getBusinessBySlug`, `getBusinessById`, `getBusinesses({category,featured,zone,pageSize,cursor})`,
`createBusiness`, `updateBusiness`,
`getPosts`, `getPostsByBusiness`, `createPost`, `updatePost`,
`getReviews(businessId,pageSize,cursor)`, `createReview` (transacción, doc id == uid),
`toggleFavorite(userId,businessId,isFav)` (escribe solo `favoriteIds`).

**Storage** (`storage.ts`): `uploadImage`, `uploadBusinessImages('logo'|'cover'|'gallery')`,
`uploadPostImages`, `deleteStorageFile`. Rutas: `businesses/{id}/{type}/...`, `posts/{id}/...`.
Límite: solo imágenes < 5 MB (impuesto por `storage.rules`).

**Utils a portar tal cual:** `formatPrice` (Bs.), `formatRelativeTime`/`formatDate` (date-fns es),
`formatNumber` (k/M), `slugify`/`uniqueSlug`, `isOpenNow`, `getInitials`, `normalizeBolivianPhone`,
`buildWhatsApp*URL`. Constantes: `BUSINESS_CATEGORIES` (12, con emoji/label/color/gradient),
`SCZ_ZONES` (12 zonas), `SCZ_CENTER`, labels de precio/plan, tamaños de paginación.

---

## 10. Riesgos encontrados (críticos para el port móvil)

1. **No existe búsqueda de texto completo.** En `/search`, el parámetro `q` es **cosmético** (solo
   título); `BusinessGrid`/`PostGrid` filtran únicamente por `category`/`zone`/`featured`. Algolia fue
   eliminado en una fase previa. → El móvil **no puede** prometer búsqueda por nombre vía backend;
   debe replicar el filtrado por categoría/zona y, si se quiere texto, hacerlo **client-side** sobre
   resultados ya cargados (con su limitación) o dejarlo fuera. **No inventar un servicio de búsqueda.**
2. **Sesión httpOnly + middleware son web-only.** El móvil usa la persistencia nativa de Firebase Auth
   (con `expo-secure-store` / AsyncStorage) y guards de Expo Router. **No** se debe portar
   `api/session` ni el guard server-side de `/admin`; la autoridad sigue siendo las reglas de Firestore.
3. **Google Sign-In con popup no funciona en móvil.** `signInWithPopup` es de navegador. En Expo hay
   que usar `expo-auth-session` / Google nativo + `signInWithCredential`. Es trabajo de plataforma, no
   de negocio.
4. **App Check usa reCAPTCHA v3 (web).** En Android sería Play Integrity. Opcional; si Firestore tiene
   enforcement activado, el cliente móvil debe registrar su proveedor o quedará bloqueado. **Verificar
   antes de Fase 3.**
5. **Subida de imágenes:** la web sube `File` desde `<input>`/dropzone. El móvil usa
   `expo-image-picker` → URI/blob; hay que adaptar `uploadImage` (mismas rutas y límite 5 MB) sin tocar
   `storage.rules`.
6. **Likes/comentarios de posts:** existen en `firestore.rules` y en el modelo (`likeCount`,
   `commentCount`) pero **no hay UI web activa** que los togglee. El móvil debe **igualar a la web** (no
   inventar interacciones); como mucho, mostrar contadores.
7. **Categorías: doble fuente.** La UI usa la constante `BUSINESS_CATEGORIES` (hardcoded) como fuente
   de verdad de presentación; la colección `categories` es gestionada por admin pero no alimenta los
   listados. El móvil debe usar la **misma constante** para la UI y, si implementa el panel admin de
   categorías, leer/escribir la colección. **No mezclar.**
8. **Push notifications: solo "preparadas".** Existen `user.notifications.push` y la subcolección
   `notifications`, pero **no hay pipeline de envío** (ninguna Cloud Function manda FCM). El móvil puede
   registrar el token (`expo-notifications`) y persistirlo, pero el envío requeriría una función nueva
   (fuera del alcance "no crear backend" salvo aprobación explícita).
9. **Cookies / SSR no aplican.** Cualquier dependencia de `next/headers`, RSC o `Image` de Next debe
   reemplazarse por equivalentes RN (`expo-image`, `FlatList`, etc.).
10. **`functions/index.js` región us-central1 vs southamerica-east1** (memoria). No afecta al cliente,
    pero conviene reconciliar el repo web en algún momento (no es tarea del móvil).

---

## Mapa de equivalencias Web → Móvil (decisión de arquitectura)

| Web (Next.js)                           | Móvil (Expo / RN)                              | ¿Se reutiliza?                                          |
| --------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| `lib/types/*`                           | `src/types/*`                                  | **Idéntico** (copiar)                                   |
| `lib/firebase/firestore.ts`             | `src/services/firestore.ts`                    | **~95%** (cambia `DocumentSnapshot` cursors, igual API) |
| `lib/firebase/auth.ts`                  | `src/services/auth.ts`                         | Quitar `syncSession`; Google → nativo                   |
| `lib/firebase/storage.ts`               | `src/services/storage.ts`                      | Adaptar `File`→URI/blob                                 |
| `lib/firebase/admin.ts` + `api/session` | —                                              | **Se elimina** (web-only)                               |
| `middleware.ts`                         | Guards en `app/_layout` / grupos `(protected)` | Reescribir                                              |
| `lib/hooks/use*` (React Query)          | `src/hooks/use*`                               | **Idéntico en lógica**                                  |
| `lib/store/useStore.ts` (zustand)       | `src/store/*`                                  | **Idéntico** (persist → AsyncStorage)                   |
| `lib/utils/*`                           | `src/utils/*`                                  | **Idéntico** (date-fns, zod, whatsapp)                  |
| Tokens CSS HSL + Tailwind               | `src/theme/*` (tokens TS)                      | Traducir HSL→hex/objeto theme                           |
| `components/*` (Tailwind)               | `components/*` + `features/*` (RN + tokens)    | Reconstruir UI, misma semántica                         |

### Tokens de marca extraídos (de `globals.css` + `tailwind.config.ts`)

- **Primary (naranja KRUZO):** light `hsl(22 94% 48%)`, dark `hsl(22 90% 56%)`.
- **Escala `brand`:** 50 `#fff4f0` … 500 `#ff4500` … 900 `#7a2000`.
- **Gold (rating/destacado):** 400 `#fbbf24`, 500 `#f59e0b`, 600 `#d97706`.
- **Fondo light** `hsl(40 45% 98%)` (cálido), **dark** `hsl(20 22% 5%)`.
- **Radius:** `0.75rem` (12px). **Fuentes:** `--font-sans` + `--font-display`.
- **Marca:** "KRUZO — Tu Ciudad. Tu Mercado." · Ciudad: Santa Cruz de la Sierra, Bolivia · Moneda: BOB (Bs.).

---

## Conclusión de la Fase 0

- El backend (Firestore + Auth + Storage + Functions + reglas + índices) es **estable y autoritativo**;
  el móvil será un **cliente adicional**, sin crear nada nuevo en el backend.
- La lógica de negocio (servicios, hooks, store, utils, tipos, validaciones) es **portable casi literal**.
- El trabajo real del móvil es: **(a)** capa de plataforma (auth nativa, sesión, uploads, navegación,
  push), **(b)** reconstruir el Design System y las pantallas en RN respetando tokens y semántica, y
  **(c)** respetar las 10 restricciones de §10 para no romper reglas/índices.
- **No se procede a escribir código** hasta aprobación de este informe y luz verde para la Fase 1
  (arquitectura móvil).
