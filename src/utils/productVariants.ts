import type { Product, ProductVariant, StrandLengthOption } from '@/types'
import {
  DEFAULT_BEAD_SIZES,
  DEFAULT_PACK_WEIGHTS,
  DEFAULT_PIECE_WEIGHTS,
  DEFAULT_STRAND_LENGTHS,
  DEFAULT_WRIST_SIZES,
} from './catalogDefaults'
import {
  consumedWholeStrands,
  halfPrice,
  isHalfStrandSelection,
  productSellsWholeStrands,
  strandPoolQuantity,
  type StrandStockLine,
} from './strandPool'

export const VARIANT_ID_OPTION_KEY = 'variantId'

/** One option axis a photo variant can be bound to, e.g. all wrist sizes. */
export type BindableOptionGroup = {
  key: string
  groupLabel: string
  values: { value: string; label: string }[]
}

export type BindableOptionLabels = {
  wristSize: string
  beadSize: string
  beadCount: string
  strandLength: string
  length: string
  packWeight: string
  pieceWeight: string
}

export type CatalogPricing = {
  min: number
  max: number
  hasRange: boolean
  compareAt?: number
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

function asStrandLengths(value: unknown): StrandLengthOption[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const entry = item as Record<string, unknown>
      const label = String(entry.label ?? '')
      const val = String(entry.value ?? label)
      if (!label) return null
      return { label, value: val }
    })
    .filter((item): item is StrandLengthOption => item != null)
}

export function createVariantId() {
  return `var-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function asStringRecord(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) return undefined
  const next: Record<string, string> = {}
  for (const [key, entry] of Object.entries(value)) {
    if (entry == null || entry === '') continue
    next[key] = String(entry)
  }
  return Object.keys(next).length ? next : undefined
}

export function parseVariants(raw: unknown): ProductVariant[] {
  if (!Array.isArray(raw)) return []
  const variants: ProductVariant[] = []

  for (const item of raw) {
    if (!isRecord(item)) continue
    const id = String(item.id ?? '').trim()
    const image = String(item.image ?? '').trim()
    if (!id || !image) continue
    const price = item.price == null || item.price === '' ? undefined : Number(item.price)
    const halfStrandPrice =
      item.halfStrandPrice == null || item.halfStrandPrice === ''
        ? undefined
        : Number(item.halfStrandPrice)
    const discountPrice =
      item.discountPrice == null || item.discountPrice === ''
        ? undefined
        : Number(item.discountPrice)
    const stock = Number(item.stock)
    variants.push({
      id,
      image,
      name: String(item.name ?? '').trim() || undefined,
      price: Number.isFinite(price) && (price as number) > 0 ? price : undefined,
      halfStrandPrice:
        Number.isFinite(halfStrandPrice) && (halfStrandPrice as number) > 0
          ? halfStrandPrice
          : undefined,
      discountPrice:
        Number.isFinite(discountPrice) && (discountPrice as number) > 0
          ? discountPrice
          : undefined,
      stock: Number.isFinite(stock) && stock >= 0 ? stock : 0,
      options: asStringRecord(item.options),
      attributes: asStringRecord(item.attributes),
    })
  }

  return variants
}

export function getProductVariants(product: Pick<Product, 'variants'>): ProductVariant[] {
  return parseVariants(product.variants)
}

/** Unbound (general) photos first, then photos tied to specific pieces. */
export function getProductGalleryImages(product: Pick<Product, 'images' | 'variants'>): string[] {
  const images = product.images.filter(Boolean)
  const bound = new Set(getProductVariants(product).map((variant) => variant.image))
  const general = images.filter((image) => !bound.has(image))
  if (!general.length) return images
  return [...general, ...images.filter((image) => bound.has(image))]
}

export function hasProductVariants(product: Pick<Product, 'variants'>): boolean {
  return getProductVariants(product).length > 0
}

export function isBoundVariant(variant: ProductVariant): boolean {
  if (variant.name?.trim()) return true
  if (variant.price != null && variant.price > 0) return true
  if (variant.halfStrandPrice != null && variant.halfStrandPrice > 0) return true
  if (variant.discountPrice != null && variant.discountPrice > 0) return true
  if (variant.options && Object.keys(variant.options).length > 0) return true
  if (variant.attributes && Object.values(variant.attributes).some((value) => value.trim())) {
    return true
  }
  return variant.stock > 0
}

/** 0 / empty is not a sale — the product is sold at the regular price. */
export function normalizeDiscountPrice(value?: number | null): number | undefined {
  if (value == null) return undefined
  const amount = Number(value)
  return Number.isFinite(amount) && amount > 0 ? amount : undefined
}

function compareAtForSale(regular: number, sale?: number | null): number | undefined {
  const amount = normalizeDiscountPrice(sale)
  return amount != null && regular > amount ? regular : undefined
}

export function getVariantUnitPrice(
  product: { price: number; discountPrice?: number | null },
  variant?: ProductVariant | null,
): number {
  const productSale = normalizeDiscountPrice(product.discountPrice)
  if (!variant) return Number(productSale ?? product.price)
  return Number(
    normalizeDiscountPrice(variant.discountPrice) ?? variant.price ?? productSale ?? product.price,
  )
}

export function getVariantCompareAtPrice(
  product: { price: number; discountPrice?: number | null },
  variant?: ProductVariant | null,
): number | undefined {
  if (!variant) {
    return compareAtForSale(product.price, product.discountPrice)
  }
  const sale = normalizeDiscountPrice(variant.discountPrice)
  if (sale == null) return undefined
  if (variant.price != null && variant.price > sale) return variant.price
  if (product.price > sale) return product.price
  return undefined
}

export function readProductHalfStrandPrice(product: { attributes?: unknown }): number | undefined {
  if (!product.attributes || typeof product.attributes !== 'object' || Array.isArray(product.attributes)) {
    return undefined
  }
  const raw = (product.attributes as Record<string, unknown>).halfStrandPrice
  const amount = typeof raw === 'number' ? raw : raw == null || raw === '' ? Number.NaN : Number(raw)
  return Number.isFinite(amount) && amount > 0 ? amount : undefined
}

export function getCatalogPricing(product: Product): CatalogPricing {
  const variants = getProductVariants(product)
  if (!variants.length) {
    const sale = normalizeDiscountPrice(product.discountPrice)
    const unit = Number(sale ?? product.price)
    const half = productSellsWholeStrands(product) ? readProductHalfStrandPrice(product) : undefined
    if (half != null && half !== unit) {
      return {
        min: Math.min(unit, half),
        max: Math.max(unit, half),
        hasRange: true,
        compareAt: undefined,
      }
    }
    return {
      min: unit,
      max: unit,
      hasRange: false,
      compareAt: compareAtForSale(product.price, sale),
    }
  }

  const units = variants.flatMap((variant) => listedUnitPrices(product, variant))
  const min = Math.min(...units)
  const max = Math.max(...units)
  const compareAts = variants
    .map((variant) => getVariantCompareAtPrice(product, variant))
    .filter((value): value is number => value != null)

  return {
    min,
    max,
    hasRange: min !== max,
    compareAt: !max || max === min ? compareAts[0] : undefined,
  }
}

export function sumVariantStock(product: Pick<Product, 'stock' | 'variants'>): number {
  const variants = getProductVariants(product)
  if (!variants.length) return product.stock
  return variants.reduce((sum, variant) => sum + variant.stock, 0)
}

export function findVariantById(
  product: Pick<Product, 'variants'>,
  id?: string | null,
): ProductVariant | undefined {
  if (!id) return undefined
  return getProductVariants(product).find((variant) => variant.id === id)
}

export function findVariantByImage(
  product: Pick<Product, 'variants'>,
  image?: string | null,
): ProductVariant | undefined {
  if (!image) return undefined
  return getProductVariants(product).find((variant) => variant.image === image)
}

export function getSelectedVariant(
  product: Pick<Product, 'variants'>,
  selectedOptions?: Record<string, string> | null,
): ProductVariant | undefined {
  return findVariantById(product, selectedOptions?.[VARIANT_ID_OPTION_KEY])
}

export function optionsWithoutVariantId(
  options?: Record<string, string> | null,
): Record<string, string> {
  if (!options) return {}
  const next = { ...options }
  delete next[VARIANT_ID_OPTION_KEY]
  return next
}

export function buildVariantSelection(
  variant: ProductVariant,
  extra?: Record<string, string>,
): Record<string, string> {
  return {
    ...optionsWithoutVariantId(extra),
    ...(variant.options ?? {}),
    [VARIANT_ID_OPTION_KEY]: variant.id,
  }
}

/** Stable identity for a cart/wishlist selection, independent of key order. */
export function selectionKey(options?: Record<string, string> | null): string {
  const entries = Object.entries(options ?? {})
    .filter(([, value]) => value != null && String(value) !== '')
    .sort(([a], [b]) => a.localeCompare(b))
  return JSON.stringify(entries)
}

export function sameSelection(
  a?: Record<string, string> | null,
  b?: Record<string, string> | null,
) {
  return selectionKey(a) === selectionKey(b)
}

function variantMatchesOptions(
  variant: ProductVariant,
  selected: Record<string, string>,
): boolean {
  const options = variant.options
  if (!options || !Object.keys(options).length) return false
  return Object.entries(options).every(([key, value]) => selected[key] === value)
}

export function findBestMatchingVariant(
  product: Pick<Product, 'variants'>,
  selectedOptions: Record<string, string>,
  currentVariantId?: string,
): ProductVariant | undefined {
  const variants = getProductVariants(product)
  if (!variants.length) return undefined

  const matches = variants.filter((variant) => variantMatchesOptions(variant, selectedOptions))
  if (!matches.length) {
    const currentId = currentVariantId ?? selectedOptions[VARIANT_ID_OPTION_KEY]
    if (!currentId) return undefined
    const current = findVariantById(product, currentId)
    if (!current) return undefined
    // Keep the current piece only while it does not contradict the new selection.
    const contradicts = Object.entries(current.options ?? {}).some(
      ([key, value]) => selectedOptions[key] != null && selectedOptions[key] !== value,
    )
    return contradicts ? undefined : current
  }

  const current = matches.find((variant) => variant.id === currentVariantId)
  if (current) return current
  return matches.find((variant) => variant.stock > 0) ?? matches[0]
}

export function pickDefaultVariant(product: Pick<Product, 'variants'>): ProductVariant | undefined {
  const variants = getProductVariants(product)
  if (!variants.length) return undefined
  return variants.find((variant) => variant.stock > 0) ?? variants[0]
}

export function getAvailableStock(
  product: Pick<Product, 'stock' | 'variants'> & {
    categorySlug?: string
    attributes?: unknown
  },
  selectedOptions?: Record<string, string> | null,
  otherLines: StrandStockLine[] = [],
): number {
  const variants = getProductVariants(product)
  if (variants.length) {
    const variant = getSelectedVariant(product, selectedOptions)
    return variant ? Math.max(0, variant.stock) : 0
  }
  const stock = Math.max(0, product.stock)
  if (!productSellsWholeStrands(product)) return stock
  return strandPoolQuantity(stock, isHalfStrandSelection(selectedOptions), otherLines)
}

/**
 * Prices a shopper can pay for this photo.
 * On strands, a custom half price is its own amount: whole 300, half 170.
 */
export function lowestListedPrice(
  product: { price: number; discountPrice?: number | null; categorySlug?: string; attributes?: unknown },
  variants: ProductVariant[],
): number | undefined {
  const prices = variants.flatMap((variant) => listedUnitPrices(product, variant))
  if (!prices.length) return undefined
  return Math.min(...prices)
}

function customHalfStrandPrice(
  product: { attributes?: unknown },
  variant: ProductVariant | null | undefined,
): number | undefined {
  if (variant?.halfStrandPrice != null && variant.halfStrandPrice > 0) return variant.halfStrandPrice
  return readProductHalfStrandPrice(product)
}

function listedUnitPrices(
  product: { price: number; discountPrice?: number | null; categorySlug?: string; attributes?: unknown },
  variant: ProductVariant,
): number[] {
  const whole = getVariantUnitPrice(product, variant)
  if (!productSellsWholeStrands(product) || isHalfStrandSelection(variant.options)) return [whole]
  const half = customHalfStrandPrice(product, variant)
  return half != null ? [whole, half] : [whole]
}

/**
 * Whole price stays as entered. Half strand uses the photo price when set,
 * otherwise the product half price, otherwise half of the whole price.
 * A photo already bound to the half length keeps its own price.
 */
function priceForStrandSelection(
  product: { categorySlug?: string; attributes?: unknown },
  variant: ProductVariant | null | undefined,
  selectedOptions: Record<string, string> | null | undefined,
  base: number,
): number {
  if (!productSellsWholeStrands(product) || !isHalfStrandSelection(selectedOptions)) return base
  if (variant && isHalfStrandSelection(variant.options)) return base
  const custom = customHalfStrandPrice(product, variant)
  if (custom != null) return custom
  return halfPrice(base)
}

export function getCartUnitPrice(
  product: {
    price: number
    discountPrice?: number | null
    variants?: unknown
    categorySlug?: string
    attributes?: unknown
  },
  selectedOptions?: Record<string, string> | null,
): number {
  const variant = getSelectedVariant(product as Pick<Product, 'variants'>, selectedOptions)
  return priceForStrandSelection(
    product,
    variant,
    selectedOptions,
    getVariantUnitPrice(product, variant),
  )
}

/** Struck-through price. A custom half-strand price is the real price, with no synthetic discount. */
export function getSelectionCompareAtPrice(
  product: {
    price: number
    discountPrice?: number | null
    variants?: unknown
    categorySlug?: string
    attributes?: unknown
  },
  selectedOptions?: Record<string, string> | null,
): number | undefined {
  const variant = getSelectedVariant(product as Pick<Product, 'variants'>, selectedOptions)
  const compare = variant
    ? getVariantCompareAtPrice(product, variant)
    : compareAtForSale(product.price, product.discountPrice)
  if (!productSellsWholeStrands(product) || !isHalfStrandSelection(selectedOptions)) return compare
  if (variant && isHalfStrandSelection(variant.options)) return compare
  if (customHalfStrandPrice(product, variant) != null) return undefined
  if (compare == null) return undefined
  const halved = halfPrice(compare)
  return halved > getCartUnitPrice(product, selectedOptions) ? halved : undefined
}

export function getVariantDisplayName(product: Pick<Product, 'name'>, variant?: ProductVariant | null) {
  const name = variant?.name?.trim()
  if (!name || name === product.name) return product.name
  return name
}

export function getVariantOptionValues(
  product: Pick<Product, 'variants'>,
  key: string,
): string[] {
  const values = new Set<string>()
  for (const variant of getProductVariants(product)) {
    const value = variant.options?.[key]
    if (value) values.add(value)
  }
  return [...values]
}

export function isOptionValueOutOfStock(
  product: Pick<Product, 'variants'>,
  key: string,
  value: string,
): boolean {
  const matches = getProductVariants(product).filter((variant) => variant.options?.[key] === value)
  if (!matches.length) return false
  return matches.every((variant) => variant.stock <= 0)
}

/**
 * Option axes a photo variant can be bound to. Categories whose price depends on
 * a fixed set of criteria always expose them, even before the admin picks values.
 */
export function getBindableOptionGroups(
  categorySlug: string,
  attributes: Record<string, unknown>,
  groupLabels: BindableOptionLabels,
): BindableOptionGroup[] {
  const groups: BindableOptionGroup[] = []
  const add = (
    key: string,
    groupLabel: string,
    values: string[],
    formatLabel?: (value: string) => string,
  ) => {
    if (!values.length) return
    groups.push({
      key,
      groupLabel,
      values: values.map((value) => ({
        value,
        label: formatLabel ? formatLabel(value) : value,
      })),
    })
  }

  const beadSizes = asStringArray(attributes.beadSizes)
  const wristSizes = asStringArray(attributes.wristSizes)
  const strandLengths = asStrandLengths(attributes.strandLengths)
  const beadSizeMm = (value: string) => `${value} мм`

  if (categorySlug === 'brаslety') {
    add('beadSize', groupLabels.beadSize, beadSizes.length ? beadSizes : DEFAULT_BEAD_SIZES, beadSizeMm)
    add('wristSize', groupLabels.wristSize, wristSizes.length ? wristSizes : DEFAULT_WRIST_SIZES)
    return groups
  }

  if (categorySlug === 'nytky') {
    add('beadSize', groupLabels.beadSize, beadSizes.length ? beadSizes : DEFAULT_BEAD_SIZES, beadSizeMm)
    add(
      'strandLength',
      groupLabels.strandLength,
      (strandLengths.length ? strandLengths : DEFAULT_STRAND_LENGTHS).map((length) => length.label),
    )
    return groups
  }

  if (categorySlug === 'pahoshchi') {
    if (attributes.saleMode === 'piece') {
      const pieceWeights = asStringArray(attributes.pieceWeights)
      add(
        'pieceWeight',
        groupLabels.pieceWeight,
        pieceWeights.length ? pieceWeights : DEFAULT_PIECE_WEIGHTS,
      )
    } else {
      const packWeights = asStringArray(attributes.packWeights)
      add('packWeight', groupLabels.packWeight, packWeights.length ? packWeights : DEFAULT_PACK_WEIGHTS)
    }
    return groups
  }

  add('wristSize', groupLabels.wristSize, wristSizes)
  add('beadSize', groupLabels.beadSize, beadSizes, beadSizeMm)
  add('beadCount', groupLabels.beadCount, asStringArray(attributes.beadCounts))
  add('strandLength', groupLabels.strandLength, strandLengths.map((length) => length.label))
  add('length', groupLabels.length, asStringArray(attributes.lengths))

  return groups
}

export function syncVariantsWithImages(
  images: string[],
  variants: ProductVariant[],
): ProductVariant[] {
  return images.map((image) => {
    const existing = variants.find((variant) => variant.image === image)
    return existing ?? { id: createVariantId(), image, stock: 0 }
  })
}

export function toStoredVariants(variants: ProductVariant[]): ProductVariant[] {
  return variants.filter(isBoundVariant).map((variant) => ({
    id: variant.id || createVariantId(),
    image: variant.image,
    // Keep the raw name, including a trailing space. This runs on every keystroke
    // in the photo-binding editor; trimming here would swallow the space before
    // the next word. Edges are trimmed when the product is parsed on save.
    name: variant.name && variant.name.trim() ? variant.name : undefined,
    price: variant.price != null && variant.price > 0 ? variant.price : undefined,
    halfStrandPrice:
      variant.halfStrandPrice != null && variant.halfStrandPrice > 0
        ? variant.halfStrandPrice
        : undefined,
    discountPrice:
      variant.discountPrice != null && variant.discountPrice > 0
        ? variant.discountPrice
        : undefined,
    stock: Math.max(0, Math.floor(Number(variant.stock) || 0)),
    options: variant.options && Object.keys(variant.options).length ? variant.options : undefined,
    attributes:
      variant.attributes && Object.values(variant.attributes).some((value) => value.trim())
        ? Object.fromEntries(
            Object.entries(variant.attributes).filter(([, value]) => value.trim()),
          )
        : undefined,
  }))
}

export function deriveProductPricingFromVariants(
  variants: ProductVariant[],
  fallbackPrice: number,
): { price: number; stock: number } {
  const bound = toStoredVariants(variants)
  if (!bound.length) {
    return { price: fallbackPrice, stock: 0 }
  }
  const units = bound
    .map((variant) => Number(variant.discountPrice ?? variant.price ?? Number.NaN))
    .filter((amount) => Number.isFinite(amount) && amount > 0)
  if (!units.length) {
    return {
      price: fallbackPrice,
      stock: bound.reduce((sum, variant) => sum + variant.stock, 0),
    }
  }
  return {
    price: Math.min(...units),
    stock: bound.reduce((sum, variant) => sum + variant.stock, 0),
  }
}

export function applyLinesStock(
  product: Pick<Product, 'stock' | 'variants'> & {
    categorySlug?: string
    attributes?: unknown
  },
  lines: StrandStockLine[],
): { stock: number; variants?: ProductVariant[] } {
  const variants = getProductVariants(product)
  if (variants.length) {
    let current: { stock: number; variants?: unknown } = {
      stock: product.stock,
      variants: product.variants,
    }
    for (const line of lines) {
      const next = applyVariantStockChange(current, line.selectedOptions, line.quantity)
      current = { stock: next.stock, variants: next.variants }
    }
    return {
      stock: current.stock,
      variants: current.variants as ProductVariant[] | undefined,
    }
  }

  const consume = productSellsWholeStrands(product)
    ? consumedWholeStrands(lines)
    : lines.reduce((sum, line) => sum + line.quantity, 0)
  if (product.stock < consume) throw new Error('Insufficient stock')
  return { stock: product.stock - consume }
}

export function applyVariantStockChange(
  product: Pick<Product, 'stock' | 'variants'> & {
    categorySlug?: string
    attributes?: unknown
  },
  selectedOptions: Record<string, string> | null | undefined,
  quantity: number,
): { stock: number; variants?: ProductVariant[] } {
  const variants = getProductVariants(product).map((variant) => ({ ...variant }))
  if (!variants.length) {
    return applyLinesStock(product, [{ quantity, selectedOptions }])
  }

  const variantId = selectedOptions?.[VARIANT_ID_OPTION_KEY]
  const index = variants.findIndex((variant) => variant.id === variantId)
  if (index < 0 || variants[index].stock < quantity) {
    throw new Error('Insufficient stock')
  }
  variants[index] = { ...variants[index], stock: variants[index].stock - quantity }
  return {
    variants,
    stock: variants.reduce((sum, variant) => sum + variant.stock, 0),
  }
}
