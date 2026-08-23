export const SUBCATEGORY_QUERY_KEY = 'sub'

export function parseSelectedSubcategories(
  pathSubcategory: string | undefined,
  search: string | URLSearchParams,
): string[] {
  if (pathSubcategory) return [pathSubcategory]

  const params = typeof search === 'string' ? new URLSearchParams(search) : search
  const slugs = params
    .getAll(SUBCATEGORY_QUERY_KEY)
    .flatMap((value) => value.split(','))
    .map((slug) => slug.trim())
    .filter(Boolean)

  return [...new Set(slugs)]
}

export function toggleSubcategorySelection(selected: string[], slug: string): string[] {
  return selected.includes(slug) ? selected.filter((item) => item !== slug) : [...selected, slug]
}

export function catalogCategoryPath(
  categorySlug: string,
  selectedSlugs: string[] = [],
  order: string[] = selectedSlugs,
): string {
  const selected = new Set(selectedSlugs.filter(Boolean))
  const ordered = (order.length > 0 ? order : selectedSlugs).filter((slug) => selected.has(slug))

  for (const slug of selectedSlugs) {
    if (slug && !ordered.includes(slug)) ordered.push(slug)
  }

  if (ordered.length === 0) return `/catalog/${categorySlug}`
  if (ordered.length === 1) return `/catalog/${categorySlug}/${ordered[0]}`

  const params = new URLSearchParams()
  for (const slug of ordered) params.append(SUBCATEGORY_QUERY_KEY, slug)
  return `/catalog/${categorySlug}?${params.toString()}`
}
