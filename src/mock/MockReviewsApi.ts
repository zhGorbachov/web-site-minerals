import type { CreateStoreReviewPayload, StoreReview, StoreReviewSort } from '@/types'
import type { ListReviewsParams } from '@/api/ReviewsApi'
import { getAuthToken } from '@/api/client'
import { MockApiError } from './MockApiError'
import { MockDb } from './MockDb'

function sortReviews(reviews: StoreReview[], sort: StoreReviewSort) {
  const next = [...reviews]
  if (sort === 'rating') {
    next.sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } else {
    next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  return next
}

export const MockReviewsApi = {
  async list(params?: ListReviewsParams): Promise<StoreReview[]> {
    const sort = params?.sort ?? 'date'
    const limit = params?.limit ?? 5
    return sortReviews(MockDb.getReviews(), sort).slice(0, limit)
  },

  async mine(): Promise<StoreReview | null> {
    const user = MockDb.resolveSession(getAuthToken())
    if (!user) throw new MockApiError(401, 'unauthorized')
    return MockDb.getReviews().find((review) => review.userId === user.id) ?? null
  },

  async create(payload: CreateStoreReviewPayload): Promise<StoreReview> {
    const rating = Math.trunc(payload.rating)
    const text = payload.text.trim()
    if (rating < 1 || rating > 5 || text.length < 10 || text.length > 1000) {
      throw new MockApiError(400, 'invalid_payload')
    }

    const user = MockDb.resolveSession(getAuthToken())

    if (user) {
      if (MockDb.getReviews().some((review) => review.userId === user.id)) {
        throw new MockApiError(409, 'already_reviewed')
      }

      if (MockDb.getOrders(user.id).length === 0) {
        throw new MockApiError(403, 'purchase_required')
      }

      const review: StoreReview = {
        id: `review-${Date.now()}`,
        userId: user.id,
        author: `${user.firstName} ${user.lastName.charAt(0)}.`.trim(),
        rating,
        text,
        createdAt: new Date().toISOString(),
      }

      MockDb.addReview(review)
      return review
    }

    const review: StoreReview = {
      id: `review-${Date.now()}`,
      userId: null,
      author: payload.language === 'en' ? 'Anonymous' : 'Анонім',
      rating,
      text,
      createdAt: new Date().toISOString(),
    }

    MockDb.addReview(review)
    return review
  },
}
