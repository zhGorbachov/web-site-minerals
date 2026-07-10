import { api } from './client'

export const WishlistApi = {
  async get() {
    const { data } = await api.get<{ productIds: string[] }>('/wishlist')
    return data.productIds
  },

  async add(productId: string) {
    const { data } = await api.post<{ productIds: string[] }>('/wishlist', { productId })
    return data.productIds
  },

  async remove(productId: string) {
    const { data } = await api.delete<{ productIds: string[] }>(`/wishlist/${productId}`)
    return data.productIds
  },

  async clear() {
    const { data } = await api.delete<{ productIds: string[] }>('/wishlist')
    return data.productIds
  },

  async merge(productIds: string[]) {
    const { data } = await api.post<{ productIds: string[] }>('/wishlist/merge', { productIds })
    return data.productIds
  },
}
