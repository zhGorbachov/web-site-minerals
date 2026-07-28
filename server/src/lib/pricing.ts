/** Category slug for «Низки» (strands) — personal discounts do not apply. */
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
  price: { toNumber?: () => number } | number
  discountPrice?: { toNumber?: () => number } | number | null
}): number {
  const sale = product.discountPrice
  if (sale != null) {
    return typeof sale === 'number' ? sale : Number(sale)
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
}

/**
 * Cart totals with volume / personal discounts.
 *
 * - No personal discount: one volume % from full subtotal, applied to all items.
 * - With personal discount: that % on everything except низок; низок use volume % from their own subtotal.
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

  let strandsDiscountPercent: number
  let otherDiscountPercent: number

  if (hasPersonalDiscount) {
    otherDiscountPercent = personalDiscountPercent
    strandsDiscountPercent = getVolumeDiscountPercent(strandsSubtotal)
  } else {
    const volumePercent = getVolumeDiscountPercent(subtotal)
    strandsDiscountPercent = volumePercent
    otherDiscountPercent = volumePercent
  }

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
