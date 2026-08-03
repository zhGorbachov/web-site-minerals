import type { CartItem, Category, Order, Product, StoreReview, SubCategory, User } from '@/types'
import { isValidLocalPhone, normalizeLocalPhone } from '@/utils/phone'
import { categories as seedCategories } from './categories'
import { subcategories as seedSubcategories } from './subcategories'
import { products as seedProducts } from './products'

const STORAGE_KEY = 'crystal-mock-db'
const STORAGE_VERSION = 8

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
  reviews: StoreReview[]
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
  const product3 = seedProducts[2] ?? product
  const statuses: Order['status'][] = [
    'pending',
    'assembling',
    'ready',
    'shipped',
    'delivered',
    'confirmed',
    'processing',
    'assembling',
    'ready',
    'shipped',
    'delivered',
    'cancelled',
  ]
  const payments: NonNullable<Order['paymentStatus']>[] = [
    'unpaid',
    'paid',
    'paid',
    'paid',
    'paid',
    'awaiting_payment',
    'unpaid',
    'paid',
    'paid',
    'paid',
    'paid',
    'failed',
  ]

  return statuses.map((status, index) => {
    const itemProduct = index % 3 === 0 ? product : index % 3 === 1 ? product2 : product3
    const quantity = (index % 3) + 1
    const unitPrice = itemProduct.discountPrice ?? itemProduct.price
    const id = `order-demo-${index + 1}`
    const day = String((index % 27) + 1).padStart(2, '0')
    const month = String((index % 11) + 1).padStart(2, '0')

    const isBankTransfer = index % 3 === 0
    const paymentMethod = isBankTransfer
      ? 'bank_transfer'
      : index % 3 === 1
        ? 'pickup'
        : 'google_pay'

    return {
      id,
      userId: DEMO_CUSTOMER.id,
      status,
      totalPrice: unitPrice * quantity,
      paymentMethod,
      paymentStatus: payments[index],
      deliveryMethod: index % 2 === 0 ? 'nova_poshta' : 'self_pickup',
      payerFullName: isBankTransfer ? 'Шевченко Тарас Григорович' : null,
      createdAt: `2026-${month}-${day}T${String(10 + (index % 8)).padStart(2, '0')}:30:00Z`,
      items: [
        {
          id: `oi-${index + 1}`,
          orderId: id,
          productId: itemProduct.id,
          productName: itemProduct.name,
          productImage: itemProduct.images[0] ?? '',
          quantity,
          price: unitPrice,
        },
      ],
    }
  })
}

function createDemoReviews(): StoreReview[] {
  return [
    {
      id: 'review-seed-1',
      userId: null,
      author: 'Олена К.',
      rating: 5,
      text: 'Чудові браслети ручної роботи! Камінці справжні, упаковка акуратна. Замовляла вже двічі.',
      createdAt: '2026-06-18T12:00:00Z',
    },
    {
      id: 'review-seed-2',
      userId: null,
      author: 'Марія С.',
      rating: 5,
      text: 'Дуже швидка доставка і приємне спілкування. Аметист виглядає ще краще, ніж на фото.',
      createdAt: '2026-05-22T09:30:00Z',
    },
    {
      id: 'review-seed-3',
      userId: null,
      author: 'Ірина В.',
      rating: 4,
      text: "Гарний вибір ниток для плетіння. Якість на висоті, обов'язково замовлю ще.",
      createdAt: '2026-04-10T16:45:00Z',
    },
    {
      id: 'review-seed-4',
      userId: null,
      author: 'Андрій П.',
      rating: 5,
      text: 'Магазин відповідає швидко, товар якісний. Дякую за допомогу з вибором каменів.',
      createdAt: '2026-03-28T11:15:00Z',
    },
    {
      id: 'review-seed-5',
      userId: null,
      author: 'Наталія М.',
      rating: 4,
      text: 'Все сподобалось: і упаковка, і сервіс. Трохи довше чекала на відповідь у месенджері, але результатом задоволена.',
      createdAt: '2026-02-14T18:20:00Z',
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
    reviews: createDemoReviews(),
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

  updateUserPassword(userId: string, password: string) {
    const record = this.findUserById(userId)
    if (!record) return false
    record.password = password
    persist()
    return true
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

  getAllOrders() {
    return Object.values(state.orders).flat()
  },

  setOrders(userId: string, orders: Order[]) {
    state.orders[userId] = orders
    persist()
  },

  updateOrder(
    orderId: string,
    patch: Partial<Pick<Order, 'status' | 'paymentStatus'>>,
  ): Order | null {
    for (const [userId, orders] of Object.entries(state.orders)) {
      const index = orders.findIndex((order) => order.id === orderId)
      if (index < 0) continue
      const updated: Order = {
        ...orders[index],
        ...patch,
      }
      const next = [...orders]
      next[index] = updated
      state.orders[userId] = next
      persist()
      return updated
    }
    return null
  },

  getReviews() {
    return state.reviews
  },

  addReview(review: StoreReview) {
    state.reviews = [review, ...state.reviews]
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
