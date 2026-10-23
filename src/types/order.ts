export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'assembling'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'unpaid' | 'awaiting_payment' | 'paid' | 'failed'

export interface OrderItem {
  id: string
  orderId: string
  /** Null when the catalog product was deleted after the order was placed. */
  productId: string | null
  productName: string
  productImage: string
  quantity: number
  price: number
  selectedOptions?: Record<string, string> | null
}

export interface Order {
  id: string
  userId: string | null
  status: OrderStatus
  paymentStatus?: PaymentStatus
  totalPrice: number
  paymentMethod: string
  deliveryMethod: string
  /** Full name of the bank-transfer payer (as on the card statement). */
  payerFullName?: string | null
  /** Contact details entered at checkout, snapshotted onto the order. */
  contactFirstName?: string | null
  contactLastName?: string | null
  contactPhone?: string | null
  contactEmail?: string | null
  /** Human-readable delivery summary (address / branch / postal index), snapshotted onto the order. */
  deliveryAddress?: string | null
  items: OrderItem[]
  createdAt: string
}

export type CreateOrderResult = Order
