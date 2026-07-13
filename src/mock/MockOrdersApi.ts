import type { CartItem, Order } from '@/types'
import type { CreateOrderPayload } from '@/api/OrdersApi'
import { getAuthToken } from '@/api/client'
import { MockApiError } from './MockApiError'
import { enrichProduct, MockDb } from './MockDb'

const GUEST_USER_ID = 'guest'

function resolveUserId() {
  return MockDb.resolveSession(getAuthToken())?.id ?? null
}

function toCartItems(items: CreateOrderPayload['items']): CartItem[] {
  if (!items?.length) return []
  return items.map((item, index) => ({
    id: item.id || `guest-item-${index}`,
    product: item.product,
    quantity: item.quantity,
    selectedOptions: item.selectedOptions,
  }))
}

export const MockOrdersApi = {
  async list(): Promise<Order[]> {
    const userId = resolveUserId()
    if (!userId) throw new MockApiError(401, 'unauthorized')
    return [...MockDb.getOrders(userId)].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  async create(payload?: CreateOrderPayload): Promise<Order> {
    const userId = resolveUserId()
    let sourceItems: CartItem[]

    if (userId) {
      const cart = MockDb.getCart(userId)
      if (!cart.items.length) throw new MockApiError(400, 'Cart is empty')
      sourceItems = cart.items

      const orderId = `order-${Date.now()}`
      const items = sourceItems.map((item, index) => {
        const product = enrichProduct(item.product)
        const price = product.discountPrice ?? product.price
        return {
          id: `oi-${orderId}-${index}`,
          orderId,
          productId: product.id,
          productName: product.name,
          productImage: product.images[0] ?? '',
          quantity: item.quantity,
          price,
        }
      })

      const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const order: Order = {
        id: orderId,
        userId,
        status: 'pending',
        totalPrice,
        paymentMethod: payload?.paymentMethod ?? 'cod',
        deliveryMethod: payload?.deliveryMethod ?? 'nova_poshta',
        createdAt: new Date().toISOString(),
        items,
      }

      MockDb.setOrders(userId, [order, ...MockDb.getOrders(userId)])
      MockDb.setCart(userId, { ...cart, items: [] })
      return order
    }

    sourceItems = toCartItems(payload?.items)
    if (!sourceItems.length) throw new MockApiError(400, 'Cart is empty')

    const orderId = `order-${Date.now()}`
    const items = sourceItems.map((item, index) => {
      const product = enrichProduct(item.product)
      const price = product.discountPrice ?? product.price
      return {
        id: `oi-${orderId}-${index}`,
        orderId,
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] ?? '',
        quantity: item.quantity,
        price,
      }
    })

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const order: Order = {
      id: orderId,
      userId: GUEST_USER_ID,
      status: 'pending',
      totalPrice,
      paymentMethod: payload?.paymentMethod ?? 'cod',
      deliveryMethod: payload?.deliveryMethod ?? 'nova_poshta',
      createdAt: new Date().toISOString(),
      items,
    }

    MockDb.setOrders(GUEST_USER_ID, [order, ...MockDb.getOrders(GUEST_USER_ID)])
    return order
  },
}
