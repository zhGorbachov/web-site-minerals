import type { Product } from '@/types'
import type { Language } from '@/i18n/Translations'
import { getSortLocale } from '@/i18n/localizeCatalog'

export type ProductSortOption =
  | 'default'
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'popular'

export const PRODUCT_SORT_OPTIONS: ProductSortOption[] = [
  'default',
  'name-asc',
  'name-desc',
  'price-asc',
  'price-desc',
  'newest',
  'popular',
]

function getEffectivePrice(product: Product) {
  return product.discountPrice ?? product.price
}

export function sortProducts(
  products: Product[],
  sortBy: ProductSortOption,
  language: Language = 'uk',
): Product[] {
  if (sortBy === 'default') return products

  const sorted = [...products]
  const locale = getSortLocale(language)

  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, locale))
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name, locale))
    case 'price-asc':
      return sorted.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b))
    case 'price-desc':
      return sorted.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a))
    case 'newest':
      return sorted.sort((a, b) => {
        if (a.isNew !== b.isNew) return a.isNew ? -1 : 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    case 'popular':
      return sorted.sort((a, b) => {
        if (a.popular !== b.popular) return a.popular ? -1 : 1
        return a.name.localeCompare(b.name, locale)
      })
    default:
      return products
  }
}
