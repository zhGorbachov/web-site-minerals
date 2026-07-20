export interface DemoCity {
  ref: string
  name: string
  area?: string
  present: string
}

export interface DemoWarehouse {
  ref: string
  number: string
  name: string
  shortAddress: string
  cityRef: string
  cityName: string
}

export const DEMO_NOVA_POSHTA_CITIES: DemoCity[] = [
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

export const DEMO_NOVA_POSHTA_WAREHOUSES: DemoWarehouse[] = [
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
