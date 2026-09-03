import type { Product, ProductAttributes, StoreReview, SubCategory } from '@/types'
import type {
  AdminOrder,
  AdminOrderUpdatePayload,
  AdminProductPayload,
  AdminSubcategoryPayload,
  AdminUser,
  UploadedMedia,
} from '@/api/AdminApi'
import { getAuthToken } from '@/api/client'
import { MockApiError } from './MockApiError'
import { enrichProduct, MockDb, slugify } from './MockDb'
import { storedSubCategoryIds, type StoredProduct } from './MockProduct'
import { categoryHasSubcategories } from '@/config/Catalog'
import { buildProductSku, uniqueSku } from '@/utils/sku'
import {
  deriveProductPricingFromVariants,
  normalizeDiscountPrice,
  parseVariants,
} from '@/utils/productVariants'

function requireAdmin() {
  const user = MockDb.resolveSession(getAuthToken())
  if (!user) throw new MockApiError(401, 'unauthorized')
  if (user.role !== 'admin' && user.role !== 'manager') {
    throw new MockApiError(403, 'forbidden')
  }
  return user
}

/** Mirrors the server: a flat category keeps its products in one technical subcategory. */
function getFlatCategorySubCategory(categoryId: string): SubCategory | null {
  const category = MockDb.getCategories().find((cat) => cat.id === categoryId)
  if (!category || categoryHasSubcategories(category.slug)) return null

  const list = MockDb.getSubcategories()
  const existing = list.find(
    (sub) => sub.categorySlug === category.slug && sub.slug === category.slug,
  )
  if (existing) return existing

  const now = new Date().toISOString()
  const created: SubCategory = {
    id: `sub-${category.slug}`,
    categoryId: category.id,
    categorySlug: category.slug,
    name: category.name,
    slug: category.slug,
    image: category.image,
    createdAt: now,
    updatedAt: now,
  }
  MockDb.setSubcategories([...list, created])
  return created
}

type ProductSubCategoryInput = {
  subCategoryId?: string
  subCategoryIds?: string[]
  categoryId?: string
}

function hasSubCategoryInput(payload: ProductSubCategoryInput) {
  return Boolean(payload.subCategoryIds?.length || payload.subCategoryId || payload.categoryId)
}

/** Mirrors the server: several subcategories are allowed, but all within the same category. */
function resolveProductSubCategories(payload: ProductSubCategoryInput): SubCategory[] | null {
  const requestedIds = [
    ...new Set([
      ...(payload.subCategoryIds ?? []),
      ...(payload.subCategoryId ? [payload.subCategoryId] : []),
    ]),
  ]

  if (requestedIds.length === 0) {
    if (!payload.categoryId) return null
    const flat = getFlatCategorySubCategory(payload.categoryId)
    return flat ? [flat] : null
  }

  const list = MockDb.getSubcategories()
  const resolved = requestedIds.map((id) => list.find((s) => s.id === id))
  if (resolved.some((sub) => !sub)) return null

  const subs = resolved as SubCategory[]
  if (subs.some((sub) => sub.categoryId !== subs[0].categoryId)) return null
  return subs
}

function skuSubCategoryToken(sub: SubCategory) {
  return categoryHasSubcategories(sub.categorySlug) ? sub.slug : ''
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export const MockAdminApi = {
  async getProducts(): Promise<Product[]> {
    requireAdmin()
    return MockDb.getProducts()
      .map(enrichProduct)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  },

  async createProduct(payload: AdminProductPayload): Promise<Product> {
    requireAdmin()
    const subs = resolveProductSubCategories(payload)
    if (!subs?.length) throw new MockApiError(400, 'Invalid subcategory')
    const sub = subs[0]

    const slug = payload.slug?.trim() || slugify(payload.name)
    if (MockDb.getProducts().some((p) => p.slug === slug)) {
      throw new MockApiError(409, 'slug_taken')
    }
    const skuBase =
      payload.sku?.trim() ||
      buildProductSku({
        categorySlug: sub.categorySlug,
        subCategorySlug: skuSubCategoryToken(sub),
        name: payload.name,
      })
    if (!skuBase) throw new MockApiError(400, 'Invalid payload')
    const sku = uniqueSku(
      skuBase,
      MockDb.getProducts().map((p) => p.sku),
    )

    const now = new Date().toISOString()
    const variants = parseVariants(payload.variants)
    const derived = variants.length
      ? deriveProductPricingFromVariants(variants, payload.price)
      : { price: payload.price, stock: payload.stock }
    const product: StoredProduct = {
      id: `prod-${Date.now()}`,
      name: payload.name,
      slug,
      sku,
      shortDescription:
        payload.shortDescription?.trim() || payload.description || '—',
      description: payload.description,
      price: derived.price,
      discountPrice: normalizeDiscountPrice(payload.discountPrice),
      stock: derived.stock,
      images: payload.images,
      video: payload.video ?? undefined,
      attributes: (payload.attributes ?? {}) as ProductAttributes,
      variants,
      featured: payload.featured ?? false,
      popular: payload.popular ?? false,
      isNew: payload.isNew ?? true,
      subCategoryId: sub.id,
      subCategorySlug: sub.slug,
      subCategoryIds: subs.map((item) => item.id),
      categorySlug: sub.categorySlug,
      createdAt: now,
      updatedAt: now,
    }

    MockDb.setProducts([product, ...MockDb.getProducts()])
    return enrichProduct(product)
  },

  async updateProduct(id: string, payload: Partial<AdminProductPayload>): Promise<Product> {
    requireAdmin()
    const products = MockDb.getProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index < 0) throw new MockApiError(404, 'Not found')

    const current = products[index]
    let subCategoryId = current.subCategoryId
    let subCategorySlug = current.subCategorySlug
    let categorySlug = current.categorySlug
    let subCategoryIds = storedSubCategoryIds(current)

    if (hasSubCategoryInput(payload)) {
      const subs = resolveProductSubCategories(payload)
      if (!subs?.length) throw new MockApiError(400, 'Invalid subcategory')
      subCategoryId = subs[0].id
      subCategorySlug = subs[0].slug
      categorySlug = subs[0].categorySlug
      subCategoryIds = subs.map((sub) => sub.id)
    }

    const slug = payload.slug?.trim() || current.slug
    if (products.some((p) => p.id !== id && p.slug === slug)) {
      throw new MockApiError(409, 'slug_taken')
    }
    const nextSku = payload.sku?.trim() || current.sku
    if (nextSku !== current.sku && products.some((p) => p.id !== id && p.sku === nextSku)) {
      throw new MockApiError(409, 'sku_taken')
    }

    const variants =
      payload.variants !== undefined ? parseVariants(payload.variants) : current.variants
    const derived =
      payload.variants !== undefined
        ? deriveProductPricingFromVariants(
            parseVariants(payload.variants),
            payload.price ?? current.price,
          )
        : null

    const updated: StoredProduct = {
      ...current,
      name: payload.name ?? current.name,
      slug,
      sku: nextSku,
      shortDescription:
        payload.shortDescription?.trim() ||
        payload.description ||
        current.shortDescription,
      description: payload.description ?? current.description,
      price: derived?.price ?? payload.price ?? current.price,
      discountPrice:
        payload.discountPrice === null
          ? undefined
          : payload.discountPrice === undefined
            ? current.discountPrice
            : normalizeDiscountPrice(payload.discountPrice),
      stock: derived?.stock ?? payload.stock ?? current.stock,
      images: payload.images ?? current.images,
      video:
        payload.video === null ? undefined : (payload.video ?? current.video),
      attributes: (payload.attributes as ProductAttributes | undefined) ?? current.attributes,
      variants,
      featured: payload.featured ?? current.featured,
      popular: payload.popular ?? current.popular,
      isNew: payload.isNew ?? current.isNew,
      subCategoryId,
      subCategorySlug,
      subCategoryIds,
      categorySlug,
      updatedAt: new Date().toISOString(),
    }

    const next = [...products]
    next[index] = updated
    MockDb.setProducts(next)
    return enrichProduct(updated)
  },

  async updateStock(id: string, stock: number): Promise<Product> {
    return this.updateProduct(id, { stock })
  },

  async deleteProduct(id: string): Promise<void> {
    requireAdmin()
    const products = MockDb.getProducts()
    if (!products.some((p) => p.id === id)) throw new MockApiError(404, 'Not found')
    MockDb.setProducts(products.filter((p) => p.id !== id))
  },

  async createSubcategory(payload: AdminSubcategoryPayload): Promise<SubCategory> {
    requireAdmin()
    const category = MockDb.getCategories().find((c) => c.id === payload.categoryId)
    if (!category) throw new MockApiError(400, 'Invalid category')

    const slug = payload.slug?.trim() || slugify(payload.name)
    if (
      MockDb.getSubcategories().some((s) => s.categorySlug === category.slug && s.slug === slug)
    ) {
      throw new MockApiError(409, 'slug_taken')
    }

    const now = new Date().toISOString()
    const subcategory: SubCategory = {
      id: `sub-${Date.now()}`,
      name: payload.name.trim(),
      slug,
      categoryId: category.id,
      categorySlug: category.slug,
      image: payload.image || category.image,
      createdAt: now,
      updatedAt: now,
    }

    MockDb.setSubcategories([...MockDb.getSubcategories(), subcategory])
    return subcategory
  },

  async updateSubcategory(
    id: string,
    payload: Partial<AdminSubcategoryPayload>,
  ): Promise<SubCategory> {
    requireAdmin()
    const list = MockDb.getSubcategories()
    const index = list.findIndex((s) => s.id === id)
    if (index < 0) throw new MockApiError(404, 'Not found')

    const current = list[index]
    const nextCategoryId = payload.categoryId ?? current.categoryId
    const category = MockDb.getCategories().find((c) => c.id === nextCategoryId)
    if (!category) throw new MockApiError(400, 'Invalid category')

    const slug = payload.slug?.trim() || current.slug
    if (
      list.some(
        (s) => s.id !== id && s.categorySlug === category.slug && s.slug === slug,
      )
    ) {
      throw new MockApiError(409, 'slug_taken')
    }

    const updated: SubCategory = {
      ...current,
      name: payload.name?.trim() || current.name,
      slug,
      categoryId: category.id,
      categorySlug: category.slug,
      image: payload.image === undefined ? current.image : payload.image || category.image,
      updatedAt: new Date().toISOString(),
    }

    const next = [...list]
    next[index] = updated
    MockDb.setSubcategories(next)

    if (slug !== current.slug || category.slug !== current.categorySlug) {
      MockDb.setProducts(
        MockDb.getProducts().map((product) =>
          product.subCategoryId === id
            ? { ...product, subCategorySlug: slug, categorySlug: category.slug }
            : product,
        ),
      )
    }

    return updated
  },

  async deleteSubcategory(id: string): Promise<void> {
    requireAdmin()
    const list = MockDb.getSubcategories()
    if (!list.some((s) => s.id === id)) throw new MockApiError(404, 'Not found')

    // A product survives as long as it still belongs to another subcategory.
    const remaining = MockDb.getProducts().flatMap((product) => {
      const ids = storedSubCategoryIds(product).filter((subId) => subId !== id)
      if (ids.length === 0) return []
      if (ids.length === storedSubCategoryIds(product).length) return [product]

      const main = list.find((sub) => sub.id === ids[0])
      return [
        {
          ...product,
          subCategoryIds: ids,
          subCategoryId: main?.id ?? ids[0],
          subCategorySlug: main?.slug ?? product.subCategorySlug,
          categorySlug: main?.categorySlug ?? product.categorySlug,
        },
      ]
    })

    MockDb.setProducts(remaining)
    MockDb.setSubcategories(list.filter((s) => s.id !== id))
  },

  async uploadFiles(files: File[]): Promise<UploadedMedia[]> {
    requireAdmin()
    const uploaded: UploadedMedia[] = []
    for (const file of files) {
      const url = await fileToDataUrl(file)
      const type = file.type.startsWith('video/') ? 'video' : 'image'
      uploaded.push({ url, type, name: file.name, size: file.size })
    }
    return uploaded
  },

  async getUsers(): Promise<AdminUser[]> {
    requireAdmin()
    return MockDb.getUsers()
      .map(({ user }) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        discountPercent: user.discountPercent,
        discountLabel: user.discountLabel,
        createdAt: user.createdAt,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async setUserDiscount(
    id: string,
    payload: { discountPercent: number | null; discountLabel?: string | null },
  ): Promise<AdminUser> {
    requireAdmin()
    const percent = payload.discountPercent
    const updated = MockDb.updateUser(id, {
      discountPercent: percent,
      discountLabel: percent && percent > 0 ? payload.discountLabel ?? null : null,
    })
    if (!updated) throw new MockApiError(404, 'Not found')
    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      discountPercent: updated.discountPercent,
      discountLabel: updated.discountLabel,
      createdAt: updated.createdAt,
    }
  },

  async getOrders(params?: { id?: string }): Promise<AdminOrder[]> {
    requireAdmin()
    const q = params?.id?.trim().toLowerCase()
    const orders = MockDb.getAllOrders()
      .filter((order) => {
        if (!q) return true
        return order.id.toLowerCase().includes(q)
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return orders.map((order) => {
      const user =
        order.userId && order.userId !== 'guest'
          ? MockDb.findUserById(order.userId)?.user
          : undefined
      return {
        ...order,
        customer: user
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
            }
          : null,
      }
    })
  },

  async updateOrder(id: string, payload: AdminOrderUpdatePayload): Promise<AdminOrder> {
    requireAdmin()
    if (payload.status === undefined && payload.paymentStatus === undefined) {
      throw new MockApiError(400, 'Invalid payload')
    }
    const updated = MockDb.updateOrder(id, payload)
    if (!updated) throw new MockApiError(404, 'Not found')

    const user =
      updated.userId && updated.userId !== 'guest'
        ? MockDb.findUserById(updated.userId)?.user
        : undefined

    return {
      ...updated,
      customer: user
        ? {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
          }
        : null,
    }
  },

  async getReviews(): Promise<StoreReview[]> {
    requireAdmin()
    return [...MockDb.getReviews()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  async deleteReview(id: string): Promise<void> {
    requireAdmin()
    if (!MockDb.removeReview(id)) {
      throw new MockApiError(404, 'Not found')
    }
  },
}
