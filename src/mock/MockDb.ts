import type { CartItem, Category, Order, Product, SubCategory, User } from '@/types'
import { isValidLocalPhone, normalizeLocalPhone } from '@/utils/phone'
import { categories as seedCategories } from './categories'
import { subcategories as seedSubcategories } from './subcategories'
import { products as seedProducts } from './products'

const STORAGE_KEY = 'crystal-mock-db'
const STORAGE_VERSION = 4

export type MockUserRecord = {
  password: string
  user: User
}

export type MockCart = {
  id: string
  items: CartItem[]
  createdAt: string
}

type MockDbState = {
  version: number
  categories: Category[]
  subcategories: SubCategory[]
  products: Product[]
  users: MockUserRecord[]
  carts: Record<string, MockCart>
  wishlists: Record<string, string[]>
  orders: Record<string, Order[]>
  sessions: Record<string, string>
}

export { normalizeLocalPhone, isValidLocalPhone } from '@/utils/phone'

const ADMIN_USER: User = {
  id: 'user-admin',
  firstName: 'Admin',
  lastName: 'LuxStones',
  email: 'admin@luxstones.local',
  phone: '0501112233',
  role: 'admin',
  provider: 'email',
  discountPercent: 15,
  discountLabel: 'VIP партнери',
  createdAt: '2024-01-01T00:00:00Z',
}

const DEMO_CUSTOMER: User = {
  id: 'user-demo',
  firstName: 'Олена',
  lastName: 'Коваленко',
  phone: '0671234567',
  email: 'olena@example.com',
  role: 'customer',
  provider: 'email',
  discountPercent: 10,
  discountLabel: 'Постійний клієнт',
  createdAt: '2024-06-01T00:00:00Z',
}

function createDemoOrders(): Order[] {
  const product = seedProducts[0]
  const product2 = seedProducts[1] ?? seedProducts[0]
  return [
    {
      id: 'order-demo-1',
      userId: DEMO_CUSTOMER.id,
      status: 'delivered',
      totalPrice: (product.discountPrice ?? product.price) * 2,
      paymentMethod: 'cod',
      paymentStatus: 'unpaid',
      deliveryMethod: 'nova_poshta',
      createdAt: '2025-11-12T10:00:00Z',
      items: [
        {
          id: 'oi-1',
          orderId: 'order-demo-1',
          productId: product.id,
          productName: product.name,
          productImage: product.images[0] ?? '',
          quantity: 2,
          price: product.discountPrice ?? product.price,
        },
      ],
    },
    {
      id: 'order-demo-2',
      userId: DEMO_CUSTOMER.id,
      status: 'processing',
      totalPrice: product2.discountPrice ?? product2.price,
      paymentMethod: 'cod',
      paymentStatus: 'unpaid',
      deliveryMethod: 'nova_poshta',
      createdAt: '2026-03-02T14:30:00Z',
      items: [
        {
          id: 'oi-2',
          orderId: 'order-demo-2',
          productId: product2.id,
          productName: product2.name,
          productImage: product2.images[0] ?? '',
          quantity: 1,
          price: product2.discountPrice ?? product2.price,
        },
      ],
    },
  ]
}

function createSeedState(): MockDbState {
  return {
    version: STORAGE_VERSION,
    categories: structuredClone(seedCategories),
    subcategories: structuredClone(seedSubcategories),
    products: structuredClone(seedProducts),
    users: [
      { password: 'admin123', user: structuredClone(ADMIN_USER) },
      { password: 'demo1234', user: structuredClone(DEMO_CUSTOMER) },
    ],
    carts: {},
    wishlists: {
      [DEMO_CUSTOMER.id]: [seedProducts[0]?.id, seedProducts[2]?.id].filter(Boolean) as string[],
    },
    orders: {
      [DEMO_CUSTOMER.id]: createDemoOrders(),
    },
    sessions: {},
  }
}

function loadState(): MockDbState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createSeedState()
    const parsed = JSON.parse(raw) as MockDbState
    if (parsed.version !== STORAGE_VERSION) return createSeedState()
    return parsed
  } catch {
    return createSeedState()
  }
}

let state = typeof window !== 'undefined' ? loadState() : createSeedState()

function persist() {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetMockDb() {
  state = createSeedState()
  persist()
}

export const MockDb = {
  getCategories() {
    return state.categories
  },

  getSubcategories() {
    return state.subcategories
  },

  setSubcategories(next: SubCategory[]) {
    state.subcategories = next
    persist()
  },

  getProducts() {
    return state.products
  },

  setProducts(next: Product[]) {
    state.products = next
    persist()
  },

  getUsers() {
    return state.users
  },

  findUserByEmail(email: string) {
    return state.users.find((u) => u.user.email?.toLowerCase() === email.toLowerCase())
  },

  findUserByPhone(phone: string) {
    const normalized = normalizeLocalPhone(phone)
    return state.users.find((u) => u.user.phone && normalizeLocalPhone(u.user.phone) === normalized)
  },

  findUserById(id: string) {
    return state.users.find((u) => u.user.id === id)
  },

  addUser(record: MockUserRecord) {
    state.users.push(record)
    persist()
  },

  updateUser(userId: string, patch: Partial<User>) {
    const record = this.findUserById(userId)
    if (!record) return null
    record.user = { ...record.user, ...patch }
    persist()
    return record.user
  },

  createSession(userId: string) {
    const token = `mock-token-${userId}-${Date.now()}`
    state.sessions[token] = userId
    persist()
    return token
  },

  resolveSession(token: string | null) {
    if (!token) return null
    const userId = state.sessions[token]
    if (!userId) return null
    return this.findUserById(userId)?.user ?? null
  },

  clearSession(token: string | null) {
    if (!token) return
    delete state.sessions[token]
    persist()
  },

  getCart(userId: string): MockCart {
    if (!state.carts[userId]) {
      state.carts[userId] = {
        id: `cart-${userId}`,
        items: [],
        createdAt: new Date().toISOString(),
      }
      persist()
    }
    return state.carts[userId]
  },

  setCart(userId: string, cart: MockCart) {
    state.carts[userId] = cart
    persist()
  },

  getWishlist(userId: string) {
    if (!state.wishlists[userId]) {
      state.wishlists[userId] = []
      persist()
    }
    return state.wishlists[userId]
  },

  setWishlist(userId: string, productIds: string[]) {
    state.wishlists[userId] = productIds
    persist()
  },

  getOrders(userId: string) {
    return state.orders[userId] ?? []
  },

  setOrders(userId: string, orders: Order[]) {
    state.orders[userId] = orders
    persist()
  },
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9а-яіїєґ]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function enrichProduct(product: Product): Product {
  const sub = state.subcategories.find((s) => s.id === product.subCategoryId)
  const category = state.categories.find((c) => c.slug === product.categorySlug)
  return {
    ...product,
    subCategorySlug: sub?.slug ?? product.subCategorySlug,
    categorySlug: sub?.categorySlug ?? product.categorySlug,
    categoryName: category?.name,
    subCategoryName: sub?.name,
  }
}
