import { getAuthToken } from '@/api/client'
import { MockApiError } from './MockApiError'
import { MockDb } from './MockDb'

function requireUserId() {
  const user = MockDb.resolveSession(getAuthToken())
  if (!user) throw new MockApiError(401, 'unauthorized')
  return user.id
}

export const MockWishlistApi = {
  async get(): Promise<string[]> {
    const userId = requireUserId()
    return [...MockDb.getWishlist(userId)]
  },

  async add(productId: string): Promise<string[]> {
    const userId = requireUserId()
    const ids = MockDb.getWishlist(userId)
    if (!ids.includes(productId)) {
      MockDb.setWishlist(userId, [...ids, productId])
    }
    return [...MockDb.getWishlist(userId)]
  },

  async remove(productId: string): Promise<string[]> {
    const userId = requireUserId()
    MockDb.setWishlist(
      userId,
      MockDb.getWishlist(userId).filter((id) => id !== productId),
    )
    return [...MockDb.getWishlist(userId)]
  },

  async clear(): Promise<string[]> {
    const userId = requireUserId()
    MockDb.setWishlist(userId, [])
    return []
  },

  async merge(productIds: string[]): Promise<string[]> {
    const userId = requireUserId()
    const merged = new Set([...MockDb.getWishlist(userId), ...productIds])
    const next = [...merged]
    MockDb.setWishlist(userId, next)
    return next
  },
}
