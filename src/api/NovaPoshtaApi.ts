import type {
  NovaPoshtaCitySearchResponse,
  NovaPoshtaWarehouseSearchResponse,
} from '@/types'
import { api } from './client'

export const NovaPoshtaApi = {
  async searchCities(query: string, limit = 20): Promise<NovaPoshtaCitySearchResponse> {
    const { data } = await api.get<NovaPoshtaCitySearchResponse>('/nova-poshta/cities', {
      params: { q: query, limit },
    })
    return data
  },

  async searchWarehouses(
    cityRef: string,
    query = '',
    limit = 30,
  ): Promise<NovaPoshtaWarehouseSearchResponse> {
    const { data } = await api.get<NovaPoshtaWarehouseSearchResponse>('/nova-poshta/warehouses', {
      params: { cityRef, q: query || undefined, limit },
    })
    return data
  },
}
