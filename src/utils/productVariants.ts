import type { Product, ProductVariant, StrandLengthOption } from '@/types'

const FALLBACK_WRIST_SIZES = Array.from({ length: 9 }, (_, i) => `${i + 14} см`)

export const VARIANT_ID_OPTION_KEY = 'variantId'

export type BindableOption = {
  key: string
  value: string
  token: string
  groupLabel: string
  label: string
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

export function encodeBindToken(key: string, value: string) {
  return `${key}::${value}`
}

export function decodeBindToken(token: string): { key: string; value: string } | null {
  const index = token.indexOf('::')
  if (index <= 0) return null
  return { key: token.slice(0, index), value: token.slice(index + 2) }
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

export function hasProductVariants(product: Pick<Product, 'variants'>): boolean {
  return getProductVariants(product).length > 0
}

export function isBoundVariant(variant: ProductVariant): boolean {
  if (variant.name?.trim()) return true
  if (variant.price != null && variant.price > 0) return true
  if (variant.discountPrice != null && variant.discountPrice > 0) return true
  if (variant.options && Object.keys(variant.options).length > 0) return true
  if (variant.attributes && Object.values(variant.attributes).some((value) => value.trim())) {
    return true
  }
  return variant.stock > 0
}

export function getVariantUnitPrice(
  product: Pick<Product, 'price' | 'discountPrice'>,
  variant?: ProductVariant | null,
): number {
  if (!variant) return Number(product.discountPrice ?? product.price)
  return Number(variant.discountPrice ?? variant.price ?? product.discountPrice ?? product.price)
}

export function getVariantCompareAtPrice(
  product: Pick<Product, 'price' | 'discountPrice'>,
  variant?: ProductVariant | null,
): number | undefined {
  if (!variant) {
    return product.discountPrice != null ? product.price : undefined
  }
  if (variant.discountPrice != null && variant.price != null && variant.price > variant.discountPrice) {
    return variant.price
  }
  if (variant.discountPrice != null && product.price > variant.discountPrice) {
    return product.price
  }
  return undefined
}

export function getCatalogPricing(product: Product): CatalogPricing {
  const variants = getProductVariants(product)
  if (!variants.length) {
    const unit = Number(product.discountPrice ?? product.price)
    return {
      min: unit,
      max: unit,
      hasRange: false,
      compareAt: product.discountPrice != null ? product.price : undefined,
    }
  }

  const units = variants.map((variant) => getVariantUnitPrice(product, variant))
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
    const byId = findVariantById(product, currentVariantId ?? selectedOptions[VARIANT_ID_OPTION_KEY])
    return byId ?? variants.find((variant) => variant.stock > 0) ?? variants[0]
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
  product: Pick<Product, 'stock' | 'variants'>,
  selectedOptions?: Record<string, string> | null,
): number {
  const variants = getProductVariants(product)
  if (!variants.length) return Math.max(0, product.stock)
  const variant = getSelectedVariant(product, selectedOptions)
  return variant ? Math.max(0, variant.stock) : 0
}

export function getCartUnitPrice(
  product: Pick<Product, 'price' | 'discountPrice' | 'variants'>,
  selectedOptions?: Record<string, string> | null,
): number {
  const variant = getSelectedVariant(product, selectedOptions)
  return getVariantUnitPrice(product, variant)
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

export function getBindableOptions(
  categorySlug: string,
  attributes: Record<string, unknown>,
  groupLabels: {
    wristSize: string
    beadSize: string
    beadCount: string
    strandLength: string
    length: string
  },
): BindableOption[] {
  const out: BindableOption[] = []
  const add = (key: string, value: string, groupLabel: string, label = value) => {
    out.push({
      key,
      value,
      token: encodeBindToken(key, value),
      groupLabel,
      label,
    })
  }

  const wristSizes = asStringArray(attributes.wristSizes)
  if (wristSizes.length) {
    wristSizes.forEach((size) => add('wristSize', size, groupLabels.wristSize))
  } else if (categorySlug === 'brаslety') {
    FALLBACK_WRIST_SIZES.forEach((size) => add('wristSize', size, groupLabels.wristSize))
  }

  asStringArray(attributes.beadSizes).forEach((size) =>
    add('beadSize', size, groupLabels.beadSize, `${size} мм`),
  )
  asStringArray(attributes.beadCounts).forEach((count) =>
    add('beadCount', count, groupLabels.beadCount),
  )
  asStrandLengths(attributes.strandLengths).forEach((length) =>
    add('strandLength', length.label, groupLabels.strandLength),
  )
  asStringArray(attributes.lengths).forEach((length) => add('length', length, groupLabels.length))

  return out
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
    name: variant.name?.trim() || undefined,
    price: variant.price != null && variant.price > 0 ? variant.price : undefined,
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
  const units = bound.map((variant) => Number(variant.discountPrice ?? variant.price ?? fallbackPrice))
  return {
    price: Math.min(...units),
    stock: bound.reduce((sum, variant) => sum + variant.stock, 0),
  }
}

export function applyVariantStockChange(
  product: Pick<Product, 'stock' | 'variants'>,
  selectedOptions: Record<string, string> | null | undefined,
  quantity: number,
): { stock: number; variants?: ProductVariant[] } {
  const variants = getProductVariants(product).map((variant) => ({ ...variant }))
  if (!variants.length) {
    if (product.stock < quantity) {
      throw new Error('Insufficient stock')
    }
    return { stock: product.stock - quantity }
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
