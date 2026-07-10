import type { Product, SubCategory } from '@/types'
import { api, withMediaUrls } from './client'

export type AdminProductPayload = {
  name: string
  slug?: string
  sku: string
  shortDescription: string
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

export type UploadedMedia = {
  url: string
  type: 'image' | 'video'
  name: string
  size: number
}

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

  async createSubcategory(payload: {
    name: string
    slug?: string
    categoryId: string
    image?: string
  }) {
    const { data } = await api.post<SubCategory>('/admin/subcategories', payload)
    return withMediaUrls(data) as SubCategory
  },

  async uploadFiles(files: File[]) {
    const body = new FormData()
    files.forEach((file) => body.append('files', file))
    const { data } = await api.post<{ files: UploadedMedia[] }>('/admin/upload', body)
    return data.files
  },
}
