import type { Category } from '@/types'
import { CatalogApi } from '@/api'
import { CATALOG_MENU_ORDER } from '@/config/Catalog'
import { categories as seedCategories } from '@/mock/categories'
import { localizeCategories, localizeCategory } from '@/i18n/localizeCatalog'
import { useLanguageStore } from '@/store/languageStore'
import type { Language } from '@/i18n/Translations'

function getLanguage() {
  return useLanguageStore.getState().language
}

function withCoreCategories(apiCats: Category[], language: Language): Category[] {
  const localizedSeed = localizeCategories(seedCategories, language)
  const localizedApi = localizeCategories(apiCats, language)
  const bySlug = new Map(localizedApi.map((cat) => [cat.slug, cat]))
  const core = CATALOG_MENU_ORDER.map((slug) => {
    const fromApi = bySlug.get(slug)
    const fromSeed = localizedSeed.find((cat) => cat.slug === slug)
    const base = fromApi ?? fromSeed
    if (!base) {
      throw new Error(`Missing core category fallback for slug: ${slug}`)
    }
    return base
  })
  const extras = localizedApi.filter(
    (cat) => !CATALOG_MENU_ORDER.includes(cat.slug as (typeof CATALOG_MENU_ORDER)[number]),
  )
  return [...core, ...extras]
}

export const CategoryService = {
  async getAll(): Promise<Category[]> {
    let apiCats: Category[] = []
    try {
      apiCats = await CatalogApi.getCategories()
    } catch {
      apiCats = []
    }
    return withCoreCategories(apiCats, getLanguage())
  },

  async getBySlug(slug: string): Promise<Category | undefined> {
    try {
      const category = await CatalogApi.getCategoryBySlug(slug)
      return localizeCategory(category, getLanguage())
    } catch {
      const fromSeed = seedCategories.find((cat) => cat.slug === slug)
      return fromSeed ? localizeCategory(fromSeed, getLanguage()) : undefined
    }
  },
}
