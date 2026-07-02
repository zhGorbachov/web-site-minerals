import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, options?: Record<string, string>, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
  isInCart: (productId: string) => boolean
  getCartQuantity: (productId: string, options?: Record<string, string>) => number
}

function optionsMatch(
  a: Record<string, string> | undefined,
  b: Record<string, string> | undefined,
) {
  return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {})
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, options, quantity = 1) => {
        const existing = get().items.find(
          (item) =>
            item.product.id === product.id &&
            optionsMatch(item.selectedOptions, options),
        )

        if (existing) {
          const nextQuantity = Math.min(existing.quantity + quantity, product.stock)
          if (nextQuantity === existing.quantity) return

          set((state) => ({
            items: state.items.map((item) =>
              item.id === existing.id
                ? { ...item, quantity: nextQuantity }
                : item,
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

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }))
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
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

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, item) => {
          const price = item.product.discountPrice ?? item.product.price
          return sum + price * item.quantity
        }, 0),

      isInCart: (productId) =>
        get().items.some((item) => item.product.id === productId),

      getCartQuantity: (productId, options) => {
        const item = get().items.find(
          (i) => i.product.id === productId && optionsMatch(i.selectedOptions, options),
        )
        return item?.quantity ?? 0
      },
    }),
    {
      name: 'crystal-cart',
      version: 1,
    },
  ),
)
