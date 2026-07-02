import type { SubCategory } from '@/types'
import { subcategories } from '@/mock'

const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export const SubCategoryService = {
  async getAll(): Promise<SubCategory[]> {
    await delay()
    return subcategories
  },

  async getByCategory(categorySlug: string): Promise<SubCategory[]> {
    await delay()
    return subcategories.filter((s) => s.categorySlug === categorySlug)
  },

  async getBySlug(slug: string): Promise<SubCategory | undefined> {
    await delay()
    return subcategories.find((s) => s.slug === slug)
  },
}
