/** Category slug for «Низки» (strands) — priced as their own discount group. */
export const STRANDS_CATEGORY_SLUG = 'nytky'

/** Free delivery when cart subtotal (before %) reaches this amount (UAH). */
export const FREE_DELIVERY_THRESHOLD = 3000

/** Volume discount starts at this amount (UAH): 1000→2%, 2000→3%, … up to 10%. */
export const VOLUME_DISCOUNT_STEP = 1000
export const VOLUME_DISCOUNT_MAX_PERCENT = 10

/** Category slug for «Пахощі» (incense). */
export const INCENSE_CATEGORY_SLUG = 'pahoshchi'

const PALO_SANTO_NAME = /пало[\s-]*санто|palo[\s-]*santo/i

/**
 * Palo Santo sold by weight (50 g / 100 g / 1 kg) is never discounted: no volume discount,
 * no personal discount, and it does not count toward the volume thresholds.
 * Palo Santo sold by the piece is a normal product.
 */
export function isDiscountExcluded(
  product: { categorySlug: string; name: string; attributes?: unknown },
  selectedOptions?: Record<string, string> | null,
): boolean {
  if (product.categorySlug !== INCENSE_CATEGORY_SLUG) return false
  if (!PALO_SANTO_NAME.test(product.name)) return false
  if (selectedOptions?.pieceWeight) return false
  const saleMode = (product.attributes as { saleMode?: string } | null | undefined)?.saleMode
  return saleMode !== 'piece'
}

export function roundUah(value: number): number {
  return Math.round(value)
}

export function getUnitPrice(product: {
  price: { toNumber?: () => number } | number
  discountPrice?: { toNumber?: () => number } | number | null
}): number {
  const sale = product.discountPrice
  if (sale != null) {
    const amount = typeof sale === 'number' ? sale : Number(sale)
    if (Number.isFinite(amount) && amount > 0) return amount
  }
  const price = product.price
  return typeof price === 'number' ? price : Number(price)
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
  /** Sold at full price: outside both discount groups (see isDiscountExcluded). */
  excluded?: boolean
}

export type CartPricing = {
  subtotal: number
  strandsSubtotal: number
  otherSubtotal: number
  /** Items sold at full price (e.g. Palo Santo by weight); part of subtotal, never discounted. */
  excludedSubtotal: number
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
 * - Items flagged `excluded` (Palo Santo by weight) get no discount and sit outside both groups.
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
  let excludedSubtotal = 0

  for (const item of items) {
    const line = item.unitPrice * item.quantity
    if (item.excluded) {
      excludedSubtotal += line
    } else if (isStrandsProduct(item.categorySlug)) {
      strandsSubtotal += line
    } else {
      otherSubtotal += line
    }
  }

  const subtotal = strandsSubtotal + otherSubtotal + excludedSubtotal
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
    excludedSubtotal,
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
  excluded = false,
): number {
  if (excluded) return unitPrice
  const percent = isStrandsProduct(categorySlug)
    ? pricing.strandsDiscountPercent
    : pricing.otherDiscountPercent
  if (percent <= 0) return unitPrice
  return roundUah(unitPrice * (1 - percent / 100))
}
