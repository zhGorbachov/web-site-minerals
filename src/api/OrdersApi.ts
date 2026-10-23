import type { Order, CartItem, CreateOrderResult } from '@/types'
import { api, mediaUrl, getAuthToken } from './client'

export type CreateOrderContact = {
  firstName: string
  lastName: string
  phone: string
  email?: string
}

export type CreateOrderPayload = {
  paymentMethod?: string
  deliveryMethod?: string
  language?: 'uk' | 'en'
  /** Required for bank_transfer — full name of the payer as on the bank statement. */
  payerFullName?: string
  /** Contact details collected on the checkout page, snapshotted onto the order. */
  contact?: CreateOrderContact
  /** Human-readable delivery summary (address / branch / postal index), snapshotted onto the order. */
  deliveryAddress?: string
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

    if (payload?.contact) {
      body.contact = payload.contact
    }

    if (payload?.deliveryAddress?.trim()) {
      body.deliveryAddress = payload.deliveryAddress.trim()
    }

    if (!getAuthToken() && payload?.items?.length) {
      body.items = toGuestItems(payload.items)
    }

    const { data } = await api.post<CreateOrderResult>('/orders', body)
    return mapOrder(data)
  },
}
