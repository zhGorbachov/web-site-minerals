import type { Product } from '@/types'

/**
 * Mock records mirror a database row: only the ids are stored, while slugs and names of the
 * subcategories are resolved on read, the same way the server derives them from its link table.
 */
export type StoredProduct = Omit<
  Product,
  'subCategoryIds' | 'subCategorySlugs' | 'subCategoryNames'
> & {
  /** All subcategories of the product; the first one is the main one. */
  subCategoryIds?: string[]
}

export function storedSubCategoryIds(product: StoredProduct): string[] {
  return product.subCategoryIds?.length ? product.subCategoryIds : [product.subCategoryId]
}
