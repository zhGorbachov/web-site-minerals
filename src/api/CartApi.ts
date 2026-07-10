import type { Cart, Product } from '@/types'
import { api, withMediaUrls } from './client'

type CartResponse = {
  id: string
  items: Array<{
    id: string
    product: Product
    quantity: number
    selectedOptions?: Record<string, string>
  }>
  createdAt: string
}

function mapCart(cart: CartResponse): Cart {
  return {
    id: cart.id,
    createdAt: cart.createdAt,
    items: cart.items.map((item) => ({
      ...item,
      product: withMediaUrls(item.product),
    })),
  }
}

export const CartApi = {
  async get() {
    const { data } = await api.get<CartResponse>('/cart')
    return mapCart(data)
  },

  async addItem(productId: string, quantity = 1, selectedOptions?: Record<string, string>) {
    const { data } = await api.post<CartResponse>('/cart/items', {
      productId,
      quantity,
      selectedOptions,
    })
    return mapCart(data)
  },

  async updateItem(itemId: string, quantity: number) {
    const { data } = await api.patch<CartResponse>(`/cart/items/${itemId}`, { quantity })
    return mapCart(data)
  },

  async removeItem(itemId: string) {
    const { data } = await api.delete<CartResponse>(`/cart/items/${itemId}`)
    return mapCart(data)
  },

  async clear() {
    const { data } = await api.delete<CartResponse>('/cart')
    return mapCart(data)
  },

  async merge(
    items: Array<{
      productId: string
      quantity: number
      selectedOptions?: Record<string, string>
    }>,
  ) {
    const { data } = await api.post<CartResponse>('/cart/merge', { items })
    return mapCart(data)
  },
}
