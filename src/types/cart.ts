import type { Product } from './product'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  selectedOptions?: Record<string, string>
}

export interface Cart {
  id: string
  items: CartItem[]
  createdAt: string
}
