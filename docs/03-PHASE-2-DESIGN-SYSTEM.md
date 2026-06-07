# KRUZO Mobile — FASE 2: Design System

> Sistema de diseño reutilizable, theme-aware, accesible y animado, construido
> sobre los tokens de `src/theme`. Validado a nivel de **bundle** y con tests.

## Componentes

**UI primitivos** (`src/components/ui`)

- **Button** — variantes primary/secondary/outline/ghost/destructive, tamaños sm/md/lg, loading, iconos, fullWidth, animación de escala.
- **IconButton** — solid/soft/ghost/outline; `accessibilityLabel` obligatorio; hitSlop.
- **Card** — contenedor temático; opcional pressable (animación) y `elevated` (sombra Android+iOS).
- **Avatar** — imagen (expo-image) o iniciales; ring opcional.
- **Badge** — neutral/primary/success/warning/danger/gold/info; sm/md.
- **Chip** — pill seleccionable (filtros categoría/zona); `accessibilityState.selected`.
- **Input** — label, error, hint, iconos, toggle de contraseña; `forwardRef`.
- **TextArea** — multilínea con contador `maxLength`.
- **SearchBar** — icono, limpiar, submit.
- **RatingStars** — display (redondeo) o interactivo (token gold).
- **Skeleton** — shimmer por pulso de opacidad (Reanimated).
- **SectionHeader** — título/subtítulo + acción opcional.
- **Tabs** — barra segmentada con indicador deslizante medido por layout.

**Overlays** (`src/components/overlay`)

- **Modal** — diálogo centrado (RN Modal: back-button + fade + tap-fuera).
- **BottomSheet** — wrapper temático de `@gorhom/bottom-sheet` (provider en `app/_layout`).
- **Toast** — store headless (`toastStore`) + `ToastHost` (Reanimated, auto-dismiss) + API imperativa `toast.success/error/info`.

**Feedback** (`src/components/feedback`) — **EmptyState**, **LoadingState** (+ ErrorBoundary, PlaceholderScreen previos).

**Dominio** (`src/features/business`) — **BusinessCard** (compuesto de Card/Badge/RatingStars; navega a `business/[slug]`).

**Catálogo** — `app/design-system.tsx`: galería viva (QA visual + documentación) que ejercita cada componente y garantiza cobertura de bundling.

## Decisiones

- **DS agnóstico de dominio** en `components/`; lo que conoce modelos vive en `features/` (BusinessCard).
- **Reanimated** para animaciones (hilo nativo) en vez de Animated JS.
- **Colores RN `hsl()`** directos de los tokens → paridad exacta con la web.
- **A11y de primera clase**: roles, labels y estados en todos los controles; `IconButton` exige label por tipos.
- **Toast headless**: cualquier capa (hooks/servicios) muestra feedback sin importar UI.
- **Providers**: `BottomSheetModalProvider` + `ToastHost` montados una vez en `app/_layout`.

## Validación

| Gate                     | Resultado                                                |
| ------------------------ | -------------------------------------------------------- |
| `tsc --noEmit`           | ✅ 0 errores (catálogo type-checkea toda la API pública) |
| `eslint .`               | ✅ 0 errores / 0 warnings                                |
| `prettier --check .`     | ✅                                                       |
| `jest`                   | ✅ 13/13 (Button, Chip/Badge, guards, whatsapp)          |
| `expo-doctor`            | ✅ 18/18                                                 |
| `expo export -p android` | ✅ **4130 módulos** (DS incluido)                        |

Nota de testing: `@testing-library/react-native` v14 (React 19) tiene **`render` asíncrono** → los tests usan `await render(...)`.

## Riesgos / deuda (menor)

1. Tints de **Badge** de estado son constantes (no específicos de dark mode) — mejora futura.
2. La ruta **/design-system** (catálogo) también se incluye en producción (inofensiva, sin enlazar).

## Próximos pasos

- **Fase 3 — Pantallas**: reemplazar placeholders usando este DS (Home, Explore/Search, BusinessProfile, Post, Auth, Dashboard, Admin).
