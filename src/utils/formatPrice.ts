import type { Language } from '@/i18n/Translations'
import { translations } from '@/i18n/Translations'

export function formatPrice(price: number, language: Language = 'uk'): string {
  const currency = translations[language].price.currency
  return `${price} ${currency}`
}

export function formatPriceRange(min: number, max: number, language: Language = 'uk'): string {
  const currency = translations[language].price.currency
  return `${min}–${max} ${currency}`
}
