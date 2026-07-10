import type { Category } from '@/types'
import { CatalogApi } from '@/api'
import { localizeCategories, localizeCategory } from '@/i18n/localizeCatalog'
import { useLanguageStore } from '@/store/languageStore'

function getLanguage() {
  return useLanguageStore.getState().language
}

export const CategoryService = {
  async getAll(): Promise<Category[]> {
    const categories = await CatalogApi.getCategories()
    return localizeCategories(categories, getLanguage())
  },

  async getBySlug(slug: string): Promise<Category | undefined> {
    try {
      const category = await CatalogApi.getCategoryBySlug(slug)
      return localizeCategory(category, getLanguage())
    } catch {
      return undefined
    }
  },
}
