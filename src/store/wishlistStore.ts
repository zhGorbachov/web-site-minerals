import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WishlistApi } from '@/api'
import { getAuthToken } from '@/api/client'

interface WishlistState {
  productIds: string[]
  syncing: boolean
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  removeManyFromWishlist: (productIds: string[]) => Promise<void>
  toggleWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => Promise<void>
  pullFromServer: () => Promise<void>
  mergeGuestWishlistToServer: () => Promise<void>
}

function isLoggedIn() {
  return Boolean(getAuthToken())
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      syncing: false,

      addToWishlist: async (productId) => {
        if (isLoggedIn()) {
          try {
            const productIds = await WishlistApi.add(productId)
            set({ productIds })
            return
          } catch {
            // fall through
          }
        }

        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds
            : [...state.productIds, productId],
        }))
      },

      removeFromWishlist: async (productId) => {
        if (isLoggedIn()) {
          try {
            const productIds = await WishlistApi.remove(productId)
            set({ productIds })
            return
          } catch {
            // fall through
          }
        }

        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        }))
      },

      removeManyFromWishlist: async (ids) => {
        const uniqueIds = [...new Set(ids)]
        if (uniqueIds.length === 0) return

        if (isLoggedIn()) {
          try {
            let productIds = await WishlistApi.remove(uniqueIds[0])
            for (let i = 1; i < uniqueIds.length; i++) {
              productIds = await WishlistApi.remove(uniqueIds[i])
            }
            set({ productIds })
            return
          } catch {
            // fall through
          }
        }

        const idSet = new Set(uniqueIds)
        set((state) => ({
          productIds: state.productIds.filter((id) => !idSet.has(id)),
        }))
      },

      toggleWishlist: async (productId) => {
        if (get().isInWishlist(productId)) {
          await get().removeFromWishlist(productId)
        } else {
          await get().addToWishlist(productId)
        }
      },

      isInWishlist: (productId) => get().productIds.includes(productId),

      clearWishlist: async () => {
        if (isLoggedIn()) {
          try {
            const productIds = await WishlistApi.clear()
            set({ productIds })
            return
          } catch {
            // fall through
          }
        }
        set({ productIds: [] })
      },

      pullFromServer: async () => {
        if (!isLoggedIn()) return
        set({ syncing: true })
        try {
          const productIds = await WishlistApi.get()
          set({ productIds })
        } finally {
          set({ syncing: false })
        }
      },

      mergeGuestWishlistToServer: async () => {
        if (!isLoggedIn()) return
        const guestIds = get().productIds
        set({ syncing: true })
        try {
          if (guestIds.length) {
            const productIds = await WishlistApi.merge(guestIds)
            set({ productIds })
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
      version: 2,
    },
  ),
)
