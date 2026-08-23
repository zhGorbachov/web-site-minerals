import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/types'
import { CartApi } from '@/api'
import { getAuthToken } from '@/api/client'
import { calculateCartPricing, toPricingItems, type CartPricing } from '@/utils/pricing'
import { mergeHalfStrands } from '@/utils/strandMerge'
import { getAvailableStock } from '@/utils/productVariants'
import { useUIStore } from './uiStore'

interface CartState {
  items: CartItem[]
  syncing: boolean
  addItem: (product: Product, options?: Record<string, string>, quantity?: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  removeItems: (itemIds: string[]) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: () => number
  /** Final payable total after volume / personal discounts. */
  totalPrice: (personalDiscountPercent?: number | null) => number
  getPricing: (personalDiscountPercent?: number | null) => CartPricing
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

function notifyHalfStrandMerge(mergedPairs: number | undefined) {
  if (!mergedPairs || mergedPairs <= 0) return
  useUIStore.getState().pushToast({ kind: 'halfStrandsMerged', count: mergedPairs })
}

function applyLocalStrandMerge(items: CartItem[]): CartItem[] {
  const { items: merged, mergedPairs } = mergeHalfStrands(items)
  notifyHalfStrandMerge(mergedPairs)
  return merged
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
            notifyHalfStrandMerge(cart.halfStrandsMerged)
            return
          } catch {
            // fall through to local
          }
        }

        const existing = get().items.find(
          (item) =>
            item.product.id === product.id && optionsMatch(item.selectedOptions, options),
        )

        let nextItems: CartItem[]

        if (existing) {
          const nextQuantity = Math.min(
            existing.quantity + quantity,
            getAvailableStock(product, options),
          )
          if (nextQuantity === existing.quantity) return

          nextItems = get().items.map((item) =>
            item.id === existing.id ? { ...item, quantity: nextQuantity } : item,
          )
        } else {
          const cappedQuantity = Math.min(quantity, getAvailableStock(product, options))
          if (cappedQuantity <= 0) return

          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity: cappedQuantity,
            selectedOptions: options,
          }
          nextItems = [...get().items, newItem]
        }

        set({ items: applyLocalStrandMerge(nextItems) })
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

      removeItems: async (itemIds) => {
        const uniqueIds = [...new Set(itemIds)]
        if (uniqueIds.length === 0) return

        if (isLoggedIn()) {
          try {
            let cart = await CartApi.removeItem(uniqueIds[0])
            for (let i = 1; i < uniqueIds.length; i++) {
              cart = await CartApi.removeItem(uniqueIds[i])
            }
            set({ items: cart.items })
            return
          } catch {
            // fall through
          }
        }

        const idSet = new Set(uniqueIds)
        set((state) => ({
          items: state.items.filter((item) => !idSet.has(item.id)),
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
            notifyHalfStrandMerge(cart.halfStrandsMerged)
            return
          } catch {
            // fall through
          }
        }

        const item = get().items.find((i) => i.id === itemId)
        if (!item) return

        const cappedQuantity = Math.min(
          quantity,
          getAvailableStock(item.product, item.selectedOptions),
        )
        const nextItems = get().items.map((i) =>
          i.id === itemId ? { ...i, quantity: cappedQuantity } : i,
        )
        set({ items: applyLocalStrandMerge(nextItems) })
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

      getPricing: (personalDiscountPercent) =>
        calculateCartPricing(toPricingItems(get().items), personalDiscountPercent),

      totalPrice: (personalDiscountPercent) =>
        get().getPricing(personalDiscountPercent).total,

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
            notifyHalfStrandMerge(cart.halfStrandsMerged)
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
      version: 3,
      migrate: (persisted) => {
        const state = persisted as { items?: CartItem[]; syncing?: boolean }
        const items = Array.isArray(state.items) ? state.items : []
        const { items: merged } = mergeHalfStrands(items)
        return {
          items: merged,
          syncing: false,
        }
      },
    },
  ),
)
