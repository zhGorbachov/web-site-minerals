import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WishlistItem } from '@/types'
import { WishlistApi } from '@/api'
import { getAuthToken } from '@/api/client'
import { sameSelection } from '@/utils/productVariants'

interface WishlistState {
  items: WishlistItem[]
  syncing: boolean
  addToWishlist: (productId: string, selectedOptions?: Record<string, string>) => Promise<void>
  removeFromWishlist: (itemId: string) => Promise<void>
  removeManyFromWishlist: (itemIds: string[]) => Promise<void>
  toggleWishlist: (productId: string, selectedOptions?: Record<string, string>) => Promise<void>
  isInWishlist: (productId: string, selectedOptions?: Record<string, string>) => boolean
  clearWishlist: () => Promise<void>
  pullFromServer: () => Promise<void>
  mergeGuestWishlistToServer: () => Promise<void>
}

function isLoggedIn() {
  return Boolean(getAuthToken())
}

function findItem(
  items: WishlistItem[],
  productId: string,
  selectedOptions?: Record<string, string>,
) {
  return items.find(
    (item) => item.productId === productId && sameSelection(item.selectedOptions, selectedOptions),
  )
}

function withOptions(selectedOptions?: Record<string, string>) {
  if (!selectedOptions || Object.keys(selectedOptions).length === 0) return undefined
  return selectedOptions
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      syncing: false,

      addToWishlist: async (productId, selectedOptions) => {
        const options = withOptions(selectedOptions)

        if (isLoggedIn()) {
          try {
            const items = await WishlistApi.add(productId, options)
            set({ items })
            return
          } catch {
            // fall through
          }
        }

        set((state) => {
          if (findItem(state.items, productId, options)) return state
          return {
            items: [
              ...state.items,
              {
                id: `wish-${productId}-${Date.now()}`,
                productId,
                selectedOptions: options,
              },
            ],
          }
        })
      },

      removeFromWishlist: async (itemId) => {
        if (isLoggedIn()) {
          try {
            const items = await WishlistApi.remove(itemId)
            set({ items })
            return
          } catch {
            // fall through
          }
        }

        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }))
      },

      removeManyFromWishlist: async (ids) => {
        const uniqueIds = [...new Set(ids)]
        if (uniqueIds.length === 0) return

        if (isLoggedIn()) {
          try {
            let items = await WishlistApi.remove(uniqueIds[0])
            for (let i = 1; i < uniqueIds.length; i++) {
              items = await WishlistApi.remove(uniqueIds[i])
            }
            set({ items })
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

      toggleWishlist: async (productId, selectedOptions) => {
        const options = withOptions(selectedOptions)
        const existing = findItem(get().items, productId, options)
        if (existing) {
          await get().removeFromWishlist(existing.id)
        } else {
          await get().addToWishlist(productId, options)
        }
      },

      isInWishlist: (productId, selectedOptions) =>
        Boolean(findItem(get().items, productId, withOptions(selectedOptions))),

      clearWishlist: async () => {
        if (isLoggedIn()) {
          try {
            const items = await WishlistApi.clear()
            set({ items })
            return
          } catch {
            // fall through
          }
        }
        set({ items: [] })
      },

      pullFromServer: async () => {
        if (!isLoggedIn()) return
        set({ syncing: true })
        try {
          const items = await WishlistApi.get()
          set({ items })
        } finally {
          set({ syncing: false })
        }
      },

      mergeGuestWishlistToServer: async () => {
        if (!isLoggedIn()) return
        const guestItems = get().items
        set({ syncing: true })
        try {
          if (guestItems.length) {
            const items = await WishlistApi.merge(
              guestItems.map((item) => ({
                productId: item.productId,
                selectedOptions: item.selectedOptions,
              })),
            )
            set({ items })
          } else {
            await get().pullFromServer()
          }
        } finally {
          set({ syncing: false })
        }
      },
    }),
    {
      name: 'crystal-wishlist',
      version: 3,
      migrate: (persisted, version) => {
        const state = persisted as {
          productIds?: string[]
          items?: WishlistItem[]
        }
        if (version < 3) {
          const productIds = Array.isArray(state.productIds) ? state.productIds : []
          return {
            items: productIds.map((productId) => ({
              id: `wish-${productId}`,
              productId,
            })),
            syncing: false,
          }
        }
        return {
          items: Array.isArray(state.items) ? state.items : [],
          syncing: false,
        }
      },
    },
  ),
)
