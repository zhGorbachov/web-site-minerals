import type { Cart, Product } from '@/types'
import { getAuthToken } from '@/api/client'
import { mergeHalfStrands } from '@/utils/strandMerge'
import { getAvailableStock } from '@/utils/productVariants'
import { MockApiError } from './MockApiError'
import { enrichProduct, MockDb, type MockCart } from './MockDb'

function requireUserId() {
  const user = MockDb.resolveSession(getAuthToken())
  if (!user) throw new MockApiError(401, 'unauthorized')
  return user.id
}

function optionsMatch(
  a: Record<string, string> | undefined,
  b: Record<string, string> | undefined,
) {
  return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {})
}

function toCart(cart: MockCart, halfStrandsMerged?: number): Cart {
  return {
    id: cart.id,
    createdAt: cart.createdAt,
    halfStrandsMerged,
    items: cart.items.map((item) => ({
      ...item,
      product: enrichProduct(item.product),
    })),
  }
}

function findProduct(productId: string): Product {
  const product = MockDb.getProducts().find((p) => p.id === productId)
  if (!product) throw new MockApiError(404, 'product_not_found')
  return enrichProduct(product)
}

function applyStrandMerge(cart: MockCart): { cart: MockCart; mergedPairs: number } {
  const { items, mergedPairs } = mergeHalfStrands(cart.items)
  return {
    cart: { ...cart, items },
    mergedPairs,
  }
}

export const MockCartApi = {
  async get(): Promise<Cart> {
    const userId = requireUserId()
    return toCart(MockDb.getCart(userId))
  },

  async addItem(
    productId: string,
    quantity = 1,
    selectedOptions?: Record<string, string>,
  ): Promise<Cart> {
    const userId = requireUserId()
    const product = findProduct(productId)
    const cart = structuredClone(MockDb.getCart(userId))

    const existing = cart.items.find(
      (item) =>
        item.product.id === productId && optionsMatch(item.selectedOptions, selectedOptions),
    )

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + quantity,
        getAvailableStock(product, selectedOptions),
      )
      existing.product = product
    } else {
      const capped = Math.min(quantity, getAvailableStock(product, selectedOptions))
      if (capped > 0) {
        cart.items.push({
          id: `item-${productId}-${Date.now()}`,
          product,
          quantity: capped,
          selectedOptions,
        })
      }
    }

    const { cart: mergedCart, mergedPairs } = applyStrandMerge(cart)
    MockDb.setCart(userId, mergedCart)
    return toCart(mergedCart, mergedPairs || undefined)
  },

  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    const userId = requireUserId()
    const cart = structuredClone(MockDb.getCart(userId))
    const item = cart.items.find((i) => i.id === itemId)
    if (!item) throw new MockApiError(404, 'item_not_found')

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.id !== itemId)
      MockDb.setCart(userId, cart)
      return toCart(cart)
    }

    item.quantity = Math.min(
      quantity,
      getAvailableStock(item.product, item.selectedOptions),
    )
    const { cart: mergedCart, mergedPairs } = applyStrandMerge(cart)
    MockDb.setCart(userId, mergedCart)
    return toCart(mergedCart, mergedPairs || undefined)
  },

  async removeItem(itemId: string): Promise<Cart> {
    const userId = requireUserId()
    const cart = structuredClone(MockDb.getCart(userId))
    cart.items = cart.items.filter((i) => i.id !== itemId)
    MockDb.setCart(userId, cart)
    return toCart(cart)
  },

  async clear(): Promise<Cart> {
    const userId = requireUserId()
    const cart = MockDb.getCart(userId)
    const next = { ...cart, items: [] }
    MockDb.setCart(userId, next)
    return toCart(next)
  },

  async merge(
    items: Array<{
      productId: string
      quantity: number
      selectedOptions?: Record<string, string>
    }>,
  ): Promise<Cart> {
    const userId = requireUserId()
    const cart = structuredClone(MockDb.getCart(userId))

    for (const incoming of items) {
      const product = findProduct(incoming.productId)
      const existing = cart.items.find(
        (item) =>
          item.product.id === incoming.productId &&
          optionsMatch(item.selectedOptions, incoming.selectedOptions),
      )
      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + incoming.quantity,
          getAvailableStock(product, incoming.selectedOptions),
        )
        existing.product = product
      } else {
        const capped = Math.min(
          incoming.quantity,
          getAvailableStock(product, incoming.selectedOptions),
        )
        if (capped > 0) {
          cart.items.push({
            id: `item-${incoming.productId}-${Date.now()}`,
            product,
            quantity: capped,
            selectedOptions: incoming.selectedOptions,
          })
        }
      }
    }

    const { cart: mergedCart, mergedPairs } = applyStrandMerge(cart)
    MockDb.setCart(userId, mergedCart)
    return toCart(mergedCart, mergedPairs || undefined)
  },
}
