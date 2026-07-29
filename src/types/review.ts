export type StoreReviewSort = 'date' | 'rating'

export interface StoreReview {
  id: string
  userId: string | null
  author: string
  rating: number
  text: string
  createdAt: string
}

export type CreateStoreReviewPayload = {
  rating: number
  text: string
}
