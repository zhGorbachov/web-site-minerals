import type { Product } from '@/types'
import { categories, products, subcategories } from '@/mock'
import { localizeProduct, localizeProducts } from '@/i18n/localizeCatalog'
import { useLanguageStore } from '@/store/languageStore'

const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function getLanguage() {
  return useLanguageStore.getState().language
}

function withCategoryNames(product: Product): Product {
  const category = categories.find((c) => c.slug === product.categorySlug)
  const subCategory = subcategories.find(
    (s) => s.slug === product.subCategorySlug && s.categorySlug === product.categorySlug,
  )

  return {
    ...product,
    categoryName: category?.name ?? product.categorySlug,
    subCategoryName: subCategory?.name ?? product.subCategorySlug,
  }
}

function localizeWithCategoryNames(product: Product): Product {
  return localizeProduct(withCategoryNames(product), getLanguage())
}

export const ProductService = {
  async getAll(): Promise<Product[]> {
    await delay()
    return localizeProducts(products, getLanguage())
  },

  async getBySlug(slug: string): Promise<Product | undefined> {
    await delay()
    const product = products.find((p) => p.slug === slug)
    return product ? localizeWithCategoryNames(product) : undefined
  },

  async getByCategory(categorySlug: string): Promise<Product[]> {
    await delay()
    return localizeProducts(
      products.filter((p) => p.categorySlug === categorySlug),
      getLanguage(),
    )
  },

  async getBySubcategory(subCategorySlug: string): Promise<Product[]> {
    await delay()
    return localizeProducts(
      products.filter((p) => p.subCategorySlug === subCategorySlug),
      getLanguage(),
    )
  },

  async getFeatured(): Promise<Product[]> {
    await delay()
    return localizeProducts(products.filter((p) => p.featured), getLanguage())
  },

  async getPopular(): Promise<Product[]> {
    await delay()
    return localizeProducts(products.filter((p) => p.popular), getLanguage())
  },

  async getNew(): Promise<Product[]> {
    await delay()
    return localizeProducts(products.filter((p) => p.isNew), getLanguage())
  },

  async getRelated(product: Product, limit = 4): Promise<Product[]> {
    await delay()
    return localizeProducts(
      products
        .filter((p) => p.subCategorySlug === product.subCategorySlug && p.id !== product.id)
        .slice(0, limit),
      getLanguage(),
    )
  },

  async search(query: string): Promise<Product[]> {
    await delay()
    const q = query.toLowerCase()
    return localizeProducts(
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      ),
      getLanguage(),
    )
  },

  async getByIds(ids: string[]): Promise<Product[]> {
    await delay()
    const byId = new Map(products.map((p) => [p.id, p]))
    return ids
      .map((id) => byId.get(id))
      .filter((p): p is Product => p !== undefined)
      .map((product) => localizeWithCategoryNames(product))
  },
}
