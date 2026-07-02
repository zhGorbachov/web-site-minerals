import type { Product } from '@/types'
import { categories, products, subcategories } from '@/mock'

const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms))

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

export const ProductService = {
  async getAll(): Promise<Product[]> {
    await delay()
    return products
  },

  async getBySlug(slug: string): Promise<Product | undefined> {
    await delay()
    const product = products.find((p) => p.slug === slug)
    return product ? withCategoryNames(product) : undefined
  },

  async getByCategory(categorySlug: string): Promise<Product[]> {
    await delay()
    return products.filter((p) => p.categorySlug === categorySlug)
  },

  async getBySubcategory(subCategorySlug: string): Promise<Product[]> {
    await delay()
    return products.filter((p) => p.subCategorySlug === subCategorySlug)
  },

  async getFeatured(): Promise<Product[]> {
    await delay()
    return products.filter((p) => p.featured)
  },

  async getPopular(): Promise<Product[]> {
    await delay()
    return products.filter((p) => p.popular)
  },

  async getNew(): Promise<Product[]> {
    await delay()
    return products.filter((p) => p.isNew)
  },

  async getRelated(product: Product, limit = 4): Promise<Product[]> {
    await delay()
    return products
      .filter((p) => p.subCategorySlug === product.subCategorySlug && p.id !== product.id)
      .slice(0, limit)
  },

  async search(query: string): Promise<Product[]> {
    await delay()
    const q = query.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    )
  },
}
