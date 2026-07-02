import type { Category } from '@/types'
import { categories } from '@/mock'

const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export const CategoryService = {
  async getAll(): Promise<Category[]> {
    await delay()
    return categories
  },

  async getBySlug(slug: string): Promise<Category | undefined> {
    await delay()
    return categories.find((c) => c.slug === slug)
  },
}
