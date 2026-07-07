import type { SubCategory } from '@/types'
import { subcategories } from '@/mock'
import { localizeSubcategories, localizeSubcategory } from '@/i18n/localizeCatalog'
import { useLanguageStore } from '@/store/languageStore'

const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function getLanguage() {
  return useLanguageStore.getState().language
}

export const SubCategoryService = {
  async getAll(): Promise<SubCategory[]> {
    await delay()
    return localizeSubcategories(subcategories, getLanguage())
  },

  async getByCategory(categorySlug: string): Promise<SubCategory[]> {
    await delay()
    return localizeSubcategories(
      subcategories.filter((s) => s.categorySlug === categorySlug),
      getLanguage(),
    )
  },

  async getBySlug(slug: string): Promise<SubCategory | undefined> {
    await delay()
    const subcategory = subcategories.find((s) => s.slug === slug)
    return subcategory ? localizeSubcategory(subcategory, getLanguage()) : undefined
  },
}
