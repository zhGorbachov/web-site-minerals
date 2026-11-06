import type { TranslationKey } from '@/i18n/useTranslation'
import type { CartPricing } from './pricing'

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string

/** Short label for cart/checkout discount row. */
export function getDiscountLabel(pricing: CartPricing, t: Translate): string {
  if (pricing.discountAmount <= 0) return ''

  const hasOther = pricing.otherSubtotal > 0 && pricing.otherDiscountPercent > 0
  const hasStrands = pricing.strandsSubtotal > 0 && pricing.strandsDiscountPercent > 0

  if (hasOther && hasStrands && pricing.otherDiscountPercent !== pricing.strandsDiscountPercent) {
    return t('cart.discountMixed', {
      personal: pricing.otherDiscountPercent,
      strands: pricing.strandsDiscountPercent,
    })
  }

  const percent = hasOther ? pricing.otherDiscountPercent : pricing.strandsDiscountPercent
  const isPersonal = hasOther ? pricing.otherIsPersonal : pricing.strandsIsPersonal
  return isPersonal
    ? t('cart.discountPersonal', { percent })
    : t('cart.discountVolume', { percent })
}
