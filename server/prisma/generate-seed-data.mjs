import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

const imgMap = {
  mineralsCategory: 'MineralsCategory.jpg',
  threads: 'Threads.jpg',
  bracelets: 'Bracelets.jpg',
  moonstone: 'Moonstone.jpg',
  beadsAgate: 'BeadsAgate.jpg',
  amethyst: 'Amethyst.jpg',
  quartzCrystal: 'QuartzCrystal.jpg',
  obsidianRock: 'ObsidianRock.jpg',
  labradorite: 'Labradorite.jpg',
  tigerEye: 'TigerEye.jpg',
  jasper: 'Jasper.jpg',
  pinkQuartz: 'PinkQuartz.jpg',
  waxThread: 'WaxThread.jpg',
  beigeThread: 'BeigeThread.jpg',
  elasticThread: 'ElasticThread.jpg',
  cottonThread: 'CottonThread.jpg',
  silkThread: 'SilkThread.jpg',
  womenBracelet: 'WomenBracelet.jpg',
  menBracelet: 'MenBracelet.jpg',
  kidsBracelet: 'KidsBracelet.jpg',
  handmadeBracelet: 'HandmadeBracelet.jpg',
  limitedBracelet: 'LimitedBracelet.jpg',
  blueAgate: 'BlueAgate.jpg',
  obsidian: 'Obsidian.jpg',
}

function media(key) {
  const file = imgMap[key]
  if (!file) throw new Error(`Unknown image key: ${key}`)
  return `/media/${file}`
}

function replaceImages(src) {
  return src.replace(/mockImages\.(\w+)/g, (_, k) => JSON.stringify(media(k)))
}

function extractArray(src, exportName) {
  const re = new RegExp(
    `(?:export const|const) ${exportName}[^=]*=\\s*(\\[[\\s\\S]*?\\n\\])`,
  )
  const match = src.match(re)
  if (!match) throw new Error(`Could not extract ${exportName}`)
  return match[1]
}

const catSrc = fs.readFileSync(path.join(root, 'src/mock/categories.ts'), 'utf8')
const categories = eval(replaceImages(extractArray(catSrc, 'categories')))

const subSrc = fs.readFileSync(path.join(root, 'src/mock/subcategories.ts'), 'utf8')
const subcategories = eval(replaceImages(extractArray(subSrc, 'subcategories')))

const prodSrc = fs.readFileSync(path.join(root, 'src/mock/products.ts'), 'utf8')
const baseProducts = eval(replaceImages(extractArray(prodSrc, 'baseProducts')))

const IMAGE_POOL = [
  'beadsAgate',
  'blueAgate',
  'amethyst',
  'quartzCrystal',
  'pinkQuartz',
  'labradorite',
  'moonstone',
  'tigerEye',
  'jasper',
  'waxThread',
  'elasticThread',
  'cottonThread',
  'silkThread',
  'womenBracelet',
  'menBracelet',
  'kidsBracelet',
  'handmadeBracelet',
  'limitedBracelet',
].map(media)

const NAME_PREFIXES = [
  'Агат',
  'Аметист',
  'Кварц',
  'Лабрадорит',
  'Обсидіан',
  'Яшма',
  'Розовий кварц',
  'Місячний камінь',
  'Нитка',
  'Браслет',
]
const NAME_SUFFIXES = [
  'натуральний',
  'полірований',
  'ручної роботи',
  'обмежена серія',
  'преміум',
  'класичний',
  "м'який блиск",
  'матовий',
]
const SUBCATEGORIES = [
  { id: 'sub-1', slug: 'agat', categorySlug: 'mineraly' },
  { id: 'sub-2', slug: 'ametyst', categorySlug: 'mineraly' },
  { id: 'sub-3', slug: 'kvarts', categorySlug: 'mineraly' },
  { id: 'sub-9', slug: 'voshcheni', categorySlug: 'nytky' },
  { id: 'sub-14', slug: 'zhinochi', categorySlug: 'brаslety' },
]

const extras = Array.from({ length: 40 }, (_, index) => {
  const n = index + 1
  const sub = SUBCATEGORIES[index % SUBCATEGORIES.length]
  const price = 45 + (index % 20) * 15
  return {
    id: `prod-mock-new-${n}`,
    subCategoryId: sub.id,
    subCategorySlug: sub.slug,
    categorySlug: sub.categorySlug,
    name: `${NAME_PREFIXES[index % NAME_PREFIXES.length]} ${NAME_SUFFIXES[index % NAME_SUFFIXES.length]} №${n}`,
    slug: `mock-novynka-${n}`,
    sku: `MOCK-NEW-${String(n).padStart(3, '0')}`,
    shortDescription: `Тестова новинка №${n} для перевірки пагінації`,
    description: `Демо-товар №${n}.`,
    price,
    discountPrice: index % 4 === 0 ? Math.round(price * 0.85) : undefined,
    stock: 5 + (index % 30),
    images: [IMAGE_POOL[index % IMAGE_POOL.length]],
    attributes: { note: 'mock' },
    featured: index % 7 === 0,
    popular: index % 3 === 0,
    isNew: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  }
})

const out = {
  categories,
  subcategories,
  products: [...baseProducts, ...extras],
}

const outPath = path.join(__dirname, 'seed-data.json')
fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
console.log(
  `Wrote ${out.categories.length} categories, ${out.subcategories.length} subcategories, ${out.products.length} products`,
)
