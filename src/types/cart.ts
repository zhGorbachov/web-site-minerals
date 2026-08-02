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
  /** How many half-strand pairs were converted into whole strands in this response. */
  halfStrandsMerged?: number
}
