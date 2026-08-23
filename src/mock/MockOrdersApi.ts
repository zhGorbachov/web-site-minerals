import type { CartItem, CreateOrderResult, Order } from '@/types'
import type { CreateOrderPayload } from '@/api/OrdersApi'
import { getAuthToken } from '@/api/client'
import {
  calculateCartPricing,
  getDiscountedUnitPrice,
  toPricingItems,
} from '@/utils/pricing'
import {
  applyVariantStockChange,
  getCartUnitPrice,
  getSelectedVariant,
  getVariantDisplayName,
} from '@/utils/productVariants'
import { MockApiError } from './MockApiError'
import { enrichProduct, MockDb } from './MockDb'

function applyOrderStock(items: CartItem[]) {
  const products = MockDb.getProducts()
  const next = products.map((product) => {
    const related = items.filter((item) => item.product.id === product.id)
    if (!related.length) return product
    let updated = product
    for (const item of related) {
      const change = applyVariantStockChange(updated, item.selectedOptions, item.quantity)
      updated = {
        ...updated,
        stock: change.stock,
        variants: change.variants ?? updated.variants,
      }
    }
    return updated
  })
  MockDb.setProducts(next)
}

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

function buildOrder(
  orderId: string,
  userId: string | null,
  sourceItems: CartItem[],
  payload?: CreateOrderPayload,
  personalDiscountPercent?: number | null,
): Order {
  const pricing = calculateCartPricing(toPricingItems(sourceItems), personalDiscountPercent)

  const items = sourceItems.map((item, index) => {
    const product = enrichProduct(item.product)
    const variant = getSelectedVariant(product, item.selectedOptions)
    const unit = getCartUnitPrice(product, item.selectedOptions)
    return {
      id: `oi-${orderId}-${index}`,
      orderId,
      productId: product.id,
      productName: getVariantDisplayName(product, variant),
      productImage: variant?.image ?? product.images[0] ?? '',
      quantity: item.quantity,
      price: getDiscountedUnitPrice(product.categorySlug, unit, pricing),
    }
  })

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const paymentMethod =
    payload?.paymentMethod === 'cod' ? 'pickup' : (payload?.paymentMethod ?? 'pickup')

  return {
    id: orderId,
    userId,
    status: 'pending',
    paymentStatus: 'unpaid',
    totalPrice,
    paymentMethod,
    deliveryMethod: payload?.deliveryMethod ?? 'nova_poshta',
    payerFullName:
      paymentMethod === 'bank_transfer' ? payload?.payerFullName?.trim() || null : null,
    createdAt: new Date().toISOString(),
    items,
  }
}

export const MockOrdersApi = {
  async list(): Promise<Order[]> {
    const userId = resolveUserId()
    if (!userId) throw new MockApiError(401, 'unauthorized')
    return [...MockDb.getOrders(userId)].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  async create(payload?: CreateOrderPayload): Promise<CreateOrderResult> {
    const userId = resolveUserId()
    let sourceItems: CartItem[]

    if (userId) {
      const cart = MockDb.getCart(userId)
      if (!cart.items.length) throw new MockApiError(400, 'Cart is empty')
      sourceItems = cart.items
      const user = MockDb.findUserById(userId)?.user

      const orderId = `order-${Date.now()}`
      const order = buildOrder(
        orderId,
        userId,
        sourceItems,
        payload,
        user?.discountPercent,
      )
      try {
        applyOrderStock(sourceItems)
      } catch {
        throw new MockApiError(400, 'Insufficient stock')
      }
      MockDb.setOrders(userId, [order, ...MockDb.getOrders(userId)])
      MockDb.setCart(userId, { ...cart, items: [] })
      return order
    }

    sourceItems = toCartItems(payload?.items)
    if (!sourceItems.length) throw new MockApiError(400, 'Cart is empty')

    const orderId = `order-${Date.now()}`
    const order = buildOrder(orderId, GUEST_USER_ID, sourceItems, payload)
    try {
      applyOrderStock(sourceItems)
    } catch {
      throw new MockApiError(400, 'Insufficient stock')
    }
    MockDb.setOrders(GUEST_USER_ID, [order, ...MockDb.getOrders(GUEST_USER_ID)])
    return order
  },
}
