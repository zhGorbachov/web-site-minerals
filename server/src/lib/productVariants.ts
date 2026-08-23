export const VARIANT_ID_OPTION_KEY = 'variantId'

export type ProductVariant = {
  id: string
  name?: string
  image: string
  price?: number
  discountPrice?: number
  stock: number
  options?: Record<string, string>
  attributes?: Record<string, string>
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

export function getVariantUnitPrice(
  product: { price: { toNumber?: () => number } | number; discountPrice?: { toNumber?: () => number } | number | null },
  variant?: ProductVariant | null,
): number {
  const productSale =
    product.discountPrice == null
      ? undefined
      : typeof product.discountPrice === 'number'
        ? product.discountPrice
        : Number(product.discountPrice)
  const productPrice = typeof product.price === 'number' ? product.price : Number(product.price)
  if (!variant) return Number(productSale ?? productPrice)
  return Number(variant.discountPrice ?? variant.price ?? productSale ?? productPrice)
}

export function getSelectedVariant(
  variants: ProductVariant[],
  selectedOptions?: Record<string, string> | null,
): ProductVariant | undefined {
  const id = selectedOptions?.[VARIANT_ID_OPTION_KEY]
  if (!id) return undefined
  return variants.find((variant) => variant.id === id)
}

export function getCartUnitPrice(
  product: {
    price: { toNumber?: () => number } | number
    discountPrice?: { toNumber?: () => number } | number | null
    variants?: unknown
  },
  selectedOptions?: Record<string, string> | null,
): number {
  const variants = parseVariants(product.variants)
  const variant = getSelectedVariant(variants, selectedOptions)
  return getVariantUnitPrice(product, variant)
}

export function getAvailableStock(
  product: { stock: number; variants?: unknown },
  selectedOptions?: Record<string, string> | null,
): number {
  const variants = parseVariants(product.variants)
  if (!variants.length) return Math.max(0, product.stock)
  const variant = getSelectedVariant(variants, selectedOptions)
  return variant ? Math.max(0, variant.stock) : 0
}

export function getVariantDisplayName(
  productName: string,
  variant?: ProductVariant | null,
): string {
  if (!variant?.name?.trim()) return productName
  if (variant.name.trim() === productName) return productName
  return variant.name.trim()
}

export function deriveProductPricingFromVariants(
  variants: ProductVariant[],
  fallbackPrice: number,
): { price: number; stock: number } {
  if (!variants.length) return { price: fallbackPrice, stock: 0 }
  const units = variants.map((variant) => Number(variant.discountPrice ?? variant.price ?? fallbackPrice))
  return {
    price: Math.min(...units),
    stock: variants.reduce((sum, variant) => sum + variant.stock, 0),
  }
}

export function applyVariantStockChange(
  product: { stock: number; variants?: unknown },
  selectedOptions: Record<string, string> | null | undefined,
  quantity: number,
): { stock: number; variants?: ProductVariant[] } {
  const variants = parseVariants(product.variants).map((variant) => ({ ...variant }))
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
