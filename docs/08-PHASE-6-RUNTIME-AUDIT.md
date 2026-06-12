# KRUZO Mobile — FASE 6: Auditoría runtime, crash del APK y compatibilidad con reglas endurecidas

> Auditoría total post-hardening de la web (2026-06-11). Objetivos: (1) encontrar
> la causa raíz del crash de arranque del APK, (2) verificar que todos los writes
> del móvil siguen siendo válidos bajo las `firestore.rules` endurecidas
> (web/phase-7-hardening, 48/48 PASS en emulador), (3) validación funcional en
> dispositivo. Todo lo afirmado aquí fue **reproducido y verificado** en un
> emulador Pixel_8 (Android 16, x86_64) con el APK release real.

---

## 1. Causa raíz del crash de arranque (splash → cierre)

El síntoma reportado («muestra el splash, comienza a cargar y se cierra; nunca
llega al login») tenía **dos causas raíz independientes y acumuladas**. Ambas
fueron reproducidas con logcat y corregidas.

### Crash #1 — APK sin libs x86_64 (afecta a TODOS los emuladores)

```
com.facebook.soloader.SoLoaderDSONotFoundError: couldn't find DSO to load: libreactnative.so
    SoSource 1: DirectApkSoSource[base.apk!/lib/x86_64]      ← busca x86_64
    at bo.kruzo.app.MainApplication.onCreate(MainApplication.kt:48)
```

- **Archivo/línea:** `android/app/src/main/java/bo/kruzo/app/MainApplication.kt:48`
  (`DefaultNewArchitectureEntryPoint.load()` → SoLoader).
- **Causa:** el APK de `builds/` se compiló con
  `-PreactNativeArchitectures=arm64-v8a` (sólo ARM, documentado en docs/07 como
  atajo de velocidad). Los AVD de Android Studio en PC son **x86_64**. La
  instalación NO falla (Android 14+ Play images anuncian traducción ARM), pero
  SoLoader busca `lib/x86_64/` dentro del APK, no existe, y el proceso muere en
  `Application.onCreate` — antes del primer frame JS. El “splash” que se ve es
  la *starting window* del sistema; por eso parece que “carga y se cierra”.
- **Fix:** compilar con `-PreactNativeArchitectures=arm64-v8a,x86_64` (docs/07
  actualizado). En emulador instalar con `adb install --abi x86_64` (la imagen
  Android 16 ps16k a veces re-deriva el ABI primario a arm64 tras un reboot).
- **Nota:** un Pixel 8 físico (arm64) NO sufría este crash… pero sí el #2.

### Crash #2 — Módulos nativos Expo ausentes por `node_modules` anidado

```
E ReactNativeJS: [runtime not ready]: Error: Cannot find native module 'ExpoAsset'
F libc: Fatal signal 6 (SIGABRT) in tid (mqt_v_js), pid (bo.kruzo.app)
```

- **Causa:** npm dejó `expo-asset`, `expo-file-system`, `expo-font` y
  `expo-keep-awake` **anidados** en `node_modules/expo/node_modules/` en vez de
  izados a la raíz. Metro sí los resuelve (resolución Node) → el JS llega al
  bundle; pero **expo-autolinking sólo escanea la raíz** → sus módulos nativos
  nunca se compilan en el APK. `requireNativeModule('ExpoAsset')` lanza, y en
  release una excepción JS no manejada aborta el proceso (SIGABRT). Este es el
  crash que sufriría también un dispositivo físico arm64.
- **Fix (commit `4c5bdb1`):** declararlos dependencias directas vía
  `npx expo install expo-asset expo-file-system expo-font expo-keep-awake`
  → quedan izados y autolinkeados. Verificado: la app arranca, Home renderiza.

### Bug #3 (encontrado al validar) — BottomSheet de @gorhom nunca se monta en release

- **Síntoma:** con la app ya arrancando, `BottomSheetModal.present()` no hace
  **nada** en el APK release (RN 0.79 + New Architecture): sin sheet, sin error
  en logcat, verificado con dumps de jerarquía en dos pantallas y estado limpio.
- **Impacto P0 funcional:** el campo **Zona** (requerido) del formulario de
  negocio usa ese sheet → era imposible crear un negocio desde la app; el filtro
  por zona de Explorar tampoco abría.
- **Fix (commit `53d24b8`):** `src/components/overlay/BottomSheet.tsx` reescrito
  sobre el `Modal` core de RN (misma API: `visible/onClose/title/snapPoints`);
  `Select` y Explore no cambian. Verificado en runtime: el sheet abre, lista las
  zonas y aplica el filtro («Zona: Centro»).

### Bug #4 (encontrado al validar) — Paridad rota con la web en auth/roles

1. **Guard del dashboard (commit `c87e6e0`):** mobile exigía rol
   `entrepreneur|admin` para `/dashboard`, pero en la web `/dashboard` es
   sólo-auth (`proxy.ts`): un usuario normal DEBE poder entrar para crear su
   primer negocio (la Cloud Function `onBusinessWritten` lo promueve después).
   Con el guard viejo, nadie podía convertirse en emprendedor desde la app
   (círculo vicioso). Nuevo grupo `protected` (sólo autenticación) + entrada
   «Registra tu negocio» en Perfil para usuarios sin negocio.
2. **Race post-registro (mismo commit):** tras registrarse,
   `onAuthStateChanged` dispara ANTES de que `createUserDocument` escriba
   `users/{uid}` → `appUser` quedaba `null` y el Perfil te mostraba como NO
   logueado hasta reiniciar la app (reproducido). `register()`/`loginGoogle()`
   ahora llaman `refreshUser()` al terminar.

### Causa ambiental (no es bug de la app)

El AVD por defecto tenía **2 GB de RAM**; el lowmemorykiller mató la app en
primer plano («min watermark is breached even after kill»). Subir el AVD a 4 GB
lo resuelve. RSS de la app ~260 MB: normal para RN + New Architecture.

---

## 2. Compatibilidad de writes vs `firestore.rules` endurecidas

Inventario exhaustivo (grep de `addDoc|setDoc|updateDoc|deleteDoc|writeBatch|runTransaction`
en `src/` y `app/` — todas las escrituras viven en `src/services/`):

| # | Archivo | Colección | Operación | Campos escritos | Regla endurecida aplicable | Compatible |
|---|---------|-----------|-----------|-----------------|----------------------------|------------|
| 1 | services/auth.ts:28 `createUserDocument` | `users/{uid}` | setDoc (create) | id, email, displayName, photoURL, phone, bio, location, **role:'user'**, businessIds, favoriteIds, postCount, reviewCount, reputation:0, notifications, **isVerified:false**, **isBanned:false**, banReason, createdAt, lastSeen | create: uid propio ∧ role=='user' ∧ !isBanned ∧ !isVerified | ✅ |
| 2 | services/auth.ts:25 (re-login) | `users/{uid}` | updateDoc | lastSeen | update propio, no toca bloqueados | ✅ |
| 3 | services/firestore.ts:39 `updateUserProfile` | `users/{uid}` | updateDoc | displayName, phone, location, bio, notifications, updatedAt | no toca `role/isBanned/banReason/isVerified/reputation` | ✅ (verificado en dispositivo) |
| 4 | services/firestore.ts:47 `linkBusinessToOwner` | `users/{uid}` | updateDoc | businessIds (arrayUnion) | campo no bloqueado | ✅ |
| 5 | services/firestore.ts:276 `toggleFavorite` | `users/{uid}` | updateDoc | favoriteIds (arrayUnion/Remove) | campo no bloqueado | ✅ |
| 6 | services/notifications.ts:37 `savePushToken` | `users/{uid}` | updateDoc | expoPushToken, lastSeen | campos no bloqueados | ✅ |
| 7 | services/firestore.ts:97 `createBusiness` | `businesses` | addDoc | form + slug, ownerId, ownerName, contadores:0, **status:'pending'**, **isVerified:false**, **isFeatured:false**, plan:'free', featuredUntil:null, createdAt/updatedAt | create: ownerId==uid ∧ status=='pending' ∧ !isVerified ∧ !isFeatured | ✅ (= test «alice crea negocio propio en estado pending» de la suite web, PASS) |
| 8 | services/firestore.ts:131 `updateBusiness` | `businesses/{id}` | updateDoc | campos del form / logo / coverImage / images + updatedAt | keepsLocked(ownerId, slug, status, isVerified, isFeatured, featuredUntil, plan, contadores, createdAt) — ninguno se toca | ✅ |
| 9 | services/firestore.ts:189 `createPost` | `posts` | addDoc | form + ownerId, businessId, businessName/Slug/Logo, whatsapp, contadores:0, status:'active', createdAt/updatedAt | create: ownerId==uid ∧ get(business).ownerId==uid | ✅ |
| 10 | services/firestore.ts:216 `updatePost` (editar) | `posts/{id}` | updateDoc | campos del form + updatedAt (status NO se toca) | keepsLocked + status igual | ✅ |
| 11 | dashboard/posts/index.tsx:35 (eliminar) | `posts/{id}` | updateDoc | status:'deleted', updatedAt | status → 'deleted' permitido explícitamente | ✅ |
| 12 | services/firestore.ts:248 `createReview` | `businesses/{bid}/reviews/{uid}` | runTransaction (get+set) | id doc == uid, userId==uid, rating (zod 1–5), comment, images, ownerReply:null, isHidden:false, reportCount:0, createdAt/updatedAt | create: rid==uid ∧ userId==uid ∧ rating 1..5 | ✅ |
| 13 | services/admin.ts:20/24 | `users/{uid}` | updateDoc | role / isBanned | isAdmin() | ✅ (pantalla tras guard admin) |
| 14 | services/admin.ts:36/40/44 | `businesses/{id}` | updateDoc | status / isFeatured / isVerified | isAdmin() | ✅ |
| 15 | services/admin.ts:56 | `posts/{id}` | updateDoc | status | isAdmin() | ✅ |
| 16 | services/storage.ts | Storage `businesses/{id}/…`, `posts/{id}/…` | upload | imágenes (picker quality 0.8) | signed-in ∧ image/* ∧ <5MB | ✅ (⚠ sin tope client-side de 5MB: P2) |

**Veredicto: compatibilidad TOTAL.** Mobile no escribe `reports`, `categories`,
`config` ni `users/*/notifications` (sólo lectura), no toca `ownerReply` ni
edita reviews, y no escribe ningún campo bloqueado por `keepsLocked`.

### ⚠️ Hallazgo crítico de despliegue (acción del lado web)

**Producción aún corre las reglas VIEJAS** (verificado en vivo el 2026-06-11
contra `kruzo-web` vía REST autenticado): un create de negocio que cumple las 4
condiciones de la regla nueva devuelve `PERMISSION_DENIED`, porque la regla
desplegada exige `isEntrepreneur()` (regla de `main`, pre-hardening). El PR de
hardening de la web (#9) sigue sin merge/deploy. Hasta que se ejecute
`firebase deploy --only firestore:rules,functions`:

- Ningún usuario `role:'user'` puede crear su primer negocio (ni en web ni en
  móvil) — el círculo roto que este audit corrige en el cliente sólo queda
  cerrado del todo con el deploy (reglas nuevas + `onBusinessWritten`).
- El resto de la app móvil funciona también con las reglas viejas (registro,
  perfil, lecturas: verificado en dispositivo contra producción).

---

## 3. Validación funcional ejecutada (APK release real, emulador, backend de producción)

| Flujo | Resultado | Evidencia |
|-------|-----------|-----------|
| Arranque → Home | ✅ | screenshot; proceso vivo; `ReactNativeJS: Running "main"` |
| Registro email (form completo) | ✅ | Firebase Auth crea cuenta; `users/{uid}` escrito y ACEPTADO por reglas; Perfil muestra «Kruzo Audit / Usuario» |
| Persistencia de sesión | ✅ | force-stop + relaunch → sesión restaurada de AsyncStorage |
| Race post-registro | 🐛→✅ | reproducido (Perfil «no logueado» hasta reiniciar); corregido con `refreshUser()` |
| Login screen / navegación auth | ✅ | guards redirigen correctamente (deep links `kruzo://register`, `kruzo://profile`) |
| Explorar (query businesses con índice compuesto) | ✅ | empty state limpio; colección vacía confirmada vía REST (no hay negocios en prod) |
| Filtro por zona (BottomSheet) | 🐛→✅ | sheet no montaba en release; reescrito sobre RN Modal; «Zona: Centro» aplicado |
| Dashboard como `role:'user'` | 🐛→✅ | antes rebotaba a Home; ahora abre («Hola, Kruzo 👋») |
| Crear negocio (form completo + submit) | ⚠️ bloqueado por backend | payload correcto; `PERMISSION_DENIED` de las reglas VIEJAS de producción (exige entrepreneur). Con las reglas nuevas el caso equivalente es PASS en la suite del emulador web |
| Guardar Configuración (updateUserProfile) | ✅ | `users/{uid}.updatedAt = 2026-06-11T17:43:40Z` visible vía REST |
| Logout | ✅ (por código) | `signOut()+googleSignOut()`; sin condiciones para fallar; no probado en runtime |
| Push token | ⚠️ esperado | «no EAS projectId yet — token registration skipped» (pendiente externo `eas init`, ya documentado en docs/07) |
| Notificaciones (lectura) | ✅ (por código) | colección vacía (no hay emisor aún; igual que web) |

Cuenta de prueba creada en producción: `audit.kruzo.qa.20260611@gmail.com`
(uid `xsvdKZb2KKMWl96E62r77M8epYr1`, role user, sin contenido). Puede borrarse
desde la consola Firebase si se desea.

---

## 4. Hallazgos restantes (no corregidos aquí; priorizados)

| Prioridad | Hallazgo | Detalle |
|----------|----------|---------|
| P0 (externo) | **Deploy pendiente de rules+functions** | Sin él, nadie puede crear su primer negocio en ningún cliente. `firebase deploy --only firestore:rules,functions` tras merge del PR web #9 |
| P1 | Sin eliminación de cuenta en mobile | La web la hace vía `DELETE /api/account` (cookie de sesión + Admin SDK); mobile no tiene equivalente. Play exige opción de borrado de cuenta para apps con registro. Requiere una Cloud Function callable |
| P1 | Release firmado con debug keystore | Ya documentado en docs/07; bloquea publicación real |
| P2 | Imágenes sin tope client-side de 5MB | storage.rules rechaza >5MB con error opaco; picker usa quality 0.8 (mitiga). Añadir validación de tamaño + mensaje |
| P2 | `ROLE_META[user.role]` sin fallback en perfil | role inesperado/ausente → TypeError. Defensivo pendiente |
| P2 | `business.rating.toFixed(1)` sin guard en dashboard/reviews | rating undefined en docs legados → crash de pantalla |
| P2 | Usuarios baneados no bloqueados en cliente | mobile no comprueba `isBanned` al iniciar sesión (las reglas tampoco lo hacen server-side fuera de create) |
| P3 | Sin crear reportes desde mobile (admin sólo lee), sin editar/borrar review propia, sin marcar notificaciones leídas | gaps funcionales menores vs web |
| P3 | `@gorhom/bottom-sheet` queda como dependencia instalada sin uso | retirarla de package.json en una pasada de limpieza (no se hizo aquí para mantener el diff mínimo) |

### Notas UX/Performance (Fases 6–7)

- Estados vacíos/carga/error consistentes y de calidad (EmptyState/LoadingState/
  Skeleton en todas las pantallas revisadas); offline-first real (React Query +
  persister AsyncStorage + OfflineBanner). Nivel: por encima de la media.
- Listas con FlatList + paginación por cursor (12/pág) idéntica a la web; imágenes
  con expo-image (caché en disco). Sin red flags de re-render (providers
  memoizados, stores con partialize).
- El stylus-tutorial de Gboard del emulador interceptaba el input de texto en
  pruebas automatizadas (`settings put secure stylus_handwriting_enabled 0` lo
  evita); irrelevante para usuarios reales.
- Jank/ANR: no observados en emulador 4GB tras los fixes; medir en hardware real
  cuando haya APK firmado.

---

## 5. Commits de esta fase

| Commit | Contenido |
|--------|-----------|
| `4c5bdb1` | fix(android): hoist expo-asset/file-system/font/keep-awake → autolinking los registra (crash #2) |
| `c87e6e0` | fix(auth): guard del dashboard a paridad web (`protected`) + `refreshUser()` post-registro/Google |
| `53d24b8` | fix(ui): BottomSheet sobre RN Modal (gorhom no monta en release) |
| `(docs)`  | docs/07 comando de build corregido + este informe |

QA final: `tsc --noEmit` ✅ · `eslint .` ✅ · `jest` 13/13 ✅ ·
`assembleRelease (arm64-v8a,x86_64)` ✅ →
`builds/kruzo-v1.0.1-arm64+x86_64-release-fixed.apk`
(57 273 116 bytes, SHA256 `04D2A6CC…AD9CE`, gitignored, suma en SHA256SUMS.txt).
