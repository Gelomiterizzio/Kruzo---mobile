# KRUZO Mobile — FASE 3.5: Cierre de deuda funcional

> Completa la gestión (CRUD) y herramientas que faltaban tras la Fase 3, con
> paridad verificada contra `web/`. Validado a nivel de bundle.

## Funcionalidades añadidas

**Gestión de negocios** — `BusinessForm` (crear/editar): info, categorías (máx. 3),
zona, contacto, opciones (delivery/QR/pagos), **imágenes** (logo/portada/galería vía
`expo-image-picker`), validación Zod, manejo de errores. Pantalla `dashboard/business`.

**Gestión de publicaciones** — `PostForm` (crear/editar): categoría, precio
(fijo/negociable/gratis/consultar), descuento, delivery, imágenes, validación.
Pantallas `dashboard/posts` (lista + **eliminar** [soft → status `deleted`]),
`dashboard/posts/new`, `dashboard/posts/[id]/edit`.

**Dashboard emprendedor** — índice con navegación real a todas las secciones;
`analytics` (totales reales del negocio), `reviews` (resumen real + lista),
`settings`.

**Administración** — `admin/businesses` (aprobar/suspender/destacar/verificar),
`admin/posts` (activar/pausar/eliminar), `admin/users` (rol/ban),
`admin/categories` (conteos reales, solo lectura), `admin/reports` (lectura real).

**Configuración de usuario** — `settings` (perfil + notificaciones + cerrar sesión)
vía `updateUserProfile` + `refreshUser` (refresco inmediato del `appUser`).

**Notificaciones** — `notifications` lee la subcolección real `users/{uid}/notifications`
con estado vacío (sin pipeline de escritura — limitación documentada).

## Componentes / servicios nuevos

DS: `Switch`, `Select` (bottom-sheet), `ImagePickerField`. Layout: `Header` (ya existía).
Features: `BusinessForm`, `PostForm`, `ProfileSettingsForm`. Servicios:
`admin.ts` (users/businesses/posts/reports), `notifications.ts`, `firestore.linkBusinessToOwner`.
Hooks: `useMyBusiness`, `AuthProvider.refreshUser`.

## Correcciones de inconsistencias respecto a web

- **Web gap corregido:** `createBusiness` no vinculaba el negocio al `businessIds`
  del dueño (el dashboard no lo encontraba). Mobile añade `linkBusinessToOwner`
  (campo existente + permiso de auto-escritura; no inventa backend).
- **Mock → real:** analytics (web usaba datos aleatorios) → totales reales del
  negocio; admin categorías (web hardcoded) → conteos reales; admin reportes/
  notificaciones (web mock) → lectura de colecciones reales.

## Auditadas sin cambios (paridad)

Favoritos (add/remove optimista, sync, vacíos, errores), reseñas (1 por usuario,
detección de duplicado), búsqueda (filtros, sin texto a backend).

## Validación

| Gate                     | Resultado           |
| ------------------------ | ------------------- |
| `tsc --noEmit`           | ✅ 0                |
| `eslint .`               | ✅ 0/0              |
| `prettier --check .`     | ✅                  |
| `jest`                   | ✅ 13/13            |
| `expo-doctor`            | ✅ 18/18            |
| `expo export -p android` | ✅ **4270 módulos** |

## Deuda restante (no crítica, documentada)

1. **Editar/eliminar reseña** — web no tiene UI (las reglas solo permiten al autor/
   admin); no se implementó para mantener paridad.
2. **Eliminar cuenta** — web tiene botón sin backend; no implementado (no inventar).
3. **`/trending`, about, contact** — páginas de descubrimiento/marketing de web;
   diferencia intencional de IA móvil (tabs). Pendientes opcionales.
4. **Campo Facebook** en `BusinessForm` (web lo tiene; omitido, opcional).
5. **Push real** — requiere Cloud Function de envío (fuera de "no crear backend").

## ¿Funcionalmente completo respecto a web?

**Sí, en el núcleo funcional.** Toda la gestión crítica (negocios, publicaciones,
moderación admin, configuración de cuenta, favoritos, reseñas) está implementada y
cableada al mismo backend. Lo restante son páginas de descubrimiento/marketing y
acciones que **web tampoco implementa funcionalmente** (editar reseña, eliminar
cuenta) o que requieren backend nuevo (push). La app está lista para la Fase 4.
