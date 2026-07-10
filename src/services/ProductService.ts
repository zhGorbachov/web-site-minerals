import type { Product } from '@/types'
import { CatalogApi } from '@/api'
import { localizeProduct, localizeProducts } from '@/i18n/localizeCatalog'
import { useLanguageStore } from '@/store/languageStore'

function getLanguage() {
  return useLanguageStore.getState().language
}

export const ProductService = {
  async getAll(): Promise<Product[]> {
    const products = await CatalogApi.getProducts()
    return localizeProducts(products, getLanguage())
  },

  async getBySlug(slug: string): Promise<Product | undefined> {
    try {
      const product = await CatalogApi.getProductBySlug(slug)
      return localizeProduct(product, getLanguage())
    } catch {
      return undefined
    }
  },

  async getByCategory(categorySlug: string): Promise<Product[]> {
    const products = await CatalogApi.getProducts({ category: categorySlug })
    return localizeProducts(products, getLanguage())
  },

  async getBySubcategory(subCategorySlug: string): Promise<Product[]> {
    const products = await CatalogApi.getProducts({ subcategory: subCategorySlug })
    return localizeProducts(products, getLanguage())
  },

  async getFeatured(): Promise<Product[]> {
    const products = await CatalogApi.getProducts({ featured: true })
    return localizeProducts(products, getLanguage())
  },

  async getPopular(): Promise<Product[]> {
    const products = await CatalogApi.getProducts({ popular: true })
    return localizeProducts(products, getLanguage())
  },

  async getNew(): Promise<Product[]> {
    const products = await CatalogApi.getProducts({ new: true })
    return localizeProducts(products, getLanguage())
  },

  async getRelated(product: Product, limit = 4): Promise<Product[]> {
    const products = await CatalogApi.getRelated(product.slug, limit)
    return localizeProducts(products, getLanguage())
  },

  async search(query: string): Promise<Product[]> {
    const products = await CatalogApi.getProducts({ search: query })
    return localizeProducts(products, getLanguage())
  },

  async getByIds(ids: string[]): Promise<Product[]> {
    if (!ids.length) return []
    const products = await CatalogApi.getProducts({ ids })
    return products.map((product) => localizeProduct(product, getLanguage()))
  },
}
