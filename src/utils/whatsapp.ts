export function normalizeBolivianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('591')) return cleaned
  if (cleaned.startsWith('0')) return `591${cleaned.slice(1)}`
  return `591${cleaned}`
}

export function buildWhatsAppURL(phone: string, message?: string): string {
  const normalized = normalizeBolivianPhone(phone)
  const encoded = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${normalized}${encoded}`
}

export function buildWhatsAppContactURL(phone: string, businessName: string): string {
  const msg = `¡Hola! Vi tu negocio *${businessName}* en KRUZO y me gustaría obtener más información. 😊`
  return buildWhatsAppURL(phone, msg)
}

export function buildWhatsAppPostURL(
  phone: string,
  businessName: string,
  postTitle: string,
  price?: number,
): string {
  const priceText = price && price > 0 ? ` (Bs. ${price})` : ''
  const msg = `¡Hola! Vi en KRUZO el producto *"${postTitle}"*${priceText} de *${businessName}*. ¿Está disponible?`
  return buildWhatsAppURL(phone, msg)
}
