import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Timestamp } from 'firebase/firestore'

export function formatPrice(price: number): string {
  if (price === 0) return 'Gratis'
  return `Bs. ${price.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatRelativeTime(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return ''
  const date = timestamp.toDate?.() ?? new Date(timestamp as unknown as number)
  return formatDistanceToNow(date, { addSuffix: true, locale: es })
}

export function formatDate(timestamp: Timestamp | null | undefined, fmt = 'dd MMM yyyy'): string {
  if (!timestamp) return ''
  const date = timestamp.toDate?.() ?? new Date(timestamp as unknown as number)
  return format(date, fmt, { locale: es })
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Slug with a short random suffix for uniqueness (e.g. business slugs). */
export function uniqueSlug(text: string): string {
  return slugify(text) + '-' + Math.random().toString(36).slice(2, 6)
}

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trim() + '…'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

export function isOpenNow(hours: Record<string, { open: string; close: string } | null>): boolean {
  const now = new Date()
  const day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()]
  const h = hours[day]
  if (!h) return false
  const cur = now.getHours() * 60 + now.getMinutes()
  const [oh, om] = h.open.split(':').map(Number)
  const [ch, cm] = h.close.split(':').map(Number)
  return cur >= oh * 60 + om && cur <= ch * 60 + cm
}
