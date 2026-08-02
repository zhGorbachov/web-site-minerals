export type HomeCategorySize = 'large' | 'small'

/** Categories shown as tiles on the home page (always, regardless of DB). */
export const HOME_PAGE_CATEGORIES = [
  { slug: 'mineraly', size: 'large' as const },
  { slug: 'nytky', size: 'large' as const },
  { slug: 'brаslety', size: 'small' as const },
  { slug: 'pidvisky', size: 'small' as const },
  { slug: 'pahoshchi', size: 'small' as const },
] as const

export const HOME_PAGE_CATEGORY_SLUGS = HOME_PAGE_CATEGORIES.map((c) => c.slug)

/** Order of top-level categories in the catalog drawer/menu. */
export const CATALOG_MENU_ORDER = ['nytky', 'pidvisky', 'brаslety', 'pahoshchi', 'mineraly'] as const
