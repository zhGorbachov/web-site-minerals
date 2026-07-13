import type { Category, Product, SubCategory } from '@/types'
import { MockApiError } from './MockApiError'
import { enrichProduct, MockDb } from './MockDb'

export const MockCatalogApi = {
  async getCategories(): Promise<Category[]> {
    return MockDb.getCategories()
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = MockDb.getCategories().find((c) => c.slug === slug)
    if (!category) throw new MockApiError(404, 'Not found')
    return category
  },

  async getSubcategories(category?: string): Promise<SubCategory[]> {
    const all = MockDb.getSubcategories()
    return category ? all.filter((s) => s.categorySlug === category) : all
  },

  async getSubcategoryBySlug(slug: string): Promise<SubCategory> {
    const subcategory = MockDb.getSubcategories().find((s) => s.slug === slug)
    if (!subcategory) throw new MockApiError(404, 'Not found')
    return subcategory
  },

  async getProducts(params?: {
    category?: string
    subcategory?: string
    featured?: boolean
    popular?: boolean
    new?: boolean
    search?: string
    ids?: string[]
  }): Promise<Product[]> {
    let list = MockDb.getProducts().map(enrichProduct)

    if (params?.category) list = list.filter((p) => p.categorySlug === params.category)
    if (params?.subcategory) list = list.filter((p) => p.subCategorySlug === params.subcategory)
    if (params?.featured) list = list.filter((p) => p.featured)
    if (params?.popular) list = list.filter((p) => p.popular)
    if (params?.new) list = list.filter((p) => p.isNew)
    if (params?.ids?.length) {
      const idSet = new Set(params.ids)
      list = list.filter((p) => idSet.has(p.id))
    }
    if (params?.search?.trim()) {
      const q = params.search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q),
      )
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const product = MockDb.getProducts().find((p) => p.slug === slug)
    if (!product) throw new MockApiError(404, 'Not found')
    return enrichProduct(product)
  },

  async getRelated(slug: string, limit = 4): Promise<Product[]> {
    const product = MockDb.getProducts().find((p) => p.slug === slug)
    if (!product) throw new MockApiError(404, 'Not found')
    return MockDb.getProducts()
      .filter((p) => p.id !== product.id && p.subCategorySlug === product.subCategorySlug)
      .slice(0, limit)
      .map(enrichProduct)
  },
}
