import type { Product } from '@/types'
import { mockImages } from '@/assets/mock/Images'

const IMAGE_POOL = [
  mockImages.beadsAgate,
  mockImages.blueAgate,
  mockImages.amethyst,
  mockImages.quartzCrystal,
  mockImages.pinkQuartz,
  mockImages.labradorite,
  mockImages.moonstone,
  mockImages.tigerEye,
  mockImages.jasper,
  mockImages.waxThread,
  mockImages.elasticThread,
  mockImages.cottonThread,
  mockImages.silkThread,
  mockImages.womenBracelet,
  mockImages.menBracelet,
  mockImages.kidsBracelet,
  mockImages.handmadeBracelet,
  mockImages.limitedBracelet,
] as const

const NAME_PREFIXES = [
  'Агат',
  'Аметист',
  'Кварц',
  'Лабрадорит',
  'Обсидіан',
  'Яшма',
  'Розовий кварц',
  'Місячний камінь',
  'Нитка',
  'Браслет',
] as const

const NAME_SUFFIXES = [
  'натуральний',
  'полірований',
  'ручної роботи',
  'обмежена серія',
  'преміум',
  'класичний',
  'м\'який блиск',
  'матовий',
] as const

const SUBCATEGORIES = [
  { id: 'sub-1', slug: 'agat', categorySlug: 'mineraly' },
  { id: 'sub-2', slug: 'ametyst', categorySlug: 'mineraly' },
  { id: 'sub-3', slug: 'kvarts', categorySlug: 'mineraly' },
  { id: 'sub-9', slug: 'voshcheni', categorySlug: 'nytky' },
  { id: 'sub-14', slug: 'zhinochi', categorySlug: 'brаslety' },
] as const

/** Generates extra mock new products for pagination demos. */
export function generateMockNewProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, index) => {
    const n = index + 1
    const sub = SUBCATEGORIES[index % SUBCATEGORIES.length]
    const prefix = NAME_PREFIXES[index % NAME_PREFIXES.length]
    const suffix = NAME_SUFFIXES[index % NAME_SUFFIXES.length]
    const image = IMAGE_POOL[index % IMAGE_POOL.length]
    const price = 45 + (index % 20) * 15

    return {
      id: `prod-mock-new-${n}`,
      subCategoryId: sub.id,
      subCategorySlug: sub.slug,
      categorySlug: sub.categorySlug,
      name: `${prefix} ${suffix} №${n}`,
      slug: `mock-novynka-${n}`,
      sku: `MOCK-NEW-${String(n).padStart(3, '0')}`,
      shortDescription: `Тестова новинка №${n} для перевірки пагінації`,
      description: `Демо-товар №${n}. Використовується лише в mock-даних, щоб побачити поведінку списку новинок при великій кількості позицій.`,
      price,
      discountPrice: index % 4 === 0 ? Math.round(price * 0.85) : undefined,
      stock: 5 + (index % 30),
      images: [image],
      attributes: { color: 'Натуральний', size: '10 мм' },
      featured: false,
      popular: index % 7 === 0,
      isNew: true,
      createdAt: `2024-${String((index % 12) + 1).padStart(2, '0')}-15T00:00:00Z`,
      updatedAt: `2024-${String((index % 12) + 1).padStart(2, '0')}-15T00:00:00Z`,
    }
  })
}

/** Total mock new products to simulate a large catalog (14 real + generated). */
export const MOCK_EXTRA_NEW_PRODUCTS_COUNT = 110
