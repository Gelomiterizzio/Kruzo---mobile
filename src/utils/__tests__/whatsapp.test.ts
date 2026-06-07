import {
  normalizeBolivianPhone,
  buildWhatsAppURL,
  buildWhatsAppContactURL,
} from '@/utils/whatsapp'

describe('whatsapp utils', () => {
  it('normalizes a local number to the 591 country code', () => {
    expect(normalizeBolivianPhone('70000000')).toBe('59170000000')
    expect(normalizeBolivianPhone('071234567')).toBe('59171234567')
    expect(normalizeBolivianPhone('59170000000')).toBe('59170000000')
    expect(normalizeBolivianPhone('+591 7000-0000')).toBe('59170000000')
  })

  it('builds a wa.me URL with an encoded message', () => {
    const url = buildWhatsAppURL('70000000', 'hola mundo')
    expect(url).toBe('https://wa.me/59170000000?text=hola%20mundo')
  })

  it('builds a contact URL mentioning the business name', () => {
    const url = buildWhatsAppContactURL('70000000', 'Pizzería Centro')
    expect(url.startsWith('https://wa.me/59170000000?text=')).toBe(true)
    expect(decodeURIComponent(url)).toContain('Pizzería Centro')
    expect(decodeURIComponent(url)).toContain('KRUZO')
  })
})
