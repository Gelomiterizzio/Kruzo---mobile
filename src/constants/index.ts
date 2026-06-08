export const APP_NAME = 'KRUZO'
export const APP_TAGLINE = 'Tu Ciudad. Tu Mercado.'
export const APP_URL = process.env.EXPO_PUBLIC_APP_URL ?? 'https://kruzo.bo'
export const APP_CITY = 'Santa Cruz de la Sierra'
export const APP_COUNTRY = 'Bolivia'

export const WHATSAPP_COUNTRY_CODE = '591'

export const SCZ_CENTER = { lat: -17.7863, lng: -63.1812 } as const

// ─── Zonas de Santa Cruz — ÚNICA fuente de verdad (espejo de web/lib/utils/constants.ts) ───
export const SCZ_ZONES = [
  'Centro',
  'Norte',
  'Sur',
  'Este',
  'Oeste',
  'Equipetrol',
  'Plan 3000',
  'La Guardia',
  'Warnes',
  'Cotoca',
  'Montero',
  'Otros',
] as const

// ─── Categorías de negocio — ÚNICA fuente de verdad de la UI ───
// key/emoji/label = identidad; color/gradient se reinterpretan en el theme móvil.
export const BUSINESS_CATEGORIES = [
  { key: 'comida', emoji: '🍕', label: 'Comida', gradient: ['#f97316', '#ef4444'] },
  { key: 'reposteria', emoji: '🧁', label: 'Repostería', gradient: ['#ec4899', '#f43f5e'] },
  { key: 'tecnologia', emoji: '💻', label: 'Tecnología', gradient: ['#2563eb', '#4f46e5'] },
  { key: 'belleza', emoji: '💇', label: 'Belleza', gradient: ['#d946ef', '#ec4899'] },
  { key: 'ropa', emoji: '👗', label: 'Ropa', gradient: ['#7c3aed', '#9333ea'] },
  { key: 'servicios', emoji: '🔧', label: 'Servicios', gradient: ['#14b8a6', '#06b6d4'] },
  { key: 'fotografia', emoji: '📸', label: 'Fotografía', gradient: ['#4f46e5', '#2563eb'] },
  { key: 'automotriz', emoji: '🚗', label: 'Automotriz', gradient: ['#475569', '#334155'] },
  { key: 'hogar', emoji: '🏠', label: 'Hogar', gradient: ['#16a34a', '#059669'] },
  { key: 'educacion', emoji: '🎓', label: 'Educación', gradient: ['#0891b2', '#0284c7'] },
  { key: 'electricistas', emoji: '⚡', label: 'Electricistas', gradient: ['#eab308', '#f59e0b'] },
  { key: 'carpinteria', emoji: '🪑', label: 'Carpintería', gradient: ['#d97706', '#ca8a04'] },
] as const

// Post categories — SEPARATE list from BUSINESS_CATEGORIES (mirror of web PostForm).
// The stored value is the lowercased label.
export const POST_CATEGORIES = [
  'Comida',
  'Repostería',
  'Ropa',
  'Tecnología',
  'Belleza',
  'Fotografía',
  'Carpintería',
  'Electricidad',
  'Automotriz',
  'Hogar',
  'Educación',
  'Servicios',
  'Otro',
] as const

export const PRICE_TYPE_LABELS = {
  fixed: 'Precio fijo',
  negotiable: 'Negociable',
  free: 'Gratis',
  consult: 'Consultar precio',
} as const

export const BUSINESS_PLAN_LABELS = {
  free: 'Básico',
  pro: 'Pro',
  premium: 'Premium',
} as const

export const PAGINATION_SIZE = 12
export const REVIEWS_PER_PAGE = 5
export const POSTS_PER_PAGE = 12
