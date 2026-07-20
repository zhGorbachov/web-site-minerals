import type {
  NovaPoshtaCity,
  NovaPoshtaCitySearchResponse,
  NovaPoshtaWarehouse,
  NovaPoshtaWarehouseSearchResponse,
} from '@/types'
import { DEMO_NOVA_POSHTA_CITIES, DEMO_NOVA_POSHTA_WAREHOUSES } from './novaPoshtaData'

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('uk-UA')
}

function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const MockNovaPoshtaApi = {
  async searchCities(query: string, limit = 20): Promise<NovaPoshtaCitySearchResponse> {
    await delay()
    const q = normalize(query)
    if (q.length < 2) return { items: [] }

    const items: NovaPoshtaCity[] = DEMO_NOVA_POSHTA_CITIES.filter(
      (c) =>
        normalize(c.name).includes(q) ||
        normalize(c.present).includes(q) ||
        (c.area && normalize(c.area).includes(q)),
    ).slice(0, limit)

    return { items }
  },

  async searchWarehouses(
    cityRef: string,
    query = '',
    limit = 30,
  ): Promise<NovaPoshtaWarehouseSearchResponse> {
    await delay()
    if (!cityRef) return { items: [] }

    const q = normalize(query)
    const items: NovaPoshtaWarehouse[] = DEMO_NOVA_POSHTA_WAREHOUSES.filter((w) => {
      if (w.cityRef !== cityRef) return false
      if (!q) return true
      return (
        w.number.includes(q) ||
        normalize(w.name).includes(q) ||
        normalize(w.shortAddress).includes(q) ||
        normalize(`${w.cityName} - ${w.number}`).includes(q)
      )
    }).slice(0, limit)

    return { items }
  },
}
