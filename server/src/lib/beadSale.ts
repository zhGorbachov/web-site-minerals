/**
 * Loose beads sold one by one from a strand product (Низки only).
 * The admin turns this on per product and sets a price and stock for each bead size,
 * e.g. 6 mm — 4 UAH, 200 pcs; 8 mm — 6 UAH, 120 pcs. Bead stock is separate from
 * the strand pool: a product can hold 2 strands and 120 loose beads.
 */

export type BeadStockLine = {
  quantity: number
  selectedOptions?: Record<string, string> | null
}

export type BeadSale = {
  price: number
  stock: number
}

/** Cart / order option marking a line as loose beads. Such a line has no `strandLength`. */
export const SALE_UNIT_OPTION_KEY = 'saleUnit'
export const BEAD_SALE_UNIT = 'bead'

export function isBeadSelection(options?: Record<string, string> | null): boolean {
  return options?.[SALE_UNIT_OPTION_KEY] === BEAD_SALE_UNIT
}

function readAmount(raw: unknown): number {
  const amount = typeof raw === 'number' ? raw : raw == null || raw === '' ? Number.NaN : Number(raw)
  return Number.isFinite(amount) ? amount : Number.NaN
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

/**
 * Bead sizes sold one by one, as set in the admin. Sizes without a price are left out.
 * Empty when the product does not sell loose beads.
 */
export function getBeadSaleSizes(product: {
  categorySlug?: string
  attributes?: unknown
}): Record<string, BeadSale> {
  if (product.categorySlug !== 'nytky') return {}
  const attributes = readRecord(product.attributes)
  if (!attributes || attributes.beadSaleEnabled !== true) return {}
  const bySize = readRecord(attributes.beadSaleBySize)
  if (!bySize) return {}

  const sizes: Record<string, BeadSale> = {}
  for (const [size, raw] of Object.entries(bySize)) {
    const entry = readRecord(raw)
    if (!entry) continue
    const price = readAmount(entry.price)
    if (!(price > 0)) continue
    const stock = readAmount(entry.stock)
    sizes[size] = { price, stock: stock > 0 ? Math.floor(stock) : 0 }
  }
  return sizes
}

export function productSellsBeads(product: { categorySlug?: string; attributes?: unknown }): boolean {
  return Object.keys(getBeadSaleSizes(product)).length > 0
}

/** Price and stock of one bead size, or null when that size is not sold one by one. */
export function getBeadSale(
  product: { categorySlug?: string; attributes?: unknown },
  beadSize?: string | null,
): BeadSale | null {
  if (!beadSize) return null
  return getBeadSaleSizes(product)[beadSize] ?? null
}

/** Loose beads of this size taken by these lines. Strand lines are not counted. */
export function consumedBeads(lines: BeadStockLine[], beadSize?: string | null): number {
  return lines.reduce(
    (sum, line) =>
      isBeadSelection(line.selectedOptions) && line.selectedOptions?.beadSize === beadSize
        ? sum + line.quantity
        : sum,
    0,
  )
}

/** How many more beads of the selected size can be sold; `otherLines` are cart lines already holding some. */
export function beadPoolQuantity(
  product: { categorySlug?: string; attributes?: unknown },
  selectedOptions: Record<string, string> | null | undefined,
  otherLines: BeadStockLine[] = [],
): number {
  const beadSize = selectedOptions?.beadSize
  const sale = getBeadSale(product, beadSize)
  if (!sale) return 0
  return Math.max(0, sale.stock - consumedBeads(otherLines, beadSize))
}

/** Product attributes after selling these bead lines. */
export function applyBeadLines(
  product: { categorySlug?: string; attributes?: unknown },
  lines: BeadStockLine[],
): Record<string, unknown> {
  const attributes = readRecord(product.attributes) ?? {}
  const bySize = { ...(readRecord(attributes.beadSaleBySize) ?? {}) }
  const sizes = new Set(lines.map((line) => line.selectedOptions?.beadSize))

  for (const beadSize of sizes) {
    const sale = getBeadSale(product, beadSize)
    const sold = consumedBeads(lines, beadSize)
    if (!beadSize || !sale || sold > sale.stock) throw new Error('Insufficient stock')
    bySize[beadSize] = { ...readRecord(bySize[beadSize]), stock: sale.stock - sold }
  }

  return { ...attributes, beadSaleBySize: bySize }
}
