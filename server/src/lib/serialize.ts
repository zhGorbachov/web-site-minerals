import type { Product, Category, SubCategory, Prisma } from '@prisma/client'

function decimalToNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value == null) return undefined
  return typeof value === 'number' ? value : Number(value)
}

function discountToNumber(value: Prisma.Decimal | number | null | undefined) {
  const amount = decimalToNumber(value)
  return amount != null && amount > 0 ? amount : undefined
}

export function serializeCategory(category: Category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image,
    description: category.description,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }
}

export function serializeSubCategory(sub: SubCategory) {
  return {
    id: sub.id,
    categoryId: sub.categoryId,
    categorySlug: sub.categorySlug,
    name: sub.name,
    slug: sub.slug,
    image: sub.image,
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
  }
}

export function serializeProduct(
  product: Product & {
    subCategory?: { name: string; category?: { name: string } | null } | null
  },
) {
  return {
    id: product.id,
    subCategoryId: product.subCategoryId,
    subCategorySlug: product.subCategorySlug,
    categorySlug: product.categorySlug,
    categoryName: product.subCategory?.category?.name,
    subCategoryName: product.subCategory?.name,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    shortDescription: product.shortDescription,
    description: product.description,
    price: decimalToNumber(product.price) ?? 0,
    discountPrice: discountToNumber(product.discountPrice),
    stock: product.stock,
    images: product.images,
    video: product.video ?? undefined,
    attributes: product.attributes,
    variants: Array.isArray(product.variants) ? product.variants : [],
    featured: product.featured,
    popular: product.popular,
    isNew: product.isNew,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}
