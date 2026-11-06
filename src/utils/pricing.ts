import { getCartUnitPrice, normalizeDiscountPrice } from './productVariants'

/** Category slug for «Низки» (strands) — priced as their own discount group. */
export const STRANDS_CATEGORY_SLUG = 'nytky'

/** Free delivery when cart subtotal (before %) reaches this amount (UAH). */
export const FREE_DELIVERY_THRESHOLD = 3000

/** Volume discount starts at this amount (UAH): 1000→2%, 2000→3%, … up to 10%. */
export const VOLUME_DISCOUNT_STEP = 1000
export const VOLUME_DISCOUNT_MAX_PERCENT = 10

export function roundUah(value: number): number {
  return Math.round(value)
}

export function getUnitPrice(product: {
  price: number
  discountPrice?: number | null
}): number {
  return Number(normalizeDiscountPrice(product.discountPrice) ?? product.price)
}

/** 1000→2%, 2000→3%, … 9000+→10%. Below 1000 → 0%. */
export function getVolumeDiscountPercent(amount: number): number {
  if (amount < VOLUME_DISCOUNT_STEP) return 0
  return Math.min(
    VOLUME_DISCOUNT_MAX_PERCENT,
    Math.floor(amount / VOLUME_DISCOUNT_STEP) + 1,
  )
}

export function isStrandsProduct(categorySlug: string): boolean {
  return categorySlug === STRANDS_CATEGORY_SLUG
}

export type CartPricingInputItem = {
  categorySlug: string
  unitPrice: number
  quantity: number
}

export type CartPricing = {
  subtotal: number
  strandsSubtotal: number
  otherSubtotal: number
  strandsDiscountPercent: number
  otherDiscountPercent: number
  strandsDiscountAmount: number
  otherDiscountAmount: number
  discountAmount: number
  total: number
  freeDelivery: boolean
  hasPersonalDiscount: boolean
  /** True when the personal % beat the volume % for that group (so the personal one is applied). */
  strandsIsPersonal: boolean
  otherIsPersonal: boolean
}

/**
 * Cart totals with volume / personal discounts.
 *
 * - Низки (strands): volume % from the strands subtotal only.
 * - Everything else (minerals, bracelets, incense, pendants): volume % from their own combined subtotal.
 * - A personal discount applies to both groups but never stacks with the volume %:
 *   each group gets the higher of the two.
 * - Free delivery when subtotal ≥ 3000 UAH.
 */
export function calculateCartPricing(
  items: CartPricingInputItem[],
  personalDiscountPercent?: number | null,
): CartPricing {
  let strandsSubtotal = 0
  let otherSubtotal = 0

  for (const item of items) {
    const line = item.unitPrice * item.quantity
    if (isStrandsProduct(item.categorySlug)) {
      strandsSubtotal += line
    } else {
      otherSubtotal += line
    }
  }

  const subtotal = strandsSubtotal + otherSubtotal
  const hasPersonalDiscount =
    personalDiscountPercent != null && personalDiscountPercent > 0

  // Two separate volume pools, each with its own subtotal. A personal discount never stacks
  // with the volume one: each pool simply gets whichever of the two percentages is higher.
  const personal = hasPersonalDiscount ? personalDiscountPercent : 0
  const strandsVolumePercent = getVolumeDiscountPercent(strandsSubtotal)
  const otherVolumePercent = getVolumeDiscountPercent(otherSubtotal)
  const strandsDiscountPercent = Math.max(strandsVolumePercent, personal)
  const otherDiscountPercent = Math.max(otherVolumePercent, personal)
  const strandsIsPersonal = personal > strandsVolumePercent
  const otherIsPersonal = personal > otherVolumePercent

  const strandsDiscountAmount = roundUah((strandsSubtotal * strandsDiscountPercent) / 100)
  const otherDiscountAmount = roundUah((otherSubtotal * otherDiscountPercent) / 100)
  const discountAmount = strandsDiscountAmount + otherDiscountAmount

  return {
    subtotal,
    strandsSubtotal,
    otherSubtotal,
    strandsDiscountPercent,
    otherDiscountPercent,
    strandsDiscountAmount,
    otherDiscountAmount,
    discountAmount,
    total: subtotal - discountAmount,
    freeDelivery: subtotal >= FREE_DELIVERY_THRESHOLD,
    hasPersonalDiscount,
    strandsIsPersonal,
    otherIsPersonal,
  }
}

export function getDiscountedUnitPrice(
  categorySlug: string,
  unitPrice: number,
  pricing: Pick<CartPricing, 'strandsDiscountPercent' | 'otherDiscountPercent'>,
): number {
  const percent = isStrandsProduct(categorySlug)
    ? pricing.strandsDiscountPercent
    : pricing.otherDiscountPercent
  if (percent <= 0) return unitPrice
  return roundUah(unitPrice * (1 - percent / 100))
}

export function toPricingItems(
  items: Array<{
    product: { categorySlug: string; price: number; discountPrice?: number | null; variants?: unknown }
    quantity: number
    selectedOptions?: Record<string, string>
  }>,
): CartPricingInputItem[] {
  return items.map((item) => ({
    categorySlug: item.product.categorySlug,
    unitPrice: getCartUnitPrice(item.product, item.selectedOptions),
    quantity: item.quantity,
  }))
}
