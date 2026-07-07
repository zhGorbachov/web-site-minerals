import type { Category, Product, SubCategory } from '@/types'
import type { Language } from './Translations'
import {
  attributeValueEn,
  categoryEn,
  colorKeyByUk,
  productEn,
  strandLengthEn,
  subcategoryEn,
} from './CatalogEn'

function translateValue(value: string, language: Language): string {
  if (language === 'uk') return value
  return attributeValueEn[value] ?? value
}

function translateStrandLabel(label: string, language: Language): string {
  if (language === 'uk') return label
  return strandLengthEn[label] ?? label
}

export function localizeCategory(category: Category, language: Language): Category {
  if (language === 'uk') return category
  const en = categoryEn[category.slug]
  if (!en) return category
  return { ...category, name: en.name, description: en.description }
}

export function localizeSubcategory(subcategory: SubCategory, language: Language): SubCategory {
  if (language === 'uk') return subcategory
  const name = subcategoryEn[subcategory.slug]
  if (!name) return subcategory
  return { ...subcategory, name }
}

export function localizeProduct(product: Product, language: Language): Product {
  if (language === 'uk') return product

  const base = productEn[product.slug]
  let localized: Product

  if (base) {
    localized = {
      ...product,
      name: base.name,
      shortDescription: base.shortDescription,
      description: base.description,
    }
  } else if (product.slug.startsWith('mock-novynka-')) {
    const n = product.slug.replace('mock-novynka-', '')
    localized = {
      ...product,
      name: product.name.replace(/^(.+) №(\d+)$/, (_, _prefix, num) => `Demo new item #${num}`),
      shortDescription: `Test new item #${n} for pagination demo`,
      description: `Demo product #${n}. Used only in mock data to test new arrivals pagination with many items.`,
    }
  } else {
    localized = { ...product }
  }

  if (localized.categoryName) {
    const cat = categoryEn[localized.categorySlug]
    if (cat) localized = { ...localized, categoryName: cat.name }
  }

  if (localized.subCategoryName) {
    const subName = subcategoryEn[localized.subCategorySlug]
    if (subName) localized = { ...localized, subCategoryName: subName }
  }

  const attrs = { ...localized.attributes } as Record<string, unknown>

  for (const [key, value] of Object.entries(attrs)) {
    if (typeof value === 'string') {
      attrs[key] = translateValue(value, language)
    } else if (key === 'strandLengths' && Array.isArray(value)) {
      attrs[key] = value.map((item: { label: string; value: string }) => ({
        label: translateStrandLabel(item.label, language),
        value: item.value,
      }))
    } else if (key === 'stones' && Array.isArray(value)) {
      attrs[key] = value.map((stone: string) => translateValue(stone, language))
    }
  }

  return { ...localized, attributes: attrs as Product['attributes'] }
}

export function localizeCategories(categories: Category[], language: Language): Category[] {
  return categories.map((category) => localizeCategory(category, language))
}

export function localizeSubcategories(subcategories: SubCategory[], language: Language): SubCategory[] {
  return subcategories.map((subcategory) => localizeSubcategory(subcategory, language))
}

export function localizeProducts(products: Product[], language: Language): Product[] {
  return products.map((product) => localizeProduct(product, language))
}

export function getColorOptions(language: Language): { key: string; label: string }[] {
  const keys = ['black', 'white', 'beige', 'pink', 'blue', 'green', 'burgundy'] as const
  if (language === 'uk') {
    return keys.map((key) => {
      const uk = Object.entries(colorKeyByUk).find(([, value]) => value === key)?.[0]
      return { key, label: uk ?? key }
    })
  }
  return keys.map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
  }))
}

export function getSortLocale(language: Language): string {
  return language === 'uk' ? 'uk' : 'en'
}
