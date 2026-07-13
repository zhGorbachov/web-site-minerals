import type { Order, CartItem } from '@/types'
import { api, mediaUrl, getAuthToken } from './client'

export type CreateOrderPayload = {
  paymentMethod?: string
  deliveryMethod?: string
  items?: CartItem[]
}

function mapOrder(order: Order): Order {
  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      productImage: mediaUrl(item.productImage),
    })),
  }
}

function toGuestItems(items: CartItem[]) {
  return items.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    selectedOptions: item.selectedOptions,
  }))
}

export const OrdersApi = {
  async list() {
    const { data } = await api.get<Order[]>('/orders')
    return data.map(mapOrder)
  },

  async create(payload?: CreateOrderPayload) {
    const body: Record<string, unknown> = {
      paymentMethod: payload?.paymentMethod,
      deliveryMethod: payload?.deliveryMethod,
    }

    if (!getAuthToken() && payload?.items?.length) {
      body.items = toGuestItems(payload.items)
    }

    const { data } = await api.post<Order>('/orders', body)
    return mapOrder(data)
  },
}
