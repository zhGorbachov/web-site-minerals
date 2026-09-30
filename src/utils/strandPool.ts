/**
 * Whole-strand inventory.
 * Admin stock is a count of full strands: 2 half strands = 1 whole.
 * An odd half sold from that pool consumes a whole strand; the leftover
 * half is added later as its own photo variant.
 */

export type StrandStockLine = {
  quantity: number
  selectedOptions?: Record<string, string> | null
}

export function isHalfStrandLabel(label: string): boolean {
  const normalized = label.trim().toLowerCase()
  return (
    normalized.includes('пів низк') ||
    normalized.includes('half strand') ||
    /(^|\s)half(\s|$)/.test(normalized) ||
    /(^|\s)пів(\s|$)/.test(normalized)
  )
}

export function isHalfStrandSelection(
  options?: Record<string, string> | null,
): boolean {
  const label = options?.strandLength
  return Boolean(label && isHalfStrandLabel(label))
}

/** Низки only. Stock there is a count of whole strands. */
export function productSellsWholeStrands(product: { categorySlug?: string }): boolean {
  return product.categorySlug === 'nytky'
}

export function variantHasOwnPrice(
  variant?: { price?: number; discountPrice?: number | null } | null,
): boolean {
  if (!variant) return false
  return (
    (variant.price != null && variant.price > 0) ||
    (variant.discountPrice != null && variant.discountPrice > 0)
  )
}

export function halfPrice(amount: number): number {
  return Math.round(amount / 2)
}

/** Whole strands taken from the shared pool by these lines. */
export function consumedWholeStrands(lines: StrandStockLine[]): number {
  let pieces = 0
  let halves = 0
  for (const line of lines) {
    if (isHalfStrandSelection(line.selectedOptions)) halves += line.quantity
    else pieces += line.quantity
  }
  return pieces + (halves > 0 ? Math.ceil(halves / 2) : 0)
}

/**
 * How many of the current selection can be sold.
 * `otherLines` are the other cart lines already drawing from the same pool.
 */
export function strandPoolQuantity(
  stock: number,
  selectionIsHalf: boolean,
  otherLines: StrandStockLine[] = [],
): number {
  const left = Math.max(0, stock) - consumedWholeStrands(otherLines)
  if (left <= 0) return 0
  return selectionIsHalf ? left * 2 : left
}
