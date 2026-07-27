import { Router } from 'express'
import { env } from '../lib/env.js'

export const ukrposhtaRouter = Router()

const UP_CLASSIFIER_URL = 'https://www.ukrposhta.ua/address-classifier-ws'

interface UpCity {
  ref: string
  name: string
  area?: string
  present: string
}

interface UpBranch {
  ref: string
  number: string
  name: string
  shortAddress: string
  cityRef: string
  cityName: string
  postalIndex: string
}

/** Demo settlements used when the live API is unavailable. */
const DEMO_CITIES: UpCity[] = [
  {
    ref: 'up-kyiv',
    name: 'Київ',
    area: 'Київська',
    present: 'м. Київ, Київська обл.',
  },
  {
    ref: 'up-kharkiv',
    name: 'Харків',
    area: 'Харківська',
    present: 'м. Харків, Харківська обл.',
  },
  {
    ref: 'up-odesa',
    name: 'Одеса',
    area: 'Одеська',
    present: 'м. Одеса, Одеська обл.',
  },
  {
    ref: 'up-dnipro',
    name: 'Дніпро',
    area: 'Дніпропетровська',
    present: 'м. Дніпро, Дніпропетровська обл.',
  },
  {
    ref: 'up-lviv',
    name: 'Львів',
    area: 'Львівська',
    present: 'м. Львів, Львівська обл.',
  },
  {
    ref: 'up-kropyvnytskyi',
    name: 'Кропивницький',
    area: 'Кіровоградська',
    present: 'м. Кропивницький, Кіровоградська обл.',
  },
]

const DEMO_BRANCHES: UpBranch[] = [
  {
    ref: 'up-kyiv-01001',
    number: '1',
    name: 'Відділення №1 (01001): вул. Хрещатик, 22',
    shortAddress: 'вул. Хрещатик, 22',
    cityRef: 'up-kyiv',
    cityName: 'Київ',
    postalIndex: '01001',
  },
  {
    ref: 'up-kyiv-03150',
    number: '15',
    name: 'Відділення №15 (03150): вул. Велика Васильківська, 72',
    shortAddress: 'вул. Велика Васильківська, 72',
    cityRef: 'up-kyiv',
    cityName: 'Київ',
    postalIndex: '03150',
  },
  {
    ref: 'up-kharkiv-61000',
    number: '1',
    name: 'Відділення №1 (61000): вул. Сумська, 37',
    shortAddress: 'вул. Сумська, 37',
    cityRef: 'up-kharkiv',
    cityName: 'Харків',
    postalIndex: '61000',
  },
  {
    ref: 'up-odesa-65000',
    number: '1',
    name: 'Відділення №1 (65000): вул. Дерибасівська, 12',
    shortAddress: 'вул. Дерибасівська, 12',
    cityRef: 'up-odesa',
    cityName: 'Одеса',
    postalIndex: '65000',
  },
  {
    ref: 'up-dnipro-49000',
    number: '2',
    name: 'Відділення №2 (49000): пр. Дмитра Яворницького, 62',
    shortAddress: 'пр. Дмитра Яворницького, 62',
    cityRef: 'up-dnipro',
    cityName: 'Дніпро',
    postalIndex: '49000',
  },
  {
    ref: 'up-lviv-79000',
    number: '1',
    name: 'Відділення №1 (79000): пл. Ринок, 1',
    shortAddress: 'пл. Ринок, 1',
    cityRef: 'up-lviv',
    cityName: 'Львів',
    postalIndex: '79000',
  },
  {
    ref: 'up-kropyvnytskyi-25000',
    number: '1',
    name: 'Відділення №1 (25000): вул. Велика Перспективна, 41',
    shortAddress: 'вул. Велика Перспективна, 41',
    cityRef: 'up-kropyvnytskyi',
    cityName: 'Кропивницький',
    postalIndex: '25000',
  },
  {
    ref: 'up-kropyvnytskyi-25006',
    number: '6',
    name: 'Відділення №6 (25006): вул. Соборна, 7А',
    shortAddress: 'вул. Соборна, 7А',
    cityRef: 'up-kropyvnytskyi',
    cityName: 'Кропивницький',
    postalIndex: '25006',
  },
]

function normalizeQuery(value: string) {
  return value.trim().toLocaleLowerCase('uk-UA')
}

function filterDemoCities(query: string, limit: number): UpCity[] {
  const q = normalizeQuery(query)
  if (!q) return []
  return DEMO_CITIES.filter(
    (c) =>
      normalizeQuery(c.name).includes(q) ||
      normalizeQuery(c.present).includes(q) ||
      (c.area && normalizeQuery(c.area).includes(q)),
  ).slice(0, limit)
}

function filterDemoBranches(cityRef: string, query: string, limit: number): UpBranch[] {
  const q = normalizeQuery(query)
  return DEMO_BRANCHES.filter((b) => {
    if (b.cityRef !== cityRef) return false
    if (!q) return true
    return (
      b.number.includes(q) ||
      b.postalIndex.includes(q) ||
      normalizeQuery(b.name).includes(q) ||
      normalizeQuery(b.shortAddress).includes(q) ||
      normalizeQuery(`${b.cityName} - ${b.number}`).includes(q)
    )
  }).slice(0, limit)
}

function asEntryList(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== 'object') return []
  const root = payload as Record<string, unknown>
  const entries = root.Entries ?? root.entries
  if (!entries || typeof entries !== 'object') return []
  const entry = (entries as Record<string, unknown>).Entry ?? (entries as Record<string, unknown>).entry
  if (!entry) return []
  return Array.isArray(entry) ? (entry as Record<string, unknown>[]) : [entry as Record<string, unknown>]
}

function pickString(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
  }
  return ''
}

async function callUkrposhtaClassifier(path: string, params: Record<string, string>) {
  if (!env.ukrposhtaBearerToken) return null

  const url = new URL(`${UP_CLASSIFIER_URL}/${path}`)
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value)
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.ukrposhtaBearerToken}`,
        Accept: 'application/json',
      },
    })
    if (!response.ok) return null
    return (await response.json()) as unknown
  } catch {
    return null
  }
}

async function searchCitiesLive(query: string, limit: number): Promise<UpCity[] | null> {
  const payload = await callUkrposhtaClassifier('get_city_by_region_id_and_district_id_and_city_ua', {
    city_ua: query,
  })
  if (!payload) return null

  const items = asEntryList(payload)
    .map((row) => {
      const ref = pickString(row, 'CITY_ID', 'city_id', 'ID', 'id')
      const name = pickString(row, 'CITY_UA', 'city_ua', 'CITY_NAME', 'city_name', 'CITYNAME')
      const type = pickString(row, 'CITYTYPE_UA', 'citytype_ua', 'CITYTYPE_SHORT', 'CITY_TYPE')
      const area = pickString(row, 'REGION_UA', 'region_ua', 'REGION_NAME', 'OLDCITYREGIONNAME')
      if (!ref || !name) return null
      const titled = type ? `${type}. ${name}` : name
      return {
        ref,
        name,
        area: area || undefined,
        present: area ? `${titled}, ${area} обл.` : titled,
      } satisfies UpCity
    })
    .filter((item): item is UpCity => Boolean(item))

  return items.length ? items.slice(0, limit) : null
}

async function searchBranchesLive(
  cityRef: string,
  query: string,
  limit: number,
): Promise<UpBranch[] | null> {
  const payload =
    (await callUkrposhtaClassifier('get_postoffices_by_city_id', {
      city_id: cityRef,
    })) ??
    (await callUkrposhtaClassifier('get_postoffices_by_postcode_cityid_cityvpzid', {
      city_id: cityRef,
    }))

  if (!payload) return null

  const q = normalizeQuery(query)
  const items = asEntryList(payload)
    .map((row) => {
      const lock = pickString(row, 'LOCK_CODE', 'lock_code')
      if (lock && lock !== '0') return null

      const postalIndex = pickString(row, 'POSTCODE', 'postcode', 'POSTINDEX', 'POST_INDEX', 'pi')
      const ref =
        pickString(row, 'ID', 'id', 'POSTOFFICE_ID', 'PO_ID') ||
        (postalIndex ? `up-${cityRef}-${postalIndex}` : '')
      const number = pickString(row, 'PO_SHORT', 'NUMBER', 'number', 'POSTOFFICE_NUMBER') || postalIndex
      const street = pickString(row, 'STREET_UA', 'street_ua', 'ADDRESS', 'address', 'PDCITY_UA')
      const cityName = pickString(row, 'CITY_UA', 'city_ua', 'CITY_NAME')
      if (!ref || !postalIndex) return null

      const shortAddress = street || `індекс ${postalIndex}`
      const name = number
        ? `Відділення №${number} (${postalIndex}): ${shortAddress}`
        : `Відділення (${postalIndex}): ${shortAddress}`

      const branch: UpBranch = {
        ref,
        number,
        name,
        shortAddress,
        cityRef,
        cityName,
        postalIndex,
      }

      if (!q) return branch
      const haystack = normalizeQuery(
        `${branch.number} ${branch.postalIndex} ${branch.name} ${branch.shortAddress} ${branch.cityName}`,
      )
      return haystack.includes(q) ? branch : null
    })
    .filter((item): item is UpBranch => Boolean(item))

  return items.length ? items.slice(0, limit) : null
}

ukrposhtaRouter.get('/cities', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  const limit = Math.min(Number(req.query.limit) || 20, 50)

  if (query.length < 2) {
    res.json({ items: [] })
    return
  }

  const live = await searchCitiesLive(query, limit)
  res.json({ items: live ?? filterDemoCities(query, limit) })
})

ukrposhtaRouter.get('/branches', async (req, res) => {
  const cityRef = typeof req.query.cityRef === 'string' ? req.query.cityRef.trim() : ''
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  const limit = Math.min(Number(req.query.limit) || 30, 50)

  if (!cityRef) {
    res.status(400).json({ error: 'cityRef is required' })
    return
  }

  const live = await searchBranchesLive(cityRef, query, limit)
  res.json({ items: live ?? filterDemoBranches(cityRef, query, limit) })
})
