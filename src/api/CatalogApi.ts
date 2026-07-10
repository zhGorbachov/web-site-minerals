import type { Category, Product, SubCategory } from '@/types'
import { api, withMediaUrls } from './client'

function mapProduct(product: Product): Product {
  return withMediaUrls(product)
}

function mapCategory(category: Category): Category {
  return withMediaUrls(category) as Category
}

function mapSubCategory(sub: SubCategory): SubCategory {
  return withMediaUrls(sub) as SubCategory
}

export const CatalogApi = {
  async getCategories() {
    const { data } = await api.get<Category[]>('/categories')
    return data.map(mapCategory)
  },

  async getCategoryBySlug(slug: string) {
    const { data } = await api.get<Category>(`/categories/${slug}`)
    return mapCategory(data)
  },

  async getSubcategories(category?: string) {
    const { data } = await api.get<SubCategory[]>('/subcategories', {
      params: category ? { category } : undefined,
    })
    return data.map(mapSubCategory)
  },

  async getSubcategoryBySlug(slug: string) {
    const { data } = await api.get<SubCategory>(`/subcategories/${slug}`)
    return mapSubCategory(data)
  },

  async getProducts(params?: {
    category?: string
    subcategory?: string
    featured?: boolean
    popular?: boolean
    new?: boolean
    search?: string
    ids?: string[]
  }) {
    const { data } = await api.get<Product[]>('/products', {
      params: {
        ...params,
        featured: params?.featured ? 'true' : undefined,
        popular: params?.popular ? 'true' : undefined,
        new: params?.new ? 'true' : undefined,
        ids: params?.ids?.join(','),
      },
    })
    return data.map(mapProduct)
  },

  async getProductBySlug(slug: string) {
    const { data } = await api.get<Product>(`/products/${slug}`)
    return mapProduct(data)
  },

  async getRelated(slug: string, limit = 4) {
    const { data } = await api.get<Product[]>(`/products/${slug}/related`, {
      params: { limit },
    })
    return data.map(mapProduct)
  },
}
