import type { CreateStoreReviewPayload, StoreReview, StoreReviewSort } from '@/types'
import { api } from './client'

export type ListReviewsParams = {
  limit?: number
  sort?: StoreReviewSort
}

export const ReviewsApi = {
  async list(params?: ListReviewsParams) {
    const { data } = await api.get<StoreReview[]>('/reviews', {
      params: {
        limit: params?.limit ?? 5,
        sort: params?.sort ?? 'date',
      },
    })
    return data
  },

  async mine() {
    const { data } = await api.get<{ review: StoreReview | null }>('/reviews/mine')
    return data.review
  },

  async create(payload: CreateStoreReviewPayload) {
    const { data } = await api.post<StoreReview>('/reviews', payload)
    return data
  },
}
