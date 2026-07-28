import type { TranslationKey } from '@/i18n/useTranslation'
import type { CartPricing } from './pricing'

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string

/** Short label for cart/checkout discount row. */
export function getDiscountLabel(pricing: CartPricing, t: Translate): string {
  if (pricing.discountAmount <= 0) return ''

  if (
    pricing.hasPersonalDiscount &&
    pricing.strandsDiscountPercent > 0 &&
    pricing.strandsSubtotal > 0 &&
    pricing.otherDiscountPercent !== pricing.strandsDiscountPercent
  ) {
    return t('cart.discountMixed', {
      personal: pricing.otherDiscountPercent,
      strands: pricing.strandsDiscountPercent,
    })
  }

  if (pricing.hasPersonalDiscount && pricing.otherDiscountPercent > 0) {
    return t('cart.discountPersonal', { percent: pricing.otherDiscountPercent })
  }

  const percent = Math.max(pricing.otherDiscountPercent, pricing.strandsDiscountPercent)
  return t('cart.discountVolume', { percent })
}
