import type { Product, ProductAttributes, SubCategory } from '@/types'
import type {
  AdminOrder,
  AdminOrderUpdatePayload,
  AdminProductPayload,
  AdminUser,
  UploadedMedia,
} from '@/api/AdminApi'
import { getAuthToken } from '@/api/client'
import { MockApiError } from './MockApiError'
import { enrichProduct, MockDb, slugify } from './MockDb'

function requireAdmin() {
  const user = MockDb.resolveSession(getAuthToken())
  if (!user) throw new MockApiError(401, 'unauthorized')
  if (user.role !== 'admin' && user.role !== 'manager') {
    throw new MockApiError(403, 'forbidden')
  }
  return user
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
    const sub = MockDb.getSubcategories().find((s) => s.id === payload.subCategoryId)
    if (!sub) throw new MockApiError(400, 'Invalid subcategory')

    const slug = payload.slug?.trim() || slugify(payload.name)
    if (MockDb.getProducts().some((p) => p.slug === slug)) {
      throw new MockApiError(409, 'slug_taken')
    }
    if (MockDb.getProducts().some((p) => p.sku === payload.sku)) {
      throw new MockApiError(409, 'sku_taken')
    }

    const now = new Date().toISOString()
    const product: Product = {
      id: `prod-${Date.now()}`,
      name: payload.name,
      slug,
      sku: payload.sku,
      shortDescription: payload.shortDescription,
      description: payload.description,
      price: payload.price,
      discountPrice: payload.discountPrice ?? undefined,
      stock: payload.stock,
      images: payload.images,
      video: payload.video ?? undefined,
      attributes: (payload.attributes ?? {}) as ProductAttributes,
      featured: payload.featured ?? false,
      popular: payload.popular ?? false,
      isNew: payload.isNew ?? true,
      subCategoryId: sub.id,
      subCategorySlug: sub.slug,
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

    if (payload.subCategoryId) {
      const sub = MockDb.getSubcategories().find((s) => s.id === payload.subCategoryId)
      if (!sub) throw new MockApiError(400, 'Invalid subcategory')
      subCategoryId = sub.id
      subCategorySlug = sub.slug
      categorySlug = sub.categorySlug
    }

    const slug = payload.slug?.trim() || current.slug
    if (products.some((p) => p.id !== id && p.slug === slug)) {
      throw new MockApiError(409, 'slug_taken')
    }
    if (payload.sku && products.some((p) => p.id !== id && p.sku === payload.sku)) {
      throw new MockApiError(409, 'sku_taken')
    }

    const updated: Product = {
      ...current,
      name: payload.name ?? current.name,
      slug,
      sku: payload.sku ?? current.sku,
      shortDescription: payload.shortDescription ?? current.shortDescription,
      description: payload.description ?? current.description,
      price: payload.price ?? current.price,
      discountPrice:
        payload.discountPrice === null
          ? undefined
          : (payload.discountPrice ?? current.discountPrice),
      stock: payload.stock ?? current.stock,
      images: payload.images ?? current.images,
      video:
        payload.video === null ? undefined : (payload.video ?? current.video),
      attributes: (payload.attributes as ProductAttributes | undefined) ?? current.attributes,
      featured: payload.featured ?? current.featured,
      popular: payload.popular ?? current.popular,
      isNew: payload.isNew ?? current.isNew,
      subCategoryId,
      subCategorySlug,
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

  async createSubcategory(payload: {
    name: string
    slug?: string
    categoryId: string
    image?: string
  }): Promise<SubCategory> {
    requireAdmin()
    const category = MockDb.getCategories().find((c) => c.id === payload.categoryId)
    if (!category) throw new MockApiError(400, 'Invalid category')

    const slug = payload.slug?.trim() || slugify(payload.name)
    if (MockDb.getSubcategories().some((s) => s.slug === slug)) {
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
}
