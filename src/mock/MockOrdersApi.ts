import type { CartItem, CreateOrderResult, Order } from '@/types'
import type { CreateOrderPayload } from '@/api/OrdersApi'
import { getAuthToken } from '@/api/client'
import {
  calculateCartPricing,
  getDiscountedUnitPrice,
  isDiscountExcluded,
  toPricingItems,
} from '@/utils/pricing'
import {
  applyLinesStock,
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
    const change = applyLinesStock(
      product,
      related.map((item) => ({
        quantity: item.quantity,
        selectedOptions: item.selectedOptions,
      })),
    )
    return {
      ...product,
      stock: change.stock,
      variants: change.variants ?? product.variants,
      attributes: change.attributes ?? product.attributes,
    }
  })
  MockDb.setProducts(next)
}

const GUEST_USER_ID = 'guest'
const proofTokens = new Map<string, string>()

function newProofToken() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
}

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
      price: getDiscountedUnitPrice(
        product.categorySlug,
        unit,
        pricing,
        isDiscountExcluded(product, item.selectedOptions),
      ),
      selectedOptions: item.selectedOptions ?? null,
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
    contactFirstName: payload?.contact?.firstName ?? null,
    contactLastName: payload?.contact?.lastName ?? null,
    contactPhone: payload?.contact?.phone ?? null,
    contactEmail: payload?.contact?.email ?? null,
    deliveryAddress: payload?.deliveryAddress ?? null,
    paymentProofUrl: null,
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
      const paymentProofToken = newProofToken()
      proofTokens.set(order.id, paymentProofToken)
      return { ...order, paymentProofToken }
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
    const paymentProofToken = newProofToken()
    proofTokens.set(order.id, paymentProofToken)
    return { ...order, paymentProofToken }
  },

  async attachPaymentProof(orderId: string, file: File, token?: string) {
    const userId = resolveUserId()
    const existing = MockDb.getAllOrders().find((order) => order.id === orderId)
    if (!existing) throw new MockApiError(404, 'Not found')
    const owns = Boolean(userId && existing.userId === userId)
    const tokenOk = Boolean(token && proofTokens.get(orderId) === token)
    if (!owns && !tokenOk) throw new MockApiError(403, 'Forbidden')
    if (!file.type.startsWith('image/')) throw new MockApiError(400, 'Only an image is allowed')
    const updated = MockDb.updateOrder(orderId, { paymentProofUrl: URL.createObjectURL(file) })
    if (!updated) throw new MockApiError(404, 'Not found')
    return updated
  },
}
