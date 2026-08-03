import type { Order, CartItem, CreateOrderResult, OrderPaymentStatus } from '@/types'
import { api, mediaUrl, getAuthToken } from './client'

export type CreateOrderPayload = {
  paymentMethod?: string
  deliveryMethod?: string
  language?: 'uk' | 'en'
  /** Required for bank_transfer — full name of the payer as on the bank statement. */
  payerFullName?: string
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

  async create(payload?: CreateOrderPayload): Promise<CreateOrderResult> {
    const body: Record<string, unknown> = {
      paymentMethod: payload?.paymentMethod,
      deliveryMethod: payload?.deliveryMethod,
      language: payload?.language,
    }

    if (payload?.payerFullName?.trim()) {
      body.payerFullName = payload.payerFullName.trim()
    }

    if (!getAuthToken() && payload?.items?.length) {
      body.items = toGuestItems(payload.items)
    }

    const { data } = await api.post<CreateOrderResult>('/orders', body)
    const { payment, ...order } = data
    return {
      ...mapOrder(order),
      ...(payment ? { payment } : {}),
    }
  },

  async paymentStatus(orderId: string) {
    const { data } = await api.get<OrderPaymentStatus>(`/orders/${orderId}/payment-status`)
    return data
  },
}
