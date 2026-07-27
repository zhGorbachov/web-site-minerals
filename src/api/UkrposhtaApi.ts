import type { UkrposhtaBranchSearchResponse, UkrposhtaCitySearchResponse } from '@/types'
import { api } from './client'

export const UkrposhtaApi = {
  async searchCities(query: string, limit = 20): Promise<UkrposhtaCitySearchResponse> {
    const { data } = await api.get<UkrposhtaCitySearchResponse>('/ukrposhta/cities', {
      params: { q: query, limit },
    })
    return data
  },

  async searchBranches(
    cityRef: string,
    query = '',
    limit = 30,
  ): Promise<UkrposhtaBranchSearchResponse> {
    const { data } = await api.get<UkrposhtaBranchSearchResponse>('/ukrposhta/branches', {
      params: { cityRef, q: query || undefined, limit },
    })
    return data
  },
}
