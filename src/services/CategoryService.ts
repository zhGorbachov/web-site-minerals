import type { Category } from '@/types'
import { categories } from '@/mock'
import { localizeCategories, localizeCategory } from '@/i18n/localizeCatalog'
import { useLanguageStore } from '@/store/languageStore'

const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function getLanguage() {
  return useLanguageStore.getState().language
}

export const CategoryService = {
  async getAll(): Promise<Category[]> {
    await delay()
    return localizeCategories(categories, getLanguage())
  },

  async getBySlug(slug: string): Promise<Category | undefined> {
    await delay()
    const category = categories.find((c) => c.slug === slug)
    return category ? localizeCategory(category, getLanguage()) : undefined
  },
}
