import type {
  NovaPoshtaCitySearchResponse,
  NovaPoshtaWarehouseSearchResponse,
} from '@/types'
import { isMockMode } from './client'
import { NovaPoshtaApi as LiveNovaPoshtaApi } from './NovaPoshtaApi'
import { MockNovaPoshtaApi } from '@/mock/MockNovaPoshtaApi'

/**
 * Prefer the live server proxy (uses NOVA_POSHTA_API_KEY).
 * In mock mode, fall back to demo data if the API server is down.
 */
async function withMockFallback<T>(live: () => Promise<T>, mock: () => Promise<T>): Promise<T> {
  try {
    return await live()
  } catch (error) {
    if (isMockMode) return mock()
    throw error
  }
}

export const NovaPoshtaApi = {
  searchCities(query: string, limit = 20): Promise<NovaPoshtaCitySearchResponse> {
    return withMockFallback(
      () => LiveNovaPoshtaApi.searchCities(query, limit),
      () => MockNovaPoshtaApi.searchCities(query, limit),
    )
  },

  searchWarehouses(
    cityRef: string,
    query = '',
    limit = 30,
  ): Promise<NovaPoshtaWarehouseSearchResponse> {
    return withMockFallback(
      () => LiveNovaPoshtaApi.searchWarehouses(cityRef, query, limit),
      () => MockNovaPoshtaApi.searchWarehouses(cityRef, query, limit),
    )
  },
}
