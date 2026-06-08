# KRUZO Mobile — FASE 4: Premium Experience & Production Readiness

> Transforma la app funcional en un producto profesional listo para Play Store.
> Cada mejora se justifica por problema → beneficio → impacto.

## Área 1 — Offline-first avanzado

- React Query conectado al estado de red (**NetInfo → `onlineManager`**) y al foco
  de la app (**AppState → `focusManager`**) en `src/lib/network.ts`.
- **Beneficio:** las queries se pausan sin conexión (cero requests fallidos) y se
  reanudan solas al reconectar; refetch al volver al foreground (datos frescos).
- **`OfflineBanner`** flotante (animado) comunica el estado; la **caché persistida**
  (AsyncStorage, ya existente) mantiene la app usable offline.

## Área 2 — Optimistic updates

| Acción                          | Antes                          | Ahora                                              |
| ------------------------------- | ------------------------------ | -------------------------------------------------- |
| Favorito                        | optimista (store)              | + haptic                                           |
| Reseña                          | invalidate (espera red)        | **inserción optimista** + rollback (`useMutation`) |
| Admin (negocios/posts/usuarios) | invalidate (refetch + flicker) | **patch optimista de la caché** + rollback         |
| Eliminar post (admin)           | refetch                        | desaparición instantánea + rollback                |

**Impacto:** latencia percibida ~0 ms (vs ~300–1500 ms de ida/vuelta), con rollback
seguro si el servidor rechaza (p. ej. reseña duplicada).

## Área 3 — Deep linking

- **Android App Links** (`intentFilters` autoVerify) + **iOS associated domains**
  para `kruzo.bo/business|post|user/*`; esquema `kruzo://` para todo.
- Las rutas `business/[slug]`, `post/[id]`, `user/[id]` se resuelven vía Expo Router.
- **Tap en notificación → deep link** (payload `data.url`/`data.path`).
- Requiere publicar `assetlinks.json` (Android) y `apple-app-site-association` (iOS)
  en el dominio para la verificación automática (documentado).

## Área 4 — Share

- `utils/contact.shareLink` (Share nativo) con URL canónica `kruzo.bo/...`.
- Botón compartir en detalle de **publicación** (header) y **negocio** (CTA).

## Área 5 — Performance

- **`React.memo`** en `BusinessCard`, `PostCard`, `ReviewCard` → las filas no
  re-renderizan si sus props no cambian.
- **FlatList windowing** en `BusinessGrid` (`removeClippedSubviews`,
  `initialNumToRender=8`, `maxToRenderPerBatch=8`, `windowSize=7`) +
  `useCallback` en `renderItem`.
- expo-image con caché memory-disk en todas las imágenes.
- **Métrica estructural:** menos celdas montadas y cero re-render de filas estables.

## Área 6 — UX premium

- **Haptics** (`utils/haptics`) en favoritos, cambio de tab, acciones admin,
  reseña enviada.
- Skeletons en listas; banner offline animado (Reanimated); transiciones nativas.

## Área 7 — Dark mode

- **Estilo de mapa oscuro** (`theme/mapStyle`) aplicado cuando el esquema es dark
  (el mapa ya no se ve claro en modo oscuro).
- Tokens HSL theme-aware en todos los componentes; `StatusBar` adaptativo.

## Área 8 — Accessibility

- `accessibilityRole="header"` en títulos (incluido el `Header` compartido → ~14
  pantallas); controles con label y `accessibilityState`; `hitSlop` en iconos;
  `IconButton` exige label por tipos.

## Área 9 — Push readiness (cliente completo, sin backend nuevo)

Implementado en `hooks/usePushRegistration` + `services/notifications.savePushToken`:

- Solicita permiso, crea el canal Android, obtiene el **Expo push token** y lo
  guarda en `users/{uid}.expoPushToken` (escritura a doc propio, permitida por las
  reglas).
- Handler de primer plano + **routing al tocar la notificación** (deep link).

**Falta del lado servidor (documentado, NO implementado):**

1. Una **Cloud Function** que lea `expoPushToken` y envíe vía la Expo Push API (o FCM).
2. Configurar **FCM** en el proyecto Firebase + credenciales del servidor.
3. Un **`projectId` de EAS** (`eas init`) para que `getExpoPushTokenAsync` emita
   token (hoy degrada a no-op con log).
4. Opcional: lógica que escriba en `users/{uid}/notifications` para el centro in-app.

## Área 10 — Production readiness

ErrorBoundary global + estados de error; validación de env (Zod, falla rápido);
CI (type-check/lint/format/test); sin secretos en el repo; reglas de Firestore como
autoridad. Pendiente para despliegue real: app icon/splash assets, dev build EAS,
claves (Maps Android, Google OAuth SHA-1), publicación de archivos de App Links.

## Validación

| Gate                     | Resultado           |
| ------------------------ | ------------------- |
| `tsc --noEmit`           | ✅ 0                |
| `eslint .`               | ✅ 0/0              |
| `prettier --check .`     | ✅                  |
| `jest`                   | ✅ 13/13            |
| `expo-doctor`            | ✅ 18/18            |
| `expo export -p android` | ✅ **4421 módulos** |

## Deuda restante

- Activos binarios (icon/splash) y `eas init` (projectId) para push/builds reales.
- Server-side push (Cloud Function) — fuera de alcance "no crear backend".
- Archivos de verificación de App Links en `kruzo.bo`.
