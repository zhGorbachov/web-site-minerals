import type { WishlistItem } from '@/types'
import { api } from './client'

type WishlistResponse = {
  items: Array<{
    id: string
    productId: string
    selectedOptions?: Record<string, string> | null
  }>
}

function mapItems(data: WishlistResponse): WishlistItem[] {
  return data.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    selectedOptions: item.selectedOptions ?? undefined,
  }))
}

export const WishlistApi = {
  async get() {
    const { data } = await api.get<WishlistResponse>('/wishlist')
    return mapItems(data)
  },

  async add(productId: string, selectedOptions?: Record<string, string>) {
    const { data } = await api.post<WishlistResponse>('/wishlist', { productId, selectedOptions })
    return mapItems(data)
  },

  async remove(itemId: string) {
    const { data } = await api.delete<WishlistResponse>(`/wishlist/${itemId}`)
    return mapItems(data)
  },

  async clear() {
    const { data } = await api.delete<WishlistResponse>('/wishlist')
    return mapItems(data)
  },

  async merge(
    items: Array<{ productId: string; selectedOptions?: Record<string, string> }>,
  ) {
    const { data } = await api.post<WishlistResponse>('/wishlist/merge', { items })
    return mapItems(data)
  },
}
