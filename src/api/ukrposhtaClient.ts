import type { UkrposhtaBranchSearchResponse, UkrposhtaCitySearchResponse } from '@/types'
import { isMockMode } from './client'
import { UkrposhtaApi as LiveUkrposhtaApi } from './UkrposhtaApi'
import { MockUkrposhtaApi } from '@/mock/MockUkrposhtaApi'

async function withMockFallback<T>(live: () => Promise<T>, mock: () => Promise<T>): Promise<T> {
  try {
    return await live()
  } catch (error) {
    if (isMockMode) return mock()
    throw error
  }
}

export const UkrposhtaApi = {
  searchCities(query: string, limit = 20): Promise<UkrposhtaCitySearchResponse> {
    return withMockFallback(
      () => LiveUkrposhtaApi.searchCities(query, limit),
      () => MockUkrposhtaApi.searchCities(query, limit),
    )
  },

  searchBranches(
    cityRef: string,
    query = '',
    limit = 30,
  ): Promise<UkrposhtaBranchSearchResponse> {
    return withMockFallback(
      () => LiveUkrposhtaApi.searchBranches(cityRef, query, limit),
      () => MockUkrposhtaApi.searchBranches(cityRef, query, limit),
    )
  },
}
