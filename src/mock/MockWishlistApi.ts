import { getAuthToken } from '@/api/client'
import type { WishlistItem } from '@/types'
import { sameSelection } from '@/utils/productVariants'
import { MockApiError } from './MockApiError'
import { MockDb } from './MockDb'

function requireUserId() {
  const user = MockDb.resolveSession(getAuthToken())
  if (!user) throw new MockApiError(401, 'unauthorized')
  return user.id
}

function toItems(): WishlistItem[] {
  return MockDb.getWishlist(requireUserId()).map((item) => ({
    id: item.id,
    productId: item.productId,
    selectedOptions: item.selectedOptions,
  }))
}

export const MockWishlistApi = {
  async get(): Promise<WishlistItem[]> {
    return toItems()
  },

  async add(productId: string, selectedOptions?: Record<string, string>): Promise<WishlistItem[]> {
    const userId = requireUserId()
    const items = MockDb.getWishlist(userId)
    if (!items.some((item) => item.productId === productId && sameSelection(item.selectedOptions, selectedOptions))) {
      MockDb.setWishlist(userId, [
        ...items,
        {
          id: `wish-${productId}-${Date.now()}`,
          productId,
          selectedOptions,
        },
      ])
    }
    return toItems()
  },

  async remove(itemId: string): Promise<WishlistItem[]> {
    const userId = requireUserId()
    MockDb.setWishlist(
      userId,
      MockDb.getWishlist(userId).filter((item) => item.id !== itemId),
    )
    return toItems()
  },

  async clear(): Promise<WishlistItem[]> {
    const userId = requireUserId()
    MockDb.setWishlist(userId, [])
    return []
  },

  async merge(
    entries: Array<{ productId: string; selectedOptions?: Record<string, string> }>,
  ): Promise<WishlistItem[]> {
    const userId = requireUserId()
    const items = [...MockDb.getWishlist(userId)]
    entries.forEach((entry, index) => {
      const exists = items.some(
        (item) => item.productId === entry.productId && sameSelection(item.selectedOptions, entry.selectedOptions),
      )
      if (exists) return
      items.push({
        id: `wish-${entry.productId}-${Date.now()}-${index}`,
        productId: entry.productId,
        selectedOptions: entry.selectedOptions,
      })
    })
    MockDb.setWishlist(userId, items)
    return toItems()
  },
}
