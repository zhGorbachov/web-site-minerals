export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  userId: string | null
  status: OrderStatus
  totalPrice: number
  paymentMethod: string
  deliveryMethod: string
  items: OrderItem[]
  createdAt: string
}
