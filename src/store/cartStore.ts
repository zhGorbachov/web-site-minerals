import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/types'
import { CartApi } from '@/api'
import { getAuthToken } from '@/api/client'

interface CartState {
  items: CartItem[]
  syncing: boolean
  addItem: (product: Product, options?: Record<string, string>, quantity?: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: () => number
  totalPrice: () => number
  isInCart: (productId: string) => boolean
  getCartQuantity: (productId: string, options?: Record<string, string>) => number
  pullFromServer: () => Promise<void>
  mergeGuestCartToServer: () => Promise<void>
}

function optionsMatch(
  a: Record<string, string> | undefined,
  b: Record<string, string> | undefined,
) {
  return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {})
}

function isLoggedIn() {
  return Boolean(getAuthToken())
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      syncing: false,

      addItem: async (product, options, quantity = 1) => {
        if (isLoggedIn()) {
          try {
            const cart = await CartApi.addItem(product.id, quantity, options)
            set({ items: cart.items })
            return
          } catch {
            // fall through to local
          }
        }

        const existing = get().items.find(
          (item) =>
            item.product.id === product.id && optionsMatch(item.selectedOptions, options),
        )

        if (existing) {
          const nextQuantity = Math.min(existing.quantity + quantity, product.stock)
          if (nextQuantity === existing.quantity) return

          set((state) => ({
            items: state.items.map((item) =>
              item.id === existing.id ? { ...item, quantity: nextQuantity } : item,
            ),
          }))
        } else {
          const cappedQuantity = Math.min(quantity, product.stock)
          if (cappedQuantity <= 0) return

          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity: cappedQuantity,
            selectedOptions: options,
          }
          set((state) => ({ items: [...state.items, newItem] }))
        }
      },

      removeItem: async (itemId) => {
        if (isLoggedIn()) {
          try {
            const cart = await CartApi.removeItem(itemId)
            set({ items: cart.items })
            return
          } catch {
            // fall through
          }
        }

        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }))
      },

      updateQuantity: async (itemId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(itemId)
          return
        }

        if (isLoggedIn()) {
          try {
            const cart = await CartApi.updateItem(itemId, quantity)
            set({ items: cart.items })
            return
          } catch {
            // fall through
          }
        }

        const item = get().items.find((i) => i.id === itemId)
        if (!item) return

        const cappedQuantity = Math.min(quantity, item.product.stock)
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity: cappedQuantity } : i,
          ),
        }))
      },

      clearCart: async () => {
        if (isLoggedIn()) {
          try {
            const cart = await CartApi.clear()
            set({ items: cart.items })
            return
          } catch {
            // fall through
          }
        }
        set({ items: [] })
      },

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, item) => {
          const price = item.product.discountPrice ?? item.product.price
          return sum + price * item.quantity
        }, 0),

      isInCart: (productId) => get().items.some((item) => item.product.id === productId),

      getCartQuantity: (productId, options) => {
        const item = get().items.find(
          (i) => i.product.id === productId && optionsMatch(i.selectedOptions, options),
        )
        return item?.quantity ?? 0
      },

      pullFromServer: async () => {
        if (!isLoggedIn()) return
        set({ syncing: true })
        try {
          const cart = await CartApi.get()
          set({ items: cart.items })
        } finally {
          set({ syncing: false })
        }
      },

      mergeGuestCartToServer: async () => {
        if (!isLoggedIn()) return
        const guestItems = get().items
        set({ syncing: true })
        try {
          if (guestItems.length) {
            const cart = await CartApi.merge(
              guestItems.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
                selectedOptions: item.selectedOptions,
              })),
            )
            set({ items: cart.items })
          } else {
            await get().pullFromServer()
          }
        } finally {
          set({ syncing: false })
        }
      },
    }),
    {
      name: 'crystal-cart',
      version: 2,
    },
  ),
)
