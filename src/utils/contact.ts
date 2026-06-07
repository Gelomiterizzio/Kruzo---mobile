import { Linking, Share, Platform } from 'react-native'
import { logger } from '@/lib/logger'
import { APP_URL } from '@/constants'

// Platform actions that replace the web's <a href> / navigator.share. All are
// best-effort: a failed deep link never crashes the screen.

export async function openURL(url: string): Promise<void> {
  try {
    await Linking.openURL(url)
  } catch (e) {
    logger.warn('openURL failed', url, e)
  }
}

export function openWhatsApp(url: string) {
  return openURL(url)
}

export function callPhone(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, '')
  return openURL(`tel:${cleaned}`)
}

/** Opens the platform maps app at coordinates (or a search query fallback). */
export function openMaps(opts: { lat?: number; lng?: number; label?: string }) {
  const { lat, lng, label } = opts
  if (lat != null && lng != null) {
    const ll = `${lat},${lng}`
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?ll=${ll}&q=${encodeURIComponent(label ?? 'Ubicación')}`
        : `geo:${ll}?q=${ll}(${encodeURIComponent(label ?? 'Ubicación')})`
    return openURL(url)
  }
  const q = encodeURIComponent(label ?? '')
  return openURL(`https://www.google.com/maps/search/?api=1&query=${q}`)
}

export async function shareLink(title: string, path: string): Promise<void> {
  try {
    const url = `${APP_URL}${path}`
    await Share.share({ title, message: `${title}\n${url}`, url })
  } catch (e) {
    logger.warn('share failed', e)
  }
}
