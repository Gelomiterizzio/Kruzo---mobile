# KRUZO Mobile — FASE 3: Pantallas

> Reemplazo de los placeholders por pantallas **funcionales reales**, cableadas a
> los hooks/servicios portados y construidas sobre el Design System. Verificadas
> contra `web/` (paridad funcional) y validadas a nivel de bundle.

## Pantallas implementadas (12 rutas)

| Ruta                     | Contenido                                                           | Datos                                         |
| ------------------------ | ------------------------------------------------------------------- | --------------------------------------------- |
| `(tabs)/` Home           | Top bar (tema/perfil) · Hero · CategoryGrid · carruseles destacados | `useBusinesses`                               |
| `(tabs)/explore`         | Chips de categoría + zona (BottomSheet) + grid infinito             | `useBusinesses` (categoría/zona/featured)     |
| `(tabs)/favorites`       | Login gate · grid de favoritos · pull-to-refresh                    | `localFavorites` → `getBusinessById`          |
| `(tabs)/profile`         | Tarjeta de perfil · accesos por rol · tema · cerrar sesión          | `useAuth`                                     |
| `(auth)/login`           | Google + email/password (RHF+Zod)                                   | `useAuth.loginEmail/loginGoogle`              |
| `(auth)/register`        | Google + nombre/email/password/confirm                              | `useAuth.register`                            |
| `(auth)/forgot-password` | Email + estado de éxito                                             | `useAuth.sendReset`                           |
| `business/[slug]`        | Cover · header · CTAs · tabs Publicaciones/Reseñas/Información/Mapa | `useBusinessBySlug`, `usePosts`, `useReviews` |
| `post/[id]`              | Imagen · precio · descripción · tags · negocio · WhatsApp           | `usePostById`                                 |
| `user/[id]`              | Tarjeta de perfil público                                           | `useUserById`                                 |
| `dashboard/`             | Stats reales (visitas/rating/reseñas/posts) + accesos               | `getBusinessById` + count()                   |
| `admin/`                 | Métricas reales (count/aggregation) + distribución por categoría    | `getCountFromServer`                          |

## Componentes de feature creados

`business/`: BusinessGrid (FlatList infinito + refresh + skeleton/empty/error), BusinessProfile (FlatList único con header + tabs), BusinessMap (react-native-maps + handoff a Maps).
`post/`: PostCard. `review/`: ReviewCard, ReviewForm (RHF+Zod → `createReview` + invalida query). `home/`: HomeHero, CategoryGrid, FeaturedRow (carrusel horizontal).
Layout: `Header` (barra de detalle con back/acciones). Utils: `contact` (WhatsApp/tel/maps/share vía Linking+Share).

## Paridad y mejoras móviles (documentadas)

- **Búsqueda = paridad web (aprobada):** el descubrimiento es por **filtros** (categoría/zona/destacados); el texto libre no consulta backend. No se añadió una caja de texto inerte; se priorizan chips de categoría + selector de zona.
- **Mejora móvil:** las secciones "destacados" son **carruseles horizontales** (patrón nativo) en vez de grids — mismos datos/lógica (`useBusinesses`).
- **Mejora navegación:** `dashboard`/`admin` son **segmentos de URL reales** (deep-link friendly) con guard de rol, en vez de grupos que colisionaban en `/`.
- **Contacto:** `wa.me`/`tel:`/share del web → `Linking`/`Share` nativos.

## Validación

| Gate                     | Resultado                                     |
| ------------------------ | --------------------------------------------- |
| `tsc --noEmit`           | ✅ 0                                          |
| `eslint .`               | ✅ 0/0                                        |
| `prettier --check .`     | ✅                                            |
| `jest`                   | ✅ 13/13                                      |
| `expo-doctor`            | ✅ 18/18                                      |
| `expo export -p android` | ✅ **4242 módulos** (incl. react-native-maps) |

## Deuda / próximos pasos (no bloqueante)

1. **Sub-páginas de gestión** (dashboard: editar negocio, CRUD de posts, analytics, reseñas; admin: moderación de negocios/usuarios/posts, categorías, reportes). Los **índices** de dashboard/admin ya son funcionales con datos reales; la gestión profunda es Fase 4.
2. **`/notifications` y `/settings`** (cuenta) — pendientes.
3. **Galería multi-imagen** en el cover del negocio (hoy muestra la primera).
4. **BusinessProfile** remonta la lista al cambiar de tab (`key={tab}`) — optimización futura.
5. **A11y:** inputs de auth usan placeholder como etiqueta (sin label visible, igual que web).
