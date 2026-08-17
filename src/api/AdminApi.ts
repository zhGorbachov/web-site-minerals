import type { Order, OrderStatus, PaymentStatus, Product, SubCategory, User } from '@/types'
import { api, mediaUrl, withMediaUrls } from './client'

export type AdminOrderCustomer = {
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

export type AdminOrder = Order & {
  customer?: AdminOrderCustomer | null
}

export type AdminOrderUpdatePayload = {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
}

function withOrderMedia(order: AdminOrder): AdminOrder {
  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      productImage: item.productImage ? mediaUrl(item.productImage) : item.productImage,
    })),
  }
}

export type AdminProductPayload = {
  name: string
  slug?: string
  sku?: string
  shortDescription?: string
  description: string
  price: number
  discountPrice?: number | null
  stock: number
  images: string[]
  video?: string | null
  attributes?: Record<string, unknown>
  featured?: boolean
  popular?: boolean
  isNew?: boolean
  subCategoryId: string
}

export type AdminSubcategoryPayload = {
  name: string
  slug?: string
  categoryId: string
  image?: string
}

export type UploadedMedia = {
  url: string
  type: 'image' | 'video'
  name: string
  size: number
}

export type AdminUser = Pick<
  User,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'role'
  | 'discountPercent'
  | 'discountLabel'
  | 'createdAt'
>

export const AdminApi = {
  async getProducts() {
    const { data } = await api.get<Product[]>('/admin/products')
    return data.map((p) => withMediaUrls(p))
  },

  async createProduct(payload: AdminProductPayload) {
    const { data } = await api.post<Product>('/admin/products', payload)
    return withMediaUrls(data)
  },

  async updateProduct(id: string, payload: Partial<AdminProductPayload>) {
    const { data } = await api.patch<Product>(`/admin/products/${id}`, payload)
    return withMediaUrls(data)
  },

  async updateStock(id: string, stock: number) {
    const { data } = await api.patch<Product>(`/admin/products/${id}/stock`, { stock })
    return withMediaUrls(data)
  },

  async deleteProduct(id: string) {
    await api.delete(`/admin/products/${id}`)
  },

  async createSubcategory(payload: AdminSubcategoryPayload) {
    const { data } = await api.post<SubCategory>('/admin/subcategories', payload)
    return withMediaUrls(data) as SubCategory
  },

  async updateSubcategory(id: string, payload: Partial<AdminSubcategoryPayload>) {
    const { data } = await api.patch<SubCategory>(`/admin/subcategories/${id}`, payload)
    return withMediaUrls(data) as SubCategory
  },

  async deleteSubcategory(id: string) {
    await api.delete(`/admin/subcategories/${id}`)
  },

  async uploadFiles(files: File[]) {
    const body = new FormData()
    files.forEach((file) => body.append('files', file))
    const { data } = await api.post<{ files: UploadedMedia[] }>('/admin/upload', body)
    return data.files
  },

  async getUsers() {
    const { data } = await api.get<AdminUser[]>('/admin/users')
    return data
  },

  async setUserDiscount(
    id: string,
    payload: { discountPercent: number | null; discountLabel?: string | null },
  ) {
    const { data } = await api.patch<AdminUser>(`/admin/users/${id}/discount`, payload)
    return data
  },

  async getOrders(params?: { id?: string }) {
    const { data } = await api.get<AdminOrder[]>('/admin/orders', {
      params: params?.id ? { id: params.id } : undefined,
    })
    return data.map(withOrderMedia)
  },

  async updateOrder(id: string, payload: AdminOrderUpdatePayload) {
    const { data } = await api.patch<AdminOrder>(`/admin/orders/${id}`, payload)
    return withOrderMedia(data)
  },
}
