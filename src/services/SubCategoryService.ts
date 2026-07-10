import type { SubCategory } from '@/types'
import { CatalogApi } from '@/api'
import { localizeSubcategories, localizeSubcategory } from '@/i18n/localizeCatalog'
import { useLanguageStore } from '@/store/languageStore'

function getLanguage() {
  return useLanguageStore.getState().language
}

export const SubCategoryService = {
  async getAll(): Promise<SubCategory[]> {
    const subcategories = await CatalogApi.getSubcategories()
    return localizeSubcategories(subcategories, getLanguage())
  },

  async getByCategory(categorySlug: string): Promise<SubCategory[]> {
    const subcategories = await CatalogApi.getSubcategories(categorySlug)
    return localizeSubcategories(subcategories, getLanguage())
  },

  async getBySlug(slug: string): Promise<SubCategory | undefined> {
    try {
      const subcategory = await CatalogApi.getSubcategoryBySlug(slug)
      return localizeSubcategory(subcategory, getLanguage())
    } catch {
      return undefined
    }
  },
}
