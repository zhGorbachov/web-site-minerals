import { Router } from 'express'
import { env } from '../lib/env.js'

export const novaPoshtaRouter = Router()

const NP_API_URL = 'https://api.novaposhta.ua/v2.0/json/'

interface NpCity {
  ref: string
  name: string
  area?: string
  present: string
}

interface NpWarehouse {
  ref: string
  number: string
  name: string
  shortAddress: string
  cityRef: string
  cityName: string
}

/** Demo settlements used when the live API is unavailable. */
const DEMO_CITIES: NpCity[] = [
  {
    ref: '8d5a980d-391c-11dd-90d9-001a92567626',
    name: 'Київ',
    area: 'Київська',
    present: 'м. Київ, Київська обл.',
  },
  {
    ref: 'db5c88e0-391c-11dd-90d9-001a92567626',
    name: 'Харків',
    area: 'Харківська',
    present: 'м. Харків, Харківська обл.',
  },
  {
    ref: 'db5c88f0-391c-11dd-90d9-001a92567626',
    name: 'Одеса',
    area: 'Одеська',
    present: 'м. Одеса, Одеська обл.',
  },
  {
    ref: 'db5c88de-391c-11dd-90d9-001a92567626',
    name: 'Дніпро',
    area: 'Дніпропетровська',
    present: 'м. Дніпро, Дніпропетровська обл.',
  },
  {
    ref: 'db5c88e5-391c-11dd-90d9-001a92567626',
    name: 'Львів',
    area: 'Львівська',
    present: 'м. Львів, Львівська обл.',
  },
  {
    ref: 'db5c8904-391c-11dd-90d9-001a92567626',
    name: 'Кропивницький',
    area: 'Кіровоградська',
    present: 'м. Кропивницький, Кіровоградська обл.',
  },
  {
    ref: 'demo-selo-kyivske',
    name: 'Київське',
    area: 'Одеська',
    present: 'с. Київське, Одеська обл.',
  },
]

const DEMO_WAREHOUSES: NpWarehouse[] = [
  {
    ref: 'kyiv-1',
    number: '1',
    name: 'Відділення №1: вул. Пирогівський шлях, 135',
    shortAddress: 'вул. Пирогівський шлях, 135',
    cityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
    cityName: 'Київ',
  },
  {
    ref: 'kyiv-137',
    number: '137',
    name: 'Відділення №137: вул. Велика Васильківська, 100',
    shortAddress: 'вул. Велика Васильківська, 100',
    cityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
    cityName: 'Київ',
  },
  {
    ref: 'kyiv-2',
    number: '2',
    name: 'Відділення №2: вул. Бориспільська, 9',
    shortAddress: 'вул. Бориспільська, 9',
    cityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
    cityName: 'Київ',
  },
  {
    ref: 'kharkiv-1',
    number: '1',
    name: 'Відділення №1: вул. Сумська, 45',
    shortAddress: 'вул. Сумська, 45',
    cityRef: 'db5c88e0-391c-11dd-90d9-001a92567626',
    cityName: 'Харків',
  },
  {
    ref: 'odesa-1',
    number: '1',
    name: 'Відділення №1: вул. Дерибасівська, 1',
    shortAddress: 'вул. Дерибасівська, 1',
    cityRef: 'db5c88f0-391c-11dd-90d9-001a92567626',
    cityName: 'Одеса',
  },
  {
    ref: 'dnipro-5',
    number: '5',
    name: 'Відділення №5: пр. Дмитра Яворницького, 50',
    shortAddress: 'пр. Дмитра Яворницького, 50',
    cityRef: 'db5c88de-391c-11dd-90d9-001a92567626',
    cityName: 'Дніпро',
  },
  {
    ref: 'lviv-3',
    number: '3',
    name: 'Відділення №3: вул. Городоцька, 174',
    shortAddress: 'вул. Городоцька, 174',
    cityRef: 'db5c88e5-391c-11dd-90d9-001a92567626',
    cityName: 'Львів',
  },
  {
    ref: 'kropyvnytskyi-1',
    number: '1',
    name: 'Відділення №1: вул. Велика Перспективна, 1',
    shortAddress: 'вул. Велика Перспективна, 1',
    cityRef: 'db5c8904-391c-11dd-90d9-001a92567626',
    cityName: 'Кропивницький',
  },
  {
    ref: 'kropyvnytskyi-4',
    number: '4',
    name: 'Відділення №4: вул. Соборна, 15',
    shortAddress: 'вул. Соборна, 15',
    cityRef: 'db5c8904-391c-11dd-90d9-001a92567626',
    cityName: 'Кропивницький',
  },
  {
    ref: 'selo-kyivske-1',
    number: '1',
    name: 'Відділення №1: вул. Центральна, 10',
    shortAddress: 'вул. Центральна, 10',
    cityRef: 'demo-selo-kyivske',
    cityName: 'Київське',
  },
]

function normalizeQuery(value: string) {
  return value.trim().toLocaleLowerCase('uk-UA')
}

function filterDemoCities(query: string, limit: number): NpCity[] {
  const q = normalizeQuery(query)
  if (!q) return []
  return DEMO_CITIES.filter(
    (c) =>
      normalizeQuery(c.name).includes(q) ||
      normalizeQuery(c.present).includes(q) ||
      (c.area && normalizeQuery(c.area).includes(q)),
  ).slice(0, limit)
}

function filterDemoWarehouses(cityRef: string, query: string, limit: number): NpWarehouse[] {
  const q = normalizeQuery(query)
  return DEMO_WAREHOUSES.filter((w) => {
    if (w.cityRef !== cityRef) return false
    if (!q) return true
    return (
      w.number.includes(q) ||
      normalizeQuery(w.name).includes(q) ||
      normalizeQuery(w.shortAddress).includes(q) ||
      normalizeQuery(`${w.cityName} - ${w.number}`).includes(q)
    )
  }).slice(0, limit)
}

interface NpApiResponse<T> {
  success: boolean
  data?: T
  errors?: string[]
}

async function callNovaPoshta<T>(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, string>,
): Promise<T | null> {
  try {
    const response = await fetch(NP_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: env.novaPoshtaApiKey,
        modelName,
        calledMethod,
        methodProperties,
      }),
    })
    if (!response.ok) return null
    const json = (await response.json()) as NpApiResponse<T>
    if (!json.success || !json.data) return null
    return json.data
  } catch {
    return null
  }
}

interface SettlementAddress {
  Present?: string
  MainDescription?: string
  Area?: string
  DeliveryCity?: string
  Ref?: string
}

interface SettlementItem {
  Addresses?: SettlementAddress[]
  TotalCount?: number
}

interface CityItem {
  Ref?: string
  Description?: string
  AreaDescription?: string
}

interface WarehouseItem {
  Ref?: string
  Number?: string
  Description?: string
  ShortAddress?: string
  CityRef?: string
  CityDescription?: string
}

async function searchCitiesLive(query: string, limit: number): Promise<NpCity[] | null> {
  const settlements = await callNovaPoshta<SettlementItem[]>('AddressGeneral', 'searchSettlements', {
    CityName: query,
    Limit: String(limit),
  })

  if (settlements?.length) {
    const items: NpCity[] = []
    for (const group of settlements) {
      for (const addr of group.Addresses ?? []) {
        const ref = addr.DeliveryCity || addr.Ref
        const name = addr.MainDescription || addr.Present
        if (!ref || !name) continue
        items.push({
          ref,
          name,
          area: addr.Area,
          present: addr.Present || (addr.Area ? `${name}, ${addr.Area}` : name),
        })
      }
    }
    if (items.length) return items.slice(0, limit)
  }

  const cities = await callNovaPoshta<CityItem[]>('Address', 'getCities', {
    FindByString: query,
    Limit: String(limit),
  })

  if (!cities?.length) return null

  return cities
    .filter((c): c is CityItem & { Ref: string; Description: string } => Boolean(c.Ref && c.Description))
    .map((c) => ({
      ref: c.Ref,
      name: c.Description,
      area: c.AreaDescription,
      present: c.AreaDescription ? `${c.Description}, ${c.AreaDescription} обл.` : c.Description,
    }))
    .slice(0, limit)
}

async function searchWarehousesLive(
  cityRef: string,
  query: string,
  limit: number,
): Promise<NpWarehouse[] | null> {
  const props: Record<string, string> = {
    CityRef: cityRef,
    Limit: String(limit),
  }
  if (query) props.FindByString = query

  const warehouses = await callNovaPoshta<WarehouseItem[]>('Address', 'getWarehouses', props)
  if (!warehouses?.length) return null

  return warehouses
    .filter((w): w is WarehouseItem & { Ref: string; Description: string } =>
      Boolean(w.Ref && w.Description),
    )
    .map((w) => ({
      ref: w.Ref,
      number: w.Number || '',
      name: w.Description,
      shortAddress: w.ShortAddress || w.Description,
      cityRef: w.CityRef || cityRef,
      cityName: w.CityDescription || '',
    }))
    .slice(0, limit)
}

novaPoshtaRouter.get('/cities', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  const limit = Math.min(Number(req.query.limit) || 20, 50)

  if (query.length < 2) {
    res.json({ items: [] })
    return
  }

  const live = await searchCitiesLive(query, limit)
  res.json({ items: live ?? filterDemoCities(query, limit) })
})

novaPoshtaRouter.get('/warehouses', async (req, res) => {
  const cityRef = typeof req.query.cityRef === 'string' ? req.query.cityRef.trim() : ''
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  const limit = Math.min(Number(req.query.limit) || 30, 50)

  if (!cityRef) {
    res.status(400).json({ error: 'cityRef is required' })
    return
  }

  const live = await searchWarehousesLive(cityRef, query, limit)
  res.json({ items: live ?? filterDemoWarehouses(cityRef, query, limit) })
})
