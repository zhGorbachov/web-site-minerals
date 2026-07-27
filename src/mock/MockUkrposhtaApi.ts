import type {
  UkrposhtaBranch,
  UkrposhtaBranchSearchResponse,
  UkrposhtaCity,
  UkrposhtaCitySearchResponse,
} from '@/types'
import { DEMO_UKRPOSHTA_BRANCHES, DEMO_UKRPOSHTA_CITIES } from './ukrposhtaData'

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('uk-UA')
}

function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const MockUkrposhtaApi = {
  async searchCities(query: string, limit = 20): Promise<UkrposhtaCitySearchResponse> {
    await delay()
    const q = normalize(query)
    if (q.length < 2) return { items: [] }

    const items: UkrposhtaCity[] = DEMO_UKRPOSHTA_CITIES.filter(
      (c) =>
        normalize(c.name).includes(q) ||
        normalize(c.present).includes(q) ||
        (c.area && normalize(c.area).includes(q)),
    ).slice(0, limit)

    return { items }
  },

  async searchBranches(
    cityRef: string,
    query = '',
    limit = 30,
  ): Promise<UkrposhtaBranchSearchResponse> {
    await delay()
    if (!cityRef) return { items: [] }

    const q = normalize(query)
    const items: UkrposhtaBranch[] = DEMO_UKRPOSHTA_BRANCHES.filter((b) => {
      if (b.cityRef !== cityRef) return false
      if (!q) return true
      return (
        b.number.includes(q) ||
        b.postalIndex.includes(q) ||
        normalize(b.name).includes(q) ||
        normalize(b.shortAddress).includes(q) ||
        normalize(`${b.cityName} - ${b.number}`).includes(q)
      )
    }).slice(0, limit)

    return { items }
  },
}
