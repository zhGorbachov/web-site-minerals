const UA_TO_LATIN: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'h',
  ґ: 'g',
  д: 'd',
  е: 'e',
  є: 'ye',
  ж: 'zh',
  з: 'z',
  и: 'y',
  і: 'i',
  ї: 'yi',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
  ю: 'yu',
  я: 'ya',
  ё: 'yo',
  ы: 'y',
  э: 'e',
  ъ: '',
}

function transliterate(value: string): string {
  return value
    .toLowerCase()
    .split('')
    .map((ch) => UA_TO_LATIN[ch] ?? ch)
    .join('')
}

function skuToken(value: string, maxLen?: number): string {
  const token = transliterate(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return maxLen ? token.slice(0, maxLen) : token
}

export function buildProductSku(params: {
  categorySlug: string
  subCategorySlug: string
  name: string
}): string {
  const name = skuToken(params.name, 28)
  if (!name) return ''
  const cat = skuToken(params.categorySlug, 3)
  const sub = skuToken(params.subCategorySlug, 4)
  return [cat, sub, name].filter(Boolean).join('-')
}

export function uniqueSku(base: string, taken: Iterable<string>): string {
  if (!base) return base
  const existing = taken instanceof Set ? taken : new Set(taken)
  if (!existing.has(base)) return base
  let n = 2
  while (existing.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}
